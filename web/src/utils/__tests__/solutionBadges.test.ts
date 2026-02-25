import { describe, it, expect } from 'vitest';
import { computeBadges, getBadgesForProblem, BADGE_DEFINITIONS } from '../solutionBadges';
import type { SolutionMetrics } from '../solutionBadges';

function makeMetrics(overrides: Partial<SolutionMetrics> = {}): SolutionMetrics {
  return {
    duration: 900,
    hintsUsed: 2,
    attempts: 3,
    bestScore: 3,
    isOptimalComplexity: false,
    ...overrides,
  };
}

describe('computeBadges', () => {
  // ── Speed Demon ──

  it('returns speed-demon when duration < 600', () => {
    const badges = computeBadges(makeMetrics({ duration: 300 }));
    expect(badges.some(b => b.id === 'speed-demon')).toBe(true);
  });

  it('does not return speed-demon when duration >= 600', () => {
    const badges = computeBadges(makeMetrics({ duration: 600 }));
    expect(badges.some(b => b.id === 'speed-demon')).toBe(false);
  });

  it('does not return speed-demon when duration is exactly 600', () => {
    const badges = computeBadges(makeMetrics({ duration: 600 }));
    expect(badges.some(b => b.id === 'speed-demon')).toBe(false);
  });

  it('does not return speed-demon when duration is 0', () => {
    const badges = computeBadges(makeMetrics({ duration: 0 }));
    expect(badges.some(b => b.id === 'speed-demon')).toBe(false);
  });

  it('returns speed-demon at 599 seconds', () => {
    const badges = computeBadges(makeMetrics({ duration: 599 }));
    expect(badges.some(b => b.id === 'speed-demon')).toBe(true);
  });

  // ── Optimal ──

  it('returns optimal when isOptimalComplexity is true', () => {
    const badges = computeBadges(makeMetrics({ isOptimalComplexity: true }));
    expect(badges.some(b => b.id === 'optimal')).toBe(true);
  });

  it('does not return optimal when isOptimalComplexity is false', () => {
    const badges = computeBadges(makeMetrics({ isOptimalComplexity: false }));
    expect(badges.some(b => b.id === 'optimal')).toBe(false);
  });

  // ── No Hints ──

  it('returns no-hints when hintsUsed is 0', () => {
    const badges = computeBadges(makeMetrics({ hintsUsed: 0 }));
    expect(badges.some(b => b.id === 'no-hints')).toBe(true);
  });

  it('does not return no-hints when hintsUsed > 0', () => {
    const badges = computeBadges(makeMetrics({ hintsUsed: 1 }));
    expect(badges.some(b => b.id === 'no-hints')).toBe(false);
  });

  // ── Perfect Score ──

  it('returns perfect-score when bestScore is 4', () => {
    const badges = computeBadges(makeMetrics({ bestScore: 4 }));
    expect(badges.some(b => b.id === 'perfect-score')).toBe(true);
  });

  it('does not return perfect-score when bestScore < 4', () => {
    const badges = computeBadges(makeMetrics({ bestScore: 3.9 }));
    expect(badges.some(b => b.id === 'perfect-score')).toBe(false);
  });

  it('does not return perfect-score when bestScore is null', () => {
    const badges = computeBadges(makeMetrics({ bestScore: null }));
    expect(badges.some(b => b.id === 'perfect-score')).toBe(false);
  });

  // ── First Try ──

  it('returns first-try when attempts is 1', () => {
    const badges = computeBadges(makeMetrics({ attempts: 1 }));
    expect(badges.some(b => b.id === 'first-try')).toBe(true);
  });

  it('returns first-try when attempts is 0', () => {
    const badges = computeBadges(makeMetrics({ attempts: 0 }));
    expect(badges.some(b => b.id === 'first-try')).toBe(true);
  });

  it('does not return first-try when attempts > 1', () => {
    const badges = computeBadges(makeMetrics({ attempts: 2 }));
    expect(badges.some(b => b.id === 'first-try')).toBe(false);
  });

  // ── Multiple badges ──

  it('returns multiple badges simultaneously', () => {
    const badges = computeBadges({
      duration: 300,
      hintsUsed: 0,
      attempts: 1,
      bestScore: 4,
      isOptimalComplexity: true,
    });
    expect(badges.length).toBe(5);
    expect(badges.map(b => b.id)).toEqual([
      'speed-demon', 'optimal', 'no-hints', 'perfect-score', 'first-try',
    ]);
  });

  it('returns no badges for a slow, hint-heavy, multi-attempt solve', () => {
    const badges = computeBadges({
      duration: 1800,
      hintsUsed: 3,
      attempts: 5,
      bestScore: 2,
      isOptimalComplexity: false,
    });
    expect(badges.length).toBe(0);
  });

  // ── Badge structure ──

  it('returns badges with correct icon and label', () => {
    const badges = computeBadges(makeMetrics({ duration: 100 }));
    const speedBadge = badges.find(b => b.id === 'speed-demon');
    expect(speedBadge).toBeDefined();
    expect(speedBadge!.icon).toBe('⚡');
    expect(speedBadge!.label).toBe('Speed Demon');
    expect(speedBadge!.color).toBe('var(--neon-amber)');
  });
});

describe('getBadgesForProblem', () => {
  it('maps progress data to badges', () => {
    const badges = getBadgesForProblem({
      bestScore: 4,
      bestTime: 300,
      hintsUsed: 0,
      attempts: 1,
    });
    expect(badges.some(b => b.id === 'speed-demon')).toBe(true);
    expect(badges.some(b => b.id === 'no-hints')).toBe(true);
    expect(badges.some(b => b.id === 'perfect-score')).toBe(true);
    expect(badges.some(b => b.id === 'first-try')).toBe(true);
  });

  it('passes isOptimalComplexity flag', () => {
    const badges = getBadgesForProblem({
      bestScore: 3,
      bestTime: 900,
      hintsUsed: 1,
      attempts: 2,
    }, true);
    expect(badges.some(b => b.id === 'optimal')).toBe(true);
    expect(badges.length).toBe(1);
  });

  it('handles null bestTime (no speed badge)', () => {
    const badges = getBadgesForProblem({
      bestScore: 4,
      bestTime: null,
      hintsUsed: 0,
      attempts: 1,
    });
    expect(badges.some(b => b.id === 'speed-demon')).toBe(false);
    expect(badges.some(b => b.id === 'perfect-score')).toBe(true);
    expect(badges.some(b => b.id === 'no-hints')).toBe(true);
  });

  it('returns empty array for no qualifying badges', () => {
    const badges = getBadgesForProblem({
      bestScore: 2,
      bestTime: 1200,
      hintsUsed: 3,
      attempts: 5,
    });
    expect(badges).toEqual([]);
  });
});

describe('BADGE_DEFINITIONS', () => {
  it('has 5 badge definitions', () => {
    expect(Object.keys(BADGE_DEFINITIONS).length).toBe(5);
  });

  it('every badge has id, icon, label, color', () => {
    for (const badge of Object.values(BADGE_DEFINITIONS)) {
      expect(badge.id).toBeTruthy();
      expect(badge.icon).toBeTruthy();
      expect(badge.label).toBeTruthy();
      expect(badge.color).toBeTruthy();
    }
  });
});
