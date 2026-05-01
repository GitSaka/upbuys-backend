const express = require('express');
const { register } = require('../controllers/AuthController');
const { login } = require('../controllers/AuthController');
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const { facebookRedirect,getMe, facebookCallback ,updateUserProfile} = require("../controllers/AuthController")


// Route : POST /api/auth/register
router.post('/register', register);
router.post('/login', login);
router.put('/update/:slug',protect, updateUserProfile);



// Facebook OAuth
// router.get('/facebook', facebookRedirect);
// router.get('/facebook/callback', facebookCallback);

router.get("/me", protect, getMe);

module.exports = router;