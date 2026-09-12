const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./env');

const configureSession = () => {
  return session({
    name: 'cv.sid', // Custom cookie name to obscure tech stack
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongodbUri,
      collectionName: 'sessions',
      ttl: config.sessionMaxAge / 1000,
      autoRemove: 'native'
    }),
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: config.sessionMaxAge
    }
  });
};

module.exports = configureSession;
