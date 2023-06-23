const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
	pid: {
		type: mongoose.ObjectId,
		required: true,
	},
	entry: {
		date: {
			type: Date,
		},
		status: {
			type: String,
			enum: ['morning', 'beforenoon', 'afternoon'],
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
	morning: {
		type: String,
		enum: ['attended', 'holiday', 'compensatory', 'leave', 'redmark'],
	},
	evening: {
		type: String,
		enum: ['attended', 'holiday', 'compensatory', 'leave', 'redmark'],
	},
	verified: {
		type: Boolean,
		default: false,
		required: true,
	},
})

module.exports = mongoose.model('attendance', attendanceSchema)
