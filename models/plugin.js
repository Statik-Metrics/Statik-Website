var graph = require('./graph');
var server = require('./server');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var pluginSchema = new Schema({
    pluginName: {type: String, required: true},
    rank: {type: Number, required: true},
    lastRank: {type: Number, required: true},
    servers: [server],
    graphs: [graph]
});

module.exports = mongoose.model('Plugin', pluginSchema);