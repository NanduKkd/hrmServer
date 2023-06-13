const mongoose = require('mongoose')

const catchSchema = new mongoose.Schema({
	user: mongoose.SchemaTypes.ObjectId,
	userAgent: {
		required: true,
		type: String,
	},
	message: {
		required: true,
		type: String,
	},
	misc: Object,
})

module.exports = mongoose.model('catch', catchSchema)