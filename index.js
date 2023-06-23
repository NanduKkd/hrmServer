const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/hrm2')
const database = mongoose.connection

database.on('error', err => {
	console.error(err);
})

const cronjobs = require('./utils/cronjobs')
const cron = require('node-cron')

database.on('connected', () => {
	console.log('Database connected')
	cronjobs.init().then(() => {
		cronjobs.cronjobs.forEach(i => {
			if(i.task) i.task.start();
			else i.task = cron.schedule(i.period, i.job);
		})
	})
})
database.on('disconnected', () => {
	console.log('Database disconnected')
	cronjobs.forEach(i => {
		if(i.task) i.task.stop()
	})
})


const app = express()



app.use((req, res, next) => {
	res.set({
		'Access-Control-Allow-Origin': 'http://localhost:3000',
		'Access-Control-Allow-Headers': req.headers['access-control-request-headers'],
		'Access-Control-Allow-Methods': req.headers['access-control-request-method'],
		'Access-Control-Allow-Credentials': true,
	})
	if(req.method==='OPTIONS') {
		res.status(200).end()
	} else
		next()
})
app.use(express.json())
app.use(cookieParser())
app.use('/api', require('./api'))
app.post('/error', require('./middlewares/auth').requireAuth, require('./controllers/catchError'))
app.use(require('./public.js'))

const port = process.env.PORT;
app.listen(port, () => {
	console.log('HRM listening on port '+port)
})
