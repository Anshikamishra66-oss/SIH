const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getBookingById, cancelBooking } = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireFarmer, requireRole } = require('../middleware/role.middleware');

// Inject io instance from app
const injectIO = (req, res, next) => {
  req.io = req.app.get('io');
  next();
};

router.use(authenticate, injectIO);
router.post('/', requireFarmer, createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
