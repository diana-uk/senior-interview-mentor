import { useState, useMemo } from 'react';
import type { PlanId } from '../../config/tiers';

interface SubscriptionBannerProps {
  plan: PlanId;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string | null;
  onUpgrade: () => void;
}

export default function SubscriptionBanner({ plan, status, currentPeriodEnd, onUpgrade }: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('sim-upgrade-dismissed') === '1'
  );

  const [mountTime] = useState(() => Date.now());
  const daysLeft = useMemo(() => {
    if (status !== 'trialing' || !currentPeriodEnd) return 0;
    return Math.max(0, Math.ceil((new Date(currentPeriodEnd).getTime() - mountTime) / 86400000));
  }, [status, currentPeriodEnd, mountTime]);

  if (dismissed) return null;

  // Show trial countdown
  if (status === 'trialing' && currentPeriodEnd) {
    return (
      <div className="subscription-banner subscription-banner--trial">
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>schedule</span>
        <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your free trial</span>
      </div>
    );
  }

  // Show past_due warning
  if (status === 'past_due') {
    return (
      <div className="subscription-banner subscription-banner--warning">
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>warning</span>
        <span>Payment failed. Update your billing info to keep your plan.</span>
        <button className="btn btn-sm btn-primary" onClick={onUpgrade}>Update Billing</button>
      </div>
    );
  }

  // Show upgrade prompt for free users
  if (plan === 'free') {
    return (
      <div className="subscription-banner subscription-banner--upgrade">
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>rocket_launch</span>
        <span>Upgrade for unlimited AI coaching, system design, and mock interviews</span>
        <button className="btn btn-sm btn-primary" onClick={onUpgrade}>Upgrade</button>
        <button
          className="subscription-banner__dismiss"
          onClick={() => {
            localStorage.setItem('sim-upgrade-dismissed', '1');
            setDismissed(true);
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    );
  }

  return null;
}
