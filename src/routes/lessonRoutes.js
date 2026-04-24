// routes/lessonRoutes.js
const express = require('express');
const router = express.Router();

const { watchLesson } = require('../controllers/lessonController');
const fanMiddleware = require('../middlewares/fanMiddleware');


// 🎬 Lire une leçon (sécurisé)
router.get('/watch/:courseId/:lessonId', fanMiddleware, watchLesson);





module.exports = router;

