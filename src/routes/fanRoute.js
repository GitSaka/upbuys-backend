// src/routes/fanRoutes.js
const express = require('express');
const router = express.Router();
const { authCheck,handleAuth,updateMe,getMe ,switchEmpire} = require('../controllers/fanController');
const fanMiddleware = require('../middlewares/fanMiddleware');
// const {verifyOTP} = require('../controllers/fanController');

router.post('/check-access', authCheck);
router.post('/auth', handleAuth);
router.put('/updateMe',fanMiddleware, updateMe);
router.get('/me',fanMiddleware, getMe);
router.post('/switch-empire',fanMiddleware, switchEmpire);
// router.post('/authCheck', authCheck);

module.exports = router;