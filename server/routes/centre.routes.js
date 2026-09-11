const express = require('express');
const router = express.Router();
const { getCentres, getCentreById, getCentreSlots } = require('../controllers/centre.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Centres are publicly viewable; optionally authenticated for eligibility filter
router.get('/', (req, res, next) => {
  // Try auth but don't require it
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authenticate(req, res, next);
  }
  next();
}, getCentres);

router.get('/:id', getCentreById);
router.get('/:id/slots', getCentreSlots);

module.exports = router;
