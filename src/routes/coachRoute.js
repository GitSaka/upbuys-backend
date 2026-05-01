const express = require('express');
const router = express.Router();
const {getCoachEarnings,getCoachDashboardData} =  require('../controllers/coachController')
const auth = require('../middlewares/authMiddleware');

router.get('/earnings',getCoachEarnings);
router.get('/stats',auth,getCoachDashboardData);


module.exports = router