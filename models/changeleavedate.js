const mongoose = require('mongoose')

const changeLeaveDateSchema = new mongoose.Schema({
	pid: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	lid: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	newstartingdate: {
		type: String,
		required: true,
	},
	newendingdate: {
		type: String,
		required: true,
	},
	newlength: {
		type: Number,
		required: true,
	},
	createdat: {
		type: Date,
		default: Date.now,
	},
	subperson: {
		type: mongoose.ObjectId,
	},
	substatus: {
		type: String,
		enum: ['Waiting', 'Accepted', 'Rejected'],
	},
	subupdatedat: {
		type: Date,
	},
	rejected: {
		type: Boolean,
		default: false,
	},
	rejectedat: {
		type: Date,
	},
})

module.exports = mongoose.model('changeleavedate', changeLeaveDateSchema)