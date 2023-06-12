const attendanceModel = require('../../models/attendance')
const personModel = require('../../models/person')

module.exports = async(req, res) => {
	try {
		if(req.user.admin) {
			if(!req.params.pid) return res.status(400).end()
			const attendances = await attendanceModel.find({'date.year': req.params.year, 'date.month': req.params.month, pid: req.params.pid}).sort({'date.year': -1, 'date.month': -1, 'date.date': -1})
			res.status(200).json(attendances)
		} else {
			if(req.params.pid) {
				const attendances = await attendanceModel.find({'date.year': req.params.year, 'date.month': req.params.month, pid: req.params.pid}).sort({'date.year': -1, 'date.month': -1, 'date.date': -1})
				res.status(200).json(attendances)
			} else {
				const people = await personModel.find({attendancereportingperson: req.user._id})
				const attendances = await attendanceModel.find({'date.year': req.params.year, 'date.month': req.params.month, _id: {$in: people.map(i => i._id)}}).sort({'date.year': -1, 'date.month': -1, 'date.date': -1})
				res.status(200).json(attendances)
			}
		}
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}
