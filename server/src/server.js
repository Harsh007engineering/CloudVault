const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start HTTP listener
    const server = app.listen(config.port, () => {
      console.log(`=========================================`);
      console.log(`🚀 CloudVault Server running on port ${config.port}`);
      console.log(`🌐 Environment: ${config.env}`);
      console.log(`🔒 Storage Provider: ${config.storageProvider}`);
      console.log(`📦 Default Quota: ${Math.round(config.defaultStorageLimit / (1024 * 1024))} MiB`);
      console.log(`=========================================`);
    });

    // Graceful shutdown handling
    const shutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error(`[Server] Failed to start:`, error);
    process.exit(1);
  }
};

startServer();
