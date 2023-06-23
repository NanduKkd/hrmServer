const attendanceModel = require('../models/attendance')
const personModel = require('../models/person')
const leaveModel = require('../models/leave')
const holidayModel = require('../models/holiday')
const pmlModel = require('../models/pml')
const mongoose = require('mongoose')

exports.personal = async(req, res) => {
	try {
		const person = req.params.person==='self'?req.user:await personModel.findOne({_id: req.params.person});
		const month = parseInt(req.params.month)-1;
		const year = parseInt(req.params.year);
		const my = year*12+month;
		const attendances = await attendanceModel.find({
			'date.year': year,
			'date.month': month,
			pid: person._id,
			verified: true,
		})
		const holidays = await holidayModel.find({
			year, month, onsite: person.onsite
		})
		const monthData = []
		const monthEnd = new Date(new Date(Math.floor((my+1)/12), (my+1)%12, 1).getTime()-24*3600000).getDate();
		for(let i=0; i<monthEnd; i++) {
			monthData.push({date: i+1})
			const d = new Date(Math.floor(my/12), my%12, i+1).getDay()
			if(d===0) {
				monthData[i].morningStatus = 'sunday'
				monthData[i].eveningStatus = 'sunday'
			}
		}
		for(let i of holidays) {
			if(i.morning) {
				monthData[i.date-1].morningStatus = 'holiday'
			}
			if(i.evening) {
				monthData[i.date-1].eveningStatus = 'holiday'
			}
		}
		for(let i of attendances) {
			monthData[i.date.date-1].morningStatus = i.morning
			monthData[i.date.date-1].eveningStatus = i.evening
		}
		const textsDict = {
			holiday: 'Holiday',
			compensatory: 'Attended (Compensatory)',
			leave: 'Leave',
			redmark: 'Redmark',
			undefined: '-',
			sunday: 'Sunday',
		}
		for(let i of monthData) {
			i.morningText = textsDict[i.morningStatus]
			i.eveningText = textsDict[i.eveningStatus]
		}
		return res.status(200).json({attendances: monthData, person: req.params.person==='self'?undefined:person})
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}

exports.total = async(req, res) => {
	try {
		const month = parseInt(req.params.month)-1;
		const year = parseInt(req.params.year);

		const pmls = await pmlModel.aggregate([
			{$match: {month, year}},
			{$lookup: {from: 'people', localField: 'person', foreignField: '_id', as: 'person'}},
			{$set: {person: {$first: '$person'}}},
			{$lookup: {from: 'posts', localField: 'person.post', foreignField: '_id', as: 'post'}},
			{$set: {post: {$first: '$post'}}},
			{$set: {post: '$post.name', person: '$person.name', pid: '$person._id'}},
		])
		res.status(200).json(pmls);
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}