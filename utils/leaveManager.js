const cron = require('node-cron')
const pmlModel = require('../models/pml')
const personModel = require('../models/person')
const mongoose = require('mongoose')
const LeaveDate = require('./leavedate')
const {PLPerYear} = require('./constants')
const Pml = require('./pml')

exports.checker = async function() {
	const now = new Date();
	const toGetMy = now.getMonth()+now.getFullYear()*12+6
	const people = await personModel.aggregate([
		{$project: {_id: 1, joiningdate: 1, monthsprobation: 1, name: 1}},
		{$lookup: {
			from: 'personmonthleaves',
			foreignField: 'person',
			localField: '_id',
			as: 'pml',
			pipeline: [
				{$sort: {year: -1, month: -1}},
				{$limit: 1}
			]
		}},
	])
	for(let person of people) {
		if(!person.pml[0] || person.pml[0].year*12+person.pml[0].month<toGetMy) {
			const jmy = person.joiningdate.getMonth()+person.joiningdate.getFullYear()*12
			const pmy = jmy+person.monthsprobation + (person.joiningdate.getDate()!==1?1:0)
			let pml = person.pml[0]
			let my = pml.month + pml.year*12 + 1;
			console.log('\nAdding pmls for '+person.name+'('+person._id+')')
			while(my<=toGetMy) {
				const newPml = new pmlModel({
					person: person._id,
					year: Math.floor(my/12), month: my%12,
					earnedCompensatory: 0,
					takenSL: 0, takenCL: 0, takenPL: 0,
				})
				if(my%12===0) {
					newPml.carryCL = 0;
					newPml.carrySL = 0;
					newPml.carryCompensatory = 0;
					newPml.carryPL = Math.max(0, (pml.earnedPL + pml.carryPL - pml.takenPL) % PLPerYear);
				} else {
					newPml.carryCompensatory = Math.max(pml.carryCompensatory + pml.earnedCompensatory - pml.takenCL, 0)
					newPml.carrySL = Math.max(pml.carrySL + pml.earnedSL - pml.takenSL, 0)
					newPml.carryCL = Math.max(pml.carryCompensatory + pml.earnedCompensatory - pml.takenCL < 0 ? pml.carryCompensatory + pml.earnedCompensatory - pml.takenCL + pml.carryCL + pml.earnedCL : pml.carryCL + pml.earnedCL, 0)
					newPml.carryPL = pml.carryPL + pml.earnedPL - pml.takenPL;
				}

				if(pmy>my) {
					newPml.earnedCL = 1.5;
					newPml.earnedSL = 0;
					newPml.earnedPL = 0;
				} else if(my<jmy+12) {
					newPml.earnedCL = 1;
					newPml.earnedSL = 1;
					newPml.earnedPL = 0;
				} else if(my===jmy+12) {
					newPml.earnedCL = 12 - my%12;
					newPml.earnedSL = 12 - my%12;
					newPml.earnedPL = PLPerYear - (my%12)*(PLPerYear/12);
				} else if(my%12===0) {
					newPml.earnedCL = 12;
					newPml.earnedSL = 12;
					newPml.earnedPL = PLPerYear;
				} else {
					newPml.earnedCL = 0;
					newPml.earnedSL = 0;
					newPml.earnedPL = 0;
				}

				await newPml.save()
				console.log('adding month '+my)
				pml = newPml;
				my++;
			}
		} else {
			console.log('checked ok for '+person.name+' ('+person._id+')')
		}
	}
}

exports.startManager = function () {
	cron.schedule('1 1 1 1 * *', exports.checker)
}

