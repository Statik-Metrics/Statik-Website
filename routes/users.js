var express = require('express');
var router = express.Router();


router.get('/register', function(req,res) {
   res.render('register', {title: 'Statik - Register'})
});

router.post('/register', function(req,res) {
    req.assert('username', 'Username is required').notEmpty();
    req.assert('email', 'Email is required!').notEmpty().isEmail();
    req.assert('password', 'Password is required!').notEmpty();
    req.assert('password_confirm', 'Password confirmation is required!').notEmpty();
    var errors = req.validationError();
    if (!errors) {
        //TODO Passed validation, save the user then send a confirmation email
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

module.exports = router;
