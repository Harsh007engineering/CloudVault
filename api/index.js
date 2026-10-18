const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

module.exports = async (req, res) => {
  // 1. Ensure database is connected before handling request
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless] MongoDB connection error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is properly configured in Vercel project environment variables.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // 2. Normalize req.url: if Vercel rewrite or proxy strips the /api prefix, restore it
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }

  // 3. Delegate to Express app
  return app(req, res);
};
