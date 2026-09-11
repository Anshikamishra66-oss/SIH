const express = require('express');
const router = express.Router();
const { getPayment, updatePaymentStatus, getMyPayments } = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireOfficer } = require('../middleware/role.middleware');

const injectIO = (req, res, next) => { req.io = req.app.get('io'); next(); };

router.use(authenticate);
router.get('/my', getMyPayments);
router.get('/:id', getPayment);
router.put('/:id/status', requireOfficer, injectIO, updatePaymentStatus);

module.exports = router;
