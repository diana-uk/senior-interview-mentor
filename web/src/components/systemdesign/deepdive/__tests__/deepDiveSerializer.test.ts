import { describe, it, expect } from 'vitest';
import { serializeDeepDivesToText } from '../deepDiveSerializer';
import type { DeepDiveChallenge, DeepDiveApproach } from '../../../../types';

// ── Helpers ──

function makeApproach(overrides: Partial<DeepDiveApproach> = {}): DeepDiveApproach {
  return { name: 'Approach A', pros: 'Fast', cons: 'Complex', ...overrides };
}

function makeChallenge(overrides: Partial<DeepDiveChallenge> = {}): DeepDiveChallenge {
  return {
    id: 'ch-1',
    title: 'Rate Limiting',
    problem: 'How to handle burst traffic?',
    approaches: [],
    chosenIndex: -1,
    justification: '',
    tradeoffs: '',
    ...overrides,
  };
}

// ── Tests ──

describe('serializeDeepDivesToText', () => {
  // ── Empty input ──

  describe('empty challenges array', () => {
    it('returns fallback message for empty array', () => {
      const result = serializeDeepDivesToText([]);
      expect(result).toBe('No deep dive challenges defined yet.');
    });
  });

  // ── Header and count ──

  describe('header and count', () => {
    it('shows header with count for one challenge', () => {
      const result = serializeDeepDivesToText([makeChallenge()]);
      expect(result).toMatch(/^Deep Dive Challenges \(1\):/);
    });

    it('shows header with count for multiple challenges', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ id: 'ch-1' }),
        makeChallenge({ id: 'ch-2' }),
        makeChallenge({ id: 'ch-3' }),
      ]);
      expect(result).toMatch(/^Deep Dive Challenges \(3\):/);
    });
  });

  // ── Challenge title ──

  describe('challenge title rendering', () => {
    it('renders challenge title with 1-based index', () => {
      const result = serializeDeepDivesToText([makeChallenge({ title: 'Caching Strategy' })]);
      expect(result).toContain('1. Caching Strategy');
    });

    it('trims whitespace from title', () => {
      const result = serializeDeepDivesToText([makeChallenge({ title: '  Load Balancing  ' })]);
      expect(result).toContain('1. Load Balancing');
    });

    it('shows "(untitled)" for empty title', () => {
      const result = serializeDeepDivesToText([makeChallenge({ title: '' })]);
      expect(result).toContain('1. (untitled)');
    });

    it('shows "(untitled)" for whitespace-only title', () => {
      const result = serializeDeepDivesToText([makeChallenge({ title: '   ' })]);
      expect(result).toContain('1. (untitled)');
    });

    it('numbers multiple challenges sequentially', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ id: 'ch-1', title: 'First' }),
        makeChallenge({ id: 'ch-2', title: 'Second' }),
      ]);
      expect(result).toContain('1. First');
      expect(result).toContain('2. Second');
    });
  });

  // ── Problem statement ──

  describe('problem statement rendering', () => {
    it('renders problem text', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ problem: 'Handle 10K concurrent connections' }),
      ]);
      expect(result).toContain('   Problem: Handle 10K concurrent connections');
    });

    it('shows "(none)" for empty problem', () => {
      const result = serializeDeepDivesToText([makeChallenge({ problem: '' })]);
      expect(result).toContain('   Problem: (none)');
    });

    it('shows "(none)" for whitespace-only problem', () => {
      const result = serializeDeepDivesToText([makeChallenge({ problem: '   ' })]);
      expect(result).toContain('   Problem: (none)');
    });

    it('trims whitespace from problem', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ problem: '  Handle burst traffic  ' }),
      ]);
      expect(result).toContain('   Problem: Handle burst traffic');
    });
  });

  // ── Approaches ──

  describe('approaches rendering', () => {
    it('omits Approaches section when no approaches', () => {
      const result = serializeDeepDivesToText([makeChallenge({ approaches: [] })]);
      expect(result).not.toContain('Approaches:');
    });

    it('renders approach name with 1-based index', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ approaches: [makeApproach({ name: 'Token Bucket' })] }),
      ]);
      expect(result).toContain('     1. Token Bucket');
    });

    it('shows "(unnamed)" for empty approach name', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ approaches: [makeApproach({ name: '' })] }),
      ]);
      expect(result).toContain('     1. (unnamed)');
    });

    it('trims whitespace from approach name', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ approaches: [makeApproach({ name: '  Sliding Window Log  ' })] }),
      ]);
      expect(result).toContain('     1. Sliding Window Log');
    });

    it('renders pros and cons for each approach', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({
          approaches: [makeApproach({ pros: 'Simple to implement', cons: 'Not distributed' })],
        }),
      ]);
      expect(result).toContain('        Pros: Simple to implement');
      expect(result).toContain('        Cons: Not distributed');
    });

    it('shows "(none)" for empty pros and cons', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({
          approaches: [makeApproach({ pros: '', cons: '' })],
        }),
      ]);
      expect(result).toContain('        Pros: (none)');
      expect(result).toContain('        Cons: (none)');
    });

    it('trims whitespace from pros and cons', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({
          approaches: [makeApproach({ pros: '  Low latency  ', cons: '  High memory  ' })],
        }),
      ]);
      expect(result).toContain('        Pros: Low latency');
      expect(result).toContain('        Cons: High memory');
    });

    it('numbers multiple approaches sequentially', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({
          approaches: [
            makeApproach({ name: 'Option A' }),
            makeApproach({ name: 'Option B' }),
          ],
        }),
      ]);
      expect(result).toContain('     1. Option A');
      expect(result).toContain('     2. Option B');
    });
  });

  // ── Chosen marker ──

  describe('[CHOSEN] marker', () => {
    it('marks chosen approach with [CHOSEN]', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({
          approaches: [
            makeApproach({ name: 'Token Bucket' }),
            makeApproach({ name: 'Leaky Bucket' }),
          ],
          chosenIndex: 1,
        }),
      ]);
      expect(result).toContain('     1. Token Bucket');
      expect(result).not.toContain('Token Bucket [CHOSEN]');
      expect(result).toContain('     2. Leaky Bucket [CHOSEN]');
    });

    it('does not add [CHOSEN] when chosenIndex is -1', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({
          approaches: [makeApproach({ name: 'Option A' })],
          chosenIndex: -1,
        }),
      ]);
      expect(result).not.toContain('[CHOSEN]');
    });

    it('marks first approach as [CHOSEN] when chosenIndex is 0', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({
          approaches: [
            makeApproach({ name: 'First' }),
            makeApproach({ name: 'Second' }),
          ],
          chosenIndex: 0,
        }),
      ]);
      expect(result).toContain('     1. First [CHOSEN]');
      expect(result).not.toContain('Second [CHOSEN]');
    });
  });

  // ── Justification and tradeoffs ──

  describe('justification and tradeoffs', () => {
    it('renders justification text', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ justification: 'Best latency under load' }),
      ]);
      expect(result).toContain('   Justification: Best latency under load');
    });

    it('shows "(none)" for empty justification', () => {
      const result = serializeDeepDivesToText([makeChallenge({ justification: '' })]);
      expect(result).toContain('   Justification: (none)');
    });

    it('trims whitespace from justification', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ justification: '  Simplest to maintain  ' }),
      ]);
      expect(result).toContain('   Justification: Simplest to maintain');
    });

    it('renders tradeoffs text', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ tradeoffs: 'Higher memory usage vs lower latency' }),
      ]);
      expect(result).toContain('   Tradeoffs: Higher memory usage vs lower latency');
    });

    it('shows "(none)" for empty tradeoffs', () => {
      const result = serializeDeepDivesToText([makeChallenge({ tradeoffs: '' })]);
      expect(result).toContain('   Tradeoffs: (none)');
    });

    it('trims whitespace from tradeoffs', () => {
      const result = serializeDeepDivesToText([
        makeChallenge({ tradeoffs: '  Consistency vs availability  ' }),
      ]);
      expect(result).toContain('   Tradeoffs: Consistency vs availability');
    });
  });

  // ── Full integration ──

  describe('full integration', () => {
    it('serializes fully populated challenge', () => {
      const challenge = makeChallenge({
        title: 'Rate Limiting',
        problem: 'Handle burst traffic at API gateway',
        approaches: [
          { name: 'Token Bucket', pros: 'Smooth rate', cons: 'Memory per user' },
          { name: 'Fixed Window', pros: 'Simple', cons: 'Burst at boundary' },
        ],
        chosenIndex: 0,
        justification: 'Token bucket handles bursts gracefully',
        tradeoffs: 'More memory per client but smoother traffic shaping',
      });

      const result = serializeDeepDivesToText([challenge]);

      expect(result).toBe(
        'Deep Dive Challenges (1):\n' +
        '\n' +
        '1. Rate Limiting\n' +
        '   Problem: Handle burst traffic at API gateway\n' +
        '   Approaches:\n' +
        '     1. Token Bucket [CHOSEN]\n' +
        '        Pros: Smooth rate\n' +
        '        Cons: Memory per user\n' +
        '     2. Fixed Window\n' +
        '        Pros: Simple\n' +
        '        Cons: Burst at boundary\n' +
        '   Justification: Token bucket handles bursts gracefully\n' +
        '   Tradeoffs: More memory per client but smoother traffic shaping',
      );
    });

    it('serializes challenge with all fields empty', () => {
      const challenge = makeChallenge({
        title: '',
        problem: '',
        approaches: [],
        chosenIndex: -1,
        justification: '',
        tradeoffs: '',
      });

      const result = serializeDeepDivesToText([challenge]);

      expect(result).toBe(
        'Deep Dive Challenges (1):\n' +
        '\n' +
        '1. (untitled)\n' +
        '   Problem: (none)\n' +
        '   Justification: (none)\n' +
        '   Tradeoffs: (none)',
      );
    });

    it('serializes multiple challenges with mixed content', () => {
      const challenges: DeepDiveChallenge[] = [
        makeChallenge({
          id: 'ch-1',
          title: 'Caching',
          problem: 'Reduce DB load',
          approaches: [
            { name: 'Redis', pros: 'Fast', cons: 'Extra infra' },
          ],
          chosenIndex: 0,
          justification: 'Low latency reads',
          tradeoffs: 'Cache invalidation complexity',
        }),
        makeChallenge({
          id: 'ch-2',
          title: '',
          problem: '',
          approaches: [],
          chosenIndex: -1,
          justification: '',
          tradeoffs: '',
        }),
      ];

      const result = serializeDeepDivesToText(challenges);

      expect(result).toBe(
        'Deep Dive Challenges (2):\n' +
        '\n' +
        '1. Caching\n' +
        '   Problem: Reduce DB load\n' +
        '   Approaches:\n' +
        '     1. Redis [CHOSEN]\n' +
        '        Pros: Fast\n' +
        '        Cons: Extra infra\n' +
        '   Justification: Low latency reads\n' +
        '   Tradeoffs: Cache invalidation complexity\n' +
        '\n' +
        '2. (untitled)\n' +
        '   Problem: (none)\n' +
        '   Justification: (none)\n' +
        '   Tradeoffs: (none)',
      );
    });
  });
});
