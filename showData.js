const mongoose = require('mongoose')
require('dotenv').config()
const models = {
	attendanceModel:  require('./models/attendance'),
	departmentModel:  require('./models/department'),
	postModel:  require('./models/post'),
	personModel:  require('./models/person'),
	holidayModel:  require('./models/holiday'),
	leaveModel:  require('./models/leave'),
	pmlModel:  require('./models/pml'),
}

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

mongoose.connect('mongodb://127.0.0.1:27017/hrm2')
const database = mongoose.connection

database.on('error', err => {
	console.error(err);
})
database.once('connected', () => {
	rl.question("We have collections:\n"+Object.keys(models).reduce((a,i,ii) => a+(ii+1)+'. '+i+'\n', '')+"Pick an option: ", ans => {
		if(!ans || parseInt(ans)<1 || parseInt(ans)>Object.keys(models).length) {
			rl.close();
			console.log('Invalid answer')
			database.close()
		} else {
			console.log("You selected "+Object.entries(models)[parseInt(ans)-1][0])
			Object.entries(models)[parseInt(ans)-1][1].find().then(coll => {
				console.log(coll);
				rl.close()
				database.close()
			})
		}
	})
})

