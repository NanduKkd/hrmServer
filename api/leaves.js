const router = require('express').Router();
const leavesCont = require('../controllers/leaves')

router.get('/myleaves', leavesCont.getMy)
router.get('/foradmin', leavesCont.getForAdmin)
router.get('/left', leavesCont.leavesLeft)
router.get('/requestedleaves', leavesCont.getRequestedLeaves)
router.get('/specialrequests', leavesCont.getSpecialRequests)
router.patch('/respond/:type/:id/:status', leavesCont.respond)
router.get('/sub', leavesCont.getSubRequests)
router.post('/sub/:leave', leavesCont.changeSub)
router.patch('/sub/:type/:leave', leavesCont.respondSub)
router.post('/', leavesCont.post)
router.get('/monthdata/:year/:month', leavesCont.getMonthData)
router.post('/monthsdata', leavesCont.getMonthsData)

module.exports = router
