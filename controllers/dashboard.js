const leaveModel = require('../models/leave')
const notificationModel = require('../models/notification')

exports.get = async(req, res) => {
	try {
		//const now = new Date(2023, 2, 24)
		const now = new Date()
		const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
		const limitDate = new Date(today.getTime()+7*24*3600000)
		const leaves = await leaveModel.aggregate([
			{$match: {$expr: {$and: [
				{$lt: [
					{$dateFromString: {dateString: {$substr: ['$period.from', 0, 10]}, format: '%d-%m-%Y'}},
					limitDate
				]},
				{$gte: [
					{$dateFromString: {dateString: {$substr: ['$period.to', 0, 10]}, format: '%d-%m-%Y'}},
					today
				]},
				{$eq: ['$status', 'Accepted']},
			]}}},
			{$lookup: {from: 'people', foreignField: '_id', localField: 'pid', as: 'person'}},
			{$set: {person: {$first: '$person'}}},
			{$lookup: {from: 'departments', foreignField: '_id', localField: 'person.department', as: 'person.department'}},
			{$lookup: {from: 'posts', foreignField: '_id', localField: 'person.post', as: 'person.post'}},
			{$set: {'person.department': {$first: '$person.department'}, 'person.post': {$first: '$person.post'}}},
		])
		const notifications = await notificationModel.find().sort({createdAt: -1});
		res.status(200).json({leaves, notifications})
	} catch (e) {
		res.status(500).end(e.message)
		console.error(e)
	}
}

exports.post = async(req, res) => {
	try {
		console.log(req.body)
		await new notificationModel({
			subject: req.body.subject,
			message: req.body.message
		}).save()
		res.status(201).end()
	} catch (e) {
		console.error(e);
		res.status(500).end()
	}
} 