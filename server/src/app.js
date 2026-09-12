const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config/env');
const configureSession = require('./config/session');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Trust reverse proxy (useful for production deployment e.g. Render, Railway)
if (config.isProduction) {
  app.set('trust proxy', 1);
}

// 1. Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: config.isProduction ? undefined : false
}));

// 2. CORS setup for credentials (session cookie transmission)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server) or matching clientUrl
    if (!origin || origin === config.clientUrl || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Request Logging
if (!config.isProduction) {
  app.use(morgan('dev'));
}

// 4. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 5. Session middleware backed by MongoDB
app.use(configureSession());

// 6. Security Header: Prevent client caching for all authenticated/private API routes
// This is critical for shared university lab PCs so private responses aren't stored in browser caches
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// 7. Mount API Routes
app.use('/api', routes);

// 8. Error Handlers
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

module.exports = app;
