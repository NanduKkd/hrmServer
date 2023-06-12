const mongoose = require('mongoose')
// const LeaveManager = require('./utils/leaveManager')
// const { getStatus } = require('./controllers/attendance')
require('dotenv').config()
// const leaveModel = require('./models/leave')
// const pmlModel = require('./models/pml')
const attendanceModel = require('./models/attendance')
const personModel = require('./models/person')
const tester = require('./controllers/attendance/getStatus')

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
mongoose.connect('mongodb://127.0.0.1:27017/hrm2')
const database = mongoose.connection

database.on('error', err => {
	console.error(err);
})
database.once('connected', async() => {
	const p = await personModel.findOne({})
	await tester({user: p.toObject()}, res)
	database.close()
})
