import { describe, it, expect } from 'vitest';
import {
  behavioralQuestions,
  CATEGORY_META,
  COMPANY_META,
  type BehavioralCategory,
  type CompanyTag,
} from '../data/behavioral';

const ALL_CATEGORIES: BehavioralCategory[] = [
  'leadership', 'conflict', 'failure', 'innovation',
  'teamwork', 'ambiguity', 'execution', 'growth',
];

const ALL_COMPANIES: CompanyTag[] = [
  'amazon', 'google', 'meta', 'apple', 'microsoft', 'general',
];

// ─── Question count ───────────────────────────────────────────────────────────

describe('behavioralQuestions — count', () => {
  it('has exactly 102 questions', () => {
    expect(behavioralQuestions).toHaveLength(102);
  });
});

// ─── IDs ─────────────────────────────────────────────────────────────────────

describe('behavioralQuestions — IDs', () => {
  it('no duplicate IDs', () => {
    const ids = behavioralQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs match bh-X-NN pattern', () => {
    for (const q of behavioralQuestions) {
      expect(q.id).toMatch(/^bh-[a-z]-\d{2}$/);
    }
  });

  it('all IDs are non-empty strings', () => {
    for (const q of behavioralQuestions) {
      expect(typeof q.id).toBe('string');
      expect(q.id.length).toBeGreaterThan(0);
    }
  });
});

// ─── Required fields ──────────────────────────────────────────────────────────

describe('behavioralQuestions — shape', () => {
  it('every question has a non-empty question string', () => {
    for (const q of behavioralQuestions) {
      expect(typeof q.question).toBe('string');
      expect(q.question.length).toBeGreaterThan(0);
    }
  });

  it('every question has a valid category', () => {
    const valid = new Set<string>(ALL_CATEGORIES);
    for (const q of behavioralQuestions) {
      expect(valid.has(q.category)).toBe(true);
    }
  });

  it('every question has a non-empty companies array', () => {
    for (const q of behavioralQuestions) {
      expect(Array.isArray(q.companies)).toBe(true);
      expect(q.companies.length).toBeGreaterThan(0);
    }
  });

  it('every question has a non-empty levels array', () => {
    for (const q of behavioralQuestions) {
      expect(Array.isArray(q.levels)).toBe(true);
      expect(q.levels.length).toBeGreaterThan(0);
    }
  });

  it('every question has a non-empty followUps array', () => {
    for (const q of behavioralQuestions) {
      expect(Array.isArray(q.followUps)).toBe(true);
      expect(q.followUps.length).toBeGreaterThan(0);
    }
  });

  it('every question has a non-empty tips array', () => {
    for (const q of behavioralQuestions) {
      expect(Array.isArray(q.tips)).toBe(true);
      expect(q.tips.length).toBeGreaterThan(0);
    }
  });
});

// ─── Category coverage ────────────────────────────────────────────────────────

describe('behavioralQuestions — category coverage', () => {
  it('all 8 categories have at least one question', () => {
    for (const cat of ALL_CATEGORIES) {
      const count = behavioralQuestions.filter((q) => q.category === cat).length;
      expect(count, `category "${cat}" has no questions`).toBeGreaterThan(0);
    }
  });

  it('leadership has multiple questions', () => {
    const count = behavioralQuestions.filter((q) => q.category === 'leadership').length;
    expect(count).toBeGreaterThanOrEqual(5);
  });
});

// ─── CATEGORY_META ────────────────────────────────────────────────────────────

describe('CATEGORY_META', () => {
  it('has all 8 categories', () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_META[cat]).toBeDefined();
    }
  });

  it('every category meta has label, icon, color', () => {
    for (const cat of ALL_CATEGORIES) {
      const meta = CATEGORY_META[cat];
      expect(typeof meta.label).toBe('string');
      expect(meta.label.length).toBeGreaterThan(0);
      expect(typeof meta.icon).toBe('string');
      expect(meta.icon.length).toBeGreaterThan(0);
      expect(typeof meta.color).toBe('string');
      expect(meta.color.length).toBeGreaterThan(0);
    }
  });
});

// ─── COMPANY_META ─────────────────────────────────────────────────────────────

describe('COMPANY_META', () => {
  it('has all 6 companies', () => {
    for (const company of ALL_COMPANIES) {
      expect(COMPANY_META[company]).toBeDefined();
    }
  });

  it('every company meta has a label', () => {
    for (const company of ALL_COMPANIES) {
      const meta = COMPANY_META[company];
      expect(typeof meta.label).toBe('string');
      expect(meta.label.length).toBeGreaterThan(0);
    }
  });
});
