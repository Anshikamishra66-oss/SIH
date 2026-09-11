const FarmerProfile = require('../models/FarmerProfile.model');
const Booking = require('../models/Booking.model');
const Procurement = require('../models/Procurement.model');
const Payment = require('../models/Payment.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/farmers/profile
const getProfile = async (req, res, next) => {
  try {
    const profile = await FarmerProfile.findOne({ userId: req.user._id })
      .populate('crops.cropId', 'name mspPrice unit season category');
    if (!profile) throw new ApiError(404, 'Profile not found.');
    res.json(new ApiResponse(200, { user: req.user, profile }));
  } catch (error) {
    next(error);
  }
};

// PUT /api/farmers/profile
const updateProfile = async (req, res, next) => {
  try {
    const { state, district, village, address, farmerIdNumber, crops } = req.body;
    const profile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        state, district, village, address,
        farmerIdNumber: farmerIdNumber || undefined,
        crops: crops || [],
        isProfileComplete: !!(state && district),
      },
      { new: true, runValidators: true }
    ).populate('crops.cropId', 'name mspPrice unit');

    if (!profile) throw new ApiError(404, 'Profile not found.');
    res.json(new ApiResponse(200, { profile }, 'Profile updated successfully.'));
  } catch (error) {
    next(error);
  }
};

// GET /api/farmers/history
const getProcurementHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { farmerId: req.user._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('centreId', 'name address district')
      .populate('cropId', 'name unit mspPrice')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Fetch procurements and payments for each booking
    const bookingIds = bookings.map((b) => b._id);
    const procurements = await Procurement.find({ bookingId: { $in: bookingIds } });
    const payments = await Payment.find({ bookingId: { $in: bookingIds } });

    const history = bookings.map((b) => {
      const proc = procurements.find((p) => p.bookingId.toString() === b._id.toString());
      const pay = payments.find((p) => p.bookingId.toString() === b._id.toString());
      return {
        booking: b,
        procurement: proc || null,
        payment: pay || null,
      };
    });

    const total = await Booking.countDocuments(filter);

    res.json(
      new ApiResponse(200, {
        history,
        pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getProcurementHistory };
