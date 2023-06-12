const router = require('express').Router();
const postsCont = require('../controllers/posts')

router.get('/', postsCont.get)
router.post('/', postsCont.post)
router.patch('/:post', postsCont.patch)
router.delete('/:post', postsCont.delete)

module.exports = router;
