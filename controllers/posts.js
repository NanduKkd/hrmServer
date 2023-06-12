const postModel = require('../models/post')

exports.get = async(req, res) => {
	try {
		const posts = await postModel.find()
		res.status(200).json(posts)
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
			const post = new postModel(req.body)
			await post.save()
			res.status(201).json(post);
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
			await postModel.updateOne({_id: req.params.post}, {$set: req.body})
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
			await postModel.deleteOne({_id: req.params.post})
			res.status(204).end();
		}
	} catch(e) {
		console.error(e)
		res.status(500).end()
	}
}