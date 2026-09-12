const express = require('express');
const mongoose = require('mongoose');
const config = require('../config/env');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return sendSuccess(res, {
    service: 'CloudVault API',
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: config.env,
    database: dbStatusMap[dbState] || 'unknown',
    storageProvider: config.storageProvider,
    limits: {
      defaultQuotaMiB: Math.round(config.defaultStorageLimit / (1024 * 1024)),
      maxFileSizeMiB: Math.round(config.maxFileSize / (1024 * 1024))
    }
  }, 'CloudVault API is healthy');
});

module.exports = router;
