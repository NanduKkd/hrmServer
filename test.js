const mongoose = require('mongoose')
const LeaveManager = require('./utils/leaveManager')
const personModel = require('./models/person')
const leaveModel = require('./models/leave')
const attendanceModel = require('./models/attendance')
const pmlModel = require('./models/pml')
const postModel = require('./models/post')
const departmentModel = require('./models/department')
const leaveManager = require('./utils/leaveManager')
const emailer = require('./utils/emailer')

const tester = require('./controllers/attendance').personalReport


const res = {
	status: s => {
		console.log(s)
		return res;
	},
	end: m => {
		if(m) console.log(m)
	},
	json: obj => console.log(JSON.stringify(obj, null, '\t')),
}


mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/hrmtest')
const database = mongoose.connection

database.on('error', err => {
	console.error(err);
})
database.once('connected', async() => {
	await attendanceModel.deleteMany({})
	await personModel.deleteMany({})
	await leaveModel.deleteMany({})
	await pmlModel.deleteMany({})
	await departmentModel.deleteMany({})
	await postModel.deleteMany({})
	console.log('running test')
	const superPost = new postModel({name: "Superman"})
	await superPost.save()
	const superDep = new departmentModel({name: "Superstrength"})
	await superDep.save()
	const clark = new personModel({
		joiningdate: new Date(2022, 4, 1),
		monthsprobation: 6,
		name: "Clark Kent",
		email: "clarkkent@gmail.com",
		admin: true,
		superadmin: true,
		post: superPost._id,
		department: superDep._id,
		password: 'jkh',
		onsite: false,
	});
	await clark.save()
	await LeaveManager.onEmployeeAdded(clark)
	const me = new personModel({
		joiningdate: new Date(2023, 1, 1),
		monthsprobation: 6,
		name: "Nandu Kkd",
		email: "nandukkd7164@gmail.com",
		admin: false,
		superadmin: false,
		post: superPost._id,
		department: superDep._id,
		password: 'jkh',
		onsite: true,
		leavereportingperson: clark._id,
		attendancereportingperson: clark._id
	})
	await me.save();
	const l = new leaveModel({
		pid: me._id,
		period: {
			from: '30-06-2023-1',
			to: '02-07-2023-1',
			length: 2
		},
		type: 'C/L',
		status: 'Waiting',
		reason: 'something',
	})
	await l.save()
	await emailer.newLeave(me, l)
	//await LeaveManager.onAttendanceData(attendance, p.onsite)
	//await tester({user: {admin: true}, params: {pid: p._id, year: 2023, month: 3}}, res)
	database.close()
})
