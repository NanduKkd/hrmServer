const leaveModel = require('../models/leave')
const pmlModel = require('../models/pml')
const holidayModel = require('../models/holiday')
const attendanceModel = require('../models/attendance')
const LeaveDate = require('../utils/LeaveDate')
const mongoose = require('mongoose')
const Pml = require('./pml');

exports.isPossible = async(pid, type, from, to) => {
	if(from.year!==to.year) return {possible: false, message: "Cannot apply for leave in two different years at a time"}
	const available = await exports.countLeft(pid, type, from.year);
	if(available >= to.getDatestamp()-from.getDatestamp()) return {possible: true}
	else return {possible: false, message: "You have only "+available+" left out of 12 in category "+type}
}

exports.countLeft = async(pid, year, month) => {
	const pml = await pmlModel.findOne({person: pid, year: year, month: month})
	return {
		'C/L': pml.carryCL+pml.earnedCL+pml.carryCompensatory+pml.earnedCompensatory-pml.takenCL,
		'S/L': pml.carrySL+pml.earnedSL-pml.takenSL,
		'P/L': pml.carryPL+pml.earnedPL-pml.takenPL,
	};
	/*
	const leaves = await leaveModel.aggregate([
		{$match: {$expr: {$and: [
			{$eq: [{$substr: ["$period.from", 6, 4]}, year+'']},
			{$eq: ['$pid', typeof pid==='string'?mongoose.Types.ObjectId(pid):pid]},
			showPending?{$ne: ['$status', 'Rejected']}:{$eq: ['$status', 'Accepted']},
		]}}},
		{$group: {_id: '$type', taken: {$sum: '$period.length'}}},
	]);
	let types = {'P/L': 12, 'C/L': 12, "S/L": 12};
	for(let i of leaves) {
		types[i._id] -= i.taken;
	}
	return types;
	*/
}

exports.countLeftByType = async(pid, type, year) => {
	const leaves = await leaveModel.aggregate([
		{$match: {$expr: {$and: [
			{$eq: [type, "$type"]},
			{$eq: [{$substr: ["$period.from", 6, 4]}, year]},
			{$eq: ['$employee', new mongoose.Types.ObjectId(pid)]}
		]}}},
		{$group: {_id: 1, taken: {$sum: '$period.length'}}},
	]);

	return 12-leaves[0].taken
}

exports.leaveReport = async(person, year, month) => {
	const monthStartDate = new Date(new Date(year+'-'+(month+1)+'-01Z').getTime())
	const monthEndDate = new Date(new Date((month===11?year+1:year)+'-'+(((month+2)%12)+'').padStart(2,'0')+'-01Z').getTime()-24*3600000)
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

	const dates = [];
	for(let i=1; i<=monthEndDate.getDate(); i++) {
		const thisDate = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth(), i)
		if(thisDate.getDay()===0)
			dates[i] = [{sunday: true}, {sunday: true}]
		else if(thisDate.getTime() >= today.getTime())
			dates[i] = [{upcoming: true}, {upcoming: true}]
		else
			dates[i] = [{}, {}]
	}
	const holidays = await holidayModel.find({
		'year': year,
		'month': month,
		onsite: person.onsite,
	})
	for(let i of holidays) {
		if(i.morning) dates[i.date][0].holiday = true
		if(i.evening) dates[i.date][1].holiday = true
	}
	const attendances = await attendanceModel.find({$expr: {$and: [
		{$eq: ['$date.year', year]},
		{$eq: ['$date.month', month]},
		{$eq: ['$pid', person._id]},
		{$or: [
			{$eq: ['$markmorning', true]},
			{$eq: ['$markevening', true]},
		]},
	]}})
	for(let i of attendances) {
		if(i.markmorning)
			dates[i.date.date][0].attendance = true
		if(i.markevening)
			dates[i.date.date][1].attendance = true
	}


	const leaves = await leaveModel.find({$expr: {$and: [
		{$lte: [
			{$dateFromString: {dateString: {$substr: ['$period.from', 0, 10]}, format: '%d-%m-%Y'}},
			monthEndDate
		]},
		{$gte: [
			{$dateFromString: {dateString: {$substr: ['$period.to', 0, 10]}, format: '%d-%m-%Y'}},
			monthStartDate
		]},
		{$eq: ['$pid', person._id]},
		{$eq: ['$status', 'Accepted']}
	]}})
	for(let leave of leaves) {
		const fromLD = LeaveDate.fromString(leave.period.from);
		const toLD = LeaveDate.fromString(leave.period.to);
		const thisLeave = () => ({type: leave.type})
		if(fromLD.getDatestamp()===toLD.getDatestamp()) {
			if(fromLD.fullday) dates[fromLD.date][0] = thisLeave()
			if(toLD.fullday) dates[toLD.date][1] = thisLeave()
		} else {
			if(fromLD.year===year && fromLD.month===month) {
				if(fromLD.fullday) dates[fromLD.date][0] = thisLeave()
				dates[fromLD.date][1].leave = thisLeave()
			}
			if(toLD.year===year && toLD.month===month) {
				if(toLD.fullday) dates[toLD.date][1] = thisLeave()
				dates[toLD.date][0].leave = thisLeave()
			}
			for(let i=fromLD.getDatestamp()+1; i<toLD.getDatestamp(); i++) {
				const thisDate = new Date(i*24*3600000)
				if(thisDate.getMonth()!==month-1 || thisDate.getFullYear()!==year)
					continue;
				dates[thisDate.getDate()][0].leave = thisLeave()
				dates[thisDate.getDate()][1].leave = thisLeave()
			}
		}
	}
	const pml = await pmlModel.findOne({year: year, month: month, person: person._id})
	const lAv = {
		'C/L': pml.carryCL+pml.earnedCL+pml.carryCompensatory+pml.earnedCompensatory,
		'S/L': pml.carrySL+pml.earnedSL,
		'P/L': pml.carryPL+pml.earnedPL,
	}
	for(let ii=1; ii<=monthEndDate.getDate(); ii++) {
		const i = dates[ii]
		if(i[0].leave) {
			if(lAv[i[0].leave.type]>0) {
				lAv[i[0].leave.type] -= 0.5;
			} else {
				i[0].leave.status = "lop"
			}
		}
		if(i[1].leave) {
			if(lAv[i[1].leave.type]>0) {
				lAv[i[1].leave.type] -= 0.5;
			} else {
				i[1].leave.status = "lop"
			}
		}
	}
	const dates1 = []
	for(let i=1; i<=monthEndDate.getDate(); i++) {
		dates1.push(dates[i])
	}
	return dates1
}

