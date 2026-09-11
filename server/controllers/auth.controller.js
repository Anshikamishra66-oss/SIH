const { body } = require('express-validator');
const User = require('../models/User.model');
const FarmerProfile = require('../models/FarmerProfile.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateTokens } = require('../middleware/auth.middleware');

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('mobile')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian mobile number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
];

const loginValidation = [
  body('mobile').trim().notEmpty().withMessage('Mobile number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const {
      name, mobile, email, password,
      state, district, village, address, farmerIdNumber,
    } = req.body;

    // Check if mobile already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      throw new ApiError(409, 'This mobile number is already registered. Please login.');
    }

    // Check email uniqueness if provided
    if (email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        throw new ApiError(409, 'This email is already registered.');
      }
    }

    // Create user
    const user = await User.create({
      name,
      mobile,
      email: email?.toLowerCase(),
      password,
      role: 'farmer',
    });

    // Create farmer profile
    await FarmerProfile.create({
      userId: user._id,
      farmerIdNumber: farmerIdNumber || undefined,
      state,
      district,
      village,
      address,
      isProfileComplete: !!(state && district),
    });

    const { accessToken } = generateTokens(user._id, user.role);

    res.status(201).json(
      new ApiResponse(201, { user, accessToken }, 'Registration successful! Welcome to Kisan Procurement Connect.')
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid mobile number or password.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, 'Invalid mobile number or password.');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const { accessToken } = generateTokens(user._id, user.role);
    const userObj = user.toJSON();

    res.json(
      new ApiResponse(200, { user: userObj, accessToken }, 'Login successful.')
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    // JWT is stateless; client deletes the token
    // In production, maintain a token blacklist or use refresh tokens
    res.json(new ApiResponse(200, null, 'Logged out successfully.'));
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ userId: user._id })
        .populate('crops.cropId', 'name mspPrice unit');
    }

    res.json(new ApiResponse(200, { user, profile }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  registerValidation,
  loginValidation,
};
