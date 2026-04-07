import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock posthog module before importing analytics
const mockCapture  = vi.fn();
const mockIdentify = vi.fn();
const mockReset    = vi.fn();
let _initialized   = false;

vi.mock('../posthog', () => ({
  posthog: {
    capture:  (...args: unknown[]) => mockCapture(...args),
    identify: (...args: unknown[]) => mockIdentify(...args),
    reset:    () => mockReset(),
  },
  isPostHogInitialized: () => _initialized,
}));

import { trackEvent, identifyUser, resetUser } from '../analytics';

beforeEach(() => {
  mockCapture.mockClear();
  mockIdentify.mockClear();
  mockReset.mockClear();
  _initialized = false;
});

describe('analytics', () => {
  describe('trackEvent', () => {
    it('does not call posthog.capture when not initialized', () => {
      _initialized = false;
      trackEvent('test_event');
      expect(mockCapture).not.toHaveBeenCalled();
    });

    it('calls posthog.capture when initialized', () => {
      _initialized = true;
      trackEvent('test_event');
      expect(mockCapture).toHaveBeenCalledOnce();
    });

    it('passes event name to posthog.capture', () => {
      _initialized = true;
      trackEvent('problem_solved');
      expect(mockCapture).toHaveBeenCalledWith('problem_solved', undefined);
    });

    it('passes properties to posthog.capture', () => {
      _initialized = true;
      trackEvent('problem_solved', { difficulty: 'Hard', pattern: 'DP' });
      expect(mockCapture).toHaveBeenCalledWith('problem_solved', { difficulty: 'Hard', pattern: 'DP' });
    });
  });

  describe('identifyUser', () => {
    it('does not call posthog.identify when not initialized', () => {
      _initialized = false;
      identifyUser('user-123');
      expect(mockIdentify).not.toHaveBeenCalled();
    });

    it('calls posthog.identify when initialized', () => {
      _initialized = true;
      identifyUser('user-123');
      expect(mockIdentify).toHaveBeenCalledOnce();
    });

    it('passes userId and traits to posthog.identify', () => {
      _initialized = true;
      identifyUser('user-abc', { plan: 'premium' });
      expect(mockIdentify).toHaveBeenCalledWith('user-abc', { plan: 'premium' });
    });

    it('passes undefined traits when not provided', () => {
      _initialized = true;
      identifyUser('user-abc');
      expect(mockIdentify).toHaveBeenCalledWith('user-abc', undefined);
    });
  });

  describe('resetUser', () => {
    it('does not call posthog.reset when not initialized', () => {
      _initialized = false;
      resetUser();
      expect(mockReset).not.toHaveBeenCalled();
    });

    it('calls posthog.reset when initialized', () => {
      _initialized = true;
      resetUser();
      expect(mockReset).toHaveBeenCalledOnce();
    });
  });
});
