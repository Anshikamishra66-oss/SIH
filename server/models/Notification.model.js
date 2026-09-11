const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'slot_reminder',
        'queue_approaching',
        'token_called',
        'procurement_completed',
        'payment_processing',
        'payment_completed',
        'booking_cancelled',
        'schedule_changed',
        'general',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      bookingId: String,
      token: String,
      centreId: String,
      procurementId: String,
      paymentId: String,
    },
    // Mock SMS/push status for future integration
    deliveryStatus: {
      inApp: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
