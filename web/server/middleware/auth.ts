import type { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin, isSupabaseConfigured } from '../db/client.js';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export interface OptionalAuthRequest extends Request {
  userId?: string;
}

/**
 * JWT verification middleware. Extracts Bearer token, verifies via Supabase,
 * and attaches userId to the request.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!isSupabaseConfigured()) {
    res.status(503).json({ error: 'Database not configured. Using localStorage fallback.' });
    return;
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'Missing auth token' });
    return;
  }

  try {
    const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    (req as AuthenticatedRequest).userId = user.id;
    next();
  } catch {
    res.status(401).json({ error: 'Auth verification failed' });
  }
}

/**
 * Optional auth middleware. Attaches userId if a valid token is present,
 * but doesn't block the request if missing or invalid.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  if (!isSupabaseConfigured()) {
    next();
    return;
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    next();
    return;
  }

  try {
    const { data: { user } } = await getSupabaseAdmin().auth.getUser(token);
    if (user) {
      (req as OptionalAuthRequest).userId = user.id;
    }
  } catch {
    // Silently continue without auth
  }
  next();
}
