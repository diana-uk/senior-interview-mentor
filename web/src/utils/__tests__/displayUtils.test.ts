import { describe, it, expect } from 'vitest';
import { countWords, getWordCountColor, difficultyColor, formatDate, getInitials } from '../displayUtils';
import type { User } from '@supabase/supabase-js';

// ─── countWords ───────────────────────────────────────────────────────────────

describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only string', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('counts a single word', () => {
    expect(countWords('hello')).toBe(1);
  });

  it('counts multiple words', () => {
    expect(countWords('hello world foo')).toBe(3);
  });

  it('handles leading/trailing whitespace', () => {
    expect(countWords('  hello world  ')).toBe(2);
  });

  it('handles multiple internal spaces', () => {
    expect(countWords('one   two   three')).toBe(3);
  });
});

// ─── getWordCountColor ────────────────────────────────────────────────────────

describe('getWordCountColor', () => {
  it('returns muted for count 0', () => {
    expect(getWordCountColor(0, 50, 150)).toBe('var(--text-muted)');
  });

  it('returns red when below min', () => {
    expect(getWordCountColor(10, 50, 150)).toBe('var(--neon-red)');
  });

  it('returns amber when above max', () => {
    expect(getWordCountColor(200, 50, 150)).toBe('var(--neon-amber)');
  });

  it('returns lime when exactly at min', () => {
    expect(getWordCountColor(50, 50, 150)).toBe('var(--neon-lime)');
  });

  it('returns lime when exactly at max', () => {
    expect(getWordCountColor(150, 50, 150)).toBe('var(--neon-lime)');
  });

  it('returns lime when within range', () => {
    expect(getWordCountColor(100, 50, 150)).toBe('var(--neon-lime)');
  });
});

// ─── difficultyColor ──────────────────────────────────────────────────────────

describe('difficultyColor', () => {
  it('returns lime for Easy', () => {
    expect(difficultyColor('Easy')).toBe('var(--neon-lime)');
  });

  it('returns red for Hard', () => {
    expect(difficultyColor('Hard')).toBe('var(--neon-red)');
  });

  it('returns amber for Medium', () => {
    expect(difficultyColor('Medium')).toBe('var(--neon-amber)');
  });

  it('returns amber for unknown difficulty', () => {
    expect(difficultyColor('Expert')).toBe('var(--neon-amber)');
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2026-01-15');
    expect(result.length).toBeGreaterThan(0);
    expect(typeof result).toBe('string');
  });

  it('returns "Invalid Date" for an unparseable date string', () => {
    // toLocaleDateString on Invalid Date returns "Invalid Date" string (no throw)
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });

  it('handles empty string (returns "Invalid Date")', () => {
    expect(formatDate('')).toBe('Invalid Date');
  });
});

// ─── getInitials ──────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<Pick<User, 'email' | 'user_metadata'>> = {}): User {
  return {
    id: 'u1',
    email: overrides.email ?? undefined,
    user_metadata: overrides.user_metadata ?? {},
    app_metadata: {},
    aud: 'authenticated',
    created_at: '',
  } as unknown as User;
}

describe('getInitials', () => {
  it('returns first letter of email (uppercase) when email has @', () => {
    const user = makeUser({ email: 'alice@example.com' });
    expect(getInitials(user)).toBe('A');
  });

  it('returns initials from full_name (first letter of each word)', () => {
    const user = makeUser({ user_metadata: { full_name: 'Diana Ukrainsky' } });
    expect(getInitials(user)).toBe('DU');
  });

  it('returns up to 2 characters for long names', () => {
    const user = makeUser({ user_metadata: { full_name: 'Alice Bob Charlie' } });
    expect(getInitials(user)).toBe('AB');
  });

  it('returns single initial for single-word name', () => {
    const user = makeUser({ user_metadata: { full_name: 'Alice' } });
    expect(getInitials(user)).toBe('A');
  });

  it('returns ? when no name or email', () => {
    const user = makeUser({});
    expect(getInitials(user)).toBe('?');
  });

  it('prefers full_name over email', () => {
    const user = makeUser({ email: 'z@example.com', user_metadata: { full_name: 'Diana Ukrainsky' } });
    expect(getInitials(user)).toBe('DU');
  });
});
