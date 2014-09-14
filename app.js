var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var validator = require('express-validator');
var flash = require('connect-flash');
var passport = require('passport');
var configuration = require('./config/config.js');
var md5 = require('MD5');
var RedisStore = require('connect-redis')(session);
var app = express();
mongoose.connect(configuration.mongoUri);
var db = mongoose.connection;
db.on('error', function(err) {
    console.log(err);
    process.exit(1);
});
db.once('open', function callback() {
    console.log('Connected to DB');
});

require('./config/passport')(passport); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(validator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session( {
    secret: configuration.COOKIE_KEY,
    cookie: { domain:'.statik.io', path: '/' },
    store: new RedisStore({url: configuration.redisUri})
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
    res.locals.user = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    if (req.user != undefined && req.user.selectedEmail != undefined) {
        res.locals.gravatar = 'http://www.gravatar.com/avatar/' +md5(req.user.selectedEmail);
    } else {
        res.locals.gravatar = 'http://www.gravatar.com/avatar/00000000000000000';
    }
    next();
});


// Log to file if required
var log = process.env.LOG || false;
if (log) {
    var logFile = fs.createWriteStream(log, {flags: 'w'});
    app.use(logger('dev', ({stream: logFile})));
    console.log("Using " + log + " for logging");
} else {
    app.use(logger('dev'));
    console.log("Using stdout for logging");
}

//CSP

app.get('/*',function(req, res, next) {
    var csp = "default-src 'none'; script-src 'self' data: cdnjs.cloudflare.com cdn.jsdelivr.net; object-src 'self'; style-src 'self' cdnjs.cloudflare.com maxcdn.bootstrapcdn.com fonts.googleapis.com 'unsafe-inline'; img-src 'self'; media-src 'self'; frame-src 'self'; font-src 'self' cdnjs.cloudflare.com maxcdn.bootstrapcdn.com fonts.googleapis.com fonts.gstatic.com; connect-src 'self'";
    res.header('Content-Security-Policy' , csp);
    next();
});

//We load the routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/plugins', require('./routes/plugin'));
app.use('/ucp', require('./routes/ucp'));

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
    app.locals.pretty = true;
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

module.exports = app;
