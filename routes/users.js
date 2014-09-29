var express = require('express');
var router = express.Router();
var app = require('../app');
var config = require('../config/config.js');
var passport = require('passport');
var crypto = require('crypto');
var Chance = require('chance'),
    chance = new Chance();

var User = require('../models/user');

router.get('/signup', function(req,res) {
   //console.log('FLASH:' + req.flash('signupMessage'));
   res.render('signup', {title: 'Statik - Signup', csrfToken: req.csrfToken()});
});


// process the signup form
//TODO Some kind of password confirmation (Atm the password confirmation field isn't checked)
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/users/username', // redirect to the secure profile section
    failureRedirect : '/users/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

router.get('/login', function(req,res) {
    res.render('login', { title: 'Statik - Login', csrfToken: req.csrfToken() });
});

router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/users/username',
        failureRedirect: '/users/login',
        failureFlash: true
}));

router.get('/passwordreset', function(req,res) {
   res.render('passwordreset', {title: 'Statik - Password Reset', csrfToken: req.csrfToken()});
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

router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login', successRedirect: '/users/username'}));

router.get('/login/google', passport.authenticate('google'));

router.get('/login/google/callback', passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/users/username'}));

router.get('/login/bitbucket',
    passport.authenticate('bitbucket'));

router.get('/login/bitbucket/callback', passport.authenticate('bitbucket', { failureRedirect: '/login', successRedirect: '/users/username' }));

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/username', ensureAuthenticated, function(req,res) {
    if (req.user.username != null) {
        res.redirect('/');
    } else {
        res.render('username', {title: 'Statik - Username configuration', csrfToken: req.csrfToken()});
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

router.get('/sso', ensureAuthenticated, function(req,res) {
    var sso = req.query.sso;
    decrypt(sso, config.CRYPT_KEY, function (decoded) {
        //Format sessionID
        encrypt(decoded + "," + req.user.id + "," + req.user.username + "," + req.user.selectedEmail + "," + req.user.group, config.CRYPT_KEY, function(encoded) {
            res.redirect("http://support.statik.io/login/?auth="+encoded);
        });
    });
})


var encrypt = function (input, password, callback) {
    var m = crypto.createHash('md5');
    m.update(password)
    var key = m.digest('hex');

    m = crypto.createHash('md5');
    m.update(password + key)
    var iv = m.digest('hex');

    var data = new Buffer(input, 'utf8').toString('binary');

    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv.slice(0,16));
    var encrypted = cipher.update(data, 'binary') + cipher.final('binary');
    var encoded = new Buffer(encrypted, 'binary').toString('base64');

    callback(encoded);
};

var decrypt = function (input, password, callback) {
    // Convert urlsafe base64 to normal base64
    var input = input.replace(/\-/g, '+').replace(/_/g, '/');
    // Convert from base64 to binary string
    var edata = new Buffer(input, 'base64').toString('binary')

    // Create key from password
    var m = crypto.createHash('md5');
    m.update(password)
    var key = m.digest('hex');

    // Create iv from password and key
    m = crypto.createHash('md5');
    m.update(password + key)
    var iv = m.digest('hex');

    // Decipher encrypted data
    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv.slice(0,16));
    var decrypted = decipher.update(edata, 'binary') + decipher.final('binary');
    var plaintext = new Buffer(decrypted, 'binary').toString('utf8');

    callback(plaintext);
};
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
