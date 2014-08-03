var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

router.get('/', ensureAuthenticated, function(req,res) {
    res.render('ucp/index', {title: 'Statik - UCP'});
});

router.get('/settings', ensureAuthenticated, function(req,res) {
    var i = 0;

    var emails = [''];
    if (req.user.local.email != undefined) {
        if (emails.indexOf(req.user.local.email) == -1) {
            emails[++i] = req.user.local.email;
        }
    }
    if (req.user.github.email != undefined) {
        if (emails.indexOf(req.user.github.email) == -1) {
            emails[++i] = req.user.github.email;
        }
    }
    if (req.user.bitbucket.email != undefined) {
        if (emails.indexOf(req.user.bitbucket.email) == -1) {
            emails[++i] = req.user.bitbucket.email;
        }
    }
    if (req.user.google.email != null) {
        if (emails.indexOf(req.user.google.email) == -1) {
            emails[++i] = req.user.google.email;
        }
    }
    res.render('ucp/settings', {title: 'Statik - Account settings', 'emails': emails});
});

router.post('/email', ensureAuthenticated, function(req,res) {
    if (req.body.email != undefined) {
        req.user.selectedEmail = req.body.email;
        req.user.save(function (err) {
            if (err) throw err;
            req.flash('success', 'Main email modified!');
        })
    }
    res.redirect('/ucp/settings');
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