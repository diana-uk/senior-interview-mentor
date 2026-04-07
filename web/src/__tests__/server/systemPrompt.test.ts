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

// ─── Memory context ────────────────────────────────────────────────────────────

const baseMemory = {
  hintStyle: 'pseudocode' as const,
  detailLevel: 'balanced' as const,
  totalSolved: 0,
  currentStreak: 0,
  solvedProblems: [] as Array<{ title: string; pattern: string; difficulty: string }>,
  strongPatterns: [] as Array<{ pattern: string; solveCount: number; avgScore: number }>,
  weakPatterns: [] as Array<{ pattern: string; mistakeCount: number; avgScore: number }>,
  recentMistakes: [] as Array<{ problem: string; description: string }>,
};

describe('buildSessionContext — memory context', () => {
  describe('hint style labels', () => {
    it('analogies → "real-world analogies"', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, hintStyle: 'analogies' } });
      expect(result).toContain('real-world analogies');
    });

    it('pseudocode → "pseudocode outlines"', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, hintStyle: 'pseudocode' } });
      expect(result).toContain('pseudocode outlines');
    });

    it('visual → "diagrams and visual examples"', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, hintStyle: 'visual' } });
      expect(result).toContain('diagrams and visual examples');
    });

    it('direct → "concise, direct explanations"', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, hintStyle: 'direct' } });
      expect(result).toContain('concise, direct explanations');
    });
  });

  describe('detail level labels', () => {
    it('brief → "brief (concise, essentials only)"', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, detailLevel: 'brief' } });
      expect(result).toContain('brief (concise, essentials only)');
    });

    it('balanced → "balanced (standard depth with examples)"', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, detailLevel: 'balanced' } });
      expect(result).toContain('balanced (standard depth with examples)');
    });

    it('detailed → "detailed (thorough with deep dives)"', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, detailLevel: 'detailed' } });
      expect(result).toContain('detailed (thorough with deep dives)');
    });
  });

  describe('progress summary', () => {
    it('includes totalSolved count', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, totalSolved: 42 } });
      expect(result).toContain('42 problems solved');
    });

    it('includes streak when currentStreak > 0', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, currentStreak: 5 } });
      expect(result).toContain('5-day streak');
    });

    it('does not include streak when currentStreak is 0', () => {
      const result = buildSessionContext({ ...baseContext, memory: { ...baseMemory, currentStreak: 0 } });
      expect(result).not.toContain('day streak');
    });
  });

  describe('recently solved problems', () => {
    it('includes recently solved problems section', () => {
      const memory = {
        ...baseMemory,
        solvedProblems: [{ title: 'Two Sum', pattern: 'HashMap', difficulty: 'Easy' }],
      };
      const result = buildSessionContext({ ...baseContext, memory });
      expect(result).toContain('Recently Solved');
      expect(result).toContain('Two Sum');
    });

    it('omits section when no solved problems', () => {
      const result = buildSessionContext({ ...baseContext, memory: baseMemory });
      expect(result).not.toContain('Recently Solved');
    });
  });

  describe('strong patterns', () => {
    it('includes strong patterns section', () => {
      const memory = {
        ...baseMemory,
        strongPatterns: [{ pattern: 'Binary Search', solveCount: 5, avgScore: 3.8 }],
      };
      const result = buildSessionContext({ ...baseContext, memory });
      expect(result).toContain('Strong Patterns');
      expect(result).toContain('Binary Search');
    });

    it('omits section when no strong patterns', () => {
      const result = buildSessionContext({ ...baseContext, memory: baseMemory });
      expect(result).not.toContain('Strong Patterns');
    });
  });

  describe('weak patterns', () => {
    it('includes weak patterns section', () => {
      const memory = {
        ...baseMemory,
        weakPatterns: [{ pattern: 'DP', mistakeCount: 3, avgScore: 1.2 }],
      };
      const result = buildSessionContext({ ...baseContext, memory });
      expect(result).toContain('Weak Patterns');
      expect(result).toContain('DP');
    });

    it('includes mistake count when > 0', () => {
      const memory = {
        ...baseMemory,
        weakPatterns: [{ pattern: 'DP', mistakeCount: 3, avgScore: 1.2 }],
      };
      const result = buildSessionContext({ ...baseContext, memory });
      expect(result).toContain('3 mistakes');
    });

    it('omits mistake count when 0', () => {
      const memory = {
        ...baseMemory,
        weakPatterns: [{ pattern: 'DP', mistakeCount: 0, avgScore: 1.5 }],
      };
      const result = buildSessionContext({ ...baseContext, memory });
      expect(result).not.toContain('0 mistakes');
    });

    it('omits section when no weak patterns', () => {
      const result = buildSessionContext({ ...baseContext, memory: baseMemory });
      expect(result).not.toContain('Weak Patterns');
    });
  });

  describe('recent mistakes', () => {
    it('includes recent mistakes section', () => {
      const memory = {
        ...baseMemory,
        recentMistakes: [{ problem: 'Two Sum', description: 'Off-by-one error' }],
      };
      const result = buildSessionContext({ ...baseContext, memory });
      expect(result).toContain('Recent Mistakes');
      expect(result).toContain('Off-by-one error on Two Sum');
    });

    it('omits section when no recent mistakes', () => {
      const result = buildSessionContext({ ...baseContext, memory: baseMemory });
      expect(result).not.toContain('Recent Mistakes');
    });
  });

  it('includes User Memory & Personalization header', () => {
    const result = buildSessionContext({ ...baseContext, memory: baseMemory });
    expect(result).toContain('User Memory & Personalization');
  });
});

