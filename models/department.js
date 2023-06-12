const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	accounts: {
		type: Boolean,
		default: false,
	},
	preset: {
		type: Boolean,
		default: false,
	},
})

module.exports = mongoose.model('department', departmentSchema)
