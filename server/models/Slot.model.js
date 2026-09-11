const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcurementCentre',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String, // 'HH:mm'
      required: true,
    },
    endTime: {
      type: String, // 'HH:mm'
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    booked: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['available', 'full', 'closed'],
      default: 'available',
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
slotSchema.index({ centreId: 1, date: 1, startTime: 1 });

// Virtual for available spots
slotSchema.virtual('available').get(function () {
  return this.capacity - this.booked;
});

// Auto-update status when booked count changes
slotSchema.pre('save', function () {
  if (this.booked >= this.capacity) {
    this.status = 'full';
  } else if (this.status === 'full' && this.booked < this.capacity) {
    this.status = 'available';
  }
});

module.exports = mongoose.model('Slot', slotSchema);
