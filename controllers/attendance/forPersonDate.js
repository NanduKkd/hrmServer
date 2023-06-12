const attendanceModel = require('../../models/attendance')
const holidayModel = require('../../models/holiday')
const leaveModel = require('../../models/leave')

module.exports = async(req, res) => {
	try {
		let dayType = 'workingday', entered = false, exited = false;
		const dd = new Date(`${req.params.year}-${req.params.month+1}-${req.params.date}Z`)
		if(dd.getDay()===0) {
			dayType = 'sunday'
			// console.log('sunday', req.params.year+'-'+req.params.month+'-'+req.params.date)
		}
		const attendance = await attendanceModel.findOne({'date.year': req.params.year, 'date.month': req.params.month, 'date.date': req.params.date, pid: req.user._id})
		if(attendance) {
			entered = true;
			if(attendance.exit) exited = true
			// console.log('attended already', req.params.year+'-'+req.params.month+'-'+req.params.date, attendances)
		}
		const holiday = await holidayModel.findOne({year: req.params.year, month: req.params.month, date: req.params.date, onsite: req.user.onsite})
		if(holiday) {
			morning = holiday.morning
			evening = holiday.evening
			// console.log('holiday', req.params.year+'-'+req.params.month+'-'+req.params.date, holidays)
		}
		const givenDate = new Date(`${req.params.year.padStart(4)}-${((parseInt(req.params.month)+1)+'').padStart(2, '0')}-${req.params.date.padStart(2, '0')}Z`)
		const leaves = await leaveModel.find({$expr: {$and: [
			{$lte: [
				{$dateFromString: {dateString: {$substr: ['$period.from', 0, 10]}, format: '%d-%m-%Y'}},
				givenDate
			]},
			{$gte: [
				{$dateFromString: {dateString: {$substr: ['$period.to', 0, 10]}, format: '%d-%m-%Y'}},
				givenDate
			]},
			{$eq: ['$pid', mongoose.Types.ObjectId(req.user._id)]},
			{$eq: ['$status', 'Accepted']}
		]}})
		for(let i of leaves) {
			const fromLD = LeaveDate.fromString(i.period.from)
			const toLD = LeaveDate.fromString(i.period.to)
			let fromIsDay = false, toIsDay = false
			if(fromLD.date===parseInt(req.params.date) && fromLD.month===parseInt(req.params.month) && fromLD.year===parseInt(req.params.year)) {
				fromIsDay = true
			}
			if(toLD.date===parseInt(req.params.date) && toLD.month===parseInt(req.params.month) && toLD.year===parseInt(req.params.year)) {
				toIsDay = true
			}
			if(fromIsDay && toIsDay) {
				// console.log('leave start and end', req.params.year+'-'+req.params.month+'-'+req.params.date, i)
				if(fromLD.fullday && toLD.fullday) dayType = 'fulldayleave'
				else if(toLD.fullday) dayType = 'eveningleave'
				else dayType = 'morningleave'
			} else if(fromIsDay) {
				// console.log('leave start', req.params.year+'-'+req.params.month+'-'+req.params.date, i)
				if(fromLD.fullday) dayType = 'fulldayleave'
				else dayType = 'eveningleave'
			} else if(toIsDay) {
				// console.log('leave end', req.params.year+'-'+req.params.month+'-'+req.params.date, i)
				if(toLD.fullday) dayType = 'fulldayleave'
				else dayType = 'morningleave'
			} else {
				dayType = 'fulldayleave'
				// console.log('leave between', req.params.year+'-'+req.params.month+'-'+req.params.date, i)
			}

			if(dayType!=='workingday') break;
		}
		res.status(200).json({dayType, entered, exited})
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}
