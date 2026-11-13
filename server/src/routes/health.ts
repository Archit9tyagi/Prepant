import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

router.get('/ready', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    success: ready,
    data: {
      status: ready ? 'ready' : 'not_ready',
      database: ready ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
