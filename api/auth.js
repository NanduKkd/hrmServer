const router = require('express').Router()
const authCont = require('../controllers/auth')

router.get('/', authCont.login)
router.patch('/', authCont.changePass)

module.exports = router
