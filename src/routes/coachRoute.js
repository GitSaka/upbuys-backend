const express = require('express');
const router = express.Router();
const {getCoachEarnings,getCoachAudience,getCoachDashboardData} =  require('../controllers/coachController')
const auth = require('../middlewares/authMiddleware');

router.get('/earnings',getCoachEarnings);
router.get('/stats',auth,getCoachDashboardData);
router.get('/audience',auth,getCoachAudience);


module.exports = router