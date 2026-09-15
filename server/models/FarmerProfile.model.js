const mongoose = require('mongoose');
const { PostgresModel } = require('../utils/postgresModel');

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    farmerIdNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    village: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    crops: [
      {
        cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
        cropName: String,
        estimatedQuantity: Number,
        unit: { type: String, default: 'quintal' },
      },
    ],
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    // KYC Fields
    aadhaarNumber: {
      type: String,
      trim: true,
    },
    aadhaarVerified: {
      type: Boolean,
      default: false,
    },
    aadhaarSeedingStatus: {
      type: String,
      default: 'Not Seeded',
    },
    npciStatus: {
      type: String,
      default: 'Inactive',
    },
    aadhaarDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    bankDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    kisanId: {
      type: String,
      trim: true,
    },
    kisanIdVerified: {
      type: Boolean,
      default: false,
    },
    kisanDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    khatauniNumber: {
      type: String,
      trim: true,
    },
    khasraNumber: {
      type: String,
      trim: true,
    },
    landArea: {
      type: String,
      trim: true,
    },
    landDocumentName: {
      type: String,
      trim: true,
    },
    kycStatus: {
      type: String,
      enum: ['Not Started', 'Pending', 'Verified', 'Rejected'],
      default: 'Not Started',
    },
    kycSubmittedAt: {
      type: Date,
    },
    kycRemarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = new PostgresModel('FarmerProfile', {
  crops: [],
  isProfileComplete: false,
  aadhaarVerified: false,
  aadhaarSeedingStatus: 'Not Seeded',
  npciStatus: 'Inactive',
  aadhaarDetails: {},
  bankDetails: {},
  kisanId: null,
  kisanIdVerified: false,
  kisanDetails: {},
  kycStatus: 'Not Started',
}, {}, farmerProfileSchema);
