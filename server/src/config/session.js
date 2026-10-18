const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./env');

const configureSession = () => {
  // On Vercel single-project deployment, frontend and backend share the exact same domain.
  // Using sameSite: 'lax' avoids third-party cookie blocking on shared university lab browsers.
  const isVercelUnified = Boolean(process.env.VERCEL);
  const isCrossSite = !isVercelUnified && config.isProduction && (!config.clientUrl || !config.clientUrl.includes('localhost'));

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
