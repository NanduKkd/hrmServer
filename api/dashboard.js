const router = require('express').Router()
const dashboardController = require('../controllers/dashboard')

router.get('/', dashboardController.get)
router.post('/', dashboardController.post)

module.exports = router;
