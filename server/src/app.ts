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
import taxonomyRouter from './routes/taxonomy.js';
import mentorRouter from './routes/mentor.js';
import adminRouter from './routes/admin.js';
import path from 'node:path';
import publicRouter from './routes/public.js';
import availabilityRouter from './routes/availability.js';
import bookingsRouter from './routes/bookings.js';
import communityRouter from './routes/community.js';
import operationsRouter from './routes/operations.js';

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
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${env.CLIENT_URL}/sitemap.xml\n`);
});
app.get('/sitemap.xml', (_req, res) => {
  const routes = [
    '',
    'mentors',
    'find-my-mentor',
    'how-it-works',
    'about',
    'contact',
    'faq',
    'privacy',
    'terms',
    'refund-policy',
  ];
  const urls = routes.map((route) => `<url><loc>${env.CLIENT_URL}/${route}</loc></url>`).join('');
  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    );
});

// API v1 routes
app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1', taxonomyRouter);
app.use('/api/v1/mentor', mentorRouter);
app.use('/api/v1/mentor/availability', availabilityRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1', communityRouter);
app.use('/api/v1', operationsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1', publicRouter);

// Catch-all 404 for undefined routes
app.use((_req, _res, next) => {
  next(ApiError.notFound('Resource not found', 'ROUTE_NOT_FOUND'));
});

// Central error handler
app.use(errorHandler);
