const express = require('express');
const router = express.Router();
const feedCtrl = require('../controllers/feedController');
const fanMiddleware = require('../middlewares/fanMiddleware');

router.post('/create', fanMiddleware,feedCtrl.createPost)
router.get('/:slug', feedCtrl.getCoachFeed);
// router.post('/comment', feedCtrl.addComment);
router.post('/like',fanMiddleware ,feedCtrl.likePost);
router.post('/comment',fanMiddleware ,feedCtrl.addComment);
router.delete('/delete/:id',fanMiddleware ,feedCtrl.deletePost);

module.exports = router;