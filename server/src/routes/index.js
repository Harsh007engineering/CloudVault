const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const fileRoutes = require('./fileRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CloudVault API is running',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
