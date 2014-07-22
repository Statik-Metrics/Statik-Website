var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Mixed = mongoose.Schema.Types.Mixed,
    ObjectId = mongoose.Schema.Types.ObjectId;

var graphEntrySchema = new Schema({
    plugin: {type: ObjectId, required: true},
    time: {type: Date, required: true},
    graphName: {type: String, required: true},
    value: {type: Mixed, required: true}
});

module.exports = mongoose.model('GraphEntry', graphEntrySchema);