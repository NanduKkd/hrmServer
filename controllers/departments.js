const departmentModel = require('../models/department')

exports.get = async(req, res) => {
	try {
		const deps = await departmentModel.find()
		res.status(200).json(deps)
	} catch(e) {
		console.error(e)
		res.status(500).end()
	}
}
exports.post = async(req, res) => {
	try {
		if(!req.user.admin) {
			res.status(403).end()
		} else {
			const dep = new departmentModel(req.body)
			await dep.save()
			res.status(201).json(dep);
		}
	} catch(e) {
		console.error(e)
		res.status(500).end()
	}
}
exports.patch = async(req, res) => {
	try {
		if(!req.user.admin) {
			res.status(403).end()
		} else {
			await departmentModel.updateOne({_id: req.params.dep}, {$set: req.body})
			res.status(204).end();
		}
	} catch(e) {
		console.error(e)
		res.status(500).end()
	}
}
exports.delete = async(req, res) => {
	try {
		if(!req.user.admin) {
			res.status(403).end()
		} else {
			await departmentModel.deleteOne({_id: req.params.dep})
			res.status(204).end();
		}
	} catch(e) {
		console.error(e)
		res.status(500).end()
	}
}
