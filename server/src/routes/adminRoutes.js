const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Require both authentication and admin role
router.use(authenticateUser);
router.use(requireAdmin);

router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/quota', adminController.updateUserQuota);
router.post('/users/:id/recovery', adminController.generateTemporaryPassword);

module.exports = router;
