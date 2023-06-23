const router = require('express').Router()
const attendanceCont = require('../controllers/attendance')

router.get('/status', attendanceCont.getStatus)
router.get('/requests', attendanceCont.getRequests)
// router.get('/bydate/:year/:month/:date', attendanceCont.getList)
router.get('/bypersonmonth/:pid/:year/:month', attendanceCont.listByPersonMonth)
router.get('/bypersondate/:year/:month/:date', attendanceCont.forPersonDate)
// router.get('/totalreport/:year/:month/', attendanceCont.totalReport)
// router.get('/personalreport/:year/:month/:pid', attendanceCont.personalReport)
router.patch('/change/:year/:month/:date/:pid', attendanceCont.change)
router.patch('/verify', attendanceCont.verify)
router.post('/entry/:latitude/:longitude/:accuracy', attendanceCont.entry)
router.patch('/exit', attendanceCont.exit)

module.exports = router
