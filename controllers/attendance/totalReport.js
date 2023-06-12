const attendanceModel = require('../../models/attendance')
const leaveModel = require('../../models/leave')
const personModel = require('../../models/person')
const holidayModel = require('../../models/holiday')
const pmlModel = require('../../models/pml')
const LeaveDate = require('../../utils/leavedate')

module.exports = async(req, res) => {
	try {
		const employees = {}
		const monthStartDate = new Date(req.params.year+'-'+req.params.month+'-01Z')
		const monthEndDate = new Date(new Date((req.params.month==='12'?parseInt(req.params.year)+1:req.params.year)+'-'+(((parseInt(req.params.month)+1)%12)+'').padStart(2,'0')+'-01Z').getTime()-24*3600000)
		function getDays() {
			const ab = [];
			for(let i=1; i<=monthEndDate.getDate(); i++) {
				const thisDate = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth(), i)
				if(thisDate.getDay()===0) {
					ab[i] = [{kind: 'sunday'}, {kind: 'sunday'}]
				} else
					ab[i] = [null, null]
			}
			return ab;
		}
		const people = await personModel.find({admin: false})
		for(let i of people) {
			employees[i._id] = getDays()
		}
		const holidays = await holidayModel.find({
			'year': parseInt(req.params.year),
			'month': parseInt(req.params.month)-1
		})
		for(let i of holidays) {
			for(let e in employees) {
				if(i.onsite===e.onsite) {
					if(i.morning) employees[e][i.date][0] = {kind: 'holiday'}
					if(i.evening) employees[e][i.date][1] = {kind: 'holiday'}
				}
			}
		}
		const attendances = await attendanceModel.find({$expr: {$and: [
			{$eq: ['$date.year', parseInt(req.params.year)]},
			{$eq: ['$date.month', parseInt(req.params.month)-1]},
			{$or: [
				{$eq: ['$markmorning', true]},
				{$eq: ['$markevening', true]},
			]},
		]}})
		for(let i of attendances) {
			if(i.markmorning)
				employees[i.pid][i.date.date][0] = {kind: 'attendance'}
			if(i.markevening)
				employees[i.pid][i.date.date][1] = {kind: 'attendance'}
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
			{$eq: ['$status', 'Accepted']}
		]}})
		for(let leave of leaves) {
			const fromLD = LeaveDate.fromString(leave.period.from);
			const toLD = LeaveDate.fromString(leave.period.to);
			const thisLeave = () => ({type: leave.type, kind: 'leave'})
			if(fromLD.getDatestamp()===toLD.getDatestamp()) {
				if(fromLD.fullday) employees[leave.pid][fromLD.date][0] = thisLeave()
				if(toLD.fullday) employees[leave.pid][toLD.date][1] = thisLeave()
			} else {
				if(fromLD.year===parseInt(req.params.year) && fromLD.month===parseInt(req.params.month)-1) {
					if(fromLD.fullday) employees[leave.pid][fromLD.date][0] = thisLeave()
					employees[leave.pid][fromLD.date][1] = thisLeave()
				}
				if(toLD.year===parseInt(req.params.year) && toLD.month===parseInt(req.params.month)-1) {
					if(toLD.fullday) employees[leave.pid][toLD.date][1] = thisLeave()
					employees[leave.pid][toLD.date][0] = thisLeave()
				}
				for(let i=fromLD.getDatestamp()+1; i<toLD.getDatestamp(); i++) {
					const thisDate = new Date(i*24*3600000)
					if(thisDate.getMonth()!==parseInt(req.params.month)-1 || thisDate.getFullYear()!==parseInt(req.params.year))
						continue;
					employees[leave.pid][thisDate.getDate()] = [thisLeave(), thisLeave()]
				}
			}
		}
		const pmls = await pmlModel.find({month: parseInt(req.params.month)-1, year: req.params.year})
		const data = []
		for(let p of people) {
			const edata = {leaves: {'P/L': 0, 'C/L': 0, 'S/L': 0}, attendance: 0, lop: 0}
			for(let ii=1; ii<=monthEndDate.getDate(); ii++) {
				const thisdate = new LeaveDate(parseInt(req.params.year), parseInt(req.params.month)-1, ii)
				if(thisdate.getDatestamp()<p.joiningdate/24/3600000) {
					continue
				}
				const i = employees[p._id][ii]
				if(!i[0])
					edata.lop += 0.5;
				else if(i[0].kind==="attendance") edata.attendance += 0.5
				else if(i[0].kind==="leave") edata.leaves[i[0].type] += 0.5
				if(!i[1])
					edata.lop += 0.5;
				else if(i[1].kind==="attendance") edata.attendance += 0.5
				else if(i[1].kind==="leave") edata.leaves[i[1].type] += 0.5

			}
			const thisPml = pmls.find(i => i.person.equals(p._id))
			if(!thisPml || edata.leaves['C/L'] !== thisPml.takenCL || edata.leaves['S/L'] !== thisPml.takenSL) {
				throw new Error("So wrong, leaves taken is not correct")
			}
			if(thisPml.takenCL>thisPml.carryCL+thisPml.earnedCL+thisPml.carryCompensatory+thisPml.earnedCompensatory) {
				edata.lop += thisPml.takenCL-(edata.leaves['C/L'] = thisPml.carryCL+thisPml.earnedCL+thisPml.carryCompensatory+thisPml.earnedCompensatory)
			}
			if(thisPml.takenPL>thisPml.carryPL+thisPml.earnedPL) {
				edata.lop += thisPml.takenPL-(edata.leaves['P/L'] = thisPml.carryPL+thisPml.earnedPL)
				throw new Error("PL taken more than earned")
			}
			if(thisPml.takenSL>thisPml.carrySL+thisPml.earnedSL) {
				edata.lop += thisPml.takenSL-(edata.leaves['S/L'] = thisPml.carrySL+thisPml.earnedSL)
			}
			data.push({employee: p, data: edata})
		}
		res.status(200).json(data)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