exports.onEmployeeAdded = async function(person) {
	const now = new Date();
	const myNow = now.getMonth()+now.getFullYear()*12
	const targetmy = myNow+6;
	const ajmy = person.joiningdate.getMonth()+person.joiningdate.getFullYear()*12
	const jmy = ajmy + (person.joiningdate.getDate()!==1?1:0)
	let pml = {
		carrySL: 0,
		carryCL: 0,
		carryPL: 0,
		carryCompensatory: 0,
		earnedSL: 0,
		earnedCL: 0,
		earnedPL: 0,
		earnedCompensatory: 0,
		takenSL: 0,
		takenCL: 0,
		takenPL: 0,
	};
	if(jmy!==ajmy) {
		pml = new pmlModel({
			person: person._id,
			...pml,
			year: Math.floor(ajmy/12),
			month: ajmy%12,
			takenSL: 0,
			takenCL: 0,
			takenPL: 0,
		})
		await pml.save()
	}
	const pmy = jmy+person.monthsprobation
	let my = jmy;
	while(my<=targetmy) {
		const newPml = new pmlModel({
			person: person._id,
			year: Math.floor(my/12), month: my%12,
			carryCompensatory: 0, earnedCompensatory: 0,
			takenCL: 0, takenSL: 0, takenPL: 0,
		})
		const carrys = calculateMonthCarry(pml, my);
		newPml.carryCL = carrys.carryCL;
		newPml.carrySL = carrys.carrySL;
		newPml.carryPL = carrys.carryPL;
		newPml.carryCompensatory = carrys.carryCompensatory;

		if(pmy>my) {
			newPml.earnedCL = 1.5;
			newPml.earnedSL = 0;
			newPml.earnedPL = 0;
		} else if(my<jmy+12) {
			newPml.earnedCL = 1;
			newPml.earnedSL = 1;
			newPml.earnedPL = 0;
		} else if(my===jmy+12) {
			newPml.earnedCL = 12 - my%12;
			newPml.earnedSL = 12 - my%12;
			newPml.earnedPL = PLPerYear - (my%12)*(PLPerYear/12);
		} else if(my%12===0) {
			newPml.earnedCL = 12;
			newPml.earnedSL = 12;
			newPml.earnedPL = PLPerYear;
		} else {
			newPml.earnedCL = 0;
			newPml.earnedSL = 0;
			newPml.earnedPL = 0;
		}

		await newPml.save()
		pml = newPml;
		my++;
	}
}

exports.onLeave = async function (leave, applyChange) {
	let changes = [];
	let pml;
	const fromLD = LeaveDate.fromString(leave.period.from)
	const toLD = LeaveDate.fromString(leave.period.to)
	const frommy = fromLD.month+fromLD.year*12, tomy = toLD.month+toLD.year*12;
	pml = await pmlModel.findOne({person: leave.pid, month: (frommy-1)%12, year: Math.floor((frommy-1)/12)})
	if(!pml) throw new Error("Algorithm Error, No pml found here")
	for(let i=frommy; i<=tomy; i++) {
		// const len = i===tomy?toLD.date:new Date(new Date(
		// 	Math.floor((i+1)/12),
		// 	(i+1)%12,
		// 	1
		// ).getTime()-24*3600*1000).getDate() + (i===frommy?-fromLD.date + (fromLD.fullday?1:0.5):0);
		const len = await calculateMonthLeaveLen(fromLD, frommy, toLD, tomy, i, leave.type, leave.pid);
		let carrys = calculateMonthCarry(pml, i);
		let takens = {};
		if(leave.type==='S/L') takens.takenSL = len;
		else if(leave.type==='C/L') takens.takenCL = len;
		else if(leave.type==='P/L') takens.takenPL = len;
		if(applyChange) {
			pml = await pmlModel.findOneAndUpdate({person: leave.pid, month: i%12, year: Math.floor(i/12)}, {$set: carrys, $inc: takens}, {returnDocument: 'after'})
		} else {
			pml = await pmlModel.findOne({person: leave.pid, month: i%12, year: Math.floor(i/12)})
			for(let j in carrys) pml[j] = carrys[j]
			for(let j in takens) pml[j] += takens[j]
			if(
				pml.takenCL>pml.carryCL+pml.carryCompensatory+pml.earnedCL+pml.earnedCompensatory
				|| pml.takenSL>pml.carrySL+pml.earnedSL
				|| pml.takenPL>pml.carryPL+pml.earnedPL
			)
				changes.push({
					month: i%12,
					year: Math.floor(i/12),
					takenSL: pml.takenSL,
					takenCL: pml.takenCL,
					takenPL: pml.takenPL,
					carrySL: pml.carrySL,
					carryCL: pml.carryCL,
					carryPL: pml.carryPL,
					carryCompensatory: pml.carryCompensatory,
					earnedCL: pml.earnedCL,
					earnedSL: pml.earnedSL,
					earnedPL: pml.earnedPL,
					earnedCompensatory: pml.earnedCompensatory
				})
		}
	}
	while(pml) {
		let cmy = pml.month + pml.year*12 + 1;
		let carrys = calculateMonthCarry(pml, cmy)
		if(applyChange) {
			pml = await pmlModel.findOneAndUpdate({person: leave.pid, month: cmy%12, year: Math.floor(cmy/12)}, {$set: carrys}, {returnDocument: 'after'})
		} else {
			pml = await pmlModel.findOne({person: leave.pid, month: cmy%12, year: Math.floor(cmy/12)})
			if(!pml) continue
			for(let i in carrys) pml[i] = carrys[i]
			if(
				pml.takenCL>pml.carryCL+pml.carryCompensatory+pml.earnedCL+pml.earnedCompensatory
				|| pml.takenSL>pml.carrySL+pml.earnedSL
			)
			
				changes.push({
					month: cmy%12,
					year: Math.floor(cmy/12),
					takenSL: pml.takenSL,
					takenCL: pml.takenCL,
					takenPL: pml.takenPL,
					carrySL: pml.carrySL,
					carryCL: pml.carryCL,
					carryPL: pml.carryPL,
					carryCompensatory: pml.carryCompensatory,
					earnedCL: pml.earnedCL,
					earnedSL: pml.earnedSL,
					earnedPL: pml.earnedPL,
					earnedCompensatory: pml.earnedCompensatory
				})
		}
	}
	if(!applyChange) return changes
}

