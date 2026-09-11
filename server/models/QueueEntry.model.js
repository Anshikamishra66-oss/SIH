const mongoose = require('mongoose');
const { PostgresModel } = require('../utils/postgresModel');

const queueEntrySchema = new mongoose.Schema(
  {
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
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcurementCentre',
      required: true,
      index: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    position: {
      type: Number,
      required: true,
    },
    queueDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'called', 'serving', 'completed', 'absent', 'cancelled'],
      default: 'waiting',
      index: true,
    },
    calledAt: Date,
    arrivedAt: Date,
    servedAt: Date,
    completedAt: Date,
    counter: String, // e.g., "Counter 1"
  },
  { timestamps: true }
);

// Index for fast queue position queries
queueEntrySchema.index({ centreId: 1, queueDate: 1, position: 1 });
queueEntrySchema.index({ centreId: 1, queueDate: 1, status: 1 });

module.exports = new PostgresModel('QueueEntry', { status: 'waiting' }, {}, queueEntrySchema);
