import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';
import { setSocketServer } from './realtime.js';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.CLIENT_URL, credentials: true },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token || typeof token !== 'string') return next(new Error('Authentication required'));
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string };
    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error('Invalid authentication token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId as string;
  socket.join(`user:${userId}`);
  socket.on('conversation:join', (conversationId: string) => {
    if (typeof conversationId === 'string') socket.join(`conversation:${conversationId}`);
  });
  socket.on('conversation:leave', (conversationId: string) => {
    if (typeof conversationId === 'string') socket.leave(`conversation:${conversationId}`);
  });
});
setSocketServer(io);

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
