import { Router, type Request, type Response } from 'express';
import { getAIBackend } from '../services/ai.js';

const startTime = Date.now();

const router = Router();

export function handleHealth(_req: Request, res: Response): void {
  const memUsage = process.memoryUsage();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    aiBackend: getAIBackend(),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    },
    nodeVersion: process.version,
  });
}

router.get('/health', handleHealth);

export default router;
