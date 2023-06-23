const LeaveManager = require('../../utils/leaveManager')
const attendanceModel = require('../../models/attendance')
const mongoose = require('mongoose')

module.exports = async(req, res) => {
	try {
		/*
		const att = await attendanceModel.aggregate([
			{$match: {_id: mongoose.Types.ObjectId(req.params.id)}},
			{$lookup: {from: 'people', localField: 'pid', foreignField: '_id', as: 'person'}},
			{$set: {person: {$first: '$person'}}},
			{$project: {
				_id: 1,
				'exit.status': 1,
				'entry.status': 1,
				reportingperson: '$person.attendancereportingperson',
				onsite: '$person.onsite',
				'date': 1,
				pid: 1,
			}}
		])
		if(att.length && att[0].reportingperson.equals(req.user._id)) {
			const markmorning = att[0].entry.status==='morning' && att[0].exit.status!=='beforenoon';
			const markevening = att[0].entry.status!=='afternoon' && (att[0].exit.status==='evening' || att[0].exit.status==='anotherday');
			await attendanceModel.updateOne({_id: req.params.id}, {$set: {
				verified: true,
				markmorning,
				markevening,
			}})
			res.status(204).end()
			await LeaveManager.onAttendanceData({...att[0], markmorning, markevening}, att[0].onsite)
		} else if(att.length)
			res.status(403).end()
		else
			res.status(404).end()
			*/
		const { year, month, date, person, morning, evening } = req.body;
		const attendance = await attendanceModel.findOne({
			pid: person,
			'date.date': date,
			'date.month': month,
			'date.year': year,
		})
		attendance.verified = true;
		if(morning && !attendance.morning)
			attendance.morning = 'attended'
		else if(morning && attendance.morning==='holiday')
			attendance.morning = 'compensatory'
		else if(!morning && !attendance.morning)
			attendance.morning = 'redmark'

		if(evening && !attendance.evening)
			attendance.evening = 'attended'
		else if(evening && attendance.evening==='holiday')
			attendance.evening = 'compensatory'
		else if(!evening && !attendance.evening)
			attendance.evening = 'redmark'

		await attendance.save()
		res.status(204).end()
		await LeaveManager.onAttendanceData(attendance);
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
