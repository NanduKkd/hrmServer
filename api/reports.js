const router = require('express').Router();
const reportsCont = require('../controllers/reports')

router.get('/personal/:person/:year/:month', reportsCont.personal)
router.get('/total/:year/:month', reportsCont.total)

module.exports = router;