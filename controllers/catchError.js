const catchModel = require('../models/catch')

module.exports = async(req, res) => {
	console.log(`\nError catched (${new Date().toString()})`)
	console.log("From "+(req.user?req.user.name+` (${req.user._id})`:'Unauthorized User'))
	console.log("Message: "+req.body.message)
	console.log("Misc data: "+JSON.stringify(req.body.misc)+"\n")
	res.status(200).end()
	await new catchModel({
		message: req.body.message,
		userAgent: req.headers['user-agent'],
		misc: req.body.misc,
		user: req.user._id,
	}).save()
}