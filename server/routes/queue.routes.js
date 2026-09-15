const express = require('express');
const router = express.Router();
const {
  getLiveQueueState,
  getMyQueuePosition,
  markArrived,
  callToken,
  completeToken,
  callNextInQueue,
  getGateMetrics,
  lookupGateToken,
  verifyGateEntry,
} = require('../controllers/queue.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireOfficer } = require('../middleware/role.middleware');

const injectIO = (req, res, next) => {
  req.io = req.app.get('io');
  next();
};

router.get('/:centreId/live', getLiveQueueState);
router.get('/:centreId/position', authenticate, getMyQueuePosition);

router.use(authenticate, requireOfficer, injectIO);
router.get('/gate-metrics', getGateMetrics);
router.post('/lookup-gate-token', lookupGateToken);
router.put('/verify-gate-entry/:token', verifyGateEntry);
router.put('/:token/arrived', markArrived);
router.put('/:token/call', callToken);
router.put('/:token/complete', completeToken);
router.post('/call-next', callNextInQueue);

module.exports = router;
