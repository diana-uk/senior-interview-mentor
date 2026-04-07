import { describe, it, expect } from 'vitest';
import {
  PLAN_TIERS,
  PLAN_ORDER,
  getPlanLimits,
  isFeatureAvailable,
  getUpgradeMessage,
  getTrialDays,
} from '../tiers';

describe('tiers config', () => {
  describe('PLAN_TIERS structure', () => {
    it('contains all 3 plans', () => {
      expect(PLAN_TIERS.free).toBeDefined();
      expect(PLAN_TIERS.premium).toBeDefined();
      expect(PLAN_TIERS.pro).toBeDefined();
    });

    it('PLAN_ORDER is [free, premium, pro]', () => {
      expect(PLAN_ORDER).toEqual(['free', 'premium', 'pro']);
    });

    it('free plan has $0 pricing', () => {
      expect(PLAN_TIERS.free.pricing.monthly).toBe(0);
      expect(PLAN_TIERS.free.pricing.yearly).toBe(0);
    });

    it('premium plan has monthly price > 0', () => {
      expect(PLAN_TIERS.premium.pricing.monthly).toBeGreaterThan(0);
    });

    it('pro plan has monthly price > premium monthly price', () => {
      expect(PLAN_TIERS.pro.pricing.monthly).toBeGreaterThan(PLAN_TIERS.premium.pricing.monthly);
    });

    it('premium plan has stripePriceIds', () => {
      expect(PLAN_TIERS.premium.stripePriceIds?.monthly).toBeDefined();
      expect(PLAN_TIERS.premium.stripePriceIds?.yearly).toBeDefined();
    });

    it('pro plan has stripePriceIds', () => {
      expect(PLAN_TIERS.pro.stripePriceIds?.monthly).toBeDefined();
      expect(PLAN_TIERS.pro.stripePriceIds?.yearly).toBeDefined();
    });

    it('free plan has no stripePriceIds', () => {
      expect(PLAN_TIERS.free.stripePriceIds).toBeUndefined();
    });
  });

  describe('getTrialDays', () => {
    it('returns 7', () => {
      expect(getTrialDays()).toBe(7);
    });
  });

  describe('getPlanLimits', () => {
    it('returns limits object for free plan', () => {
      const limits = getPlanLimits('free');
      expect(limits).toBeDefined();
      expect(typeof limits.problemsPerDay).toBe('number');
    });

    it('free plan has limited problemsPerDay', () => {
      expect(getPlanLimits('free').problemsPerDay).toBeGreaterThan(0);
    });

    it('premium plan has unlimited problems (-1)', () => {
      expect(getPlanLimits('premium').problemsPerDay).toBe(-1);
    });

    it('pro plan has unlimited problems (-1)', () => {
      expect(getPlanLimits('pro').problemsPerDay).toBe(-1);
    });

    it('free plan does not have systemDesignAccess', () => {
      expect(getPlanLimits('free').systemDesignAccess).toBe(false);
    });

    it('premium plan has systemDesignAccess', () => {
      expect(getPlanLimits('premium').systemDesignAccess).toBe(true);
    });

    it('pro plan has companySpecificPrep', () => {
      expect(getPlanLimits('pro').companySpecificPrep).toBe(true);
    });
  });

  describe('isFeatureAvailable', () => {
    it('returns false for free plan systemDesignAccess (boolean false)', () => {
      expect(isFeatureAvailable('free', 'systemDesignAccess')).toBe(false);
    });

    it('returns true for premium plan systemDesignAccess (boolean true)', () => {
      expect(isFeatureAvailable('premium', 'systemDesignAccess')).toBe(true);
    });

    it('returns true for unlimited numeric limit (-1)', () => {
      // premium has problemsPerDay = -1 (unlimited)
      expect(isFeatureAvailable('premium', 'problemsPerDay')).toBe(true);
    });

    it('returns true for positive numeric limit', () => {
      // free has problemsPerDay > 0
      expect(isFeatureAvailable('free', 'problemsPerDay')).toBe(true);
    });

    it('returns false for zero numeric limit', () => {
      // free plan has mockInterviewsPerDay = 0
      expect(isFeatureAvailable('free', 'mockInterviewsPerDay')).toBe(false);
    });

    it('returns true for pro behavioralCoachAccess', () => {
      expect(isFeatureAvailable('pro', 'behavioralCoachAccess')).toBe(true);
    });
  });

  describe('getUpgradeMessage', () => {
    it('free plan → suggests upgrading to Premium', () => {
      const msg = getUpgradeMessage('free', 'System design workspace');
      expect(msg).toContain('Premium');
      expect(msg).toContain('System design workspace');
    });

    it('premium plan → suggests upgrading to Pro', () => {
      const msg = getUpgradeMessage('premium', 'Advanced analytics');
      expect(msg).toContain('Pro');
      expect(msg).toContain('Advanced analytics');
    });

    it('pro plan → returns not available message (highest tier)', () => {
      const msg = getUpgradeMessage('pro', 'Some feature');
      expect(msg).toContain('not available');
      expect(msg).not.toContain('Upgrade to');
    });

    it('free plan message contains Upgrade to', () => {
      const msg = getUpgradeMessage('free', 'anything');
      expect(msg).toContain('Upgrade to');
    });

    it('premium plan message contains Upgrade to', () => {
      const msg = getUpgradeMessage('premium', 'anything');
      expect(msg).toContain('Upgrade to');
    });
  });
});
