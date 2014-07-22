require('newrelic');
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var session = require('express-session');
var validator = require('express-validator');
var methodOverride = require('method-override');
var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(process.env.MAILGUN_API_KEY);
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var app = express();

var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/test';
mongoose.connect(mongoUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('Connected to DB');
});

//User Schema
var userSchema = new Schema({
    username: {type: String, required: true, index: {unique: true}},
    email: {type: String, required: true},
    password: {type: String, required: true},
    resetKey: {type: String, required: true},
    enabled: {type: Boolean, default: false, required: true},
    plugins: [ObjectId]
});

var graphEntrySchema = new Schema({
    plugin: {type: ObjectId, required: true},
    time: {type: Date, required: true},
    graphName: {type: String, required: true},
    value: {type: Mixed, required: true}
});

//This is the table where servers write their entry. When the cron runs, it then get's converted to a graphEntrySchema
var graphEntryRaw = new Schema({
    time: {type: Date, required: true},
    graphName: {type: String, required: true},
    value: {type: Mixed, required: true}
});

var graphSchema = new Schema({
    name: {type: String, required: true},
    displayName: {type: String},
    readonly: {type: Boolean, required: true},
    position: {type: Number, required: true, default: 0},
    active: {type: Boolean, default: true},
    type: {type: String, default: 'line'},
    entries: [graphEntrySchema]
});

var serverSchema = new Schema({
    guid: {type: String, required: true},
    plugin_version: {type: String, required: true},
    server_version: {type: String, required: true},
    players_online: {type: Number, required: true},
    osname: {type: String, required: true},
    osarch: {type: String, required: true},
    osversion: {type: String, required: true},
    cores: {type: Number, required: true},
    auth_mode: {type: Boolean, required: true},
    java_version: {type: String, required: true},
    graphSchema: [graphEntrySchema]
});

var pluginSchema = new Schema({
    pluginName: {type: String, required: true},
    rank: {type: Number, required: true},
    lastRank: {type: Number, required: true},
    servers: [serverSchema],
    graphs: [graphSchema]
});

//Schema variables
var User = mongoose.model('User', userSchema);
var Plugin = mongoose.model('Plugin', pluginSchema);
var Server = mongoose.model('Server', serverSchema);
// Bcrypt middleware
userSchema.pre('save', function(next) {
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Password verification
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if(err) return cb(err);
        cb(null, isMatch);
    });
};

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
    });
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session( { secret: '9208efyg98wgc987stdc97sgdc'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(validator);
app.use(methodOverride());


var routes = require('./routes/index');
var users = require('./routes/users');
var plugin = require('./routes/plugin');
app.use('/', routes);
app.use('/users', users);
app.use('/plugins', plugin);
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

module.exports = app;
