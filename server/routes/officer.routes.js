const express = require('express');
const router = express.Router();
const {
  getOfficerDashboard,
  getOfficerBookings,
  getPendingKycApprovals,
  updateKycApproval,
} = require('../controllers/officer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireOfficer } = require('../middleware/role.middleware');

router.use(authenticate, requireOfficer);
router.get('/dashboard', getOfficerDashboard);
router.get('/bookings', getOfficerBookings);
router.get('/kyc-approvals', getPendingKycApprovals);
router.put('/kyc-approvals/:profileId', updateKycApproval);

module.exports = router;
