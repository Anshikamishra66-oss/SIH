const Booking = require('../models/Booking.model');
const QueueEntry = require('../models/QueueEntry.model');
const Procurement = require('../models/Procurement.model');
const Payment = require('../models/Payment.model');
const OfficerProfile = require('../models/OfficerProfile.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getLiveQueue } = require('../services/queue.service');
const { startOfDay, endOfDay } = require('../utils/helpers');

// GET /api/officer/dashboard
const getOfficerDashboard = async (req, res, next) => {
  try {
    const officerProfile = await OfficerProfile.findOne({ userId: req.user._id })
      .populate('centreId', 'name address avgServiceTimeMinutes');

    if (!officerProfile) throw new ApiError(404, 'Officer profile not found.');

    const centreId = officerProfile.centreId._id;
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    const [
      totalToday,
      arrivedCount,
      completedCount,
      cancelledCount,
      waitingCount,
    ] = await Promise.all([
      Booking.countDocuments({ centreId, bookingDate: { $gte: dayStart, $lte: dayEnd }, status: { $ne: 'cancelled' } }),
      Booking.countDocuments({ centreId, bookingDate: { $gte: dayStart, $lte: dayEnd }, status: { $in: ['arrived', 'verification', 'verified', 'procurement_in_progress', 'procurement_completed', 'payment_processing', 'payment_completed'] } }),
      Booking.countDocuments({ centreId, bookingDate: { $gte: dayStart, $lte: dayEnd }, status: 'procurement_completed' }),
      Booking.countDocuments({ centreId, bookingDate: { $gte: dayStart, $lte: dayEnd }, status: 'cancelled' }),
      QueueEntry.countDocuments({ centreId, queueDate: { $gte: dayStart, $lte: dayEnd }, status: 'waiting' }),
    ]);

    const queueState = await getLiveQueue(centreId, today);

    // Get today's bookings for table
    const todayBookings = await Booking.find({
      centreId,
      bookingDate: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'cancelled' },
    })
      .populate('farmerId', 'name mobile')
      .populate('cropId', 'name')
      .sort({ slotStartTime: 1, token: 1 });

    res.json(
      new ApiResponse(200, {
        centre: officerProfile.centreId,
        stats: {
          totalToday,
          arrived: arrivedCount,
          waiting: waitingCount,
          completed: completedCount,
          cancelled: cancelledCount,
          pending: totalToday - completedCount - cancelledCount,
        },
        queue: queueState,
        todayBookings,
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/officer/bookings?status=&date=
const getOfficerBookings = async (req, res, next) => {
  try {
    const officerProfile = await OfficerProfile.findOne({ userId: req.user._id });
    if (!officerProfile) throw new ApiError(404, 'Officer profile not found.');

    const { status, date, page = 1, limit = 20, search } = req.query;
    const centreId = officerProfile.centreId;

    const targetDate = date ? new Date(date) : new Date();
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const filter = {
      centreId,
      bookingDate: { $gte: dayStart, $lte: dayEnd },
    };
    if (status) filter.status = status;

    let bookings = await Booking.find(filter)
      .populate('farmerId', 'name mobile')
      .populate('cropId', 'name')
      .sort({ token: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.token?.toLowerCase().includes(s) ||
          b.bookingId?.toLowerCase().includes(s) ||
          b.farmerId?.name?.toLowerCase().includes(s)
      );
    }

    const total = await Booking.countDocuments(filter);

    res.json(
      new ApiResponse(200, {
        bookings,
        pagination: { page: Number(page), limit: Number(limit), total },
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getOfficerDashboard, getOfficerBookings };
