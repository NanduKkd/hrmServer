const attendanceModel = require('../../models/attendance')
const personModel = require('../../models/person')
const LeaveDate = require('../../utils/leavedate')

module.exports = async(req, res) => {
	try {
		const people = await personModel.aggregate([
			{$match: {attendancereportingperson: req.user._id}},
			{$project: {_id: 1, name: 1, post: 1}},
			{$lookup: {from: 'posts', foreignField: '_id', localField: 'post', as: 'post'}},
			{$set: {post: {$first: '$post'}}},
			{$set: {post: '$post.name'}},
		]);
		const data = await attendanceModel.aggregate([
			{$match: {
				pid: {$in: people.map(i => i._id)},
				verified: false,
			}},
			{$project: {date: 1, _id: 0}},
			{$sort: {'date.year': 1, 'date.month': 1, 'date.date': 1}},
			{$limit: 1},
			{$lookup: {
				from: 'attendances',
				let: {date: '$date.date', month: '$date.month', year: '$date.year'},
				pipeline: [
					{$match: {$expr: {$and: [
						{$eq: ['$date.date', '$$date']},
						{$eq: ['$date.month', '$$month']},
						{$eq: ['$date.year', '$$year']},
						{$in: ['$pid', people.map(i => i._id)]},
					]}}},
				],
				as: 'attendance'
			}},
		]);
		const day = data[0];
		if(!day) return res.status(200).json([])

		// for(let person of people) {
		// 	person.attendance = day.attendance.find(i => i.pid===person._id);
		// 	if(!person.attendance?.entry?.status || !person.attendance?.exit?.status) continue;
		// 	if(
		// 		person.attendance.entry?.status==='morning'
		// 		&& person.attendance.exit?.status in ['afternoon', 'evening', 'anotherday']
		// 	) {
		// 		person.morning = 'attended'
		// 	}
		// 	if(
		// 		person.attendance.entry?.status in ['morning', 'beforenoon']
		// 		&& person.attendance.exit?.status in ['evening', 'anotherday']
		// 	) {
		// 		person.evening = 'attended'
		// 	}
		// }
		day.attendance.forEach(i => {
			i.person = people.find(j => j._id.equals(i.pid));
			if(!i.entry?.status || !i.exit?.status) return;
			if(
				i.entry?.status==='morning'
				&& i.exit?.status !== 'beforenoon'
			) {
				i.attendedmorning = true
			}
			if(
				(i.entry?.status === 'morning' || i.entry?.status ===  'beforenoon')
				&& (i.exit?.status === 'evening' || i.exit?.status === 'anotherday')
			) {
				i.attendedevening = true
			}
		})
		const d = new Date(day.date.year, day.date.month, day.date.date)
		res.status(200).json({date: d.toISOString(), attendances: day.attendance});
	} catch (e) {
		res.status(500).end()
		console.error(e)
	}
}

function toHrs (d) {
	return d.getHours()+d.getMinutes()/60;
}