const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    procurementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Procurement',
      required: true,
      unique: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    // Mock/demo payment fields — clearly marked
    transactionId: {
      type: String,
      sparse: true,
    },
    referenceNo: String,
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cheque', 'other'],
      default: 'bank_transfer',
    },
    paymentDate: Date,
    bankDetails: {
      accountNumber: String, // Last 4 digits only for display
      ifscCode: String,
      bankName: String,
    },
    // Flags to communicate demo nature clearly
    isDemoPayment: {
      type: Boolean,
      default: true,
    },
    notes: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
