const attendanceModel = require('../../models/attendance')
const {
	MorningStart, MorningOpening, MorningClosing,
	EveningStart, EveningOpening, EveningClosing,
} = require('../../utils/constants')

module.exports = async(req, res) => {
	try {
		const entryTime = new Date();
		const att = new attendanceModel({
			pid: req.user._id,
			entry: {
				location: {
					latitude: req.params.latitude,
					longitude: req.params.longitude,
				},
			},
			date: {
				date: entryTime.getDate(),
				month: entryTime.getMonth(),
				year: entryTime.getFullYear(),
			},
		})
		const entryHrs = getHrs(entryTime)
		if(entryHrs<MorningClosing)
			att.entry.status = 'morning'
		else if(entryHrs<EveningClosing)
			att.entry.status = 'beforenoon'
		else
			att.entry.status = 'afternoon'
		await att.save()
		res.status(201).end()
	} catch(e) {
		console.error(e)
		res.status(500).end()
	}
}

function getHrs(d) {
	return d.getHours()+d.getMinutes()/60;
}