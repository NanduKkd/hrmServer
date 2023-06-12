const LeaveDate = require('../utils/leavedate')
const personModel = require('../models/person')
const leaveModel = require('../models/leave')
const attendanceModel = require('../models/attendance')
const holidayModel = require('../models/holiday')
const pmlModel = require('../models/pml')
const mongoose = require('mongoose')
const LeaveManager = require('../utils/leaveManager')
const leaveChecker = require('../utils/leaveChecker')

exports.get = async(req, res) => {
	try {
		if(req.user.admin || req.params.reporting) {
			const persons = await personModel.aggregate([
				...(req.params.reporting?[{$match: {$expr: {$or: [
					{eq: ['$attendancereportingperson', new mongoose.Types.ObjectId(req.user._id)]},
					{eq: ['$leavereportingperson', new mongoose.Types.ObjectId(req.user._id)]},
				]}}}]:[]),
				{$lookup: {from: 'departments', foreignField: '_id', localField: "department", as: 'department'}},
				{$lookup: {from: 'posts', foreignField: '_id', localField: "post", as: 'post'}},
				{$set: {department: {$first: '$department'}, post: {$first: '$post'}}},
			])
			if(!persons.length) return res.status(405).end()
			const now = new Date();
			const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
			const thisDayLD = new LeaveDate(now.getFullYear(), now.getMonth(), now.getDate(), 1)
			const leaves = await leaveModel.find({$expr: {$and: [
				{$lte: [
					{$dateFromString: {dateString: {$substr: ['$period.from', 0, 10]}, format: '%d-%m-%Y'}},
					today
				]},
				{$gte: [
					{$dateFromString: {dateString: {$substr: ['$period.to', 0, 10]}, format: '%d-%m-%Y'}},
					today
				]},
				{$in: ['$status', ['Accepted', 'Waiting']]}
			]}})

			for(let leave of leaves) {
				const person = persons.find(i => i._id.toString()===leave.pid.toString())
				person.available = [true, true]
				const fromLD = LeaveDate.fromString(leave.period.from)
				const toLD = LeaveDate.fromString(leave.period.to)
				if(fromLD.getDatestamp()===toLD.getDatestamp()) {
					if(fromLD.fullday) person.available[0] = false
					if(toLD.fullday) person.available[1] = false
				} else if(fromLD.getDatestamp()===thisDayLD.getDatestamp()) {
					if(fromLD.fullday) person.available[0] = false
					person.available[1] = false
				} else if(toLD.getDatestamp()===thisDayLD.getDatestamp()) {
					if(toLD.fullday)
						person.available[1] = false
					person.available[0] = false
				} else {
					person.available = [false, false]
				}
			}
			res.status(200).json(persons)
		} else {
			const persons = await personModel.aggregate([
				{$lookup: {from: 'departments', foreignField: '_id', localField: "department", as: 'department'}},
				{$lookup: {from: 'posts', foreignField: '_id', localField: "post", as: 'post'}},
				{$set: {department: {$first: '$department'}, post: {$first: '$post'}}},
			])
			res.status(200).json(persons)
		}
	} catch(e) {
		res.status(500).end()
		console.error(e)
	}
}
exports.getPerson = async(req, res) => {
	try {
		if(req.user.admin || !req.params.reporting) {
			const persons = await personModel.aggregate([
				{$match: {_id: mongoose.Types.ObjectId(req.params.pid)}},
				{$lookup: {
					from: 'departments',
					foreignField: '_id',
					localField: "department",
					as: 'department'
				}},
				{$lookup: {
					from: 'posts',
					foreignField: '_id',
					localField: "post",
					as: 'post'
				}},
				{$lookup: {
					from: 'people',
					foreignField: '_id',
					localField: "leavereportingperson",
					as: 'leavereportingperson'
				}},
				{$lookup: {
					from: 'people',
					foreignField: '_id',
					localField: "attendancereportingperson",
					as: 'attendancereportingperson'
				}},
				{$set: {
					department: {$first: '$department'},
					post: {$first: '$post'},
					attendancereportingperson: {$first: '$attendancereportingperson'},
					leavereportingperson: {$first: '$leavereportingperson'},
				}},
			])
			if(!persons[0]) return res.status(404).end()
			const person = persons[0]

			let now = new Date()
			const pml = await pmlModel.findOne({year: now.getFullYear(), month: now.getMonth(), person: person._id})
			// simpleReport = await leaveChecker.simplePersonalReport(person, now.getFullYear(), now.getMonth())
			// console.log(simpleReport,'...');

			res.status(200).json({...persons[0], pml})
		} else if(req.params.reporting) {
			const persons = await personModel.find({$expr: {$or: [
				{$eq: ['$attendancereportingperson', req.user._id]},
				{$eq: ['$leavereportingperson', req.user._id]},
			]}})
			res.status(200).json(persons)
		} else {
			res.status(403).end()
		}
	} catch(e) {
		res.status(500).end()
		console.error(e)
	}
}
exports.post = async(req, res) => {
	try {
		const person = new personModel({...req.body, password: '$2b$08$6RnWj2mzMIZ2SiRMcMZBd.eDr0/aR9kkyNkNU1uSPqnlz2eAHwqiq'})
		await person.save()
		res.status(201).json(person)
		await LeaveManager.onEmployeeAdded(person)
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}
exports.patch = async(req, res) => {
	try {
		await personModel.updateOne({_id: req.params.pid}, {$set: req.body})
		res.status(204).end()
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}
exports.patchPost = async(req, res) => {
	try {
		await personModel.updateOne({_id: req.params.pid}, {$set: {post: req.body.post}})
		res.status(204).end()
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}
exports.patchDepartment = async(req, res) => {
	try {
		await personModel.updateOne({_id: req.params.pid}, {$set: {department: req.body.department}})
		res.status(204).end()
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}
exports.patchReportingPerson = async(req, res) => {
	try {
		await personModel.updateOne({_id: req.params.pid}, {$set: {reportingperson: req.body.reportingperson}})
		res.status(204).end()
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}
exports.delete = async(req, res) => {
	try {
		await personModel.deleteOne({_id: req.params.pid})
		res.status(204).end()
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}

exports.getSelfProfile = async(req, res) => {
	res.status(200).json(req.user)
}
