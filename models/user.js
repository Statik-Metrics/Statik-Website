var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var userSchema = new Schema({
    email: {type: String, required: true},
    resetKey: {type: String, required: false},
    enabled: {type: Boolean, default: false},
    plugins: [String],
    group: {type: String, default: 'user'},
    githubId: {type: Number, required: false}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);