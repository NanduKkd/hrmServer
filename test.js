const mongoose = require('mongoose')
const LeaveManager = require('./utils/leaveManager')
require('dotenv').config()
const personModel = require('./models/person')
const leaveModel = require('./models/leave')
const pmlModel = require('./models/pml')
const postModel = require('./models/post')
const departmentModel = require('./models/department')

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
	await personModel.deleteMany({})
	await leaveModel.deleteMany({})
	await pmlModel.deleteMany({})
	await departmentModel.deleteMany({})
	await postModel.deleteMany({})
	console.log('running test')
	//await tester({params: {pid: '63f3360c8b79c3472f7115d7'}, user: {admin: true}}, res)
	const po = new postModel({name: "Superman"})
	await po.save()
	const de = new departmentModel({name: "Superstrength"})
	await de.save()
	const p = new personModel({
		joiningdate: new Date(2022, 4, 1),
		monthsprobation: 3,
		name: "ha",
		email: "ha",
		admin: false,
		superadmin: false,
		post: po._id,
		department: de._id,
		password: 'jkh',
		onsite: true,
	});
	await p.save()
	await LeaveManager.onEmployeeAdded(p)
	const l = new leaveModel({
		pid: p._id,
		period: {
			from: '30-03-2023-1',
			to: '02-04-2023-1',
			length: 4
		},
		type: 'C/L',
		status: 'Accepted',
		reason: ''
	})
	await l.save()
	const changes1 = await LeaveManager.onLeave(l, true)
	const l1 = new leaveModel({
		pid: p._id,
		period: {
			from: '22-02-2023-1',
			to: '22-02-2023-1',
			length: 1
		},
		type: 'C/L',
		status: 'Accepted',
		reason: ''
	})
	await l1.save()
	const changes2 = await LeaveManager.onLeave(l1, true)
	await tester({user: {admin: true}, params: {pid: p._id, year: 2023, month: 3}}, res)
	await personModel.deleteMany({})
	await leaveModel.deleteMany({})
	await pmlModel.deleteMany({})
	await departmentModel.deleteMany({})
	await postModel.deleteMany({})
	database.close()
})
