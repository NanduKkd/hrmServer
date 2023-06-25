const leaveModel = require('../models/leave')
const personModel = require('../models/person')
const cancelLeaveModel = require('../models/cancelleave')
const cancelledLeaveModel = require('../models/cancelledleave')
const changeLeaveDateModel = require('../models/changeleavedate')
const LeaveManager = require('../utils/leaveManager')
const pmlModel = require('../models/pml')
const holidayModel = require('../models/holiday')
const mongoose = require('mongoose')
const emailer = require('../utils/emailer')
// const {filterLeaves} = require('../utils/leaveChecker')

exports.getMy = async(req, res) => {
	try {
		const myLeaves = await leaveModel.find({pid: req.user._id}).sort({'date.year': -1, 'date.month': -1, 'date.date': -1})
		res.status(200).json(myLeaves)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
exports.getForAdmin = async(req, res) => {
	try {
		const leaves = await leaveModel.find({status: 'Accepted'})
		res.status(200).json(leaves)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
exports.getRequestedLeaves = async(req, res) => {
	try {
		const people = await personModel.find({leavereportingperson: req.user._id})
		if(!people.length) {
			res.status(405).end()
		} else {
			const leaves = await leaveModel.aggregate([
				{$match: {$expr: {$and: [
					{$in: ['$pid', people.map(i => i._id)]},
					{$or: [
						{$lte: ['$sub.person', null]},
						{$eq: ['$sub.status', 'Accepted']}
					]},
					{$eq: ['$noresponse', false]},
					{$eq: ['$status', 'Waiting']},
				]}}},
				{$lookup: {from: 'people', foreignField: '_id', localField: 'pid', as: 'employee'}},
				{$set: {employee: {$first: '$employee'}}},
				{$lookup: {from: 'departments', foreignField: '_id', localField: 'employee.department', as: 'department'}},
				{$lookup: {from: 'posts', foreignField: '_id', localField: 'employee.post', as: 'post'}},
				{$set: {post: {$first: '$post'}, department: {$first: '$department'}}},
				{$project: {period: 1, type: 1, department: '$department.name', post: '$post.name', name: '$employee.name', pid: '$employee._id', createdAt: 1}}
			])
			res.status(200).json(await LeaveManager.filterLeaves(leaves, true))
		}
	} catch (e) {
		console.error(e)
		res.status(500).end()
		if(e.runChecker) {
			await LeaveManager.checker()
			console.log('runnning checker');
		}
	}
}
// exports.getSpecialLeaves = async(req, res) => {
// 	try {
// 		console.log('haha')
// 		if(!req.user.superadmin) return res.status(405).end()
// 		console.log('huhu')
// 		const leaves = await leaveModel.aggregate([
// 			{$match: {$expr: {$and: [
// 				{$or: [
// 					{$lte: ['$sub.person', null]},
// 					{$eq: ['$sub.status', 'Accepted']}
// 				]},
// 				{$eq: ['$status', 'Waiting']},
// 			]}}},
// 			{$lookup: {from: 'people', foreignField: '_id', localField: 'pid', as: 'employee'}},
// 			{$set: {employee: {$first: '$employee'}}},
// 			{$lookup: {from: 'departments', foreignField: '_id', localField: 'employee.department', as: 'department'}},
// 			{$lookup: {from: 'posts', foreignField: '_id', localField: 'employee.post', as: 'post'}},
// 			{$set: {post: {$first: '$post'}, department: {$first: '$department'}}},
// 			{$project: {period: 1, type: 1, department: '$department.name', post: '$post.name', name: '$employee.name', pid: '$employee._id', createdAt: 1}}
// 		])
// 		console.log(leaves, 'hehe')
// 		res.status(200).json(await LeaveManager.filterLeaves(leaves, false))
// 	} catch (e) {
// 		console.error(e)
// 		res.status(500).end()
// 		if(e.runChecker) {
// 			await LeaveManager.checker()
// 			console.log('runnning checker');
// 		}
// 	}
// }

exports.leavesLeft = async(req, res) => {
	try {
		const year = new Date().getFullYear()
		const pmls = await pmlModel.find({year: {$in: [year-1, year, year+1]}, pid: req.user._id})
		res.status(200).json(pmls)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}

exports.respond = async(req, res) => {
	try {
		if(req.params.type==='leave') {
			const leave = await leaveModel.findOneAndUpdate({_id: req.params.id}, {$set: {
				status: req.params.status,
				responseBy: req.user._id,
				responseAt: Date.now()
			}}, {returnDocument: 'after'});
			console.log(req.params.type, req.params.id, req.params.status);
			await LeaveManager.onLeave(leave, true)
		} else if(req.params.type==='cancelleave') {
			const cancelLeave = await cancelLeaveModel.findOneAndDelete({_id: req.params.id})
			if(cancelLeave.cancelcompletely) {
				const leave = await leaveModel.findOneAndDelete({_id: cancelLeave.lid})
				await new cancelledLeaveModel(leave).save()
			} else
				await leaveModel.updateOne({_id: cancelLeave.lid}, {$set: {
					'period.cancelledleaves': cancelLeave.days
				}})
			await LeaveManager.onCancelLeave(cancelLeave)
		} else if(req.params.type==='changedate') {
			if(req.params.status==='Accepted') {
				const cld = await changeLeaveDateModel.findOneAndDelete({_id: req.params.id})
				await leaveModel.updateOne({_id: cld.lid}, {$set: {'period.from': cld.newstartingdate, 'period.to': cld.newstartingdate, 'period.length': cld.newendingdate}})
				await LeaveManager.onLeaveChangeDate(cld);
			} else if(req.params.status==='Rejected') {
				await changeLeaveDateModel.updateOne({_id: req.params.id}, {$set: {rejected: true, rejectedat: new Date()}})
			}
		}
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
exports.getSubRequests = async(req, res) => {
	try {
		const leaves = await leaveModel.aggregate([
			{$match: {'sub.person': req.user._id, 'sub.status': 'Waiting'}},
			{$lookup: {
				from: 'people', localField: 'pid', 'foreignField': '_id', as: 'employee'
			}},
			{$set: {employee: {$first: '$employee'}}},
			{$lookup: {
				from: 'posts', localField: 'employee.post', 'foreignField': '_id', as: 'post'
			}},
			{$lookup: {
				from: 'departments', localField: 'employee.department', 'foreignField': '_id', as: 'department'
			}},
			{$set: {post: {$first: '$post'}, department: {$first: '$department'}}},
			{$project: {employee: '$employee.name', post: '$post.name', department: '$department.name', period: 1, sub: 1, _id: 1}},
		]);
		const cancelLeaves = await cancelLeaveModel.aggregate([
			{$match: {'subperson': req.user._id, subaccepted: false}},
			{$lookup: {
				from: 'people', localField: 'pid', 'foreignField': '_id', as: 'employee'
			}},
			{$set: {employee: {$first: '$employee'}}},
			{$lookup: {
				from: 'posts', localField: 'employee.post', 'foreignField': '_id', as: 'post'
			}},
			{$lookup: {
				from: 'departments', localField: 'employee.department', 'foreignField': '_id', as: 'department'
			}},
			{$set: {post: {$first: '$post'}, department: {$first: '$department'}}},
			{$project: {employee: '$employee.name', post: '$post.name', department: '$department.name', cancelcompletely: 1, days: 1, _id: 1}},
		])
		const changeLeaves = await changeLeaveDateModel.aggregate([
			{$match: {'subperson': req.user._id, substatus: 'Waiting'}},
			{$lookup: {
				from: 'people', localField: 'pid', 'foreignField': '_id', as: 'employee'
			}},
			{$set: {employee: {$first: '$employee'}}},
			{$lookup: {
				from: 'posts', localField: 'employee.post', 'foreignField': '_id', as: 'post'
			}},
			{$lookup: {
				from: 'departments', localField: 'employee.department', 'foreignField': '_id', as: 'department'
			}},
			{$set: {post: {$first: '$post'}, department: {$first: '$department'}}},
			{$project: {employee: '$employee.name', post: '$post.name', department: '$department.name', newstartingdate: 1, newendingdate: 1, newlength: 1, _id: 1}},
		])
		res.status(200).json({leaves, cancelLeaves, changeLeaves})
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}

exports.getSubLeaves = async(req, res) => {
	try {
		const subs = await leaveModel.aggregate([
			{$match: {'sub.person': req.user._id, 'sub.status': 'Accepted', status: 'Accepted'}},
			{$lookup: {
				from: 'people', localField: 'pid', 'foreignField': '_id', as: 'employee'
			}},
			{$set: {employee: {$first: '$employee'}}},
			{$lookup: {
				from: 'posts', localField: 'employee.post', 'foreignField': '_id', as: 'post'
			}},
			{$lookup: {
				from: 'departments', localField: 'employee.department', 'foreignField': '_id', as: 'department'
			}},
			{$set: {post: {$first: '$post'}, department: {$first: '$department'}}},
			{$project: {employee: '$employee.name', post: '$post.name', department: '$department.name', period: 1, sub: 1, _id: 1}},
		])
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}

exports.changeSub = async(req, res) => {
	try {
		await leaveModel.updateOne({pid: req.user._id, _id: req.params.leave}, {$set: {
			'sub.person': req.body.person,
			'sub.requestedAt': Date.now(),
			'sub.status': 'Waiting',
		}, $unset: {'sub.responseAt': ''}})
		await changeLeaveDateModel.updateOne({pid: req.user._id, lid: req.params.leave}, {$set: {
			subperson: req.body.person,
			substatus: 'Waiting',
		}, $unset: {subupdatedat: 1}})
		await cancelLeaveModel.updateOne({pid: req.user._id, lid: req.params.leave}, {$set: {
			subperson: req.body.person,
			subaccepted: false,
		}, $unset: {subacceptedat: 1}})
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
exports.respondSub = async(req, res) => {
	try {
		if(req.params.type==='newrequest') {
			const leave = await leaveModel.findOneAndUpdate({
				_id: req.params.leave,
				'sub.status': 'Waiting',
				'sub.person': req.user._id,
			}, {$set: {
				'sub.status': req.body.status,
				'sub.responseAt': new Date(),
			}})
		} else if(req.params.type==='cancel') {
			await cancelLeaveModel.updateOne({_id: req.params.leave, subperson: req.user._id}, {$set: {
				subaccepted: true,
				subacceptedat: new Date(),
			}})
		} else if(req.params.type==='changedate') {
			await changeLeaveDateModel.updateOne({_id: req.params.leave, subperson: req.user._id}, {$set: {
				substatus: req.body.status,
				subupdatedat: new Date(),
			}})
		}
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
exports.post = async(req, res) => {
	try {
		const leave = new leaveModel(req.body)
		if(req.user.superadmin && !leave.sub?.person) {
			leave.status = "Accepted";
		}
		await leave.save()
		res.status(201).json(leave);
		if(leave.status==='Accepted')
			await LeaveManager.onLeave(leave, true)
		else
			await emailer.newLeave(req.user, leave);
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}

exports.cancelLeave = async(req, res) => {
	try {
		const leave = await leaveModel.findById(req.params.lid)
		if(leave.pid!==req.user._id) res.status(403).end()
		const cancelLeave = new cancelLeaveModel({
			pid: leave.pid,
			lid: leave._id,
			subperson: leave.sub.person,
		})
		if(req.body.cancelCompletely) {
			cancelLeave.cancelcompletely = true
		} else {
			cancelLeave.dates = req.body.dates
		}
		leave.status = 'Reviewing'
		await cancelLeave.save()
		await leave.save()
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}

exports.changeLeaveDate = async(req, res) => {
	try {
		const leave = await leaveModel.findById(req.params.lid)
		if(leave.pid!==req.user._id) res.status(403).end()
		const changeLeaveDate = new changeLeaveDateModel({
			pid: leave.pid,
			lid: leave._id,
			subperson: leave.sub.person,
			newstartingdate: req.body.starting,
			newendingdate: req.body.ending,
			newlength: req.body.length
		})
		leave.status = 'Reviewing'
		await leave.save()
		await cancelLeave.save()
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}

exports.getSpecialRequests = async(req, res) => {
	try {
		if(!req.user.superadmin) return res.status(403).end()
		const cancels = await cancelLeaveModel.find();
		const changeDates = await changeLeaveDateModel.find({$expr: {$or: [
			{$eq: ['$subperson', null]},
			{$eq: ['$substatus', 'Accepted']}
		]}})
		const leaves = await leaveModel.aggregate([
			{$match: {$expr: {$and: [
				{$or: [
					{$lte: ['$sub.person', null]},
					{$eq: ['$sub.status', 'Accepted']}
				]},
				{$eq: ['$status', 'Waiting']},
			]}}},
			{$lookup: {from: 'people', foreignField: '_id', localField: 'pid', as: 'employee'}},
			{$set: {employee: {$first: '$employee'}}},
			{$lookup: {from: 'departments', foreignField: '_id', localField: 'employee.department', as: 'department'}},
			{$lookup: {from: 'posts', foreignField: '_id', localField: 'employee.post', as: 'post'}},
			{$set: {post: {$first: '$post'}, department: {$first: '$department'}}},
			{$project: {period: 1, type: 1, department: '$department.name', post: '$post.name', name: '$employee.name', pid: '$employee._id', createdAt: 1, noresponse: 1}}
		])
		res.status(200).json({cancels, changeDates, leaves: await LeaveManager.filterLeaves(leaves, false)})
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}


exports.getMonthData = async(req, res) => {
	try {
		const month = parseInt(req.params.month)-1
		const year = parseInt(req.params.year)
		const my = month + year*12;
		const pml = (await pmlModel.findOne({month, year, person: req.user._id})).toObject()
		pml.my = my;
		const holidays = await holidayModel.find({year, month, onsite: req.user.onsite})
		res.json({pml, my, holidays})
	} catch (e) {
		console.error(e)
		res.status(500).end()
		if(e.name==='TypeError') {
			await LeaveManager.checker()
		}
	}
}

exports.getMonthsData = async(req, res) => {
	try {
		const mys = req.body.mys;
		const pmls = await pmlModel.aggregate([
			{$set: {my: {$add: [{$multiply: ['$year', 12]}, '$month']}}},
			{$match: {$expr: {$and: [
				{$in: [
					'$my'
					, mys
				]},
				{$eq: ['$person', req.user._id]},
			]}}},
		])
		const holidays = await holidayModel.find({$expr: {$and: [
			{$in: [
				{$add: ['$month', {$multiply: ['$year', 12]}]}, mys
			]},
			{$eq: ['$onsite', req.user.onsite]}
		]}})
		const leaves = {};
		for(let i of mys) {
			const year = Math.floor(i/12), month = i%12;
			const monthStartDate = new Date(Date.UTC(year,month,1))
			const monthEndDate = new Date(Date.UTC(month===11?year+1:year, (month+1)%12, 1)-24*3600000)
			leaves[i] = await leaveModel.find({$expr: {$and: [
				{$lte: [
					{$dateFromString: {dateString: {$substr: ['$period.from', 0, 10]}, format: '%d-%m-%Y'}},
					monthEndDate
				]},
				{$gte: [
					{$dateFromString: {dateString: {$substr: ['$period.to', 0, 10]}, format: '%d-%m-%Y'}},
					monthStartDate
				]},
				{$in: ['$status', ['Accepted', 'Waiting', 'Reviewing']]},
				{$eq: ['$pid', req.user._id]}
			]}}, {period: 1, type: 1})
		}
		const arr = []
		for(let my of mys) {
			const monthData = {my}
			monthData.pml = pmls.find(i => i.my===my)
			monthData.holidays = holidays.filter(i => 
				i.month===my%12
				&& i.year===Math.floor(my/12)
			)
			monthData.leaves = leaves[my];
			arr.push(monthData);
		}
		res.status(200).json(arr)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}