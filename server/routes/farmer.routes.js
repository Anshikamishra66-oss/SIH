const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getProcurementHistory,
  sendAadhaarOtp,
  verifyAadhaarOtp,
  sendKisanIdOtp,
  verifyKisanIdOtp,
  verifyKisanId,
  submitKyc,
  getKycStatus,
} = require('../controllers/farmer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireFarmer } = require('../middleware/role.middleware');

router.use(authenticate, requireFarmer);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/history', getProcurementHistory);

// Aadhaar e-KYC endpoints
router.post('/aadhaar/send-otp', sendAadhaarOtp);
router.post('/aadhaar/verify-otp', verifyAadhaarOtp);

// Kisan ID verification with OTP & KYC submission
router.post('/kisan-id/send-otp', sendKisanIdOtp);
router.post('/kisan-id/verify-otp', verifyKisanIdOtp);
router.post('/verify-kisan-id', verifyKisanIdOtp);
router.post('/submit-kyc', submitKyc);
router.get('/kyc-status', getKycStatus);

module.exports = router;
