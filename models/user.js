var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var userSchema = new Schema({
    email: {type: String, required: true},
    resetKey: {type: String, required: true},
    enabled: {type: Boolean, default: false, required: true},
    plugins: [ObjectId]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);