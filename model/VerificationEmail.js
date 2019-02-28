const mongoose = require('mongoose');
const uid = require('uid2');
let Schema = mongoose.Schema;


const verifyCodeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    code: {
        type: String,
        unique: true,
        default: function () {
            return uid(124);
        }
    },
    expires: {
        type: Date,
        default: function () {
            var today = new Date();
            var length = 7 * 24 * 60; // Length (in minutes) of our access token ---- 24 hours
            return new Date(today.getTime() + length * 60000);
        }
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
        default: true
    }
});


const VerifyCode = mongoose.model('VerifyCode', verifyCodeSchema);
module.exports = VerifyCode;