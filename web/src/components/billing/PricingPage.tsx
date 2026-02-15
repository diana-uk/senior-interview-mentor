import { useState } from 'react';
import { PLAN_TIERS, PLAN_ORDER, getTrialDays } from '../../config/tiers';
import type { PlanId } from '../../config/tiers';

interface PricingPageProps {
  currentPlan: PlanId;
  onCheckout: (priceId: string, interval: 'month' | 'year') => void;
  onEnterApp: () => void;
  isAuthenticated: boolean;
}

export default function PricingPage({ currentPlan, onCheckout, onEnterApp }: PricingPageProps) {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const trialDays = getTrialDays();

  function handleCta(planId: PlanId) {
    if (planId === 'free') {
      onEnterApp();
      return;
    }
    const tier = PLAN_TIERS[planId];
    const priceId = tier.stripePriceIds?.[interval === 'month' ? 'monthly' : 'yearly'];
    if (priceId) {
      onCheckout(priceId, interval);
    }
  }

  return (
    <section className="pricing-page">
      <h2 className="pricing-page__title">Simple, transparent pricing</h2>
      <p className="pricing-page__subtitle">
        Start free. Upgrade when you're ready to go all-in.
      </p>

      <div className="pricing-toggle">
        <button
          className={`pricing-toggle__btn ${interval === 'month' ? 'pricing-toggle__btn--active' : ''}`}
          onClick={() => setInterval('month')}
        >
          Monthly
        </button>
        <button
          className={`pricing-toggle__btn ${interval === 'year' ? 'pricing-toggle__btn--active' : ''}`}
          onClick={() => setInterval('year')}
        >
          Yearly
          <span className="pricing-toggle__savings">Save ~35%</span>
        </button>
      </div>

      <div className="pricing-grid">
        {PLAN_ORDER.map((planId) => {
          const tier = PLAN_TIERS[planId];
          const isCurrent = planId === currentPlan;
          const price = interval === 'month' ? tier.pricing.monthly : tier.pricing.yearly;
          const period = planId === 'free' ? 'forever' : interval === 'month' ? '/mo' : '/yr';

          return (
            <div
              key={planId}
              className={`pricing-card ${tier.recommended ? 'pricing-card--popular' : ''} ${isCurrent ? 'pricing-card--current' : ''}`}
            >
              {tier.recommended && (
                <div className="pricing-card__badge">MOST POPULAR</div>
              )}
              <h3 className="pricing-card__name" style={{ color: planId === 'free' ? 'var(--text-muted)' : planId === 'premium' ? 'var(--neon-cyan)' : 'var(--neon-magenta)' }}>
                {tier.name}
              </h3>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">${price}</span>
                <span className="pricing-card__period">{period}</span>
              </div>
              <ul className="pricing-card__features">
                {tier.features.map((f) => (
                  <li key={f} className="pricing-card__feature">
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ color: 'var(--neon-lime)', fontSize: 16 }}>check</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`btn ${tier.recommended ? 'btn-primary' : 'btn-secondary'} pricing-card__cta`}
                onClick={() => handleCta(planId)}
                disabled={isCurrent && planId !== 'free'}
              >
                {isCurrent ? 'Current Plan' : planId === 'free' ? 'Get Started' : `Start ${trialDays}-Day Trial`}
              </button>
              {planId !== 'free' && !isCurrent && (
                <div className="pricing-card__trial">
                  {trialDays}-day free trial, cancel anytime
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
