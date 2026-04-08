import { describe, it, expect } from 'vitest';
import {
  STUDY_PLAN_TEMPLATES,
  PACE_CONFIG,
} from '../studyPlans';
import {
  behavioralQuestions,
  CATEGORY_META,
  COMPANY_META,
  totalBehavioralQuestions,
  getQuestionsByCategory,
  getQuestionsByCompany,
  getQuestionsByLevel,
  getRandomQuestion,
} from '../behavioral';

// ─── studyPlans ───────────────────────────────────────────────────────────────

describe('STUDY_PLAN_TEMPLATES', () => {
  it('contains exactly 4 templates', () => {
    expect(STUDY_PLAN_TEMPLATES).toHaveLength(4);
  });

  it('every template has a non-empty id', () => {
    for (const t of STUDY_PLAN_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(typeof t.id).toBe('string');
    }
  });

  it('every template has a non-empty name', () => {
    for (const t of STUDY_PLAN_TEMPLATES) {
      expect(t.name).toBeTruthy();
    }
  });

  it('every template has a non-empty description', () => {
    for (const t of STUDY_PLAN_TEMPLATES) {
      expect(t.description).toBeTruthy();
    }
  });

  it('every template has a positive durationDays', () => {
    for (const t of STUDY_PLAN_TEMPLATES) {
      expect(t.durationDays).toBeGreaterThan(0);
    }
  });

  it('no duplicate template IDs', () => {
    const ids = STUDY_PLAN_TEMPLATES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('blind75 template has id "blind75"', () => {
    const blind75 = STUDY_PLAN_TEMPLATES.find(t => t.id === 'blind75');
    expect(blind75).toBeDefined();
  });

  it('neetcode150 template has id "neetcode150"', () => {
    const nc = STUDY_PLAN_TEMPLATES.find(t => t.id === 'neetcode150');
    expect(nc).toBeDefined();
  });

  it('templates with patterns have non-empty patterns array', () => {
    for (const t of STUDY_PLAN_TEMPLATES) {
      if (t.patterns !== undefined) {
        expect(Array.isArray(t.patterns)).toBe(true);
        expect(t.patterns.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('PACE_CONFIG', () => {
  it('has exactly 3 paces: relaxed, normal, intense', () => {
    expect(Object.keys(PACE_CONFIG)).toEqual(['relaxed', 'normal', 'intense']);
  });

  it('every pace has a non-empty label', () => {
    for (const config of Object.values(PACE_CONFIG)) {
      expect(config.label).toBeTruthy();
    }
  });

  it('every pace has a positive problemsPerDay', () => {
    for (const config of Object.values(PACE_CONFIG)) {
      expect(config.problemsPerDay).toBeGreaterThan(0);
    }
  });

  it('every pace has a description', () => {
    for (const config of Object.values(PACE_CONFIG)) {
      expect(config.description).toBeTruthy();
    }
  });

  it('problemsPerDay is in ascending order: relaxed < normal < intense', () => {
    expect(PACE_CONFIG.relaxed.problemsPerDay).toBeLessThan(PACE_CONFIG.normal.problemsPerDay);
    expect(PACE_CONFIG.normal.problemsPerDay).toBeLessThan(PACE_CONFIG.intense.problemsPerDay);
  });
});

// ─── behavioral ───────────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  'leadership', 'conflict', 'failure', 'innovation',
  'teamwork', 'ambiguity', 'execution', 'growth',
]);

const VALID_COMPANIES = new Set([
  'amazon', 'google', 'meta', 'apple', 'microsoft', 'general',
]);

const VALID_LEVELS = new Set(['new-grad', 'mid', 'senior', 'staff']);

describe('behavioralQuestions dataset', () => {
  it('contains at least 100 questions', () => {
    expect(behavioralQuestions.length).toBeGreaterThanOrEqual(100);
  });

  it('totalBehavioralQuestions matches array length', () => {
    expect(totalBehavioralQuestions).toBe(behavioralQuestions.length);
  });

  it('no duplicate IDs', () => {
    const ids = behavioralQuestions.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every question has a non-empty id', () => {
    for (const q of behavioralQuestions) {
      expect(q.id).toBeTruthy();
    }
  });

  it('every question has a non-empty question text', () => {
    for (const q of behavioralQuestions) {
      expect(q.question).toBeTruthy();
    }
  });

  it('every question has a valid category', () => {
    for (const q of behavioralQuestions) {
      expect(VALID_CATEGORIES.has(q.category)).toBe(true);
    }
  });

  it('every question has at least one valid company tag', () => {
    for (const q of behavioralQuestions) {
      expect(q.companies.length).toBeGreaterThan(0);
      for (const c of q.companies) {
        expect(VALID_COMPANIES.has(c)).toBe(true);
      }
    }
  });

  it('every question has at least one valid seniority level', () => {
    for (const q of behavioralQuestions) {
      expect(q.levels.length).toBeGreaterThan(0);
      for (const l of q.levels) {
        expect(VALID_LEVELS.has(l)).toBe(true);
      }
    }
  });

  it('followUps and tips are arrays', () => {
    for (const q of behavioralQuestions) {
      expect(Array.isArray(q.followUps)).toBe(true);
      expect(Array.isArray(q.tips)).toBe(true);
    }
  });

  it('all 8 categories have at least one question', () => {
    for (const cat of VALID_CATEGORIES) {
      const count = behavioralQuestions.filter(q => q.category === cat).length;
      expect(count).toBeGreaterThan(0);
    }
  });
});

describe('CATEGORY_META', () => {
  it('has entries for all 8 categories', () => {
    for (const cat of VALID_CATEGORIES) {
      expect(CATEGORY_META[cat as keyof typeof CATEGORY_META]).toBeDefined();
    }
  });

  it('every entry has a non-empty label and icon', () => {
    for (const meta of Object.values(CATEGORY_META)) {
      expect(meta.label).toBeTruthy();
      expect(meta.icon).toBeTruthy();
    }
  });
});

describe('COMPANY_META', () => {
  it('has entries for all 6 company tags', () => {
    for (const company of VALID_COMPANIES) {
      expect(COMPANY_META[company as keyof typeof COMPANY_META]).toBeDefined();
    }
  });

  it('every entry has a non-empty label', () => {
    for (const meta of Object.values(COMPANY_META)) {
      expect(meta.label).toBeTruthy();
    }
  });
});

describe('getQuestionsByCategory', () => {
  it('returns only questions with the requested category', () => {
    const results = getQuestionsByCategory('leadership');
    expect(results.length).toBeGreaterThan(0);
    for (const q of results) {
      expect(q.category).toBe('leadership');
    }
  });

  it('returns different results for different categories', () => {
    const leadership = getQuestionsByCategory('leadership');
    const failure = getQuestionsByCategory('failure');
    expect(leadership.length).toBeGreaterThan(0);
    expect(failure.length).toBeGreaterThan(0);
    expect(leadership[0].id).not.toBe(failure[0].id);
  });
});

describe('getQuestionsByCompany', () => {
  it('returns only questions that include the requested company', () => {
    const results = getQuestionsByCompany('amazon');
    expect(results.length).toBeGreaterThan(0);
    for (const q of results) {
      expect(q.companies).toContain('amazon');
    }
  });
});

describe('getQuestionsByLevel', () => {
  it('returns only questions that include the requested level', () => {
    const results = getQuestionsByLevel('senior');
    expect(results.length).toBeGreaterThan(0);
    for (const q of results) {
      expect(q.levels).toContain('senior');
    }
  });
});

describe('getRandomQuestion', () => {
  it('returns a valid question with no filters', () => {
    const q = getRandomQuestion();
    expect(q.id).toBeTruthy();
    expect(q.question).toBeTruthy();
    expect(VALID_CATEGORIES.has(q.category)).toBe(true);
  });

  it('returns a question matching the category filter', () => {
    const q = getRandomQuestion({ category: 'teamwork' });
    expect(q.category).toBe('teamwork');
  });

  it('returns a question matching the company filter', () => {
    const q = getRandomQuestion({ company: 'google' });
    expect(q.companies).toContain('google');
  });

  it('falls back to full pool for impossible filter combination', () => {
    // An impossible filter combination that returns empty pool should fall back
    const q = getRandomQuestion({ category: 'leadership', level: 'new-grad' });
    expect(q.id).toBeTruthy();
  });
});
