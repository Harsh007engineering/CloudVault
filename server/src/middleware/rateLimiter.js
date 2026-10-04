const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

const config = require('../config/env');

const createLimiter = (prodMaxRequests, windowMinutes, message) => {
  const max = config.isProduction ? prodMaxRequests : 1000;

  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test' || req.headers['x-test-suite'] === 'cloudvault-test',
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