exports.onLeaveChangeDate = async function (lc) {
	let pml;
	const leave = await leaveModel.findOne({_id: lc.lid})
	const fromLD = LeaveDate.fromString(leave.period.from)
	const toLD = LeaveDate.fromString(leave.period.to)
	let frommy = fromLD.month+fromLD.year*12, tomy = toLD.month+toLD.year*12;
	pml = await pmlModel.findOne({person: leave.pid, month: (frommy-1)%12, year: Math.floor((frommy-1)/12)})
	if(!pml) throw new Error("Algorithm Error, No pml found here")
	let carrys = {}, takens = {};
	for(let i=frommy; i<=tomy; i++) {
		const len = await calculateMonthLeaveLen(fromLD, frommy, toLD, tomy, i, leave.type, leave.pid)
		carrys = calculateMonthCarry(pml, i)
		takens = {};
		if(leave.type==='S/L') takens.takenSL = len;
		else if(leave.type==='C/L') takens.takenCL = len;
		else if(leave.type==='P/L') takens.takenPL = len;
		pml = await pmlModel.findOneAndUpdate({person: leave.pid, month: i%12, year: Math.floor(i/12)}, {$set: carrys, $dec: takens}, {returnDocument: 'after'})
	}
	updatePmlForward(pml, leave.pid)

	let my = frommy;
	pml = await pmlModel.findOne({person: leave.pid, month: (my-1)%12, year: Math.floor((my-1)/12)})
	for(let i of cl.dates) {
		const cLD = LeaveDate.fromString(i)
		while(Math.floor(my/12)!==cLD.year || my%12!==cLD.month) {
			pml = await pmlModel.findOneAndUpdate({person: leave.pid, month: my%12, year: Math.floor(my)/12}, {$set: carrys, $dec: takens}, {returnDocument: 'after'})
			my++;
			carrys = calculateMonthCarry(pml, my); takens = {};
		}
		if(leave.type==='S/L') takens.takenSL += 0.5;
		else if(leave.type==='C/L') takens.takenCL += 0.5;
		else if(leave.type==='P/L') takens.takenPL += 0.5;
	}
	if(Object.keys(takens).length)
		await pmlModel.updateOne({person: leave.pid, month: my%12, year: Math.floor(my)/12}, {$set: carrys, $dec: takens})


	const startingLD = LeaveDate.fromString(lc.newstartingdate)
	const endingLD = LeaveDate.fromString(leave.lc.newendingdate)
	frommy = startingLD.month+startingLD.year*12
	tomy = endingLD.month+endingLD.year*12;
	pml = await pmlModel.findOne({person: leave.pid, month: (frommy-1)%12, year: Math.floor((frommy-1)/12)})
	if(!pml) throw new Error("Algorithm Error, No pml found here")
	for(let i=frommy; i<=tomy; i++) {
		const len = await calculateMonthLeaveLen(startingLD, frommy, endingLD, tomy, i, leave.type, leave.pid)
		carrys = calculateMonthCarry(pml, i)
		takens = {};
		if(leave.type==='S/L') takens.takenSL = len;
		else if(leave.type==='C/L') takens.takenCL = len;
		else if(leave.type==='P/L') takens.takenPL = len;
		pml = await pmlModel.findOneAndUpdate({person: leave.pid, month: i%12, year: Math.floor(i/12)}, {$set: carrys, $inc: takens}, {returnDocument: 'after'})
	}
	updatePmlForward(pml, lc.pid)

	leave.period.from = lc.newstartingdate
	leave.period.to = lc.newendingdate
	leave.period.length = lc.newlength

	if(leave.period.cancelledleaves) {
		await this.onCancelLeave({lid: leave._id, dates: leave.period.cancelledleaves})
	}
	
	await leave.save()
}
exports.onCancelLeave = async function(cl) {
	const leave = await leaveModel.findOne({_id: cl.lid})
	if(cl.cancelcompletely) {
		const fromLD = LeaveDate.fromString(leave.period.from)
		const toLD = LeaveDate.fromString(leave.period.to)
		const frommy = fromLD.month+fromLD.year*12, tomy = toLD.month+toLD.year*12;
		let pml = await pmlModel.findOne({person: leave.pid, month: (frommy-1)%12, year: Math.floor((frommy-1)/12)})
		if(!pml) throw new Error("Algorithm Error, No pml found here")
		for(let i=frommy; i<=tomy; i++) {
			const len = await calculateMonthLeaveLen(fromLD, frommy, toLD, tomy, i, leave.type, leave.pid)
			let carrys = calculateMonthCarry(pml, i)
			let takens = {};
			if(leave.type==='S/L') takens.takenSL = len;
			else if(leave.type==='C/L') takens.takenCL = len;
			else if(leave.type==='P/L') takens.takenPL = len;
			pml = await pmlModel.findOneAndUpdate({person: leave.pid, month: i%12, year: Math.floor(i/12)}, {$set: carrys, $dec: takens}, {returnDocument: 'after'})
		}
		await updatePmlForward(pml, leave.pid)
	} else {
		const fromLD = LeaveDate.fromString(leave.period.from)
		const frommy = fromLD.month+fromLD.year*12;
		let my = frommy, carrys={}, takens={};
		let pml = await pmlModel.findOne({person: leave.pid, month: (my-1)%12, year: Math.floor((my-1)/12)})
		for(let i of cl.dates) {
			const cLD = LeaveDate.fromString(i)
			while(Math.floor(my/12)!==cLD.year || my%12!==cLD.month) {
				pml = await pmlModel.findOneAndUpdate({person: leave.pid, month: my%12, year: Math.floor(my)/12}, {$set: carrys, $dec: takens}, {returnDocument: 'after'})
				my++;
				carrys = calculateMonthCarry(pml, my); takens = {};
			}
			if(leave.type==='S/L') takens.takenSL += 0.5;
			else if(leave.type==='C/L') takens.takenCL += 0.5;
			else if(leave.type==='P/L') takens.takenPL += 0.5;
		}
		if(Object.keys(takens).length)
			pml = await pmlModel.findOneAndUpdate({person: leave.pid, month: my%12, year: Math.floor(my)/12}, {$set: carrys, $dec: takens}, {returnDocument: 'after'})
		await updatePmlForward(pml, leave.pid)
	}
}

