var express = require('express');
var mongoose = require('mongoose');
var plugin = require("../models/plugin");
var router = express.Router();

router.get('/', function(req, res) {
    plugin.find({}).sort({rank: 'asc'}).exec(function(err,doc) {
        console.log(doc);
        res.render('pluginindex', {title: 'Statik - Plugin List', pluginList: doc})
    })
});

module.exports = router;