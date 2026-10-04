const config = require('../../config/env');
const LocalStorageProvider = require('./LocalStorageProvider');
const R2StorageProvider = require('./R2StorageProvider');

let instance = null;

const getStorageProvider = () => {
  if (instance) {
    return instance;
  }

  if (config.storageProvider === 'r2' && config.r2.endpoint && config.r2.accessKeyId) {
    console.log('[StorageService] Initializing Cloudflare R2 / S3 Provider');
    instance = new R2StorageProvider(config.r2);
  } else {
    if (config.storageProvider === 'r2') {
      console.warn('[StorageService] R2 credentials not fully specified in .env, falling back to LocalStorageProvider');
    }
    console.log(`[StorageService] Initializing Local Disk Storage Provider at: ${config.localStoragePath}`);
    instance = new LocalStorageProvider(config.localStoragePath);
  }

  return instance;
};

module.exports = getStorageProvider();
