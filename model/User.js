const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const uid = require('uid2');

let Schema = mongoose.Schema;


const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        set: function (newValue) {
            return bcrypt.hashSync(newValue, saltRounds);
        }
    },
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    superAdmin: {
        type: Boolean,
    },
    userStatus: {
        type: Boolean,
        default: false
    },
    resetPassword: {
        code: {
            type: String,
            unique: true,
            sparse: true,
        },
        expires: {
            type: Date,
        },
        active: {
            type: Boolean,
            get: function (value) {
                if (this.expires < new Date() || !value) {
                    return false;
                } else {
                    return value;
                }
            },
        }
    }
});


userSchema.statics.authenticate = function (username, password, callback) {
    this.findOne({
        username: username
    }, function (error, user) {
        if (error) {
            return callback(error, null)
        }
        if (user) {
            bcrypt.compare(password, user.password).then(function (result) {
                if (result) {
                    callback(null, user);
                } else {
                    callback(false, null);
                }
            })
        } else {
            callback(false, null);
        }
    })
}
const Users = mongoose.model('User', userSchema);
module.exports = Users;