const mongoose = require('mongoose')

const cancelledLeaveSchema = new mongoose.Schema({
	pid: {
		type: mongoose.ObjectId,
		required: true,
	},
	sub: {
		person: {
			type: mongoose.ObjectId,
		},
		status: {
			type: String,
			enum: ['Waiting', 'Accepted', 'Rejected'],
			default: 'Waiting',
		},
		requestedAt: {
			type: Date,
			default: Date.now,
		},
		responseAt: Date,
	},
	period: {
		cancelledleaves: [String],
		from: {
			type: 'String',
			validate: {
				validator: (v) => /^\d{2}-\d{2}-\d{4}-\d$/.test(v),
				message: data => `${data.value} is not a valid leave date`,
			},
			required: true,
		},
		to: {
			type: 'String',
			validate: {
				validator: (v) => /^\d{2}-\d{2}-\d{4}-\d$/.test(v),
				message: data => `${data.value} is not a valid leave date`,
			},
			required: true,
		},
		length: {
			type: 'Number',
			required: true,
		},
	},
	status: {
		required: true,
		type: 'String',
		enum: ['Waiting', 'Accepted', 'Rejected', 'Reviewing'],
		default: 'Waiting',
	},
	type: {
		required: true,
		type: 'String',
		enum: ['P/L','C/L','S/L'],
	},
	responseBy: mongoose.ObjectId,
	rejectReason: String,
	responseAt: Date,
	reason: {
		type: String,
		requred: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
})

module.exports = mongoose.model('cancelledleave', cancelledLeaveSchema);
