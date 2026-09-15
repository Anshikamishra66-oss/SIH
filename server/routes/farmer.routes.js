const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getProcurementHistory,
  sendAadhaarOtp,
  verifyAadhaarOtp,
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

// Kisan ID verification & KYC submission
router.post('/verify-kisan-id', verifyKisanId);
router.post('/submit-kyc', submitKyc);
router.get('/kyc-status', getKycStatus);

module.exports = router;
