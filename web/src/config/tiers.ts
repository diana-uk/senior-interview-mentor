// ---------------------------------------------------------------------------
// Subscription tier definitions for Senior Interview Mentor
// SIM-34: Free / Premium / Pro pricing & feature gates
// ---------------------------------------------------------------------------

export type PlanId = 'free' | 'premium' | 'pro';

export interface PlanLimits {
  problemsPerDay: number; // -1 = unlimited
  aiMessagesPerProblem: number; // -1 = unlimited
  mockInterviewsPerDay: number; // -1 = unlimited
  systemDesignAccess: boolean;
  behavioralCoachAccess: boolean;
  mistakeTracking: boolean;
  spacedRepetition: boolean;
  learningPaths: boolean;
  companySpecificPrep: boolean;
  advancedAnalytics: boolean;
  resumeReview: boolean;
  weeklyReports: boolean;
  priorityAI: boolean;
  earlyAccess: boolean;
}

export interface PlanPricing {
  monthly: number; // dollars, 0 for free
  yearly: number; // dollars, 0 for free
  yearlySavings: number; // percentage saved vs monthly
}

export interface PlanTier {
  id: PlanId;
  name: string;
  tagline: string;
  pricing: PlanPricing;
  limits: PlanLimits;
  features: string[]; // marketing feature list
  highlightFeature: string; // the one feature that sells this tier
  recommended: boolean; // show "Most Popular" badge
  stripePriceIds?: {
    monthly: string;
    yearly: string;
  };
}

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

export const PLAN_TIERS: Record<PlanId, PlanTier> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Get started with guided coding practice',
    pricing: {
      monthly: 0,
      yearly: 0,
      yearlySavings: 0,
    },
    limits: {
      problemsPerDay: 5,
      aiMessagesPerProblem: 3,
      mockInterviewsPerDay: 0,
      systemDesignAccess: false,
      behavioralCoachAccess: false,
      mistakeTracking: false,
      spacedRepetition: false,
      learningPaths: false,
      companySpecificPrep: false,
      advancedAnalytics: false,
      resumeReview: false,
      weeklyReports: false,
      priorityAI: false,
      earlyAccess: false,
    },
    features: [
      '5 problems per day',
      'AI coaching (3 messages/problem)',
      'Basic progress tracking',
      'Blind 75 problem list',
    ],
    highlightFeature: 'AI coaching (3 messages/problem)',
    recommended: false,
  },

  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'Unlimited practice with full AI coaching',
    pricing: {
      monthly: 19,
      yearly: 149,
      yearlySavings: Math.round((1 - 149 / (19 * 12)) * 100), // ~35%
    },
    limits: {
      problemsPerDay: -1,
      aiMessagesPerProblem: -1,
      mockInterviewsPerDay: -1,
      systemDesignAccess: true,
      behavioralCoachAccess: true,
      mistakeTracking: true,
      spacedRepetition: true,
      learningPaths: true,
      companySpecificPrep: false,
      advancedAnalytics: false,
      resumeReview: false,
      weeklyReports: false,
      priorityAI: true,
      earlyAccess: false,
    },
    features: [
      'Unlimited problems & AI coaching',
      'All learning paths',
      'Unlimited mock interviews',
      'Mistake tracking & spaced repetition',
      'System design workspace',
      'Behavioral interview coach',
      'Priority AI response speed',
    ],
    highlightFeature: 'Unlimited problems & AI coaching',
    recommended: true,
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Everything you need to land a senior role',
    pricing: {
      monthly: 29,
      yearly: 229,
      yearlySavings: Math.round((1 - 229 / (29 * 12)) * 100), // ~34%
    },
    limits: {
      problemsPerDay: -1,
      aiMessagesPerProblem: -1,
      mockInterviewsPerDay: -1,
      systemDesignAccess: true,
      behavioralCoachAccess: true,
      mistakeTracking: true,
      spacedRepetition: true,
      learningPaths: true,
      companySpecificPrep: true,
      advancedAnalytics: true,
      resumeReview: true,
      weeklyReports: true,
      priorityAI: true,
      earlyAccess: true,
    },
    features: [
      'Everything in Premium',
      'Company-specific prep paths',
      'Advanced analytics & reports',
      'AI-powered resume review',
      'Weekly progress reports via email',
      'Early access to new features',
    ],
    highlightFeature: 'Company-specific prep paths',
    recommended: false,
  },
};

/** Display ordering for pricing pages and plan selectors. */
export const PLAN_ORDER: PlanId[] = ['free', 'premium', 'pro'];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Return the limits object for a given plan. */
export function getPlanLimits(planId: PlanId): PlanLimits {
  return PLAN_TIERS[planId].limits;
}

/**
 * Check whether a boolean feature flag is enabled for a plan.
 * For numeric limits (problemsPerDay, etc.) this returns `true` when the
 * value is non-zero (i.e. -1 for unlimited also counts as available).
 */
export function isFeatureAvailable(
  planId: PlanId,
  feature: keyof PlanLimits,
): boolean {
  const value = PLAN_TIERS[planId].limits[feature];
  if (typeof value === 'boolean') {
    return value;
  }
  // Numeric limit: available when not zero
  return value !== 0;
}

/**
 * Return a user-facing upgrade message when a feature is gated.
 * Example: "Upgrade to Premium to unlock System design workspace"
 */
export function getUpgradeMessage(planId: PlanId, feature: string): string {
  if (planId === 'pro') {
    // Already on the highest tier
    return `${feature} is not available on your current plan.`;
  }

  const targetPlan: PlanId = planId === 'free' ? 'premium' : 'pro';
  const targetName = PLAN_TIERS[targetPlan].name;

  return `Upgrade to ${targetName} to unlock ${feature}`;
}

/** Number of days for the free trial period. */
export function getTrialDays(): number {
  return 7;
}
