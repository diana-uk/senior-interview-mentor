import { describe, it, expect } from 'vitest';
import { formatTime, getTimerClass, getDifficultyClass } from '../timerUtils';

// ─── formatTime ───────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats 0 seconds as "00:00"', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats 59 seconds as "00:59"', () => {
    expect(formatTime(59)).toBe('00:59');
  });

  it('formats 60 seconds as "01:00"', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  it('formats 61 seconds as "01:01"', () => {
    expect(formatTime(61)).toBe('01:01');
  });

  it('formats 600 seconds as "10:00"', () => {
    expect(formatTime(600)).toBe('10:00');
  });

  it('formats 3661 seconds as "61:01"', () => {
    expect(formatTime(3661)).toBe('61:01');
  });

  it('zero-pads single-digit minutes and seconds', () => {
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(65)).toBe('01:05');
  });
});

// ─── getTimerClass ────────────────────────────────────────────────────────────

describe('getTimerClass', () => {
  it('returns "" when not running', () => {
    expect(getTimerClass(3600, false)).toBe('');
    expect(getTimerClass(0, false)).toBe('');
    expect(getTimerClass(100, false)).toBe('');
  });

  it('returns "interview-timer-safe" when running and seconds > 600', () => {
    expect(getTimerClass(601, true)).toBe('interview-timer-safe');
    expect(getTimerClass(3600, true)).toBe('interview-timer-safe');
  });

  it('returns "interview-timer-warning" when running and 120 < seconds <= 600', () => {
    expect(getTimerClass(600, true)).toBe('interview-timer-warning');
    expect(getTimerClass(121, true)).toBe('interview-timer-warning');
    expect(getTimerClass(300, true)).toBe('interview-timer-warning');
  });

  it('returns "interview-timer-danger" when running and seconds <= 120', () => {
    expect(getTimerClass(120, true)).toBe('interview-timer-danger');
    expect(getTimerClass(1, true)).toBe('interview-timer-danger');
    expect(getTimerClass(0, true)).toBe('interview-timer-danger');
  });
});

// ─── getDifficultyClass ───────────────────────────────────────────────────────

describe('getDifficultyClass', () => {
  it('returns "badge badge-easy" for Easy', () => {
    expect(getDifficultyClass('Easy')).toBe('badge badge-easy');
  });

  it('returns "badge badge-medium" for Medium', () => {
    expect(getDifficultyClass('Medium')).toBe('badge badge-medium');
  });

  it('returns "badge badge-hard" for Hard', () => {
    expect(getDifficultyClass('Hard')).toBe('badge badge-hard');
  });
});
