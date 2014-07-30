var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Statik', numberOfPlugins: 932, numberOfServers: 150 }); //TODO : Valid numbers when the API is built
});

router.get('/info', function(req, res) {
   res.render('info', { title: 'Statik - More Information'});
});

module.exports = router;
