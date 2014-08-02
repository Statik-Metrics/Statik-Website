var configuration = require('./config');

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    GitHubStrategy = require('passport-github').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    BitbucketStrategy = require('passport-bitbucket').Strategy;

var request = require('request');

var Chance = require('chance'),
    chance = new Chance();

//Email setup
var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(configuration.MAILGUN_API_KEY);

var User = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // GITHUB SIGNUP ===========================================================
    // =========================================================================
    passport.use(new GitHubStrategy({
            clientID: configuration.github.clientID,
            clientSecret: configuration.github.clientSecret,
            callbackURL: "http://dev.statik.io/users/login/github/callback", //TODO: Make that a legit URL
            scope: 'user:email'
        },
        function (accessToken, refreshToken, profile, done) {
            User.findOne({'github.id': profile.id}, function (err, user) {
                if (err) return done(err);

                if (!user) {
                    user = new User();
                    user.github.id = profile.id;
                    user.github.token = accessToken;
                    user.github.name = profile.displayName;
                    user.enabled = true;
                    user.save(function (err) {
                        if (err) throw err;
                        return done(null, user);
                    });
                    var options = {
                        url: 'https://api.github.com/user/emails?access_token=' + accessToken,
                        headers: {
                            'User-Agent': 'statik-website'
                        }
                    };
                    request(options, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var json = JSON.parse(body);
                            json.forEach(function(entry) {
                                if (entry.primary) {
                                    user.github.email = entry.email;
                                    user.save(function (err) {
                                        if (err) throw err;
                                    });
                                }
                            });
                        };
                    });
                } else {
                    //If the token is different, let's change it!
                    if (user.github.token != accessToken) {
                        user.github.token = accessToken;
                        user.save(function (err) {
                            if (err) throw err;
                        });
                    }
                    var options = {
                        url: 'https://api.github.com/user/emails?access_token=' + accessToken,
                        headers: {
                            'User-Agent': 'statik-website'
                        }
                    };
                    request(options, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var json = JSON.parse(body);
                            json.forEach(function(entry) {
                                if (entry.primary) {
                                    user.github.email = entry.email;
                                    user.save(function (err) {
                                        if (err) throw err;
                                    });
                                }
                            });
                        };
                    });
                    done(null, user);
                }
            });
        }
    ));

    // =========================================================================
    // Google SIGNUP ===========================================================
    // =========================================================================

    passport.use(new GoogleStrategy({
            clientID: configuration.google.consumerKey,
            clientSecret: configuration.google.consumerSecret,
            callbackURL: "http://dev.statik.io/users/login/google/callback", //TODO: Make that a legit URL
            scope: ['profile', 'email']
        },
        function (accessToken, refreshToken, profile, done) {
            User.findOne({'google.id': profile.id}, function (err, user) {
                if (err) return done(err);

                if (!user) {
                    user = new User();
                    user.google.id = profile.id;
                    user.google.token = accessToken;
                    user.google.name = profile.displayName;
                    user.google.email = profile.emails[0].value;
                    user.enabled = true;
                    user.save(function (err) {
                        if (err) throw err;
                        return done(null, user);
                    });
                } else {
                    //If the token is different, let's change it!
                    if (user.google.token != accessToken) {
                        user.google.token = accessToken;
                        user.save(function (err) {
                            if (err) throw err;
                        });
                    }
                    //We check if we had a empty email. If empty, let's set it to a possible new value
                    if (user.google.email == null || user.google.email != profile.emails[0].value) {
                        user.google.email = profile.emails[0].value;
                        user.save(function (err) {
                            if (err) throw err;
                        });
                    }
                    done(null, user);
                }
            });
        }
    ));

    // =========================================================================
    // Bitbucket SIGNUP ===========================================================
    // =========================================================================
    passport.use(new BitbucketStrategy({
            consumerKey: configuration.bitbucket.clientID,
            consumerSecret: configuration.bitbucket.clientSecret,
            callbackURL: "http://dev.statik.io/users/login/bitbucket/callback"
        },
        function(accessToken, tokenSecret, profile, done) {
            User.findOne({'bitbucket.id': profile.username}, function (err, user) {
                if (err) return done(err);

                if (!user) {
                    user = new User();
                    user.bitbucket.id = profile.username;
                    user.bitbucket.token = accessToken;
                    user.bitbucket.name = profile.displayName;
                    user.bitbucket.email = profile.emails[0].value;
                    user.enabled = true;
                    user.save(function (err) {
                        if (err) throw err;
                        return done(null, user);
                    });
                } else {
                    //If the token is different, let's change it!
                    if (user.bitbucket.token != accessToken) {
                        user.bitbucket.token = accessToken;
                        user.save(function (err) {
                            if (err) throw err;
                        });
                    }
                    //We check if we had a empty email. If empty, let's set it to a possible new value
                    if (user.bitbucket.email == null || user.bitbucket.email != profile.emails[0].value) {
                        user.bitbucket.email = profile.emails[0].value;
                        user.save(function (err) {
                            if (err) throw err;
                        });
                    }
                    done(null, user);
                }
            });
        }
    ));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function () {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({ 'local.email': email }, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.local.confirmKey = chance.guid();
                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            mg.sendText('noreply@statik.io', email, 'Password confirmation',
                                    "Welcome to Statik.io! \n" +
                                    "To confirm your account, please click this link: http://statik.io/users/confirm/" + newUser.local.confirmKey +
                                    "\n\n" +
                                    "Statik.io Staff");
                            return done(null, newUser, req.flash('success', 'To be able to add plugins on the website, you will need to confirm your email! You should receive a email in the next 5 minutes.'));
                        });
                    }

                });

            });
    }
    ));
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, user);
            });

    }));

};