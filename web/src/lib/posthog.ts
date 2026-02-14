import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST;
  if (initialized || !key) return;

  posthog.init(key, {
    api_host: host || 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: true,
    persistence: 'localStorage',
  });

  initialized = true;
}

export function isPostHogInitialized() {
  return initialized;
}

export { posthog };
