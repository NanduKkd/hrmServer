const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const personModel = require('../models/person')
const departmentModel = require('../models/department')
const postModel = require('../models/post')

exports.login = (req, res) => {
	if(req.headers.authorization && /^Basic .+$/.exec(req.headers.authorization)) {
		const data = /^(.+)?:(.+)$/.exec(decodeURI(Buffer.from(/^Basic (.+)$/.exec(req.headers.authorization)[1], 'base64').toString('binary')))
		if(data) {
			const [_, user, password] = data;
			personModel.findOne({email: user}).then(personData => {
				if(personData) {
					bcrypt.compare(password, personData.password, (err, result) => {
						if(!err && result) {
							jwt.sign({uid: personData._id}, process.env.SECRET_AUTH_KEY, (err1, token) => {
								if(err1) {
									console.error(err1)
									res.status(500).end()
								} else {
									departmentModel.findById(personData.department).then(departmentData => {
										postModel.findById(personData.post).then(postData => {
											res.cookie('auth', token)
											res.status(200).json({profile: {
												...personData.toObject(),
												department: departmentData.name,
												post: postData.name
											}, token})
										}).catch(err2 => {
											res.status(500).end()
											console.error(err2)
										})
									}).catch(err2 => {
										res.status(500).end()
										console.error(err2)
									})
								}
							})
						} else if(!result) {
							res.status(400).end('reason 4')
						} else {
							res.status(500).end()
							console.error(err)
						}
					})
				} else {
					res.status(400).end('reason 3')
				}
			}).catch(e => {
				res.status(500).end()
				console.error(e)
			})
		} else {
			res.status(400).end('reason 2')
		}
	} else {
		res.status(400).end('reason 1')
	}
}

exports.changePass = (req, res) => {
	personModel.findOne({_id: req.user._id}).then(personData => {
		bcrypt.compare(req.body.oldPassword, personData.password, (err, result) => {
			if(err) {
				res.status(500).end()
				console.error(err)
			} else if(result) {
				bcrypt.hash(req.body.newPassword, 8, (err1, password) => {
					if(err1) {
						console.error(err1)
						res.status(500).end()
					} else {
						personModel.updateOne({_id: req.user._id}, {$set: {password}}).then(() => {
							res.status(204).end()
						}).catch(err2 => {
							res.status(500).end()
							console.error(err2)
						})
					}
				})
			} else {
				res.status(400).end()
			}
		})
	}).catch(err => {
		res.status(500).end()
		console.error(err)
	})
}
