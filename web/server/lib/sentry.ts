import * as Sentry from '@sentry/node';
import { config } from '../config.js';

let initialized = false;

export function initSentry() {
  if (initialized || !config.sentryDsn) return;

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.nodeEnv,
    tracesSampleRate: config.nodeEnv === 'production' ? 0.2 : 1.0,
  });

  initialized = true;
  console.log('[sentry] Backend error tracking initialized');
}

export function captureException(err: unknown) {
  if (!initialized) return;
  Sentry.captureException(err);
}

export { Sentry };
