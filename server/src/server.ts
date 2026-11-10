import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';

const httpServer = createServer(app);

async function startServer() {
  try {
    await connectDB();

    httpServer.listen(env.PORT, () => {
      logger.info(`Prepant API running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  httpServer.close(async () => {
    logger.info('HTTP server closed');
    await disconnectDB();
    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

if (process.env.NODE_ENV !== 'test') {
  void startServer();
}

export { httpServer };
