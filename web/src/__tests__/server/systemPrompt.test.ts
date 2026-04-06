import { describe, it, expect } from 'vitest';
import { buildSessionContext } from '../../../server/services/systemPrompt';

const baseContext = {
  mode: 'TEACHER' as const,
  hintsUsed: 0,
  commitmentGateCompleted: 0,
};

describe('buildSessionContext — mode-specific behavioral instructions', () => {
  describe('TEACHER mode', () => {
    it('injects TEACHER MODE ACTIVE instruction', () => {
      const result = buildSessionContext(baseContext);
      expect(result).toContain('TEACHER MODE ACTIVE');
    });

    it('mentions Socratic guidance', () => {
      const result = buildSessionContext(baseContext);
      expect(result).toContain('Socratic guidance');
    });

    it('mentions hint ladder', () => {
      const result = buildSessionContext(baseContext);
      expect(result).toContain('hint ladder');
    });

    it('mentions commitment gate', () => {
      const result = buildSessionContext(baseContext);
      expect(result).toContain('commitment gate');
    });

    it('does NOT inject INTERVIEWER or REVIEWER instructions', () => {
      const result = buildSessionContext(baseContext);
      expect(result).not.toContain('INTERVIEWER MODE ACTIVE');
      expect(result).not.toContain('REVIEWER MODE ACTIVE');
    });
  });

  describe('INTERVIEWER mode', () => {
    const interviewerContext = { ...baseContext, mode: 'INTERVIEWER' as const };

    it('injects INTERVIEWER MODE ACTIVE instruction', () => {
      const result = buildSessionContext(interviewerContext);
      expect(result).toContain('INTERVIEWER MODE ACTIVE');
    });

    it('mentions professional interviewer tone', () => {
      const result = buildSessionContext(interviewerContext);
      expect(result).toContain('professional interviewer');
    });

    it('says minimal hints', () => {
      const result = buildSessionContext(interviewerContext);
      expect(result).toContain('minimal hints');
    });

    it('says Do NOT teach', () => {
      const result = buildSessionContext(interviewerContext);
      expect(result).toContain('Do NOT teach');
    });

    it('does NOT inject TEACHER or REVIEWER instructions', () => {
      const result = buildSessionContext(interviewerContext);
      expect(result).not.toContain('TEACHER MODE ACTIVE');
      expect(result).not.toContain('REVIEWER MODE ACTIVE');
    });
  });

  describe('REVIEWER mode', () => {
    const reviewerContext = { ...baseContext, mode: 'REVIEWER' as const };

    it('injects REVIEWER MODE ACTIVE instruction', () => {
      const result = buildSessionContext(reviewerContext);
      expect(result).toContain('REVIEWER MODE ACTIVE');
    });

    it('mentions 0-4 rubric', () => {
      const result = buildSessionContext(reviewerContext);
      expect(result).toContain('0-4 rubric');
    });

    it('mentions 6 dimensions', () => {
      const result = buildSessionContext(reviewerContext);
      expect(result).toContain('6 dimensions');
    });

    it('says Do NOT teach', () => {
      const result = buildSessionContext(reviewerContext);
      expect(result).toContain('Do NOT teach');
    });

    it('does NOT inject TEACHER or INTERVIEWER instructions', () => {
      const result = buildSessionContext(reviewerContext);
      expect(result).not.toContain('TEACHER MODE ACTIVE');
      expect(result).not.toContain('INTERVIEWER MODE ACTIVE');
    });
  });

  describe('mode instruction placement', () => {
    it('mode instruction appears after Mode line', () => {
      const result = buildSessionContext(baseContext);
      const modeIndex = result.indexOf('**Mode:** TEACHER');
      const instructionIndex = result.indexOf('TEACHER MODE ACTIVE');
      expect(modeIndex).toBeGreaterThanOrEqual(0);
      expect(instructionIndex).toBeGreaterThan(modeIndex);
    });

    it('mode instruction appears before Hints Used line', () => {
      const result = buildSessionContext(baseContext);
      const instructionIndex = result.indexOf('TEACHER MODE ACTIVE');
      const hintsIndex = result.indexOf('Hints Used');
      expect(instructionIndex).toBeGreaterThanOrEqual(0);
      expect(instructionIndex).toBeLessThan(hintsIndex);
    });
  });

  describe('no context', () => {
    it('returns empty string when context is undefined', () => {
      expect(buildSessionContext(undefined)).toBe('');
    });

    it('returns empty string when called with no args', () => {
      expect(buildSessionContext()).toBe('');
    });
  });

  describe('context still includes standard fields', () => {
    it('always includes Mode line', () => {
      const result = buildSessionContext(baseContext);
      expect(result).toContain('**Mode:** TEACHER');
    });

    it('always includes Hints Used line', () => {
      const result = buildSessionContext({ ...baseContext, hintsUsed: 2 });
      expect(result).toContain('**Hints Used:** 2/3');
    });

    it('always includes Commitment Gate line', () => {
      const result = buildSessionContext({ ...baseContext, commitmentGateCompleted: 3 });
      expect(result).toContain('**Commitment Gate:** 3/5');
    });
  });
});
