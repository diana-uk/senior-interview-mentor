import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscribe, showToast } from '../toast';

// Each test imports from the same module instance — listeners persist across
// tests unless we unsubscribe. Use the returned unsubscribe in every test.

describe('toast utility', () => {
  describe('subscribe', () => {
    it('returns an unsubscribe function', () => {
      const unsub = subscribe(vi.fn());
      expect(typeof unsub).toBe('function');
      unsub();
    });

    it('listener is called when showToast fires', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('hello', 'info', 0);
      expect(listener).toHaveBeenCalledOnce();
      unsub();
    });

    it('listener receives a ToastEvent with correct message', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('Test message', 'success', 2000);
      expect(listener.mock.calls[0][0].message).toBe('Test message');
      unsub();
    });

    it('listener receives a ToastEvent with correct type', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('msg', 'warning', 0);
      expect(listener.mock.calls[0][0].type).toBe('warning');
      unsub();
    });

    it('listener receives a ToastEvent with correct duration', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('msg', 'error', 5000);
      expect(listener.mock.calls[0][0].duration).toBe(5000);
      unsub();
    });

    it('listener receives a non-empty string id', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('msg', 'info', 0);
      const { id } = listener.mock.calls[0][0];
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
      unsub();
    });

    it('multiple showToast calls generate unique ids', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('a', 'info', 0);
      showToast('b', 'info', 0);
      const id1 = listener.mock.calls[0][0].id;
      const id2 = listener.mock.calls[1][0].id;
      expect(id1).not.toBe(id2);
      unsub();
    });

    it('multiple subscribers all receive the event', () => {
      const l1 = vi.fn();
      const l2 = vi.fn();
      const u1 = subscribe(l1);
      const u2 = subscribe(l2);
      showToast('broadcast', 'info', 0);
      expect(l1).toHaveBeenCalledOnce();
      expect(l2).toHaveBeenCalledOnce();
      u1();
      u2();
    });

    it('all subscribers receive the same event id', () => {
      const l1 = vi.fn();
      const l2 = vi.fn();
      const u1 = subscribe(l1);
      const u2 = subscribe(l2);
      showToast('same', 'success', 0);
      expect(l1.mock.calls[0][0].id).toBe(l2.mock.calls[0][0].id);
      u1();
      u2();
    });
  });

  describe('unsubscribe', () => {
    it('listener is not called after unsubscribe', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      unsub();
      showToast('after unsub', 'info', 0);
      expect(listener).not.toHaveBeenCalled();
    });

    it('calling unsubscribe twice does not throw', () => {
      const unsub = subscribe(vi.fn());
      unsub();
      expect(() => unsub()).not.toThrow();
    });

    it('other subscribers still receive events after one unsubscribes', () => {
      const l1 = vi.fn();
      const l2 = vi.fn();
      const u1 = subscribe(l1);
      const u2 = subscribe(l2);
      u1();
      showToast('remaining', 'info', 0);
      expect(l1).not.toHaveBeenCalled();
      expect(l2).toHaveBeenCalledOnce();
      u2();
    });
  });

  describe('showToast defaults', () => {
    it('defaults type to "info" when not specified', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('default type');
      expect(listener.mock.calls[0][0].type).toBe('info');
      unsub();
    });

    it('defaults duration to 3000 when not specified', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('default duration');
      expect(listener.mock.calls[0][0].duration).toBe(3000);
      unsub();
    });

    it('uses provided type over default', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('msg', 'error');
      expect(listener.mock.calls[0][0].type).toBe('error');
      unsub();
    });
  });

  describe('toast types', () => {
    it.each(['success', 'error', 'warning', 'info'] as const)('fires with type=%s', (type) => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      showToast('msg', type, 0);
      expect(listener.mock.calls[0][0].type).toBe(type);
      unsub();
    });
  });
});
