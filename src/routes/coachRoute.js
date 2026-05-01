const express = require('express');
const router = express.Router();
const {getCoachEarnings,getCoachAudience,getWalletStats,requestWithdrawal,getWithdrawalHistory,getCoachDashboardData} =  require('../controllers/coachController')
const auth = require('../middlewares/authMiddleware');

router.get('/earnings',getCoachEarnings);
router.get('/stats',auth,getCoachDashboardData);
router.get('/audience',auth,getCoachAudience);
router.get('/wallet/stats', auth,getWalletStats);
router.post('/wallet/withdraw', auth, requestWithdrawal);
router.get('/wallet/history', auth, getWithdrawalHistory);



module.exports = router