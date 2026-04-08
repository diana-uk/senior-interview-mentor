import { describe, it, expect } from 'vitest';
import { formatTime } from '../timeUtils';

describe('formatTime', () => {
  it('formats 0 seconds as "0:00"', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats 1 second as "0:01"', () => {
    expect(formatTime(1)).toBe('0:01');
  });

  it('formats 9 seconds as "0:09"', () => {
    expect(formatTime(9)).toBe('0:09');
  });

  it('formats 59 seconds as "0:59"', () => {
    expect(formatTime(59)).toBe('0:59');
  });

  it('formats 60 seconds as "1:00"', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('formats 61 seconds as "1:01"', () => {
    expect(formatTime(61)).toBe('1:01');
  });

  it('formats 90 seconds as "1:30"', () => {
    expect(formatTime(90)).toBe('1:30');
  });

  it('formats 600 seconds as "10:00"', () => {
    expect(formatTime(600)).toBe('10:00');
  });

  it('formats 2700 seconds (45 min) as "45:00"', () => {
    expect(formatTime(2700)).toBe('45:00');
  });

  it('pads seconds < 10 with leading zero', () => {
    expect(formatTime(125)).toBe('2:05');
  });
});
