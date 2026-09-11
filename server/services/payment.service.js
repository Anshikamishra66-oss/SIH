/**
 * MockPaymentService
 *
 * Demo/mock payment service. All payment data is clearly labelled as DEMO.
 *
 * To integrate a real payment gateway (government bank API, PFMS, etc.):
 * - Implement RealPaymentService with the same interface
 * - Swap in payment.controller.js
 */

const Payment = require('../models/Payment.model');

class MockPaymentService {
  /**
   * Initialize payment record when procurement is completed.
   */
  async initializePayment(procurementId, bookingId, farmerId, amount) {
    const payment = await Payment.create({
      procurementId,
      bookingId,
      farmerId,
      amount,
      status: 'pending',
      isDemoPayment: true,
      notes: '[DEMO] This is simulated payment data for demonstration purposes.',
    });
    return payment;
  }

  /**
   * Process payment (mock: just update status).
   * Real implementation would call bank/PFMS API here.
   */
  async processPayment(paymentId, processedBy) {
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'processing',
        processedBy,
        notes: '[DEMO] Payment processing simulated. Real API call would be made here.',
      },
      { new: true }
    );
    return payment;
  }

  /**
   * Complete payment (mock: generate fake transaction ID).
   * Real implementation would receive webhook/callback from bank.
   */
  async completePayment(paymentId, processedBy) {
    const txnId = `DEMO-TXN-${Date.now().toString(36).toUpperCase()}`;
    const refNo = `PFMS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'paid',
        transactionId: txnId,
        referenceNo: refNo,
        paymentDate: new Date(),
        processedBy,
        isDemoPayment: true,
        notes: '[DEMO] Simulated payment completion. Transaction ID is not real.',
      },
      { new: true }
    );
    return payment;
  }

  async failPayment(paymentId, reason, processedBy) {
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'failed',
        processedBy,
        notes: `[DEMO] Payment failed: ${reason}`,
      },
      { new: true }
    );
    return payment;
  }
}

const mockPaymentService = new MockPaymentService();
module.exports = mockPaymentService;
