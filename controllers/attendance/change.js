const personModel = require('../../models/person')
const attendanceModel = require('../../models/attendance')

module.exports = async(req, res) => {
	try {
		if(req.user.superadmin) {
			await attendanceModel.updateOne({
				pid: req.params.pid,
				'date.year': req.params.year,
				'date.month': parseInt(req.params.month)-1,
				'date.date': req.params.date
			}, {$set: {
				morning: req.body.morning,
				evening: req.body.evening
			}})
		} else {
			res.status(403).end()
		}
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
