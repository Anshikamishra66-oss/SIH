const QueueEntry = require('../models/QueueEntry.model');
const Booking = require('../models/Booking.model');
const ProcurementCentre = require('../models/ProcurementCentre.model');
const { startOfDay, endOfDay } = require('../utils/helpers');

/**
 * Get the live queue state for a centre on a given date.
 */
const getLiveQueue = async (centreId, date) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const entries = await QueueEntry.find({
    centreId,
    queueDate: { $gte: dayStart, $lte: dayEnd },
    status: { $nin: ['cancelled'] },
  })
    .sort({ position: 1 })
    .populate('farmerId', 'name mobile')
    .populate('bookingId', 'cropName quantity slotStartTime slotEndTime token status');

  const serving = entries.find((e) => e.status === 'serving');
  const waiting = entries.filter((e) => e.status === 'waiting');
  const completed = entries.filter((e) => e.status === 'completed');
  const called = entries.filter((e) => e.status === 'called');

  return {
    entries,
    currentlyServing: serving || null,
    waitingCount: waiting.length,
    completedCount: completed.length,
    totalToday: entries.length,
  };
};

/**
 * Get queue position for a specific token on a given day and centre.
 * Returns: { position, farmersAhead, estimatedWaitMinutes, status }
 */
const getQueuePosition = async (centreId, token, date) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const myEntry = await QueueEntry.findOne({
    centreId,
    token,
    queueDate: { $gte: dayStart, $lte: dayEnd },
  });

  if (!myEntry) return null;

  // Count waiting entries ahead of this entry
  const farmersAhead = await QueueEntry.countDocuments({
    centreId,
    queueDate: { $gte: dayStart, $lte: dayEnd },
    position: { $lt: myEntry.position },
    status: { $in: ['waiting', 'serving', 'called'] },
  });

  const centre = await ProcurementCentre.findById(centreId).select('avgServiceTimeMinutes');
  const avgTime = centre?.avgServiceTimeMinutes || 8;
  const estimatedWaitMinutes = calculateWaitTime(farmersAhead, avgTime);

  return {
    myEntry,
    position: myEntry.position,
    farmersAhead,
    estimatedWaitMinutes,
    status: myEntry.status,
  };
};

/**
 * Helper to calculate estimated wait time based on queue length, service time and active counters
 */
const calculateWaitTime = (farmersAhead, avgTime = 8, counters = 1) => {
  if (!farmersAhead || farmersAhead <= 0) return 0;
  return Math.round((farmersAhead * avgTime) / (counters || 1));
};

/**
 * Get the next waiting entry in the queue for a centre.
 */
const getNextWaiting = async (centreId, date) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return QueueEntry.findOne({
    centreId,
    queueDate: { $gte: dayStart, $lte: dayEnd },
    status: 'waiting',
  }).sort({ position: 1 });
};

/**
 * Get the next token number for a centre on a given day.
 */
const getNextTokenNumber = async (centreId, date) => {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const count = await QueueEntry.countDocuments({
    centreId,
    queueDate: { $gte: dayStart, $lte: dayEnd },
  });

  return count + 1;
};

module.exports = {
  getLiveQueue,
  getQueuePosition,
  getNextWaiting,
  getNextTokenNumber,
  calculateWaitTime,
};
