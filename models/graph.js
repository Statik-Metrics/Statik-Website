var graphEntry = require('./graph-entry');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var graphSchema = new Schema({
    name: {type: String, required: true},
    displayName: {type: String},
    readonly: {type: Boolean, required: true},
    position: {type: Number, required: true, default: 0},
    active: {type: Boolean, default: true},
    type: {type: String, default: 'line'},
    entries: [graphEntry]
});

module.exports = mongoose.model('Graph', graphSchema);