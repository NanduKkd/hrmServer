require('dotenv').config()
const attendanceModel =  require('./models/attendance');
const departmentModel =  require('./models/department');
const postModel =  require('./models/post');
const personModel =  require('./models/person');
const holidayModel =  require('./models/holiday');
const leaveModel =  require('./models/leave');
const pmlModel =  require('./models/pml');
const bcrypt = require('bcrypt')
const LeaveManager = require('./utils/leaveManager')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/hrm2')
const database = mongoose.connection

database.on('error', err => {
	console.error(err);
})
database.once('connected', async() => {
	console.log('all data will be deleted!')
	
	await personModel.deleteMany({})
	await leaveModel.deleteMany({})
	await pmlModel.deleteMany({})
	await departmentModel.deleteMany({})
	await postModel.deleteMany({})
	await holidayModel.deleteMany({})
	await attendanceModel.deleteMany({})

	const department = new departmentModel({name: "Management", preset: true})
	await department.save();

	// Super admin
	const post = new postModel({name: "Senior Manager"})
	await post.save()
	const superAdminPerson = new personModel({
		joiningdate: new Date(2022, 4, 1),
		monthsprobation: 3,
		name: "Vijay KT",
		email: "vijaykt@gmail.com",
		admin: true,
		superadmin: true,
		post: post._id,
		department: department._id,
		password: '$2b$08$6RnWj2mzMIZ2SiRMcMZBd.eDr0/aR9kkyNkNU1uSPqnlz2eAHwqiq',
		onsite: false,
	})
	await superAdminPerson.save()
	await LeaveManager.onEmployeeAdded(superAdminPerson)


	// Site Engineer
	const department2 = new departmentModel({name: "Engineering", preset: true})
	await department2.save();
	const siteEngineer = new postModel({name: "Senior Site Engineer"})
	await siteEngineer.save()
	const siteEngineerPerson = new personModel({
		joiningdate: new Date(2022, 4, 1),
		monthsprobation: 3,
		name: "Akhilesh PV",
		email: "akhilesh@gmail.com",
		admin: false,
		superadmin: false,
		post: siteEngineer._id,
		department: department2._id,
		password: '$2b$08$6RnWj2mzMIZ2SiRMcMZBd.eDr0/aR9kkyNkNU1uSPqnlz2eAHwqiq',
		onsite: true,
		attendancereportingperson: new mongoose.Types.ObjectId(superAdminPerson),
		leavereportingperson: new mongoose.Types.ObjectId(superAdminPerson),
	})
	await siteEngineerPerson.save()
	await LeaveManager.onEmployeeAdded(siteEngineerPerson)

	const jrSiteEngineer = new postModel({name: "Junior Site Engineer"})
	await jrSiteEngineer.save()
	const jrSiteEngineerPerson = new personModel({
		joiningdate: new Date(2022, 4, 1),
		monthsprobation: 3,
		name: "Ajith KT",
		email: "ajith@gmail.com",
		admin: false,
		superadmin: false,
		post: jrSiteEngineer._id,
		department: department2._id,
		password: '$2b$08$6RnWj2mzMIZ2SiRMcMZBd.eDr0/aR9kkyNkNU1uSPqnlz2eAHwqiq',
		onsite: true,
		attendancereportingperson: new mongoose.Types.ObjectId(siteEngineerPerson),
		leavereportingperson: new mongoose.Types.ObjectId(siteEngineerPerson),
	})
	await jrSiteEngineerPerson.save()
	await LeaveManager.onEmployeeAdded(jrSiteEngineerPerson)

	database.close()
})

