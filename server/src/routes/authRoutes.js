const express = require('express');
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { authLimiter, recoveryLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public auth endpoints (Rate limited)
router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);

// Recovery endpoints (Strict rate limiting)
router.post('/forgot-password', recoveryLimiter, authController.forgotPassword);
router.post('/verify-recovery-code', recoveryLimiter, authController.verifyRecoveryCode);
router.post('/reset-password', recoveryLimiter, authController.resetPassword);

// Authenticated session & account endpoints
router.get('/me', authenticateUser, authController.getMe);
router.post('/change-password', authenticateUser, authController.changePassword);
router.post('/regenerate-recovery-codes', authenticateUser, authController.regenerateRecoveryCodes);

module.exports = router;
