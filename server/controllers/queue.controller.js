const QueueEntry = require('../models/QueueEntry.model');
const Booking = require('../models/Booking.model');
const ProcurementCentre = require('../models/ProcurementCentre.model');
const OfficerProfile = require('../models/OfficerProfile.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getLiveQueue, getQueuePosition, getNextWaiting } = require('../services/queue.service');
const notificationService = require('../services/notification/NotificationService');
const { startOfDay, endOfDay } = require('../utils/helpers');

// GET /api/queue/:centreId/live
const getLiveQueueState = async (req, res, next) => {
  try {
    const { centreId } = req.params;
    const date = req.query.date ? new Date(req.query.date) : new Date();

    const queueState = await getLiveQueue(centreId, date);
    const centre = await ProcurementCentre.findById(centreId).select('name avgServiceTimeMinutes');

    res.json(new ApiResponse(200, { ...queueState, centre }));
  } catch (error) {
    next(error);
  }
};

// GET /api/queue/:centreId/position?token=F001
const getMyQueuePosition = async (req, res, next) => {
  try {
    const { centreId } = req.params;
    const { token } = req.query;
    if (!token) throw new ApiError(400, 'Token is required.');

    const date = req.query.date ? new Date(req.query.date) : new Date();
    const result = await getQueuePosition(centreId, token, date);
    if (!result) {
      return res.json(
        new ApiResponse(200, {
          position: 1,
          farmersAhead: 0,
          estimatedWaitMinutes: 0,
          status: 'waiting',
          message: 'Queue entry scheduled.',
        })
      );
    }

    res.json(new ApiResponse(200, result));
  } catch (error) {
    next(error);
  }
};

// Verify officer is assigned to this centre
const verifyOfficerCentre = async (userId, centreId) => {
  if (!userId) return false;
  const profile = await OfficerProfile.findOne({ userId });
  if (!profile) return false;
  return profile.centreId.toString() === centreId.toString();
};

// PUT /api/queue/:token/arrived - Officer marks farmer as arrived
const markArrived = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { centreId } = req.body;

    if (req.user.role === 'officer') {
      const isAssigned = await verifyOfficerCentre(req.user._id, centreId);
      if (!isAssigned) throw new ApiError(403, 'You are not assigned to this centre.');
    }

    const date = new Date();
    const entry = await QueueEntry.findOneAndUpdate(
      {
        token,
        centreId,
        queueDate: { $gte: startOfDay(date), $lte: endOfDay(date) },
        status: 'waiting',
      },
      { status: 'called', calledAt: new Date() },
      { new: true }
    );

    if (!entry) throw new ApiError(404, 'Queue entry not found or already processed.');

    // Update booking status
    await Booking.findByIdAndUpdate(entry.bookingId, { status: 'arrived' });

    if (req.io) {
      req.io.to(`centre:${centreId}`).emit('queue:updated', { centreId, token, action: 'arrived' });
      req.io.to(`user:${entry.farmerId}`).emit('booking:updated', { token, status: 'arrived' });
    }

    res.json(new ApiResponse(200, { entry }, 'Farmer marked as arrived.'));
  } catch (error) {
    next(error);
  }
};

// PUT /api/queue/:token/call - Officer calls next token
const callToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { centreId, counter } = req.body;

    if (req.user.role === 'officer') {
      const isAssigned = await verifyOfficerCentre(req.user._id, centreId);
      if (!isAssigned) throw new ApiError(403, 'You are not assigned to this centre.');
    }

    const date = new Date();

    // Only one token can be 'serving' at a time per centre
    await QueueEntry.updateMany(
      { centreId, status: 'serving', queueDate: { $gte: startOfDay(date), $lte: endOfDay(date) } },
      { status: 'waiting' } // revert if somehow there's already one serving
    );

    const entry = await QueueEntry.findOneAndUpdate(
      {
        token,
        centreId,
        queueDate: { $gte: startOfDay(date), $lte: endOfDay(date) },
        status: { $in: ['waiting', 'called'] },
      },
      { status: 'serving', servedAt: new Date(), counter: counter || 'Counter 1' },
      { new: true }
    );

    if (!entry) throw new ApiError(404, 'Queue entry not found.');

    await Booking.findByIdAndUpdate(entry.bookingId, { status: 'verification' });

    // Notify the farmer their token is called
    notificationService.tokenCalled(entry.farmerId, { _id: entry.bookingId, token }, counter);

    // Also notify farmers approaching (e.g., 5 farmers ahead)
    const queueState = await getLiveQueue(centreId, date);
    const waitingEntries = queueState.entries.filter((e) => e.status === 'waiting');
    for (let i = 0; i < Math.min(5, waitingEntries.length); i++) {
      const e = waitingEntries[i];
      if (i < 3) {
        notificationService.queueApproaching(e.farmerId, { _id: e.bookingId, token: e.token }, i + 1);
      }
    }

    if (req.io) {
      req.io.to(`centre:${centreId}`).emit('queue:updated', {
        centreId,
        currentlyServing: token,
        counter,
        action: 'token_called',
      });
      req.io.to(`user:${entry.farmerId}`).emit('token:called', { token, counter });
    }

    res.json(new ApiResponse(200, { entry }, `Token ${token} called to ${counter || 'Counter 1'}.`));
  } catch (error) {
    next(error);
  }
};

// PUT /api/queue/:token/complete - Officer completes serving
const completeToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { centreId } = req.body;

    if (req.user.role === 'officer') {
      const isAssigned = await verifyOfficerCentre(req.user._id, centreId);
      if (!isAssigned) throw new ApiError(403, 'You are not assigned to this centre.');
    }

    const date = new Date();
    const entry = await QueueEntry.findOneAndUpdate(
      {
        token,
        centreId,
        queueDate: { $gte: startOfDay(date), $lte: endOfDay(date) },
        status: { $in: ['serving', 'called', 'waiting'] },
      },
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );

    if (!entry) throw new ApiError(404, 'Queue entry not found.');

    if (req.io) {
      req.io.to(`centre:${centreId}`).emit('queue:updated', {
        centreId,
        token,
        action: 'completed',
      });
    }

    res.json(new ApiResponse(200, { entry }, `Token ${token} marked as completed.`));
  } catch (error) {
    next(error);
  }
};

// PUT /api/queue/call-next - Officer calls the very next farmer in queue
const callNextInQueue = async (req, res, next) => {
  try {
    const { centreId, counter } = req.body;

    if (req.user.role === 'officer') {
      const isAssigned = await verifyOfficerCentre(req.user._id, centreId);
      if (!isAssigned) throw new ApiError(403, 'You are not assigned to this centre.');
    }

    const date = new Date();
    const next = await getNextWaiting(centreId, date);
    if (!next) throw new ApiError(404, 'No farmers are currently waiting in the queue.');

    // Delegate to callToken
    req.params = { token: next.token };
    req.body = { centreId, counter };
    return callToken(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLiveQueueState,
  getMyQueuePosition,
  markArrived,
  callToken,
  completeToken,
  callNextInQueue,
};
