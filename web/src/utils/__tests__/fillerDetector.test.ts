import { describe, it, expect } from 'vitest';
import { detectFillers, getFillerFeedback, type FillerReport } from '../fillerDetector';

describe('detectFillers', () => {
  it('returns zero fillers for clean text', () => {
    const result = detectFillers('I would use a hash map to solve this in O(n) time.');
    expect(result.totalFillers).toBe(0);
    expect(result.fillers).toEqual({});
    expect(result.fillerRate).toBe(0);
  });

  it('counts word count correctly', () => {
    const result = detectFillers('one two three four five');
    expect(result.wordCount).toBe(5);
  });

  it('handles empty string', () => {
    const result = detectFillers('');
    expect(result.totalFillers).toBe(0);
    expect(result.wordCount).toBe(0);
    expect(result.fillerRate).toBe(0);
  });

  it('handles whitespace-only string', () => {
    const result = detectFillers('   ');
    expect(result.totalFillers).toBe(0);
    expect(result.wordCount).toBe(0);
    expect(result.fillerRate).toBe(0);
  });

  // Hesitation fillers
  it('detects "um"', () => {
    const result = detectFillers('um I think um we should use um a stack');
    expect(result.fillers['um']).toBe(3);
    expect(result.totalFillers).toBe(3);
  });

  it('detects "uh"', () => {
    const result = detectFillers('So uh the time complexity is uh linear');
    expect(result.fillers['uh']).toBe(2);
  });

  it('detects "hmm" with variable length', () => {
    const result = detectFillers('hmm let me think hmmm about that');
    expect(result.fillers['hmm']).toBe(2);
  });

  it('detects "er"', () => {
    const result = detectFillers('The answer is er forty two');
    expect(result.fillers['er']).toBe(1);
  });

  it('detects "ah"', () => {
    const result = detectFillers('ah yes that makes sense');
    expect(result.fillers['ah']).toBe(1);
  });

  // Hedge words
  it('detects "like"', () => {
    const result = detectFillers('Its like a sliding window like approach');
    expect(result.fillers['like']).toBe(2);
  });

  it('detects "basically"', () => {
    const result = detectFillers('So basically we iterate through the array');
    expect(result.fillers['basically']).toBe(1);
  });

  it('detects "actually"', () => {
    const result = detectFillers('Actually I think actually we need BFS');
    expect(result.fillers['actually']).toBe(2);
  });

  it('detects "literally"', () => {
    const result = detectFillers('This literally takes O(n) time');
    expect(result.fillers['literally']).toBe(1);
  });

  it('detects "honestly"', () => {
    const result = detectFillers('Honestly I am not sure about this edge case');
    expect(result.fillers['honestly']).toBe(1);
  });

  // Filler phrases
  it('detects "you know"', () => {
    const result = detectFillers('We need to you know traverse the tree');
    expect(result.fillers['you know']).toBe(1);
  });

  it('detects "sort of"', () => {
    const result = detectFillers('Its sort of like a greedy approach');
    expect(result.fillers['sort of']).toBe(1);
  });

  it('detects "kind of"', () => {
    const result = detectFillers('We kind of need to merge these intervals');
    expect(result.fillers['kind of']).toBe(1);
  });

  it('detects "I mean"', () => {
    const result = detectFillers('I mean the space complexity is O(n)');
    expect(result.fillers['I mean']).toBe(1);
  });

  it('detects "right"', () => {
    const result = detectFillers('So we push to the stack right and then pop');
    expect(result.fillers['right']).toBe(1);
  });

  // Case insensitivity
  it('is case insensitive', () => {
    const result = detectFillers('UM the answer is BASICALLY Like forty two');
    expect(result.fillers['um']).toBe(1);
    expect(result.fillers['basically']).toBe(1);
    expect(result.fillers['like']).toBe(1);
    expect(result.totalFillers).toBe(3);
  });

  // Multiple different fillers
  it('tracks multiple filler types separately', () => {
    const result = detectFillers('um so like basically um we need to uh sort of think');
    expect(result.fillers['um']).toBe(2);
    expect(result.fillers['like']).toBe(1);
    expect(result.fillers['basically']).toBe(1);
    expect(result.fillers['uh']).toBe(1);
    expect(result.fillers['sort of']).toBe(1);
    expect(result.totalFillers).toBe(6);
  });

  // Filler rate calculation
  it('calculates filler rate as percentage of total words', () => {
    // 2 fillers in 10 words = 20%
    const result = detectFillers('um we need to um traverse the binary search tree');
    expect(result.totalFillers).toBe(2);
    expect(result.wordCount).toBe(10);
    expect(result.fillerRate).toBeCloseTo(20.0, 1);
  });

  // Word boundary: should NOT match partial words
  it('does not match "um" inside words like "umbrella" or "medium"', () => {
    const result = detectFillers('The umbrella algorithm uses medium complexity');
    expect(result.fillers['um']).toBeUndefined();
  });

  it('does not match "er" inside words like "server" or "error"', () => {
    const result = detectFillers('The server returned an error');
    expect(result.fillers['er']).toBeUndefined();
  });

  it('does not match "ah" inside words like "ahead"', () => {
    const result = detectFillers('Look ahead in the array');
    expect(result.fillers['ah']).toBeUndefined();
  });

  // Stress test: all fillers at once
  it('detects all 15 filler patterns in one text', () => {
    const text = 'um uh hmm er ah like basically actually literally honestly you know sort of kind of I mean right';
    const result = detectFillers(text);
    expect(result.totalFillers).toBe(15);
    expect(Object.keys(result.fillers).length).toBe(15);
  });
});

