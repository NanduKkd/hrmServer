const personModel = require('../../models/person')
const leaveChecker = require('../../utils/leaveChecker')

exports.getRequests = require('./getRequests')

exports.listByPersonMonth = require('./listByPersonMonth')

exports.forPersonDate = require('./forPersonDate')

exports.personalReport = async(req, res) => {
	try {
		const person = await personModel.findOne({_id: req.params.pid})
		if(person.admin) return res.status(400).end()
		const dates = await leaveChecker.leaveReport(person, parseInt(req.params.year), parseInt(req.params.month)-1)
		res.status(200).json(dates)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
}

exports.totalReport = require('./totalReport')

exports.change = require('./change')

exports.verify = require('./verify')

exports.entry = require('./entry')

exports.exit = require('./exit')

exports.getStatus = require('./getStatus')