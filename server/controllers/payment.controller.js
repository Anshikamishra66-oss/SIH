const Payment = require('../models/Payment.model');
const Booking = require('../models/Booking.model');
const OfficerProfile = require('../models/OfficerProfile.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification/NotificationService');
const paymentService = require('../services/payment.service');

// GET /api/payments/:id
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('farmerId', 'name mobile')
      .populate('procurementId');

    if (!payment) throw new ApiError(404, 'Payment record not found.');

    if (
      req.user.role === 'farmer' &&
      payment.farmerId._id.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(403, 'Access denied.');
    }

    res.json(new ApiResponse(200, { payment }));
  } catch (error) {
    next(error);
  }
};

// PUT /api/payments/:id/status - Officer/admin updates payment status
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { action } = req.body; // 'process' | 'complete' | 'fail'

    const payment = await Payment.findById(req.params.id);
    if (!payment) throw new ApiError(404, 'Payment record not found.');

    let updated;

    if (action === 'process') {
      updated = await paymentService.processPayment(payment._id, req.user._id);
      await Booking.findByIdAndUpdate(payment.bookingId, { status: 'payment_processing' });
      notificationService.paymentProcessing(payment.farmerId, payment._id);
    } else if (action === 'complete') {
      updated = await paymentService.completePayment(payment._id, req.user._id);
      await Booking.findByIdAndUpdate(payment.bookingId, { status: 'payment_completed' });
      notificationService.paymentCompleted(payment.farmerId, updated);
    } else if (action === 'fail') {
      updated = await paymentService.failPayment(payment._id, req.body.reason || 'Payment failed', req.user._id);
    } else {
      throw new ApiError(400, 'Invalid action. Use process, complete, or fail.');
    }

    if (req.io) {
      req.io.to(`user:${payment.farmerId}`).emit('payment:updated', {
        paymentId: payment._id,
        status: updated.status,
      });
    }

    res.json(new ApiResponse(200, { payment: updated }, `Payment status updated to: ${updated.status}`));
  } catch (error) {
    next(error);
  }
};

// GET /api/payments - Farmer's own payment records
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ farmerId: req.user._id })
      .populate('procurementId', 'cropName quantity grade totalAmount')
      .populate('bookingId', 'token bookingDate centreId')
      .sort({ createdAt: -1 });

    res.json(new ApiResponse(200, { payments }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getPayment, updatePaymentStatus, getMyPayments };
