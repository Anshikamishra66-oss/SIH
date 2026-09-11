const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getProcurementHistory } = require('../controllers/farmer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireFarmer } = require('../middleware/role.middleware');

router.use(authenticate, requireFarmer);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/history', getProcurementHistory);

module.exports = router;
