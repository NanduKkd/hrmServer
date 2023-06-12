const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const personModel = require('../models/person')

exports.requireAuth = (req, res, next) => {
	if(req.headers.authorization && /^Bearer /.test(req.headers.authorization) || req.cookies.auth) {
		const token =  req.cookies.auth || req.headers.authorization.match(/^Bearer (.*)$/)[1]
		jwt.verify(token, process.env.SECRET_AUTH_KEY, (err, decoded) => {
			if(!err) {
				personModel.findById(decoded.uid).then(userDoc => {
					if(userDoc) {
						req.user = userDoc
						next()
					} else {
						res.status(401).end()
						console.log('User does not exist in db')
					}
				}).catch(e => {
					console.error(e)
					res.status(500).end()
				})
			} else {
				res.status(401).end()
				console.error(err)
			}
		})
	} else {
		res.status(401).end()
		console.log('No login found')
	}
}
