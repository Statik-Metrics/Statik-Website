var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//This is the table where servers write their entry. When the cron runs, it then get's converted to a graphEntry
var graphEntryRaw = new Schema({
    plugin: {type: ObjectId, required: true},
    time: {type: Date, required: true},
    graphName: {type: String, required: true},
    value: {type: Mixed, required: true}
});

module.exports = mongoose.model('GraphEntryRaw', graphEntryRaw);