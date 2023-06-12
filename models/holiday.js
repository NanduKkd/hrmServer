const mongoose = require('mongoose')

const holidaySchema = new mongoose.Schema({
	year: {
		type: Number,
		required: true,
	},
	month: {
		type: Number,
		required: true,
	},
	date: {
		type: Number,
		required: true,
	},
	onsite: {
		type: Boolean,
		required: true,
	},
	reason: {
		type: String,
	},
	morning: {
		type: Boolean,
		default: true,
		required: true,
	},
	evening: {
		type: Boolean,
		default: true,
		required: true,
	},
})

module.exports = mongoose.model('holiday', holidaySchema)
