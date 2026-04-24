const express = require('express');
const { getAllActiveCourses,getCourseDetails,getUserBySlug,getUsersByCategory,getMyCourseInventory } = require('../controllers/ClientController');
const fanMiddleware = require('../middlewares/fanMiddleware');
const router = express.Router();


router.get('/get-all-cours/:slug', getAllActiveCourses)
router.get('/get-details/:id', getCourseDetails)
router.get('/profile/:slug', getUserBySlug)
router.get('/category/:category', getUsersByCategory)
router.get('/my-inventory',fanMiddleware, getMyCourseInventory)


module.exports = router