const multer = require('multer');
const config = require('../config/env');

// Use memory storage so we can validate file contents, compute safe keys, and upload to storage provider
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize, // 25 MiB per file
    files: 10 // Max 10 files per request
  }
});

module.exports = upload;
