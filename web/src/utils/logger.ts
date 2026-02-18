/**
 * Dev-only logger utility.
 *
 * - `logger.log` / `logger.warn` — silent in production builds
 * - `logger.error` — always active (errors should never be swallowed)
 */

const isDev = import.meta.env.DEV;

/* eslint-disable no-console */
export const logger = {
  log: isDev
    ? (...args: unknown[]) => console.log(...args)
    : () => {},
  warn: isDev
    ? (...args: unknown[]) => console.warn(...args)
    : () => {},
  error: (...args: unknown[]) => console.error(...args),
} as const;
/* eslint-enable no-console */
