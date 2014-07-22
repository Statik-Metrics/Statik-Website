var express = require('express');
var mongoose = require('mongoose');
var Plugin = require('../models/plugin');
var Server = require('../models/server');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    Plugin.count({}, function(err, c) {
        console.log(c);
        Server.count({}, function(err, serverCount) {
            res.render('index', { title: 'Statik', numberOfPlugins: c, numberOfServers: serverCount });
        });
    });
});

router.get('/info', function(req, res) {
   res.render('info', { title: 'Statik - More Information'});
});

module.exports = router;
