const MockNotificationProvider = require('./MockNotificationProvider');
const SMSNotificationProvider = require('./SMSNotificationProvider');

/**
 * NotificationService
 *
 * Central service for sending notifications.
 * Provider is selected based on NOTIFICATION_PROVIDER env variable.
 *
 * Supported providers:
 *   - mock (default, dev/demo)
 *   - sms (future)
 */

class NotificationService {
  constructor() {
    const provider = process.env.NOTIFICATION_PROVIDER || 'mock';
    if (provider === 'sms') {
      this.provider = new SMSNotificationProvider();
    } else {
      this.provider = new MockNotificationProvider();
    }
    this._io = null;
  }

  setIO(io) {
    this._io = io;
  }

  async send(userId, type, title, message, metadata = {}) {
    try {
      return await this.provider.send({
        userId,
        type,
        title,
        message,
        metadata,
        io: this._io,
      });
    } catch (err) {
      // Never let notification failure crash the main flow
      console.error('Notification send error:', err.message);
      return null;
    }
  }

  // Convenience methods for each notification type
  async bookingConfirmed(userId, booking) {
    return this.send(
      userId,
      'booking_confirmed',
      'Booking Confirmed ✓',
      `Your slot has been booked for ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString('en-IN') : 'your selected date'} at ${booking.slotStartTime}. Your token number is ${booking.token}.`,
      { bookingId: booking._id?.toString(), token: booking.token }
    );
  }

  async queueApproaching(userId, booking, farmersAhead) {
    return this.send(
      userId,
      'queue_approaching',
      'Your Turn is Approaching!',
      `Only ${farmersAhead} farmer${farmersAhead === 1 ? '' : 's'} are ahead of you. Please proceed to the procurement centre.`,
      { bookingId: booking._id?.toString(), token: booking.token }
    );
  }

  async tokenCalled(userId, booking, counter) {
    return this.send(
      userId,
      'token_called',
      `Token ${booking.token} — Please Proceed`,
      `Your token ${booking.token} is now being called. Please proceed to ${counter || 'the counter'} immediately.`,
      { bookingId: booking._id?.toString(), token: booking.token }
    );
  }

  async procurementCompleted(userId, booking, amount) {
    return this.send(
      userId,
      'procurement_completed',
      'Procurement Completed',
      `Your crop procurement has been completed. Amount: ₹${amount?.toLocaleString('en-IN') || 'Pending calculation'}. Payment processing will begin shortly.`,
      { bookingId: booking._id?.toString(), token: booking.token }
    );
  }

  async paymentProcessing(userId, procurementId) {
    return this.send(
      userId,
      'payment_processing',
      'Payment Processing',
      'Your payment is being processed. Funds will be transferred to your registered bank account within 2-3 working days.',
      { procurementId: procurementId?.toString() }
    );
  }

  async paymentCompleted(userId, payment) {
    return this.send(
      userId,
      'payment_completed',
      'Payment Received ✓',
      `[DEMO] Your payment of ₹${payment.amount?.toLocaleString('en-IN')} has been processed. Reference: ${payment.transactionId || 'N/A'}.`,
      { paymentId: payment._id?.toString() }
    );
  }

  async bookingCancelled(userId, booking) {
    return this.send(
      userId,
      'booking_cancelled',
      'Booking Cancelled',
      `Your booking (Token: ${booking.token}) has been cancelled. Your slot has been released.`,
      { bookingId: booking._id?.toString(), token: booking.token }
    );
  }

  async kycSubmitted(userId, mobile) {
    const message = 'Your KYC application has been successfully submitted. Your KYC will be updated within 2 working days.';
    console.log(`\n📱 [SMS DISPATCHED to +91 ${mobile}]: "${message}"\n`);
    return this.send(
      userId,
      'kyc_submitted',
      'KYC Application Submitted',
      message,
      { mobile, event: 'kyc_submitted' }
    );
  }
}

// Singleton instance
const notificationService = new NotificationService();
module.exports = notificationService;
