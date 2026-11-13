import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

const maxAttempts = 5;

function mongoHost(uri: string): string {
  try {
    return new URL(uri).hostname || 'unknown';
  } catch {
    return 'unknown';
  }
}

function connectionHint(error: unknown, uri: string): string {
  const message = error instanceof Error ? error.message : String(error);
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  const host = mongoHost(uri);

  if (
    (code === 'ECONNREFUSED' || message.includes('ECONNREFUSED')) &&
    /localhost|127\.0\.0\.1|::1/.test(host)
  ) {
    return 'MongoDB refused a localhost connection; MONGODB_URI is missing or points to a local database.';
  }
  if (code === '18' || /bad auth|authentication failed/i.test(message)) {
    return 'MongoDB authentication failed; check the database user/password and URL-encode special password characters.';
  }
  if (code === 'ENOTFOUND' || /querySrv|ENOTFOUND/i.test(message)) {
    return 'MongoDB host lookup failed; check the Atlas cluster hostname in MONGODB_URI.';
  }
  if (/server selection timeout|ServerSelectionError/i.test(message)) {
    return 'MongoDB server selection timed out; check Atlas Network Access and the service outbound IP allowlist.';
  }
  return 'Check MONGODB_URI and the MongoDB provider configuration.';
}

export async function connectDB(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  const host = mongoHost(uri);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      logger.info({ host }, 'MongoDB connected');
      return conn;
    } catch (error) {
      logger.error({ attempt, host }, `MongoDB connection failed. ${connectionHint(error, uri)}`);
      if (attempt === maxAttempts) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * 2 ** (attempt - 1), 10000)),
      );
    }
  }

  throw new Error('MongoDB connection failed after retries');
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully');
  } catch (err) {
    logger.error({ err }, 'Error closing MongoDB connection');
  }
}

mongoose.connection.on('error', () => {
  logger.error('MongoDB runtime error');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
