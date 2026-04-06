import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useKeyboardShortcutsModal } from '../useKeyboardShortcutsModal';

function fireKey(key: string, options: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, ...options });
  document.dispatchEvent(event);
  return event;
}

describe('useKeyboardShortcutsModal', () => {
  describe('initial state', () => {
    it('starts closed', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      expect(result.current.isOpen).toBe(false);
    });

    it('exposes open, close, and isOpen', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
      expect(typeof result.current.isOpen).toBe('boolean');
    });
  });

  describe('open / close helpers', () => {
    it('open() sets isOpen to true', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { result.current.open(); });
      expect(result.current.isOpen).toBe(true);
    });

    it('close() sets isOpen to false', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { result.current.open(); });
      act(() => { result.current.close(); });
      expect(result.current.isOpen).toBe(false);
    });

    it('close() is a no-op when already closed', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { result.current.close(); });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('? key — opens/toggles modal', () => {
    it('pressing ? opens the modal', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { fireKey('?'); });
      expect(result.current.isOpen).toBe(true);
    });

    it('pressing ? a second time closes the modal (toggle)', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { fireKey('?'); });
      act(() => { fireKey('?'); });
      expect(result.current.isOpen).toBe(false);
    });

    it('pressing ? three times leaves modal open', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { fireKey('?'); });
      act(() => { fireKey('?'); });
      act(() => { fireKey('?'); });
      expect(result.current.isOpen).toBe(true);
    });

    it('? with Ctrl modifier does NOT open modal', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { fireKey('?', { ctrlKey: true }); });
      expect(result.current.isOpen).toBe(false);
    });

    it('? with Alt modifier does NOT open modal', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { fireKey('?', { altKey: true }); });
      expect(result.current.isOpen).toBe(false);
    });

    it('? with Meta modifier does NOT open modal', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { fireKey('?', { metaKey: true }); });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('? key — ignores editable targets', () => {
    let input: HTMLInputElement;
    let textarea: HTMLTextAreaElement;
    let div: HTMLDivElement;

    beforeEach(() => {
      input = document.createElement('input');
      textarea = document.createElement('textarea');
      div = document.createElement('div');
      div.contentEditable = 'true';
      document.body.appendChild(input);
      document.body.appendChild(textarea);
      document.body.appendChild(div);
    });

    afterEach(() => {
      document.body.removeChild(input);
      document.body.removeChild(textarea);
      document.body.removeChild(div);
    });

    it('does NOT open when ? is fired from an <input>', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '?', bubbles: true });
        Object.defineProperty(event, 'target', { value: input });
        document.dispatchEvent(event);
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('does NOT open when ? is fired from a <textarea>', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '?', bubbles: true });
        Object.defineProperty(event, 'target', { value: textarea });
        document.dispatchEvent(event);
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('does NOT open when ? is fired from a contenteditable element', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => {
        // Dispatch from the div directly so e.target is the actual div element
        div.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }));
      });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('Escape key — closes modal', () => {
    it('Escape closes the modal when open', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { result.current.open(); });
      act(() => { fireKey('Escape'); });
      expect(result.current.isOpen).toBe(false);
    });

    it('Escape does nothing when modal is already closed', () => {
      const { result } = renderHook(() => useKeyboardShortcutsModal());
      act(() => { fireKey('Escape'); });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('event listener cleanup', () => {
    it('removes keydown listener on unmount', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = renderHook(() => useKeyboardShortcutsModal());
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeSpy.mockRestore();
    });

    it('does not respond to ? after unmount', () => {
      const { result, unmount } = renderHook(() => useKeyboardShortcutsModal());
      unmount();
      act(() => { fireKey('?'); });
      expect(result.current.isOpen).toBe(false);
    });
  });
});
