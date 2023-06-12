const router = require('express').Router()
const personsCont = require('../controllers/persons')

router.get('/', personsCont.get)
router.get('/myprofile', personsCont.getSelfProfile)
router.get('/reporting', (req, res, next) => {req.params.reporting = true; console.log('---'); next()}, personsCont.get)
router.get('/:pid', personsCont.getPerson)
router.post('/', personsCont.post)
router.patch('/:pid', personsCont.patch)
router.patch('/:pid/post', personsCont.patchPost)
router.patch('/:pid/department', personsCont.patchDepartment)
router.patch('/:pid/reportingperson', personsCont.patchReportingPerson)
router.delete('/:pid', personsCont.delete)

module.exports = router
