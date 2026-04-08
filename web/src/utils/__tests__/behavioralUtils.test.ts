import { describe, it, expect } from 'vitest';
import { detectRedFlags, getAnswersCount } from '../behavioralUtils';

const FULL = {
  s: 'I was leading the team on a critical deadline project in Q3.',
  t: 'My task was to ensure delivery within the two-week sprint.',
  a: 'I restructured the work breakdown and personally resolved three blockers.',
  r: 'We shipped on time and reduced defects by 40%.',
};

describe('detectRedFlags', () => {
  it('returns empty array for a clean STAR answer', () => {
    expect(detectRedFlags(FULL.s, FULL.t, FULL.a, FULL.r)).toEqual([]);
  });

  it('flags action using "they/we" without "I"', () => {
    // regex is case-sensitive: checks lowercase "they", "team", "we"
    const flags = detectRedFlags(FULL.s, FULL.t, 'they handled all the work and we shipped it', FULL.r);
    expect(flags).toContain(
      'Action section uses "they/we" without "I" — focus on YOUR specific contributions',
    );
  });

  it('does NOT flag action that uses "we" AND "my"', () => {
    // regex checks lowercase "i" or "my" — "my" is unambiguous
    const flags = detectRedFlags(FULL.s, FULL.t, 'We delivered, but my work resolved the blockers', FULL.r);
    expect(flags).not.toContain(
      'Action section uses "they/we" without "I" — focus on YOUR specific contributions',
    );
  });

  it('flags result that is too brief', () => {
    const flags = detectRedFlags(FULL.s, FULL.t, FULL.a, 'Done well.');
    expect(flags).toContain('Result is too brief — add specific metrics or measurable outcomes');
  });

  it('does NOT flag brief result that is empty', () => {
    // empty result is caught by "sections are empty" flag, not "too brief"
    const flags = detectRedFlags(FULL.s, FULL.t, FULL.a, '');
    expect(flags).not.toContain('Result is too brief — add specific metrics or measurable outcomes');
  });

  it('flags result with no numbers', () => {
    const flags = detectRedFlags(FULL.s, FULL.t, FULL.a, 'We shipped the feature successfully on time.');
    expect(flags).toContain(
      'No numbers in Result — quantify impact (%, time saved, users affected)',
    );
  });

  it('does NOT flag result with numbers', () => {
    const flags = detectRedFlags(FULL.s, FULL.t, FULL.a, 'Reduced latency by 30%.');
    expect(flags).not.toContain(
      'No numbers in Result — quantify impact (%, time saved, users affected)',
    );
  });

  it('flags when any STAR section is empty', () => {
    const flags = detectRedFlags('', FULL.t, FULL.a, FULL.r);
    expect(flags).toContain(
      'One or more STAR sections are empty — complete all four for a strong answer',
    );
  });

  it('flags blame language anywhere in STAR', () => {
    const flags = detectRedFlags(FULL.s, FULL.t, FULL.a + ' their mistake caused the delay', FULL.r);
    expect(flags).toContain(
      'Avoid blaming others — focus on what you did to resolve the situation',
    );
  });

  it('flags filler words in STAR', () => {
    const flags = detectRedFlags(FULL.s, FULL.t, 'I basically just fixed it', FULL.r);
    expect(flags).toContain(
      'Filler words detected ("basically", "just", "kind of") — be more precise',
    );
  });

  it('can return multiple flags at once', () => {
    // Both "no numbers" and "too brief" should fire
    const flags = detectRedFlags(FULL.s, FULL.t, FULL.a, 'Done.');
    expect(flags.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── getAnswersCount ──────────────────────────────────────────────────────────

describe('getAnswersCount', () => {
  it('returns 0 for empty tags array', () => {
    expect(getAnswersCount([])).toBe(0);
  });

  it('returns a positive number for a known category', () => {
    expect(getAnswersCount(['leadership'])).toBeGreaterThan(0);
  });

  it('returns more questions when multiple categories are supplied', () => {
    const single = getAnswersCount(['leadership']);
    const multi = getAnswersCount(['leadership', 'conflict']);
    expect(multi).toBeGreaterThanOrEqual(single);
  });

  it('returns the same count as behavioralQuestions filtered by that category', () => {
    // leadership has 15 questions per grep count
    expect(getAnswersCount(['leadership'])).toBe(15);
  });

  it('does not double-count a question that matches two supplied tags (each q has one category)', () => {
    const a = getAnswersCount(['leadership']);
    const b = getAnswersCount(['conflict']);
    const both = getAnswersCount(['leadership', 'conflict']);
    expect(both).toBe(a + b);
  });

  it('returns 0 for an unrecognised category (cast)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getAnswersCount(['nonexistent'] as any)).toBe(0);
  });
});
