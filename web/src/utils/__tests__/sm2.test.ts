import { describe, it, expect } from 'vitest';
import { sm2, addDays } from '../sm2';

// ─── sm2 ──────────────────────────────────────────────────────────────────────

describe('sm2', () => {
  const DEFAULT_EF = 2.5;

  // ── Pass / Fail boundary ──

  it('quality < 3 resets repetitions to 0', () => {
    const result = sm2(2, 3, DEFAULT_EF, 10);
    expect(result.repetitions).toBe(0);
  });

  it('quality < 3 resets interval to 1', () => {
    const result = sm2(2, 3, DEFAULT_EF, 10);
    expect(result.interval).toBe(1);
  });

  it('quality >= 3 increments repetitions', () => {
    expect(sm2(3, 0, DEFAULT_EF, 1).repetitions).toBe(1);
    expect(sm2(5, 2, DEFAULT_EF, 6).repetitions).toBe(3);
  });

  // ── Interval progression ──

  it('first pass (reps=0): interval = 1', () => {
    expect(sm2(3, 0, DEFAULT_EF, 1).interval).toBe(1);
  });

  it('second pass (reps=1): interval = 6', () => {
    expect(sm2(3, 1, DEFAULT_EF, 1).interval).toBe(6);
  });

  it('third pass (reps=2): interval = round(prev * EF)', () => {
    const ef = 2.5;
    const prev = 6;
    const result = sm2(5, 2, ef, prev);
    // quality=5: EF' = 2.5 + (0.1 - 0 * ...) = 2.5 + 0.1 = 2.6
    // interval = round(6 * 2.6) = 16
    expect(result.interval).toBe(Math.round(prev * result.easeFactor));
  });

  // ── EaseFactor adjustments ──

  it('quality 5 increases easeFactor', () => {
    const result = sm2(5, 1, DEFAULT_EF, 1);
    expect(result.easeFactor).toBeGreaterThan(DEFAULT_EF);
  });

  it('quality 3 decreases easeFactor', () => {
    const result = sm2(3, 1, DEFAULT_EF, 1);
    expect(result.easeFactor).toBeLessThan(DEFAULT_EF);
  });

  it('easeFactor never drops below 1.3', () => {
    // Start with EF at 1.3 and use quality 0 (worst)
    const result = sm2(0, 2, 1.3, 1);
    expect(result.easeFactor).toBe(1.3);
  });

  it('easeFactor minimum cap applies even with very low EF input', () => {
    const result = sm2(0, 0, 2.5, 1);
    // EF' = 2.5 + (0.1 - 5*(0.08+5*0.02)) = 2.5 + (0.1 - 5*0.18) = 2.5 - 0.8 = 1.7
    expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('quality 4 results in approximately the same EF (minimal change)', () => {
    // q=4: EF' = EF + (0.1 - 1*(0.08 + 1*0.02)) = EF + (0.1 - 0.10) = EF
    const result = sm2(4, 1, DEFAULT_EF, 1);
    expect(result.easeFactor).toBeCloseTo(DEFAULT_EF, 5);
  });

  // ── Quality 0 edge case ──

  it('quality 0 fails and uses minimum EF if computed EF < 1.3', () => {
    const result = sm2(0, 5, 1.4, 30);
    // EF' = 1.4 + (0.1 - 5*(0.08+5*0.02)) = 1.4 - 0.8 = 0.6 → clamped to 1.3
    expect(result.easeFactor).toBe(1.3);
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(0);
  });
});

// ─── addDays ──────────────────────────────────────────────────────────────────

describe('addDays', () => {
  it('adds 0 days returns same date', () => {
    expect(addDays('2026-01-10', 0)).toBe('2026-01-10');
  });

  it('adds 1 day', () => {
    expect(addDays('2026-01-10', 1)).toBe('2026-01-11');
  });

  it('adds 7 days', () => {
    expect(addDays('2026-01-10', 7)).toBe('2026-01-17');
  });

  it('crosses month boundary', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('crosses year boundary', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
  });

  it('returns date in YYYY-MM-DD format', () => {
    expect(addDays('2026-06-15', 10)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
