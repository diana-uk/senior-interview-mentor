import { posthog, isPostHogInitialized } from './posthog';

type Properties = Record<string, string | number | boolean | null>;

export function trackEvent(event: string, properties?: Properties) {
  if (!isPostHogInitialized()) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, traits?: Properties) {
  if (!isPostHogInitialized()) return;
  posthog.identify(userId, traits);
}

export function resetUser() {
  if (!isPostHogInitialized()) return;
  posthog.reset();
}
