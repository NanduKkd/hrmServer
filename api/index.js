const router = require('express').Router()
const { requireAuth } = require('../middlewares/auth')

router.use('/attendance', requireAuth, require('./attendance'))
router.use('/dashboard', requireAuth, require('./dashboard'))
router.use('/persons', requireAuth, require('./persons'))
router.use('/leaves', requireAuth, require('./leaves'))
router.use('/departments', requireAuth, require('./departments'))
router.use('/posts', requireAuth, require('./posts'))
router.use('/calendar', requireAuth, require('./calendar'))
router.use('/auth', require('./auth'))

module.exports = router
