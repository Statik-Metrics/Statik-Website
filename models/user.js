var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs');

var pluginSchema = new Schema({
    uuid: {type: String},
    name: {type: String}
});
var userSchema = new Schema({

    username: {type: String }, //Created on first login in the system
    selectedEmail: {type: String }, //This is to select where we want to send informational emails
    enabled: {type: Boolean, default: false},
    local: {
        email: {type: String},
        password: {type: String},
        confirmKey: {type: String},
        resetKey: {type: String}
    },
    github: {
        id: {type: String},
        token: {type: String},
        email: {type: String}
    },
    bitbucket: {
        id: {type: String},
        token: {type: String},
        email: {type: String}
    },
    google: {
        id: {type: String},
        token: {type: String},
        email: {type: String}
    },
    plugins: [pluginSchema],
    group: {type: String, default: 'user'}
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
