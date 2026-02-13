import { Router, type Request, type Response } from 'express';
import { isSupabaseConfigured } from '../db/client.js';
import {
  getProgressForUser,
  upsertProgress,
  getSessionsForUser,
  createSession,
  getMistakesForUser,
  getDueMistakes,
  createMistake,
  updateMistake,
  deleteMistake,
  getReviewsForUser,
  createReview,
  getStreak,
  recordActivity,
  syncFromLocalStorage,
  type SyncPayload,
} from '../db/queries.js';

const router = Router();

/**
 * Middleware: check Supabase is configured and extract user ID.
 * For now, user ID comes from X-User-Id header (placeholder until auth is wired).
 * When SIM-19 (Auth) is complete, this will use JWT verification.
 */
function requireUser(req: Request, res: Response, next: () => void) {
  if (!isSupabaseConfigured()) {
    res.status(503).json({ error: 'Database not configured. Using localStorage fallback.' });
    return;
  }

  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    res.status(401).json({ error: 'Missing X-User-Id header. Auth required.' });
    return;
  }

  // Attach userId to request for downstream use
  (req as Request & { userId: string }).userId = userId;
  next();
}

// ═══════════════════════════════════════
// PROBLEM PROGRESS
// ═══════════════════════════════════════

router.get('/progress', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const data = await getProgressForUser(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress', details: String(err) });
  }
});

router.post('/progress', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const { problemId, status, attempts, bestScore, bestTime, hintsUsed, code } = req.body;
    const data = await upsertProgress({
      user_id: userId,
      problem_id: problemId,
      status,
      attempts,
      best_score: bestScore,
      best_time: bestTime,
      hints_used: hintsUsed,
      last_code: code,
    });
    // Also record activity for streak
    await recordActivity(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save progress', details: String(err) });
  }
});

// ═══════════════════════════════════════
// SESSIONS
// ═══════════════════════════════════════

router.get('/sessions', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const data = await getSessionsForUser(userId, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions', details: String(err) });
  }
});

router.post('/sessions', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const { mode, problemId, problemTitle, duration, hintsUsed, score, patterns } = req.body;
    const data = await createSession({
      user_id: userId,
      mode,
      problem_id: problemId,
      problem_title: problemTitle,
      duration,
      hints_used: hintsUsed,
      score,
      patterns,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create session', details: String(err) });
  }
});

// ═══════════════════════════════════════
// MISTAKES
// ═══════════════════════════════════════

router.get('/mistakes', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const data = await getMistakesForUser(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mistakes', details: String(err) });
  }
});

router.get('/mistakes/due', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const data = await getDueMistakes(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch due mistakes', details: String(err) });
  }
});

router.post('/mistakes', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const { pattern, problemId, problemTitle, description } = req.body;
    const data = await createMistake({
      user_id: userId,
      pattern,
      problem_id: problemId,
      problem_title: problemTitle,
      description,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create mistake', details: String(err) });
  }
});

router.patch('/mistakes/:id', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const id = req.params.id as string;
    const { nextReview, intervalDays, easeFactor, repetitions, streak } = req.body;
    const data = await updateMistake(id, userId, {
      next_review: nextReview,
      interval_days: intervalDays,
      ease_factor: easeFactor,
      repetitions,
      streak,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update mistake', details: String(err) });
  }
});

router.delete('/mistakes/:id', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const id = req.params.id as string;
    await deleteMistake(id, userId);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mistake', details: String(err) });
  }
});

// ═══════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════

router.get('/reviews', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const data = await getReviewsForUser(userId, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews', details: String(err) });
  }
});

router.post('/reviews', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const { problemId, problemTitle, dimensions, overallScore, feedback, improvementPlan } = req.body;
    const data = await createReview({
      user_id: userId,
      problem_id: problemId,
      problem_title: problemTitle,
      correctness: dimensions?.correctness,
      time_complexity: dimensions?.['time-complexity'],
      space_complexity: dimensions?.['space-complexity'],
      code_quality: dimensions?.['code-quality'],
      edge_cases: dimensions?.['edge-cases'],
      communication: dimensions?.communication,
      overall_score: overallScore,
      feedback,
      improvement_plan: improvementPlan,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review', details: String(err) });
  }
});

// ═══════════════════════════════════════
// STREAKS
// ═══════════════════════════════════════

router.get('/streak', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const data = await getStreak(userId);
    res.json(data ?? { current_streak: 0, longest_streak: 0, last_active_date: null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch streak', details: String(err) });
  }
});

// ═══════════════════════════════════════
// BULK SYNC (localStorage → DB migration)
// ═══════════════════════════════════════

router.post('/sync', requireUser, async (req: Request, res: Response) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const payload = req.body as SyncPayload;
    const result = await syncFromLocalStorage(userId, payload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync data', details: String(err) });
  }
});

export default router;
