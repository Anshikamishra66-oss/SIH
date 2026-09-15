const express = require('express');
const router = express.Router();
const {
  createSubordinate,
  getSubordinates,
  getHierarchy,
  toggleSubordinate,
  resetSubordinatePassword,
  getCreatableRoles,
} = require('../controllers/staff.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireOfficerOrAbove } = require('../middleware/role.middleware');

// All staff routes require authentication + officer-level role
router.use(authenticate, requireOfficerOrAbove);

router.get('/creatable-roles', getCreatableRoles);
router.post('/create', createSubordinate);
router.get('/subordinates', getSubordinates);
router.get('/hierarchy', getHierarchy);
router.put('/:id/toggle', toggleSubordinate);
router.put('/:id/reset-password', resetSubordinatePassword);

module.exports = router;