describe('getFillerFeedback', () => {
  it('returns clean message when no fillers detected', () => {
    const report: FillerReport = { totalFillers: 0, fillers: {}, wordCount: 20, fillerRate: 0 };
    expect(getFillerFeedback(report)).toBe('No filler words detected. Clean communication!');
  });

  it('includes filler count and word count in summary', () => {
    const report: FillerReport = { totalFillers: 3, fillers: { 'um': 2, 'like': 1 }, wordCount: 50, fillerRate: 6.0 };
    const feedback = getFillerFeedback(report);
    expect(feedback).toContain('3 fillers in 50 words');
  });

  it('uses singular "filler" for count of 1', () => {
    const report: FillerReport = { totalFillers: 1, fillers: { 'um': 1 }, wordCount: 20, fillerRate: 5.0 };
    const feedback = getFillerFeedback(report);
    expect(feedback).toContain('1 filler in 20 words');
  });

  it('includes rate as percentage', () => {
    const report: FillerReport = { totalFillers: 3, fillers: { 'um': 3 }, wordCount: 50, fillerRate: 6.0 };
    const feedback = getFillerFeedback(report);
    expect(feedback).toContain('6.0 per 100 words');
  });

  it('lists fillers sorted by frequency descending', () => {
    const report: FillerReport = {
      totalFillers: 5,
      fillers: { 'like': 1, 'um': 3, 'uh': 1 },
      wordCount: 50,
      fillerRate: 10.0,
    };
    const feedback = getFillerFeedback(report);
    // "um" (3) should appear before "like" (1) and "uh" (1)
    const umIdx = feedback.indexOf("'um'");
    const likeIdx = feedback.indexOf("'like'");
    expect(umIdx).toBeLessThan(likeIdx);
  });

  it('includes pause tip for high filler rate (>5%)', () => {
    const report: FillerReport = { totalFillers: 6, fillers: { 'um': 6 }, wordCount: 50, fillerRate: 12.0 };
    const feedback = getFillerFeedback(report);
    expect(feedback).toContain('Try pausing silently');
  });

  it('includes moderate tip for medium filler rate (2-5%)', () => {
    const report: FillerReport = { totalFillers: 2, fillers: { 'um': 2 }, wordCount: 50, fillerRate: 4.0 };
    const feedback = getFillerFeedback(report);
    expect(feedback).toContain('Mostly clean');
  });

  it('includes no tip for low filler rate (<2%)', () => {
    const report: FillerReport = { totalFillers: 1, fillers: { 'um': 1 }, wordCount: 100, fillerRate: 1.0 };
    const feedback = getFillerFeedback(report);
    expect(feedback).not.toContain('Try pausing');
    expect(feedback).not.toContain('Mostly clean');
  });

  it('formats count with multiplication sign', () => {
    const report: FillerReport = { totalFillers: 2, fillers: { 'um': 2 }, wordCount: 20, fillerRate: 10.0 };
    const feedback = getFillerFeedback(report);
    expect(feedback).toContain("'um' \u00d72");
  });
});
