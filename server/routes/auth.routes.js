const express = require('express');
const router = express.Router();
const { register, login, sendOtp, verifyOtp, logout, getMe, changePassword, registerValidation, loginValidation } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', registerValidation, validate, register);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginValidation, validate, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
