const mongoose = require('mongoose');
const { PostgresModel } = require('../utils/postgresModel');

const procurementCentreSchema = new mongoose.Schema(
  {
    centreId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Centre name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: String,
    contactPhone: String,
    contactEmail: String,
    operatingHours: {
      start: { type: String, default: '09:00' }, // HH:mm
      end: { type: String, default: '17:00' },
    },
    dailyCapacity: {
      type: Number,
      required: true,
      default: 100,
    },
    slotDurationMinutes: {
      type: Number,
      default: 60,
    },
    avgServiceTimeMinutes: {
      type: Number,
      default: 8,
    },
    cancellationCutoffHours: {
      type: Number,
      default: 12,
    },
    availableCrops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
      },
    ],
    officerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    eligibilityDistricts: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    description: String,
    facilities: [String],
  },
  { timestamps: true }
);

module.exports = new PostgresModel('ProcurementCentre', { operatingHours: { start: '09:00', end: '17:00' }, dailyCapacity: 100, slotDurationMinutes: 60, avgServiceTimeMinutes: 8, cancellationCutoffHours: 12, availableCrops: [], officerIds: [], eligibilityDistricts: [], isActive: true, facilities: [] }, {}, procurementCentreSchema);
