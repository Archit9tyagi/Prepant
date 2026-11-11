import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { httpLogger } from './config/logger.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import { ApiError } from './utils/ApiError.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';

export const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(httpLogger);
app.use(globalLimiter);

// API v1 routes
app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);

// Catch-all 404 for undefined routes
app.use((_req, _res, next) => {
  next(ApiError.notFound('Resource not found', 'ROUTE_NOT_FOUND'));
});

// Central error handler
app.use(errorHandler);
