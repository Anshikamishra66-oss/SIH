const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop.model');
const ApiResponse = require('../utils/ApiResponse');

router.get('/', async (req, res, next) => {
  try {
    const crops = await Crop.find({ isActive: true }).sort({ name: 1 });
    res.json(new ApiResponse(200, { crops }));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
