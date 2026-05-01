const express = require('express');
const router = express.Router();
const {getCoachEarnings,getCoachDashboardData} =  require('../controllers/coachController')

router.get('/earnings',getCoachEarnings);
router.get('/stats',getCoachDashboardData);


module.exports = router