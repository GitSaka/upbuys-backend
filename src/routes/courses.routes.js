const express = require('express');
const { createCourse, getAllCourses, deleteCourse, toggleCourseStatus, getSingleCourse, updateCourse } = require('../controllers/courses.controller');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getAllWithdrawals, validateWithdrawal } = require('../controllers/superAdminController');



router.post("/create-empire", auth, createCourse )
router.get("/getAll-courses", auth, getAllCourses )
router.get("/get-courses/:id", auth, getSingleCourse )
router.delete("/delete-course/:id", auth, deleteCourse )
router.put("/update-course/:id", auth, updateCourse )
router.get("/all-withdrawals", auth, getAllWithdrawals )
router.put("/validate-withdrawal/:id", auth, validateWithdrawal)

// Route pour changer uniquement le statut (PATCH)
router.patch('/courses/:id/status',auth, toggleCourseStatus);

module.exports = router;