exports.filterLeaves = async(list, isLegal) => {
	const finalList = [];
	const now = new Date();
	const today = new LeaveDate(now.getFullYear(), now.getMonth(), now.getDate()).getDatestamp();
	for(const leave of list) {
		const requestTime = new Date(leave.createdAt);
		const requestDate = new LeaveDate(requestTime.getFullYear(), requestTime.getMonth(), requestTime.getDate()).getDatestamp();
		let _legal = true;
		const fromLD = LeaveDate.fromString(leave.period.from)
		const toLD = LeaveDate.fromString(leave.period.to)
		const frommy = fromLD.month+fromLD.year*12, tomy = toLD.month+toLD.year*12;
		const endmy = now.getFullYear()*12 + now.getMonth() + 6;
		if(fromLD.getDatestamp()<requestDate || fromLD.getDatestamp()<today || requestDate+1<today) _legal = false
		else {
			let pml = await pmlModel.findOne({person: leave.pid, month: (frommy-1)%12, year: Math.floor((frommy-1)/12)})
			if(!pml) throw new Error("Algorithm Error, No pml found here")
			for(let i=frommy; i<=endmy && _legal; i++) {
				const len = await calculateMonthLeaveLen(fromLD, frommy, toLD, tomy, i, leave.type, leave.pid)
				let carrys = calculateMonthCarry(pml, i)
				pml = await pmlModel.findOne({person: leave.pid, month: i%12, year: Math.floor(i/12)})
				if(!pml) {
					const e = new Error("Algorithm Error, No pml found here ("+(i%12)+"/"+Math.floor(i/12)+")")
					e.runChecker = true;
					throw e;
				}
				pml = {...pml.toObject(), ...carrys};
				const _pml = new Pml(pml);
				if(/*_pml.available(leave.type) && */_pml.available(leave.type) < len) {
					_legal = false;
					break;
				}
				if(leave.type==='P/L') pml.takenPL += len;
				if(leave.type==='C/L') pml.takenCL += len;
				if(leave.type==='S/L') pml.takenSL += len;
			}
		}
		if(_legal===isLegal) {
			finalList.push(leave);
		}
	}
	return finalList;
}

