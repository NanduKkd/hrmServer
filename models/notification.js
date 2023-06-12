const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
	subject: {
		type: String,
		reqiured: true,
	},
	message: {
		type: String,
		required: true,
	},
	createdAt: {
		required: true,
		type: Date,
		default: Date.now,
	},
})


module.exports = mongoose.model('notification', notificationSchema)
