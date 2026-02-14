import type { Request, Response, NextFunction } from 'express';
import { captureException } from '../lib/sentry.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('[Error]', err);
  captureException(err);

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Invalid JSON in request body.' });
    return;
  }

  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred.';
  res.status(500).json({ error: message });
}
