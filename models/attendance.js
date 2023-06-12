const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
	pid: {
		type: mongoose.ObjectId,
		required: true,
	},
	entry: {
		date: {
			type: Date,
			required: true,
			default: Date.now,
		},
		status: {
			type: String,
			required: true,
			enum: ['morning', 'beforenoon', 'afternoon'],
			default: 'morning'
		},
		location: {
			latitude: {
				type: Number,
				required: true,
			},
			longitude: {
				type: Number,
				required: true,
			},
		},
	},
	exit: {
		date: {
			type: Date,
		},
		status: {
			type: String,
			enum: ['beforenoon', 'afternoon', 'evening', 'anotherday'],
		},
		location: {
			latitude: {
				type: Number,
			},
			longitude: {
				type: Number,
			},
		},
	},
	date: {
		date: {
			type: Number,
			required: true,
		},
		month: {
			type: Number,
			required: true,
		},
		year: {
			type: Number,
			required: true,
		},
	},
	markmorning: {
		type: Boolean,
	},
	markevening: {
		type: Boolean,
	},
	verified: {
		type: Boolean,
		default: false,
		required: true,
	},
})

module.exports = mongoose.model('attendance', attendanceSchema)
