import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDB(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.error({ err }, 'Failed to connect to MongoDB');
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
  } catch (err) {
    logger.error({ err }, 'Error closing MongoDB connection');
  }
}

mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB runtime error');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