async function calculateMonthLeaveLen (fromLD, frommy, toLD, tomy, my, type, pid) {
	if(my>tomy || my < frommy) return 0;
	const dateFilters = [];
	let len=0;
	const monthend = new Date(new Date(
		Math.floor((my+1)/12),
		(my+1)%12,
		1
	).getTime()-24*3600*1000).getDate();
	if(my===tomy) {
		dateFilters.push({$lte: ['$date', toLD.date]});
		len += toLD.date - (toLD.fullday?0:0.5);
	} else {
		len += monthend;
	}
	if(my===frommy) {
		dateFilters.push({$gte: ['$date', fromLD.date]});
		len -= fromLD.date - (fromLD.fullday?1:0.5);
	}
	if(type!=='P/L') {
		const _ph = await personModel.aggregate([
			{$match: {_id: mongoose.Types.ObjectId(pid)}},
			{$project: {_id: 0, onsite: 1}},
			{$lookup: {
				from: 'holidays',
				let: {onsite: '$onsite'},
				pipeline: [
					{$match: {$expr: {$and: [
						{$eq: ['$onsite', '$$onsite']},
						{$eq: ['$month', my%12]},
						{$eq: ['$year', Math.floor(my/12)]},
						...dateFilters
					]}}}
				],
				as: 'holidays'}
			}
		]);
		for(let i of _ph[0].holidays) {
			if(my!==frommy || i.date!==fromLD.date && fromLD.fullday) len -= i.morning?0.5:0;
			if(my!==tomy || i.date!==toLD.date && toLD.fullday) len -= i.evening?0.5:0;
		}
	}

	for(let i=my===frommy?fromLD.date:1; i<=(my===tomy?toLD.date:monthend); i++) {
		const date = new Date(Math.floor(my/12), my%12, i);
		if(date.getDay()===0) {
			if(my!==frommy || i!==fromLD.date || fromLD.fullday) len -= 0.5;
			if(my!==tomy || i!==toLD.date || toLD.fullday) len -= 0.5;
		}
	}
	return len;
}

function calculateMonthCarry(lastpml, thismy) {
	const carrys = {}
	if(thismy%12===0) {
		carrys.carrySL = 0
		carrys.carryCompensatory = 0
		carrys.carryCL = 0
		carrys.carryPL = Math.max(lastpml.earnedPL+lastpml.carryPL-lastpml.takenPL, 0)%PLPerYear;
	} else {
		carrys.carrySL = Math.max(lastpml.carrySL + lastpml.earnedSL - lastpml.takenSL, 0)
		carrys.carryCompensatory = Math.max(lastpml.carryCompensatory + lastpml.earnedCompensatory - lastpml.takenCL, 0)
		carrys.carryCL = Math.max(
			lastpml.carryCompensatory + lastpml.earnedCompensatory < lastpml.takenCL
				? lastpml.carryCompensatory + lastpml.earnedCompensatory - lastpml.takenCL + lastpml.carryCL + lastpml.earnedCL
				: lastpml.carryCL + lastpml.earnedCL,
			0
		)
		carrys.carryPL = Math.max(lastpml.carryPL + lastpml.earnedPL - lastpml.takenPL);
	}
	return carrys;
}

async function updatePmlForward(pml, pid) {
	while(pml) {
		let cmy = pml.month + pml.year*12 + 1;
		let carrys = calculateMonthCarry(pml, cmy)
		pml = await pmlModel.findOneAndUpdate({person: pid, month: cmy%12, year: Math.floor(cmy/12)}, {$set: carrys}, {returnDocument: 'after'})
	}
}
