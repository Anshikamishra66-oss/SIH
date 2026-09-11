const mongoose = require('mongoose');
const { PostgresModel } = require('../utils/postgresModel');

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameHindi: {
      type: String,
      trim: true,
    },
    mspPrice: {
      type: Number, // Minimum Support Price per quintal in INR
      required: true,
    },
    unit: {
      type: String,
      enum: ['quintal', 'kg', 'tonne'],
      default: 'quintal',
    },
    season: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'All'],
      default: 'All',
    },
    category: {
      type: String,
      enum: ['Cereal', 'Pulse', 'Oilseed', 'Cotton', 'Sugarcane', 'Other'],
      default: 'Cereal',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: String,
  },
  { timestamps: true }
);

module.exports = new PostgresModel('Crop', { unit: 'quintal', season: 'All', category: 'Cereal', isActive: true });
