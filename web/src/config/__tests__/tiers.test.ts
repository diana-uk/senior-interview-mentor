import { describe, it, expect } from 'vitest';
import {
  PLAN_TIERS,
  PLAN_ORDER,
  getPlanLimits,
  isFeatureAvailable,
  getUpgradeMessage,
  getTrialDays,
  type PlanId,
} from '../tiers';

const ALL_PLAN_IDS: PlanId[] = ['free', 'premium', 'pro'];

// ─── PLAN_TIERS shape ─────────────────────────────────────────────────────────

describe('PLAN_TIERS — shape', () => {
  it('has exactly 3 plans', () => {
    expect(Object.keys(PLAN_TIERS)).toHaveLength(3);
  });

  it('has free, premium, pro keys', () => {
    for (const id of ALL_PLAN_IDS) {
      expect(PLAN_TIERS[id]).toBeDefined();
    }
  });

  it('every plan has a non-empty name and tagline', () => {
    for (const id of ALL_PLAN_IDS) {
      expect(typeof PLAN_TIERS[id].name).toBe('string');
      expect(PLAN_TIERS[id].name.length).toBeGreaterThan(0);
      expect(typeof PLAN_TIERS[id].tagline).toBe('string');
      expect(PLAN_TIERS[id].tagline.length).toBeGreaterThan(0);
    }
  });

  it('every plan has a pricing object with monthly, yearly, yearlySavings', () => {
    for (const id of ALL_PLAN_IDS) {
      const { pricing } = PLAN_TIERS[id];
      expect(typeof pricing.monthly).toBe('number');
      expect(typeof pricing.yearly).toBe('number');
      expect(typeof pricing.yearlySavings).toBe('number');
    }
  });

  it('every plan has a non-empty features array', () => {
    for (const id of ALL_PLAN_IDS) {
      expect(Array.isArray(PLAN_TIERS[id].features)).toBe(true);
      expect(PLAN_TIERS[id].features.length).toBeGreaterThan(0);
    }
  });

  it('every plan has a highlightFeature', () => {
    for (const id of ALL_PLAN_IDS) {
      expect(typeof PLAN_TIERS[id].highlightFeature).toBe('string');
      expect(PLAN_TIERS[id].highlightFeature.length).toBeGreaterThan(0);
    }
  });
});

// ─── PLAN_TIERS — pricing values ──────────────────────────────────────────────

describe('PLAN_TIERS — pricing values', () => {
  it('free plan costs $0/month', () => {
    expect(PLAN_TIERS.free.pricing.monthly).toBe(0);
  });

  it('free plan costs $0/year', () => {
    expect(PLAN_TIERS.free.pricing.yearly).toBe(0);
  });

  it('premium plan costs $19/month', () => {
    expect(PLAN_TIERS.premium.pricing.monthly).toBe(19);
  });

  it('premium plan costs $149/year', () => {
    expect(PLAN_TIERS.premium.pricing.yearly).toBe(149);
  });

  it('pro plan costs $29/month', () => {
    expect(PLAN_TIERS.pro.pricing.monthly).toBe(29);
  });

  it('pro plan yearly savings percentage is positive', () => {
    expect(PLAN_TIERS.pro.pricing.yearlySavings).toBeGreaterThan(0);
  });

  it('premium is the recommended plan', () => {
    expect(PLAN_TIERS.premium.recommended).toBe(true);
    expect(PLAN_TIERS.free.recommended).toBe(false);
    expect(PLAN_TIERS.pro.recommended).toBe(false);
  });
});

// ─── PLAN_ORDER ───────────────────────────────────────────────────────────────

describe('PLAN_ORDER', () => {
  it('has 3 items', () => {
    expect(PLAN_ORDER).toHaveLength(3);
  });

  it('is ordered free → premium → pro', () => {
    expect(PLAN_ORDER[0]).toBe('free');
    expect(PLAN_ORDER[1]).toBe('premium');
    expect(PLAN_ORDER[2]).toBe('pro');
  });
});

// ─── getPlanLimits ────────────────────────────────────────────────────────────

describe('getPlanLimits', () => {
  it('returns limits matching PLAN_TIERS for free', () => {
    expect(getPlanLimits('free')).toEqual(PLAN_TIERS.free.limits);
  });

  it('returns limits matching PLAN_TIERS for premium', () => {
    expect(getPlanLimits('premium')).toEqual(PLAN_TIERS.premium.limits);
  });

  it('free plan allows 5 problems per day', () => {
    expect(getPlanLimits('free').problemsPerDay).toBe(5);
  });

  it('premium plan has unlimited problems (-1)', () => {
    expect(getPlanLimits('premium').problemsPerDay).toBe(-1);
  });

  it('free plan has 0 mock interviews per day', () => {
    expect(getPlanLimits('free').mockInterviewsPerDay).toBe(0);
  });
});

// ─── isFeatureAvailable ───────────────────────────────────────────────────────

describe('isFeatureAvailable', () => {
  it('returns false for boolean feature not in free plan', () => {
    expect(isFeatureAvailable('free', 'systemDesignAccess')).toBe(false);
  });

  it('returns true for boolean feature in premium plan', () => {
    expect(isFeatureAvailable('premium', 'systemDesignAccess')).toBe(true);
  });

  it('returns false when numeric limit is 0 (free mockInterviewsPerDay)', () => {
    expect(isFeatureAvailable('free', 'mockInterviewsPerDay')).toBe(false);
  });

  it('returns true when numeric limit is -1 (unlimited)', () => {
    expect(isFeatureAvailable('premium', 'problemsPerDay')).toBe(true);
  });

  it('returns true for positive numeric limit (free problemsPerDay = 5)', () => {
    expect(isFeatureAvailable('free', 'problemsPerDay')).toBe(true);
  });

  it('pro plan has companySpecificPrep, premium does not', () => {
    expect(isFeatureAvailable('pro', 'companySpecificPrep')).toBe(true);
    expect(isFeatureAvailable('premium', 'companySpecificPrep')).toBe(false);
  });

  it('free mistakeTracking is false', () => {
    expect(isFeatureAvailable('free', 'mistakeTracking')).toBe(false);
  });

  it('premium mistakeTracking is true', () => {
    expect(isFeatureAvailable('premium', 'mistakeTracking')).toBe(true);
  });
});

// ─── getUpgradeMessage ────────────────────────────────────────────────────────

describe('getUpgradeMessage', () => {
  it('free plan upgrade message mentions Premium', () => {
    const msg = getUpgradeMessage('free', 'System design');
    expect(msg).toContain('Premium');
  });

  it('free plan upgrade message mentions the feature', () => {
    const msg = getUpgradeMessage('free', 'System design');
    expect(msg).toContain('System design');
  });

  it('premium plan upgrade message mentions Pro', () => {
    const msg = getUpgradeMessage('premium', 'Company prep');
    expect(msg).toContain('Pro');
  });

  it('pro plan message says feature is not available', () => {
    const msg = getUpgradeMessage('pro', 'Some feature');
    expect(msg).toContain('not available');
  });

  it('pro plan message does not suggest upgrading', () => {
    const msg = getUpgradeMessage('pro', 'Some feature');
    expect(msg.toLowerCase()).not.toContain('upgrade');
  });
});

// ─── getTrialDays ─────────────────────────────────────────────────────────────

describe('getTrialDays', () => {
  it('returns 7', () => {
    expect(getTrialDays()).toBe(7);
  });

  it('returns a positive integer', () => {
    const days = getTrialDays();
    expect(Number.isInteger(days)).toBe(true);
    expect(days).toBeGreaterThan(0);
  });
});