exports.simplePersonalReport = async(person, year, month) => {
	const monthStartDate = new Date(Date.UTC(year,month,1))
	const monthEndDate = new Date(Date.UTC(month===11?year+1:year, (month+1)%12, 1)-24*3600000)
	const dates = [];
	const now = new Date()
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	for(let i=1; i<=monthEndDate.getDate(); i++) {
		const thisDate = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth(), i)
		if(thisDate.getDay()===0)
			dates[i] = [{kind: 'sunday'}, {kind: 'sunday'}]
		else if(thisDate.getTime() >= today.getTime())
			dates[i] = [{kind: 'upcoming'}, {kind: 'upcoming'}]
		else
			dates[i] = [null, null]
	}
	const holidays = await holidayModel.find({
		'year': year,
		'month': month,
		'onsite': person.onsite
	})
	for(let i of holidays) {
		if(i.morning) dates[i.date][0] = {kind: 'holiday'}
		if(i.evening) dates[i.date][1] = {kind: 'holiday'}
	}
	const attendances = await attendanceModel.find({$expr: {$and: [
		{$eq: ['$date.year', year]},
		{$eq: ['$date.month', month]},
		{$eq: ['$pid', person._id]},
		{$or: [
			{$eq: ['$markmorning', true]},
			{$eq: ['$markevening', true]},
		]},
	]}})
	for(let i of attendances) {
		if(i.markmorning)
			dates[i.date.date][0] = {kind: 'attendance'}
		if(i.markevening)
			dates[i.date.date][1] = {kind: 'attendance'}
	}
	const leaves = await leaveModel.find({$expr: {$and: [
		{$lte: [
			{$dateFromString: {dateString: {$substr: ['$period.from', 0, 10]}, format: '%d-%m-%Y'}},
			monthEndDate
		]},
		{$gte: [
			{$dateFromString: {dateString: {$substr: ['$period.to', 0, 10]}, format: '%d-%m-%Y'}},
			monthStartDate
		]},
		{$eq: ['$status', 'Accepted']},
		{$eq: ['$pid', mongoose.Types.ObjectId(person._id)]}
	]}})
	for(let leave of leaves) {
		const fromLD = LeaveDate.fromString(leave.period.from);
		const toLD = LeaveDate.fromString(leave.period.to);
		const thisLeave = () => ({type: leave.type, kind: 'leave'})
		if(fromLD.getDatestamp()===toLD.getDatestamp()) {
			if(fromLD.fullday) dates[fromLD.date][0] = thisLeave()
			if(toLD.fullday) dates[toLD.date][1] = thisLeave()
		} else {
			if(fromLD.year===year && fromLD.month===month) {
				if(fromLD.fullday) dates[fromLD.date][0] = thisLeave()
				dates[fromLD.date][1] = thisLeave()
			}
			if(toLD.year===year && toLD.month===month) {
				if(toLD.fullday) dates[toLD.date][1] = thisLeave()
				dates[toLD.date][0] = thisLeave()
			}
			for(let i=fromLD.getDatestamp()+1; i<toLD.getDatestamp(); i++) {
				const thisDate = new Date(i*24*3600000)
				if(thisDate.getMonth()!==month || thisDate.getFullYear()!==year)
					continue;
				dates[thisDate.getDate()] = [thisLeave(), thisLeave()]
			}
		}
	}
	const thisPml = await pmlModel.findOne({month: month, year: year, person: person._id})
	const edata = {leaves: {'P/L': 0, 'C/L': 0, 'S/L': 0}, attendance: 0, lop: 0}
	for(let ii=1; ii<=monthEndDate.getDate(); ii++) {
		const thisdate = new LeaveDate(year, month, ii)
		if(thisdate.getDatestamp()<person.joiningdate/24/3600000) {
			continue
		}
		const i = dates[ii]
		if(!i[0])
			edata.lop += 0.5;
		else if(i[0].kind==="attendance") edata.attendance += 0.5
		else if(i[0].kind==="leave") edata.leaves[i[0].type] += 0.5
		if(!i[1])
			edata.lop += 0.5;
		else if(i[1].kind==="attendance") edata.attendance += 0.5
		else if(i[1].kind==="leave") edata.leaves[i[1].type] += 0.5

	}
	if(!thisPml || edata.leaves['P/L'] !== thisPml.takenCL || edata.leaves['C/L'] !== thisPml.takenCL || edata.leaves['S/L'] !== thisPml.takenSL) {
		if(thisPml) {
			console.log("PL:",thisPml.takenPL,edata.leaves["P/L"],"CL:",thisPml.takenCL,edata.leaves["C/L"],"SL:",thisPml.takenSL,edata.leaves["S/L"],)
		}
		throw new Error("So wrong, leaves taken is not correct")
	}
	if(thisPml.takenCL>thisPml.carryCL+thisPml.earnedCL+thisPml.carryCompensatory+thisPml.earnedCompensatory) {
		edata.lop += thisPml.takenCL-(edata.leaves['C/L'] = thisPml.carryCL+thisPml.earnedCL+thisPml.carryCompensatory+thisPml.earnedCompensatory)
	}
	if(thisPml.takenPL>thisPml.carryPL+thisPml.earnedPL) {
		edata.lop += thisPml.takenPL-(edata.leaves['P/L'] = thisPml.carryPL+thisPml.earnedPL)
		throw new Error("P/L Leaves taken is more than available, which should not happen.")
	}
	if(thisPml.takenSL>thisPml.carrySL+thisPml.earnedSL) {
		edata.lop += thisPml.takenSL-(edata.leaves['S/L'] = thisPml.carrySL+thisPml.earnedSL)
	}
	return edata;
}


