const personModel = require('../../models/person')
const attendanceModel = require('../../models/attendance')
const mongoose = require('mongoose')

module.exports = async(req, res) => {
	try {
		const att = await attendanceModel.aggregate([
			{$match: {_id: mongoose.Types.ObjectId(req.params.id)}},
			{$lookup: {from: 'people', localField: 'pid', foreignField: '_id', as: 'person'}},
			{$set: {person: {$first: '$person'}}},
			{$project: {_id: 0, 'exit.status': 1, 'entry.status': 1, reportingperson: '$person.attendancereportingperson'}}
		])
		if(att.length && att[0].reportingperson.equals(req.user._id)) {
			await attendanceModel.updateOne({_id: req.params.id}, {$set: {
				verified: true,
				markmorning: att[0].entry.status==='morning' && att[0].exit.status!=='beforenoon',
				markevening: att[0].entry.status!=='afternoon' && (att[0].exit.status==='evening' || att[0].exit.status==='anotherday'),
			}})
			res.status(204).end()
		} else if(att.length)
			res.status(403).end()
		else
			res.status(404).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}
