const ApiError = require('../utils/ApiError');

/**
 * Creates a middleware that restricts access to specified roles.
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. This area requires ${roles.join(' or ')} access.`
        )
      );
    }
    next();
  };
};

const requireFarmer = requireRole('farmer');
const requireOfficer = requireRole('officer', 'admin');
const requireAdmin = requireRole('admin');

module.exports = { requireRole, requireFarmer, requireOfficer, requireAdmin };
