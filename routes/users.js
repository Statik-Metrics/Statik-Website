var express = require('express');
var router = express.Router();
var app = require('../app');
var passport = require('passport');
var Chance = require('chance'),
    chance = new Chance();


router.get('/register', function(req,res) {
   res.render('register', {title: 'Statik - Register'});
});

router.post('/register', function(req,res) {
    req.assert('username', 'Username is required').notEmpty();
    req.assert('email', 'Email is required!').notEmpty().isEmail();
    req.assert('password', 'Password is required!').notEmpty();
    req.assert('password_confirm', 'Password confirmation is required!').notEmpty();
    var errors = req.validationError();
    if (!errors) {
        req.sanitize('username').toString();
        req.sanitize('email').toString();
        var randomGUID = chance.guid();
        var user = new User({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            resetKey: randomGUID
        });
        user.save(function (err) {
            if (err) return res.render('register', {title: 'Statik - Register', errors: err});
            mg.sendText('noreply@statik.io', req.body.email, 'Password confirmation',
                    "Welcome to Statik.io! \n" +
                    "To confirm your account, please click this link: http://statik.io/users/confirm/" +randomGUID +
                    "\n\n" +
                    "Statik.io Staff", function (err) {
                    if (err) return res.render('register', {title: 'Statik - Register', errors: err});
                    redirect('/');
                });
        })
    } else {
        res.render('register', {title: 'Statik - Register', errors: errors});
    }
});

router.get('/login', function(req,res) {
    res.render('login', { title: 'Statik - Login' });
});

router.post('/login', function(req,res) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: 'true'
    });
});

router.get('/login/github', passport.authenticate('github'));

router.get('/login/github/callback', passport.authenticate('github', { failureReditect: '/login'}), function(req,res) {
    //Auth success
    res.redirect('/');
});

module.exports = router;
