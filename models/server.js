var graph = require('./graph');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var serverSchema = new Schema({
    guid: {type: String, required: true},
    plugin_version: {type: String, required: true},
    server_version: {type: String, required: true},
    players_online: {type: Number, required: true},
    osname: {type: String, required: true},
    osarch: {type: String, required: true},
    osversion: {type: String, required: true},
    cores: {type: Number, required: true},
    auth_mode: {type: Boolean, required: true},
    java_version: {type: String, required: true},
    graphs: [graph]
});

module.exports = mongoose.model('Server', serverSchema);