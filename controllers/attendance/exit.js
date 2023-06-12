const attendanceModel = require('../../models/attendance')
const {
	MorningClosing, EveningClosing, MorningEnd, EveningEnd
} = require('../../utils/constants')
const LeaveDate = require('../../utils/leavedate')

module.exports = async(req, res) => {
	try {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const att = await attendanceModel.findOne({
			pid: req.user._id,
			'exit.date': {$exists: false},
		})
		const exitTime = now;
		att.exit = {
			date: exitTime,
			location: {
				latitude: req.body.latitude,
				longitude: req.body.longitude,
			},
		};
		const todayDs = new LeaveDate(today.getFullYear(), today.getMonth(), today.getDate()).getDatestamp();
		const attDs = new LeaveDate(att.date.year, att.date.month, att.date.date);
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
			att.markmorning = att.entry.status==='morning' && att.exit.status!=='beforenoon';
			att.markevening = att.entry.status in ['morning', 'beforenoon'] && !(att.exit.status in ['beforenoon', 'afternoon'])
			att.verified = true;
		}

		/*
		// Should be marked by reporting person
		att.markmorning = att.entry.status==='morning' && att.exit.status!=='beforenoon';
		att.markevening = att.entry.status in ['morning', 'beforenoon'] && !(att.exit.status in ['beforenoon', 'afternoon'])
		*/
		await att.save();
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}


const getHrs = (d) => d.getHours()+d.getMinutes()/60