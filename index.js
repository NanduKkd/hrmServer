const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/hrm2')
const database = mongoose.connection

database.on('error', err => {
	console.error(err);
})
database.once('connected', () => {
	console.log('Database connected')
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
app.use(require('./public.js'))

app.listen(4321, () => {
	console.log('HRM listening on port 4321')
})
