const express = require('express');
const router = express.Router();
const {getCoachEarnings} =  require('../controllers/coachController')

router.get('/earnings',getCoachEarnings);


module.exports = router