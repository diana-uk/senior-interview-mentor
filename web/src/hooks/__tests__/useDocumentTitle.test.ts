import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from '../useDocumentTitle';

const BASE_TITLE = 'Senior Mentor — AI Coding Interview Coach';

describe('useDocumentTitle', () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  // ── Initial render with null ──

  describe('null input (default title)', () => {
    it('sets the base title when passed null', () => {
      renderHook(() => useDocumentTitle(null));
      expect(document.title).toBe(BASE_TITLE);
    });

    it('sets the base title on initial render immediately', () => {
      document.title = 'Something Else';
      renderHook(() => useDocumentTitle(null));
      expect(document.title).toBe(BASE_TITLE);
    });
  });

  // ── Custom title formatting ──

  describe('custom title formatting', () => {
    it('formats title with " | Senior Mentor" suffix', () => {
      renderHook(() => useDocumentTitle('Two Sum'));
      expect(document.title).toBe('Two Sum | Senior Mentor');
    });

    it('formats a different problem title correctly', () => {
      renderHook(() => useDocumentTitle('Valid Parentheses'));
      expect(document.title).toBe('Valid Parentheses | Senior Mentor');
    });

    it('handles title with special characters', () => {
      renderHook(() => useDocumentTitle('3Sum — Medium'));
      expect(document.title).toBe('3Sum — Medium | Senior Mentor');
    });

    it('handles title with pipe character in name', () => {
      renderHook(() => useDocumentTitle('A | B Problem'));
      expect(document.title).toBe('A | B Problem | Senior Mentor');
    });
  });

  // ── Empty string input ──

  describe('empty string input', () => {
    it('sets the base title when passed an empty string', () => {
      renderHook(() => useDocumentTitle(''));
      expect(document.title).toBe(BASE_TITLE);
    });
  });

  // ── Title updates on rerender ──

  describe('title updates on rerender', () => {
    it('updates title when prop changes from null to a string', () => {
      const { rerender } = renderHook(
        ({ title }: { title: string | null }) => useDocumentTitle(title),
        { initialProps: { title: null } },
      );
      expect(document.title).toBe(BASE_TITLE);

      rerender({ title: 'Merge Intervals' });
      expect(document.title).toBe('Merge Intervals | Senior Mentor');
    });

    it('updates title when prop changes from a string to null', () => {
      const { rerender } = renderHook(
        ({ title }: { title: string | null }) => useDocumentTitle(title),
        { initialProps: { title: 'Binary Search' } },
      );
      expect(document.title).toBe('Binary Search | Senior Mentor');

      rerender({ title: null });
      expect(document.title).toBe(BASE_TITLE);
    });

    it('updates title when prop changes from one string to another', () => {
      const { rerender } = renderHook(
        ({ title }: { title: string | null }) => useDocumentTitle(title),
        { initialProps: { title: 'Two Sum' } },
      );
      expect(document.title).toBe('Two Sum | Senior Mentor');

      rerender({ title: 'Three Sum' });
      expect(document.title).toBe('Three Sum | Senior Mentor');
    });

    it('handles multiple sequential rerenders', () => {
      const { rerender } = renderHook(
        ({ title }: { title: string | null }) => useDocumentTitle(title),
        { initialProps: { title: null } },
      );
      expect(document.title).toBe(BASE_TITLE);

      rerender({ title: 'Problem A' });
      expect(document.title).toBe('Problem A | Senior Mentor');

      rerender({ title: 'Problem B' });
      expect(document.title).toBe('Problem B | Senior Mentor');

      rerender({ title: 'Problem C' });
      expect(document.title).toBe('Problem C | Senior Mentor');

      rerender({ title: null });
      expect(document.title).toBe(BASE_TITLE);
    });

    it('does not change title when rerendered with the same value', () => {
      const { rerender } = renderHook(
        ({ title }: { title: string | null }) => useDocumentTitle(title),
        { initialProps: { title: 'Stable Title' } },
      );
      expect(document.title).toBe('Stable Title | Senior Mentor');

      rerender({ title: 'Stable Title' });
      expect(document.title).toBe('Stable Title | Senior Mentor');
    });
  });

  // ── Cleanup on unmount ──

  describe('cleanup on unmount', () => {
    it('does not restore title on unmount (no cleanup in hook)', () => {
      document.title = 'Before Mount';
      const { unmount } = renderHook(() => useDocumentTitle('Active Page'));
      expect(document.title).toBe('Active Page | Senior Mentor');

      unmount();
      // The hook has no cleanup function, so title stays as last set value
      expect(document.title).toBe('Active Page | Senior Mentor');
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('handles whitespace-only string as truthy (formats with suffix)', () => {
      // Whitespace-only is truthy, so it enters the template path;
      // jsdom trims leading whitespace from document.title
      renderHook(() => useDocumentTitle('   '));
      expect(document.title).toBe('| Senior Mentor');
    });

    it('handles very long title strings', () => {
      const longTitle = 'A'.repeat(200);
      renderHook(() => useDocumentTitle(longTitle));
      expect(document.title).toBe(`${longTitle} | Senior Mentor`);
    });

    it('sets title immediately on first render', () => {
      document.title = 'Old Title';
      renderHook(() => useDocumentTitle('New Title'));
      expect(document.title).toBe('New Title | Senior Mentor');
    });
  });
});
