import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMetaTags } from '../useMetaTags';

const DEFAULT_DESCRIPTION =
  'AI-powered coding interview coach. Practice LeetCode problems, system design, and behavioral interviews with real-time Socratic teaching.';

describe('useMetaTags', () => {
  let metaDescription: HTMLMetaElement;
  let ogDescription: HTMLMetaElement;

  beforeEach(() => {
    // Create meta[name="description"] element
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', DEFAULT_DESCRIPTION);
    document.head.appendChild(metaDescription);

    // Create meta[property="og:description"] element
    ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', DEFAULT_DESCRIPTION);
    document.head.appendChild(ogDescription);
  });

  afterEach(() => {
    // Remove meta elements after each test
    metaDescription.remove();
    ogDescription.remove();
  });

  // ── Default description (null input) ──

  describe('default description when input is null', () => {
    it('sets meta description to DEFAULT_DESCRIPTION when null is passed', () => {
      renderHook(() => useMetaTags(null));
      expect(metaDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);
    });

    it('sets og:description to DEFAULT_DESCRIPTION when null is passed', () => {
      renderHook(() => useMetaTags(null));
      expect(ogDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);
    });

    it('restores DEFAULT_DESCRIPTION on unmount after custom description', () => {
      const { unmount, rerender } = renderHook(
        ({ desc }: { desc: string | null }) => useMetaTags(desc),
        { initialProps: { desc: 'Custom page description' } },
      );
      expect(metaDescription.getAttribute('content')).toBe('Custom page description');

      // Rerender with null to restore default, then unmount
      rerender({ desc: null });
      expect(metaDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);
      unmount();
      // After unmount the last applied value persists (no cleanup effect in hook)
      expect(metaDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);
    });
  });

  // ── Custom description updates ──

  describe('custom description updates', () => {
    it('updates meta[name="description"] with custom string', () => {
      renderHook(() => useMetaTags('Practice Two Sum today'));
      expect(metaDescription.getAttribute('content')).toBe('Practice Two Sum today');
    });

    it('updates meta[property="og:description"] with custom string', () => {
      renderHook(() => useMetaTags('Practice Two Sum today'));
      expect(ogDescription.getAttribute('content')).toBe('Practice Two Sum today');
    });

    it('both meta elements have the same custom content', () => {
      const desc = 'Solve sliding window problems';
      renderHook(() => useMetaTags(desc));
      expect(metaDescription.getAttribute('content')).toBe(desc);
      expect(ogDescription.getAttribute('content')).toBe(desc);
    });
  });

  // ── Handling missing meta elements ──

  describe('handles missing meta elements gracefully', () => {
    it('does not crash when meta[name="description"] is absent', () => {
      metaDescription.remove();
      expect(() => {
        renderHook(() => useMetaTags('Some description'));
      }).not.toThrow();
      // og:description should still be updated
      expect(ogDescription.getAttribute('content')).toBe('Some description');
    });

    it('does not crash when meta[property="og:description"] is absent', () => {
      ogDescription.remove();
      expect(() => {
        renderHook(() => useMetaTags('Some description'));
      }).not.toThrow();
      // meta description should still be updated
      expect(metaDescription.getAttribute('content')).toBe('Some description');
    });

    it('does not crash when both meta elements are absent', () => {
      metaDescription.remove();
      ogDescription.remove();
      expect(() => {
        renderHook(() => useMetaTags('Some description'));
      }).not.toThrow();
    });
  });

  // ── Updates on prop changes (rerender) ──

  describe('updates on prop changes', () => {
    it('updates description when rerendered with a new value', () => {
      const { rerender } = renderHook(
        ({ desc }: { desc: string | null }) => useMetaTags(desc),
        { initialProps: { desc: 'First description' } },
      );
      expect(metaDescription.getAttribute('content')).toBe('First description');

      rerender({ desc: 'Second description' });
      expect(metaDescription.getAttribute('content')).toBe('Second description');
      expect(ogDescription.getAttribute('content')).toBe('Second description');
    });

    it('handles multiple sequential rerenders', () => {
      const { rerender } = renderHook(
        ({ desc }: { desc: string | null }) => useMetaTags(desc),
        { initialProps: { desc: 'A' } },
      );
      expect(metaDescription.getAttribute('content')).toBe('A');

      rerender({ desc: 'B' });
      expect(metaDescription.getAttribute('content')).toBe('B');

      rerender({ desc: 'C' });
      expect(metaDescription.getAttribute('content')).toBe('C');

      rerender({ desc: 'D' });
      expect(metaDescription.getAttribute('content')).toBe('D');
    });
  });

  // ── Null ↔ string transitions ──

  describe('null to string to null transitions', () => {
    it('transitions from null to custom string', () => {
      const { rerender } = renderHook(
        ({ desc }: { desc: string | null }) => useMetaTags(desc),
        { initialProps: { desc: null as string | null } },
      );
      expect(metaDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);

      rerender({ desc: 'Now a custom description' });
      expect(metaDescription.getAttribute('content')).toBe('Now a custom description');
    });

    it('transitions from custom string back to null (restores default)', () => {
      const { rerender } = renderHook(
        ({ desc }: { desc: string | null }) => useMetaTags(desc),
        { initialProps: { desc: 'Custom value' as string | null } },
      );
      expect(metaDescription.getAttribute('content')).toBe('Custom value');

      rerender({ desc: null });
      expect(metaDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);
      expect(ogDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);
    });

    it('handles null → string → null → string cycle', () => {
      const { rerender } = renderHook(
        ({ desc }: { desc: string | null }) => useMetaTags(desc),
        { initialProps: { desc: null as string | null } },
      );
      expect(metaDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);

      rerender({ desc: 'Step 1' });
      expect(metaDescription.getAttribute('content')).toBe('Step 1');

      rerender({ desc: null });
      expect(metaDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);

      rerender({ desc: 'Step 2' });
      expect(metaDescription.getAttribute('content')).toBe('Step 2');
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('handles empty string by falling back to DEFAULT_DESCRIPTION', () => {
      renderHook(() => useMetaTags(''));
      // empty string is falsy, so description || DEFAULT_DESCRIPTION yields default
      expect(metaDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);
      expect(ogDescription.getAttribute('content')).toBe(DEFAULT_DESCRIPTION);
    });

    it('handles very long description', () => {
      const longDesc = 'A'.repeat(5000);
      renderHook(() => useMetaTags(longDesc));
      expect(metaDescription.getAttribute('content')).toBe(longDesc);
      expect(ogDescription.getAttribute('content')).toBe(longDesc);
    });

    it('handles description with special characters (quotes, angle brackets)', () => {
      const special = `"Two Sum" <O(n)> & O'Reilly's guide`;
      renderHook(() => useMetaTags(special));
      expect(metaDescription.getAttribute('content')).toBe(special);
      expect(ogDescription.getAttribute('content')).toBe(special);
    });

    it('handles description with HTML entities and unicode', () => {
      const unicode = 'Solve problems with \u2192 arrows & \u2264 comparisons';
      renderHook(() => useMetaTags(unicode));
      expect(metaDescription.getAttribute('content')).toBe(unicode);
    });

    it('same description on rerender does not cause issues', () => {
      const { rerender } = renderHook(
        ({ desc }: { desc: string | null }) => useMetaTags(desc),
        { initialProps: { desc: 'Stable description' } },
      );
      expect(metaDescription.getAttribute('content')).toBe('Stable description');

      // Rerender with the same value
      rerender({ desc: 'Stable description' });
      expect(metaDescription.getAttribute('content')).toBe('Stable description');
    });
  });
});
