const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./env');

const configureSession = () => {
  // In production across different domains (e.g. Vercel frontend + Render backend),
  // cookies must be sameSite: 'none' and secure: true to be sent cross-site with credentials.
  const isCrossSite = config.isProduction && config.clientUrl && !config.clientUrl.includes('localhost');

  return session({
    name: 'cv.sid', // Custom cookie name to obscure tech stack
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Respect reverse proxy TLS termination headers
    store: MongoStore.create({
      mongoUrl: config.mongodbUri,
      collectionName: 'sessions',
      ttl: config.sessionMaxAge / 1000,
      autoRemove: 'native'
    }),
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: isCrossSite ? 'none' : 'lax',
      maxAge: config.sessionMaxAge
    }
  });
};

module.exports = configureSession;
