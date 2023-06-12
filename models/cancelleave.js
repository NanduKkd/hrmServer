const mongoose = require('mongoose')

const cancelleave = new mongoose.Schema({
	pid: {
		required: true,
		type: mongoose.ObjectId,
	},
	lid: {
		required: true,
		type: mongoose.ObjectId,
	},
	cancelcompletely: {
		type: Boolean,
		required: true,
		default: false,
	},
	days: [String],
	subperson: {
		type: mongoose.ObjectId,
	},
	subaccepted: {
		type: Boolean,
	},
	subacceptedat: {
		type: Date,
	},
})

module.exports = mongoose.model('cancelleave', cancelleave)
