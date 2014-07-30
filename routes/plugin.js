var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('pluginindex', {title: 'Statik - Plugin List', pluginList: doc}) //TODO Use the API
});

module.exports = router;