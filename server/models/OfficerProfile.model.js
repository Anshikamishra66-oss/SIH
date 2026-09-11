const mongoose = require('mongoose');
const { PostgresModel } = require('../utils/postgresModel');

const officerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcurementCentre',
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      default: 'Procurement Officer',
    },
  },
  { timestamps: true }
);

module.exports = new PostgresModel('OfficerProfile', {}, {}, officerProfileSchema);