// ─── Language context ──────────────────────────────────────────────────────────

describe('buildSessionContext — language', () => {
  it('includes Language line when language is set', () => {
    const result = buildSessionContext({ ...baseContext, language: 'python' });
    expect(result).toContain('**Language:** python');
  });

  it('includes Python instructions when language is python', () => {
    const result = buildSessionContext({ ...baseContext, language: 'python' });
    expect(result).toContain('Python idioms');
    expect(result).toContain('snake_case');
  });

  it('does not include Python instructions for typescript', () => {
    const result = buildSessionContext({ ...baseContext, language: 'typescript' });
    expect(result).not.toContain('Python idioms');
  });

  it('omits Language line when no language set', () => {
    const result = buildSessionContext(baseContext);
    expect(result).not.toContain('**Language:**');
  });
});

// ─── Current problem context ───────────────────────────────────────────────────

describe('buildSessionContext — current problem', () => {
  const problem = {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium' as const,
    pattern: 'Sliding Window',
    description: 'Find the longest substring without repeating characters.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters and digits'],
  };

  it('includes problem title', () => {
    const result = buildSessionContext({ ...baseContext, currentProblem: problem });
    expect(result).toContain('Longest Substring Without Repeating Characters');
  });

  it('includes problem difficulty', () => {
    const result = buildSessionContext({ ...baseContext, currentProblem: problem });
    expect(result).toContain('Medium');
  });

  it('includes problem pattern', () => {
    const result = buildSessionContext({ ...baseContext, currentProblem: problem });
    expect(result).toContain('Sliding Window');
  });

  it('includes problem description', () => {
    const result = buildSessionContext({ ...baseContext, currentProblem: problem });
    expect(result).toContain('Find the longest substring');
  });

  it('includes constraints when present', () => {
    const result = buildSessionContext({ ...baseContext, currentProblem: problem });
    expect(result).toContain('0 <= s.length');
  });

  it('omits constraints when empty', () => {
    const noProblem = { ...problem, constraints: [] };
    const result = buildSessionContext({ ...baseContext, currentProblem: noProblem });
    expect(result).not.toContain('Constraints');
  });

  it('omits current problem section when not provided', () => {
    const result = buildSessionContext(baseContext);
    expect(result).not.toContain('Current Problem');
  });
});

// ─── Interview stage context ───────────────────────────────────────────────────

describe('buildSessionContext — interview stage', () => {
  it('includes Interview Stage header', () => {
    const result = buildSessionContext({ ...baseContext, interviewStage: 'technical' });
    expect(result).toContain('Interview Stage: technical');
  });

  it('describes technical-questions stage as knowledge Q&A', () => {
    const result = buildSessionContext({ ...baseContext, interviewStage: 'technical-questions' });
    expect(result).toContain('technical questions interview');
    expect(result).toContain('senior engineering manager');
  });

  it('includes category for technical-questions when provided', () => {
    const result = buildSessionContext({
      ...baseContext,
      interviewStage: 'technical-questions',
      technicalQuestionCategory: 'react-frontend',
    });
    expect(result).toContain('react-frontend');
  });

  it('describes other stages as mock interview', () => {
    const result = buildSessionContext({ ...baseContext, interviewStage: 'technical' });
    expect(result).toContain('mock interview');
    expect(result).toContain('professional interviewer');
  });

  it('omits interview stage section when not provided', () => {
    const result = buildSessionContext(baseContext);
    expect(result).not.toContain('Interview Stage');
  });
});
