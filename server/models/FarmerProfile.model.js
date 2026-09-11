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
  },
  { timestamps: true }
);

module.exports = new PostgresModel('FarmerProfile', { crops: [], isProfileComplete: false }, {}, farmerProfileSchema);
