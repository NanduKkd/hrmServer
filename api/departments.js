const router = require('express').Router();
const departmentsCont = require('../controllers/departments')

router.get('/', departmentsCont.get)
router.post('/', departmentsCont.post)
router.patch('/:dep', departmentsCont.patch)
router.delete('/:dep', departmentsCont.delete)

module.exports = router;
