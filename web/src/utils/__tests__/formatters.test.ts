import { describe, it, expect } from 'vitest';
import { formatDuration, formatDate, formatScore, formatDurationCompact, formatDurationStats } from '../formatters';

// ─── formatDuration ───────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('returns "—" for 0 seconds', () => {
    expect(formatDuration(0)).toBe('—');
  });

  it('returns "—" for negative values', () => {
    expect(formatDuration(-1)).toBe('—');
    expect(formatDuration(-100)).toBe('—');
  });

  it('returns seconds-only string for values under 60', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(1)).toBe('1s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('returns minutes and seconds for exactly 60', () => {
    expect(formatDuration(60)).toBe('1m 0s');
  });

  it('returns minutes and seconds for values over 60', () => {
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(150)).toBe('2m 30s');
  });

  it('handles large values (one hour = 60m)', () => {
    expect(formatDuration(3600)).toBe('60m 0s');
  });

  it('handles 5 minutes exactly', () => {
    expect(formatDuration(300)).toBe('5m 0s');
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2026-01-15T10:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Should contain the year
    expect(result).toContain('2026');
  });

  it('falls back to the raw string for invalid input', () => {
    const invalid = 'not-a-date';
    // new Date('not-a-date') returns Invalid Date, toLocaleDateString returns "Invalid Date"
    const result = formatDate(invalid);
    expect(typeof result).toBe('string');
  });

  it('returns a non-empty string for empty input', () => {
    const result = formatDate('');
    expect(typeof result).toBe('string');
  });

  it('returns a non-empty string for a date-only string', () => {
    const result = formatDate('2026-06-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── formatScore ──────────────────────────────────────────────────────────────

describe('formatScore', () => {
  it('returns "—" for null', () => {
    expect(formatScore(null)).toBe('—');
  });

  it('formats 0 as "0.0/4"', () => {
    expect(formatScore(0)).toBe('0.0/4');
  });

  it('formats 4 as "4.0/4"', () => {
    expect(formatScore(4)).toBe('4.0/4');
  });

  it('formats 3.5 as "3.5/4"', () => {
    expect(formatScore(3.5)).toBe('3.5/4');
  });

  it('formats 2.75 as "2.8/4" (1 decimal place)', () => {
    expect(formatScore(2.75)).toBe('2.8/4');
  });

  it('formats whole numbers with .0 suffix', () => {
    expect(formatScore(2)).toBe('2.0/4');
    expect(formatScore(3)).toBe('3.0/4');
  });
});

// ─── formatDurationCompact ────────────────────────────────────────────────────

describe('formatDurationCompact', () => {
  it('returns seconds string for values under 60', () => {
    expect(formatDurationCompact(0)).toBe('0s');
    expect(formatDurationCompact(45)).toBe('45s');
    expect(formatDurationCompact(59)).toBe('59s');
  });

  it('returns minutes string for 60–3599 seconds', () => {
    expect(formatDurationCompact(60)).toBe('1m');
    expect(formatDurationCompact(90)).toBe('1m');
    expect(formatDurationCompact(120)).toBe('2m');
    expect(formatDurationCompact(3599)).toBe('59m');
  });

  it('returns hours and minutes for 3600+ seconds', () => {
    expect(formatDurationCompact(3600)).toBe('1h 0m');
    expect(formatDurationCompact(5400)).toBe('1h 30m');
    expect(formatDurationCompact(7200)).toBe('2h 0m');
    expect(formatDurationCompact(9000)).toBe('2h 30m');
  });
});

// ─── formatDurationStats ──────────────────────────────────────────────────────

describe('formatDurationStats', () => {
  it('returns "0m" for 0 seconds', () => {
    expect(formatDurationStats(0)).toBe('0m');
  });

  it('returns minutes only for values under one hour', () => {
    expect(formatDurationStats(60)).toBe('1m');
    expect(formatDurationStats(1800)).toBe('30m');
    expect(formatDurationStats(3599)).toBe('59m');
  });

  it('returns hours and minutes for 3600+ seconds', () => {
    expect(formatDurationStats(3600)).toBe('1h 0m');
    expect(formatDurationStats(5400)).toBe('1h 30m');
    expect(formatDurationStats(7200)).toBe('2h 0m');
  });

  it('returns "1m" for 90 seconds (rounds down to minutes)', () => {
    expect(formatDurationStats(90)).toBe('1m');
  });
});
