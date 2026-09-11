const ProcurementCentre = require('../models/ProcurementCentre.model');
const Slot = require('../models/Slot.model');
const FarmerProfile = require('../models/FarmerProfile.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// GET /api/centres - List centres (filtered by farmer eligibility if logged in as farmer)
const getCentres = async (req, res, next) => {
  try {
    const { district, state, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (district) filter.district = { $regex: district, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };

    // If farmer, show centres in their district + any with empty eligibility (open)
    if (req.user && req.user.role === 'farmer') {
      const profile = await FarmerProfile.findOne({ userId: req.user._id });
      if (profile) {
        filter.$or = [
          { eligibilityDistricts: { $size: 0 } },
          { eligibilityDistricts: { $elemMatch: { $regex: profile.district, $options: 'i' } } },
        ];
      }
    }

    const centres = await ProcurementCentre.find(filter)
      .populate('availableCrops', 'name mspPrice unit season')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ name: 1 });

    const total = await ProcurementCentre.countDocuments(filter);

    res.json(
      new ApiResponse(200, {
        centres,
        pagination: { page: Number(page), limit: Number(limit), total },
      })
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/centres/:id
const getCentreById = async (req, res, next) => {
  try {
    const centre = await ProcurementCentre.findById(req.params.id)
      .populate('availableCrops', 'name mspPrice unit season category')
      .populate('officerIds', 'name');

    if (!centre || !centre.isActive) {
      throw new ApiError(404, 'Procurement centre not found.');
    }

    res.json(new ApiResponse(200, { centre }));
  } catch (error) {
    next(error);
  }
};

// GET /api/centres/:id/slots?date=YYYY-MM-DD
const getCentreSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) throw new ApiError(400, 'Date is required.');

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const slots = await Slot.find({
      centreId: req.params.id,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'closed' },
    }).sort({ startTime: 1 });

    res.json(new ApiResponse(200, { slots }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getCentres, getCentreById, getCentreSlots };
