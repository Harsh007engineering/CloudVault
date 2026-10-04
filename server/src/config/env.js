const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudvault',
  sessionSecret: process.env.SESSION_SECRET || 'fallback_session_secret_replace_in_prod',
  sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 7200000, // 2 hours
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  defaultStorageLimit: parseInt(process.env.DEFAULT_STORAGE_LIMIT, 10) || 524288000, // 500 MiB
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 26214400, // 25 MiB
  storageProvider: process.env.STORAGE_PROVIDER || 'local',
  localStoragePath: process.env.LOCAL_STORAGE_PATH ? path.resolve(process.env.LOCAL_STORAGE_PATH) : path.resolve(__dirname, '../../../uploads'),
  r2: {
    endpoint: process.env.R2_ENDPOINT || '',
    bucket: process.env.R2_BUCKET || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    region: process.env.R2_REGION || 'auto'
  }
};

module.exports = config;
