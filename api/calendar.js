const router = require('express').Router()
const holidayModel = require('../models/holiday')

router.get('/:year/:onsite', async(req, res) => {
	const days = await holidayModel.find({year: req.params.year, onsite: req.params.onsite==='onsite'})
	res.status(200).json(days)
})
router.post('/:year/:month/:date/:onsite', async(req, res) => {
	try {
		await new holidayModel({year: req.params.year, month: req.params.month, date: req.params.date, reason: req.body?.reason || '', onsite: req.params.onsite==='onsite'}).save()
		res.status(201).end()
	} catch(e) {
		console.error(e)
		res.status(500).end()
	}
})
router.patch('/:year/:month/:date/:onsite', async(req, res) => {
	try {
		await holidayModel.updateOne({
			year: req.params.year,
			month: req.params.month,
			date: req.params.date,
			onsite: req.params.onsite==='onsite'
		}, {$set: req.body}, {upsert: true})
		res.status(201).end()
	} catch(e) {
		console.error(e)
		res.status(500).end()
	}
})
router.delete('/:year/:month/:date/:onsite', async(req, res) => {
	try {
		await holidayModel.deleteOne({year: req.params.year, month: req.params.month, date: req.params.date, onsite: req.params.onsite==='onsite'})
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

module.exports = router;
