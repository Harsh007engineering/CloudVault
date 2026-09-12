const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * Ensures user is authenticated via server-side session
 */
const authenticateUser = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return sendError(res, 'Authentication required. Please sign in.', 401);
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      // User was deleted or session is stale
      req.session.destroy();
      res.clearCookie('cv.sid');
      return sendError(res, 'Session expired. Please sign in again.', 401);
    }

    if (user.accountStatus === 'disabled') {
      req.session.destroy();
      res.clearCookie('cv.sid');
      return sendError(res, 'Your account has been disabled. Please contact the administrator.', 403);
    }

    // Attach authenticated user to request object
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication check failed', 500);
  }
};

/**
 * Ensures authenticated user has 'admin' role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 'Access denied. Administrator privileges required.', 403);
  }
  next();
};

/**
 * Checks if user is required to change a temporary password before accessing general endpoints
 */
const checkForcePasswordChange = (req, res, next) => {
  if (req.user && req.user.forcePasswordChange) {
    // Allow routes related to changing password or logging out
    const allowedPaths = ['/api/auth/change-password', '/api/auth/logout', '/api/auth/me'];
    if (!allowedPaths.some(p => req.originalUrl.startsWith(p))) {
      return sendError(res, 'You must change your temporary password before accessing CloudVault features.', 403, {
        forcePasswordChange: true
      });
    }
  }
  next();
};

module.exports = {
  authenticateUser,
  requireAdmin,
  checkForcePasswordChange
};
