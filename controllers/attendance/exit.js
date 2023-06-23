const attendanceModel = require('../../models/attendance')
const {
	MorningClosing, EveningClosing, MorningEnd, EveningEnd
} = require('../../utils/constants')
const LeaveDate = require('../../utils/leavedate')
const LeaveManager = require('../../utils/leaveManager')

module.exports = async(req, res) => {
	try {
		const now = new Date();
		const att = await attendanceModel.findOne({
			pid: req.user._id,
			'date.date': now.getDate(),
			'date.month': now.getMonth(),
			'date.year': now.getFullYear(),
		})
		const exitTime = now;
		att.exit = {
			date: exitTime,
			location: {
				latitude: req.body.latitude,
				longitude: req.body.longitude,
			},
		};
		const todayDs = new LeaveDate(now.getFullYear(), now.getMonth(), now.getDate()).getDatestamp();
		const attDs = new LeaveDate(att.date.year, att.date.month, att.date.date).getDatestamp();
		const nowHrs = getHrs(now);
		if(attDs!==todayDs)
			att.exit.status = 'anotherday'
		else if(nowHrs<MorningEnd)
			att.exit.status = 'beforenoon'
		else if(nowHrs<EveningEnd)
			att.exit.status = 'afternoon'
		else
			att.exit.status = 'evening'

		if(req.user.superadmin) {
			if(att.morning!=='leave') att.morning = att.entry.status==='morning' && att.exit.status!=='beforenoon'?att.morning==='holiday'?'compensatory':'attended':att.morning==='holiday'?'holiday':'redmark';
			if(att.evening!=='leave') att.evening = att.entry.status!=='afternoon' && att.exit.status!=='beforenoon' && att.exit.status!=='afternoon'?att.evening==='holiday'?'compensatory':'attended':att.evening==='holiday'?'holiday':'redmark';
			att.verified = true;
		}
		await att.save();
		res.status(204).end()
		if(req.user.superadmin) {
			await LeaveManager.onAttendanceData(att);
		}
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}


const getHrs = (d) => d.getHours()+d.getMinutes()/60