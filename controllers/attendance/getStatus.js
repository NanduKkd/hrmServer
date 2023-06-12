const LeaveDate = require('../../utils/leavedate');
const attendanceModel = require('../../models/attendance')
const leaveModel = require('../../models/leave')
const {
	MorningOpening, MorningClosing,
	EveningOpening, EveningClosing,
} = require('../../utils/constants')

const statuser = async(person) => {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const todayDs = new LeaveDate(now.getFullYear(), now.getMonth(), now.getDate(), 1).getDatestamp();
	const lastMarks = await attendanceModel.find({pid: person._id}).sort({'entry.date': -1}).limit(1)
	if(lastMarks.length && !lastMarks[0].exit?.date) {
		if(lastMarks[0].date.year !== now.getFullYear() || lastMarks[0].date.month !== now.getMonth() || lastMarks[0].date.date !== now.getDate())
			return {status: 'open', warning: true};
		else
			return {status: 'open'};
	} else if(
		lastMarks.length
		&& lastMarks[0].date.year===now.getFullYear()
		&& lastMarks[0].date.month===now.getMonth()
		&& lastMarks[0].date.date===now.getDate()
	) {
		return {status: 'empty', reason: 'marked'}
	}
	const hrs = toHrs(now);
	const leaves = await leaveModel.find({$expr: {$and: [
		{$lte: [
			{$dateFromString: {dateString: {$substr: ['$period.from', 0, 10]}, format: '%d-%m-%Y', timezone: '+0530'}},
			today
		]},
		{$gte: [
			{$dateFromString: {dateString: {$substr: ['$period.to', 0, 10]}, format: '%d-%m-%Y', timezone: '+0530'}},
			today
		]},
		{$eq: ['$status', 'Accepted']},
		{$eq: ['$pid', person._id]},
	]}})
	for(let l of leaves) {
		const fromLD = LeaveDate.fromString(l.period.from)
		const toLD = LeaveDate.fromString(l.period.to)
		if(fromLD.getDatestamp()===todayDs && !fromLD.fullday) {
			if(hrs<MorningClosing) continue;
		}
		if(toLD.getDatestamp()===todayDs && !toLD.fullday) {
			if(hrs>=EveningOpening) continue;
		}
		return {status: 'empty', reason: 'leave'};
		//TODO check cancellations in leaves
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

function toHrs (d) {
	return d.getHours()+d.getMinutes()/60;
}

module.exports = async(req, res) => {
	const status = await statuser(req.user);
	res.status(200).json(status);
}