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

const aadhaarService = require('../services/aadhaar/AadhaarService');
const smsService = require('../services/sms/SMSService');

// POST /api/farmers/aadhaar/send-otp — Request official UIDAI OTP via authorized provider
const sendAadhaarOtp = async (req, res, next) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber) {
      throw new ApiError(400, 'Aadhaar number is required.');
    }

    const result = await aadhaarService.requestAadhaarOtp(aadhaarNumber);

    res.json(
      new ApiResponse(200, {
        configured: result.configured,
        referenceId: result.referenceId,
        maskedAadhaar: result.maskedAadhaar,
        configurationGuide: result.configurationGuide,
      }, result.message)
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/farmers/aadhaar/verify-otp — Verify official UIDAI OTP & receive authorized demographic packet
const verifyAadhaarOtp = async (req, res, next) => {
  try {
    const { referenceId, otp } = req.body;

    if (!referenceId) {
      throw new ApiError(400, 'Aadhaar reference ID is required. Please request OTP first.');
    }
    if (!otp || String(otp).trim().length !== 6) {
      throw new ApiError(400, 'Please enter a valid 6-digit Aadhaar OTP.');
    }

    const kycResult = await aadhaarService.verifyAadhaarOtp(referenceId, otp);

    res.json(
      new ApiResponse(200, {
        verified: true,
        aadhaarDetails: kycResult.aadhaarDetails,
        aadhaarSeedingStatus: kycResult.aadhaarSeedingStatus, // ONLY if reported by provider
        npciStatus: kycResult.npciStatus,                     // ONLY if reported by provider
      }, 'Aadhaar verified successfully via authorized e-KYC gateway.')
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/farmers/submit-kyc — Submit KYC with manual Land Records & dispatch real SMS
const submitKyc = async (req, res, next) => {
  try {
    const {
      aadhaarNumber,
      aadhaarDetails,
      aadhaarSeedingStatus,
      npciStatus,
      khatauniNumber,
      khasraNumber,
      landArea,
      landDocumentName,
    } = req.body;

    if (!khatauniNumber || !khatauniNumber.trim()) {
      throw new ApiError(400, 'Khatauni number is required.');
    }
    if (!khasraNumber || !khasraNumber.trim()) {
      throw new ApiError(400, 'Khasra / Survey / Plot number is required.');
    }
    if (!landArea || !landArea.trim()) {
      throw new ApiError(400, 'Land area is required.');
    }

    const maskedAadhaar = aadhaarDetails?.maskedAadhaar || aadhaarService.maskAadhaar(aadhaarNumber || '');

    const updateData = {
      aadhaarNumber: maskedAadhaar,
      aadhaarVerified: Boolean(aadhaarDetails?.verifiedAt),
      aadhaarSeedingStatus: aadhaarSeedingStatus || 'Pending Verification',
      npciStatus: npciStatus || 'Pending Verification',
      aadhaarDetails: aadhaarDetails || {
        maskedAadhaar,
        name: req.user?.name,
        district: req.user?.district,
        state: req.user?.state,
      },
      khatauniNumber: khatauniNumber.trim(),
      khasraNumber: khasraNumber.trim(),
      landArea: landArea.trim(),
      landDocumentName: landDocumentName || 'Khatauni_ROR_Record.pdf',
      kycStatus: 'Pending',
      kycSubmittedAt: new Date(),
    };

    const profile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    // Send mandatory KYC submission SMS to farmer's verified mobile number
    await smsService.sendKycConfirmation(req.user.mobile);

    res.json(
      new ApiResponse(200, {
        profile,
        kycStatus: 'Pending',
        message: 'Your KYC application has been successfully submitted. Your KYC will be updated within 2 working days.',
      }, 'KYC application submitted successfully.')
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/farmers/kyc-status — Retrieve KYC status and verified details
const getKycStatus = async (req, res, next) => {
  try {
    const profile = await FarmerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      throw new ApiError(404, 'Farmer profile not found.');
    }

    res.json(
      new ApiResponse(200, {
        kycStatus: profile.kycStatus || 'Not Started',
        aadhaarVerified: !!profile.aadhaarVerified,
        aadhaarNumber: profile.aadhaarNumber || null,
        aadhaarSeedingStatus: profile.aadhaarSeedingStatus || 'Not Started',
        npciStatus: profile.npciStatus || 'Not Started',
        aadhaarDetails: profile.aadhaarDetails || null,
        khatauniNumber: profile.khatauniNumber || null,
        khasraNumber: profile.khasraNumber || null,
        landArea: profile.landArea || null,
        landDocumentName: profile.landDocumentName || null,
        kycSubmittedAt: profile.kycSubmittedAt || null,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getProcurementHistory,
  sendAadhaarOtp,
  verifyAadhaarOtp,
  submitKyc,
  getKycStatus,
};
