const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uid = require('uid2');

var ApplicationSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	oauth_id: {
		type: Number,
		unique: true
	},
	oauth_secret: {
		type: String,
		unique: true,
		default: function () {
			return uid(42);
		}
	},
	domains: [{
		type: String
	}],
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
});

var Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;