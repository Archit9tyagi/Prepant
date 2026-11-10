import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, number>;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: formatted,
      },
    });
    return;
  }

  const mongoErr = err as MongoError;
  if (mongoErr.code === 11000) {
    const fields = mongoErr.keyPattern ? Object.keys(mongoErr.keyPattern) : [];
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: `Resource already exists with unique field: ${fields.join(', ')}`,
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled server error');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message,
    },
  });
};
