const attendanceModel = require('../../models/attendance')
const personModel = require('../../models/person')

module.exports = async(req, res) => {
	try {
		const people = await personModel.find({attendancereportingperson: req.user._id}, {_id: 1})
		const attendances = await attendanceModel.aggregate([
			{$match: {
				pid: {$in: people.map(i => i._id)},
				verified: false,
				'exit.date': {$exists: true},
			}},
			{$lookup: {from: 'people', foreignField: '_id', localField: 'pid', as: 'person'}},
			{$set: {person: {$first: '$person'}}},
			{$lookup: {from: 'posts', foreignField: '_id', localField: 'person.post', as: 'post'}},
			{$set: {post: {$first: '$post'}}},
			{$set: {post: '$post.name', person: '$person.name'}},
		])
		res.status(200).json(attendances)
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}

function toHrs (d) {
	return d.getHours()+d.getMinutes()/60;
}