exports.filterLeaves = async(list, isLegal) => {
	const finalList = []

	for(let leave of list) {
		let leaveLegal = true;
		const fromLD = LeaveDate.fromString(leave.period.from);
		const toLD = LeaveDate.fromString(leave.period.to);
		const frommy = fromLD.month+fromLD.year*12, tomy = toLD.month+toLD.year*12;
		// if(!pml) throw new Error("Algorithm Error, No pml found here")
		for(let i=frommy; i<=tomy; i++) {
			pml = await pmlModel.findOne({person: leave.pid, month: frommy%12, year: Math.floor(frommy/12)})
			const len = i===tomy?toLD.date:new Date(new Date(
				Math.floor((i+1)/12),
				(i+1)%12,
				1
			).getTime()-24*3600*1000).getDate() + (i===frommy?-fromLD.date + (fromLD.fullday?1:0.5):0);
			if(
				leave.type==='P/L' && pml.earnedPL+pml.carryPL-pml.takenPL < len
				|| leave.type==='S/L' && pml.earnedSL+pml.carrySL-pml.takenSL < len
				|| leave.type==='C/L' && pml.earnedCL+pml.carryCL+pml.carryCompensatory+pml.earnedCompensatory < len
			) {
				leaveLegal = false;
				break;
			}
		}
		if(leaveLegal === isLegal) finalList.push(leave)
	}
	return finalList
}
