var express = require('express');
var router = express.Router();


router.get('/register', function(req,res) {
   res.render('register', {title: 'Statik - Register'})
});

router.post('/register', function(req,res) {
        if (req.body.username != null)
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
