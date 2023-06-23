const LeaveDate = require('../../utils/leavedate');
const attendanceModel = require('../../models/attendance')
const leaveModel = require('../../models/leave')
const {
	MorningOpening, MorningClosing,
	EveningOpening, EveningClosing,
} = require('../../utils/constants')

const statuser = async(person) => {
	const now = new Date();
	const openMark = await attendanceModel.findOne({pid: person._id, 'entry.status': {$exists: true}, 'exit.status': {$exists: false}})
	if(openMark) {
		if(openMark.date.year !== now.getFullYear() || openMark.date.month !== now.getMonth() || openMark.date.date !== now.getDate())
			return {status: 'open', warning: true};
		else
			return {status: 'open'};
	} else {
		const hrs = toHrs(now);
		const todayMark = await attendanceModel.findOne({pid: person._id, 'date.year': now.getFullYear(), 'date.month': now.getMonth(), 'date.date': now.getDate()})
		if(todayMark) {
			if(todayMark.entry?.status && todayMark?.exit?.status) return {status: 'empty', reason: 'marked'}
			let sessionMark;
			if(hrs<EveningOpening) sessionMark = todayMark.morning
			else if(hrs>=EveningOpening) sessionMark = todayMark.evening
			if(sessionMark==='leave')
				return {status: 'empty', reason: 'leave'}
		}
		if(hrs<MorningOpening) {
			return {status: 'empty', reason: 'early'};
		} else if(hrs>=MorningClosing && hrs<EveningOpening) {
			return {status: 'empty', reason: 'late'}
		} else if(hrs>=EveningClosing) {
			return {status: 'empty', reason: 'late'};
		}
		return {status: 'ready'}
	}
}

function toHrs (d) {
	return d.getHours()+d.getMinutes()/60;
}

module.exports = async(req, res) => {
	const status = await statuser(req.user);
	res.status(200).json(status);
}