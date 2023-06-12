const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	admin: {
		type: Boolean,
		required: true,
		default: false,
	},
	superadmin: {
		type: Boolean,
		required: false,
	},
	post: {
		type: mongoose.Types.ObjectId,
		required: true,
	},
	department: {
		type: mongoose.Types.ObjectId,
	},
	leavereportingperson: {
		type: mongoose.Types.ObjectId,
	},
	attendancereportingperson: {
		type: mongoose.Types.ObjectId,
	},
	password: {
		type: String,
		required: true,
		default: '',
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	joiningdate: {
		type: Date,
		required: true,
	},
	monthsprobation: {
		type: Number,
		required: true,
	},
	onsite: {
		type: Boolean,
		required: true,
	},
})

module.exports = mongoose.model('person', personSchema)
