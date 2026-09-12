const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

const createLimiter = (maxRequests, windowMinutes, message) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      return sendError(res, message, 429);
    }
  });
};

const authLimiter = createLimiter(
  30,
  15,
  'Too many authentication attempts from this computer. Please try again after 15 minutes.'
);

const recoveryLimiter = createLimiter(
  10,
  15,
  'Too many password recovery attempts. Please try again after 15 minutes.'
);

module.exports = {
  authLimiter,
  recoveryLimiter
};
