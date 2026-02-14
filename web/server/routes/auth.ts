import { Router } from 'express';
import type { Response } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { syncFromLocalStorage, type SyncPayload } from '../db/queries.js';

const router = Router();

/**
 * POST /api/auth/sync
 * One-time migration of localStorage data to the database on first login.
 */
router.post('/sync', requireAuth, async (req, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const payload = req.body as SyncPayload;
    const result = await syncFromLocalStorage(userId, payload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync data', details: String(err) });
  }
});

export default router;
