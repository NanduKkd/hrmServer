const path = require('path')

module.exports = (req, res, next) => {
	const mime = req.header('Accept').match(/([a-zA-Z\-]+)\/([a-zA-Z\-]+)/)
	if(mime && (mime[2].toLowerCase()==='html' || mime[2]==='*' && mime[1].toLowerCase()==='text') && !req.path.match(/^\/auth/)){
		res.sendFile(path.join(__dirname, 'public', 'content.html'))
	} else {
		res.sendFile(path.join(__dirname, 'public', req.path))
	}
}