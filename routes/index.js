var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Statik', numberOfPlugins: 932, numberOfServers: 150, 'flashsuccess': req.flash('success'), 'flasherror': req.flash('error') }); //TODO : Valid numbers when the API is built
});

router.get('/about', function(req, res) {
   res.render('about', { title: 'Statik - About'});
});

router.get('/faq', function(req,res) {
    res.render('faq', { title: 'Statik - FAQ'});
});

router.get('/status', function(req,res) {
    //TODO: The proper data
    res.render('status', {title: 'Statik - Backend status'});
});

module.exports = router;
