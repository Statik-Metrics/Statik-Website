var express = require('express');
var router = express.Router();
var app = require('../app');
var passport = require('passport');
var Chance = require('chance'),
    chance = new Chance();

var User = require('../models/user');

router.get('/signup', function(req,res) {
   //console.log('FLASH:' + req.flash('signupMessage'));
   res.render('signup');
});


// process the signup form
//TODO Some kind of password confirmation (Atm the password confirmation field isn't checked)
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/users/username', // redirect to the secure profile section
    failureRedirect : '/users/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

router.get('/login', function(req,res) {
    res.render('login', { title: 'Statik - Login' });
});

router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/users/username',
        failureRedirect: '/users/login',
        failureFlash: 'true'
}));

router.get('/passwordreset', function(req,res) {
   res.render('passwordreset');
});

router.get('/confirm/:confirmKey', function(req,res) {
    User.findOne({'local.confirmKey': req.params.confirmKey, 'enabled': false}, function (err,user) {
        if (err) throw err;

        if (user) {
            user.enabled = true;
            user.save(function(err) {
                if (err) throw err;
                req.flash('success', 'Account activated!');
                res.redirect('/');
            });
        } else {
            req.flash('error', 'Key not found!');
            res.redirect('/');
        }

    });
})
router.get('/login/github', passport.authenticate('github'));

router.get('/login/github/callback', passport.authenticate('github', { failureReditect: '/login'}), function(req,res) {
    //Auth success
    res.redirect('/');
});

router.get('/login/google', passport.authenticate('google'));

router.get('/login/google/callback', passport.authenticate('google', { failureReditect: '/login'}), function(req,res) {
    //Auth success
    res.redirect('/');
});

router.get('/login/bitbucket',
    passport.authenticate('bitbucket'));

router.get('/login/bitbucket/callback', passport.authenticate('bitbucket', { failureRedirect: '/login' }), function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/username', ensureAuthenticated, function(req,res) {
    if (req.user.username != null) {
        res.redirect('/');
    } else {
        res.render('username', {title: 'Statik - Username configuration'});
    }
});

router.post('/username', ensureAuthenticated,  function(req,res) {
   if (req.user.username != null) {
       res.redirect('/');
   }  else {
        if (req.body.username != null && req.body.username != '') {
            User.findOne({'username': req.body.username}, function (err, user) {
                if (err) throw err;

                if (user) {
                    req.flash('error', 'Username already taken!');
                    res.redirect('/users/username');
                } else {
                    req.user.username = req.body.username;
                    req.user.save(function(err) {
                        if (err) throw err;
                        req.flash('success', 'Username saved! Welcome ' + req.body.username + '!');
                        res.redirect('/');
                    });
                }
            });
        }
   }
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    req.flash('error', 'You need to be logged in!');
    res.redirect('/users/login')
}
module.exports = router;
