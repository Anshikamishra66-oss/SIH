const mongoose = require('mongoose');
const { PostgresModel } = require('../utils/postgresModel');

const BOOKING_STATUSES = [
  'booked',
  'arrived',
  'verification',
  'verified',
  'procurement_in_progress',
  'procurement_completed',
  'payment_processing',
  'payment_completed',
  'cancelled',
];

/*
  The document adapter keeps the route contract while PostgreSQL stores each
  model document in JSONB. Relational migration can happen independently.
*/
const bookingSchema =
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
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
      index: true,
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    cropName: String,
    quantity: {
      type: Number,
      required: true,
      min: [0.1, 'Quantity must be at least 0.1'],
    },
    unit: {
      type: String,
      default: 'quintal',
    },
    token: {
      type: String,
      required: true,
      index: true,
    },
    bookingDate: Date,     // The date of the slot
    slotStartTime: String, // e.g., '10:00'
    slotEndTime: String,
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'booked',
      index: true,
    },
    cancelledAt: Date,
    cancellationReason: String,
    notes: String,
  };

// Prevent the same farmer from booking the same slot twice
module.exports = new PostgresModel('Booking', { status: 'booked', unit: 'quintal' }, {}, bookingSchema);
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
