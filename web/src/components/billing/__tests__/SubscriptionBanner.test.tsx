import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SubscriptionBanner from '../SubscriptionBanner';

// ── Mock storage utilities ──

vi.mock('../../../utils/storage.js', () => ({
  safeGetItem: vi.fn(() => null),
  safeSetItem: vi.fn(() => true),
}));

import { safeGetItem, safeSetItem } from '../../../utils/storage.js';

const mockSafeGetItem = safeGetItem as ReturnType<typeof vi.fn>;
const mockSafeSetItem = safeSetItem as ReturnType<typeof vi.fn>;

// ── Helpers ──

const defaultProps = {
  plan: 'free' as const,
  status: 'active' as const,
  currentPeriodEnd: null as string | null,
  onUpgrade: vi.fn(),
};

function renderBanner(overrides: Partial<typeof defaultProps> = {}) {
  return render(<SubscriptionBanner {...defaultProps} {...overrides} />);
}

// ── Tests ──

describe('SubscriptionBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSafeGetItem.mockReturnValue(null);
  });

  // ── Renders nothing for active paid subscriptions ──

  describe('active paid subscriptions', () => {
    it('renders nothing for active premium plan', () => {
      const { container } = renderBanner({ plan: 'premium', status: 'active' });
      expect(container.innerHTML).toBe('');
    });

    it('renders nothing for active pro plan', () => {
      const { container } = renderBanner({ plan: 'pro', status: 'active' });
      expect(container.innerHTML).toBe('');
    });

    it('renders nothing for canceled premium plan (not free, not past_due, not trialing)', () => {
      const { container } = renderBanner({ plan: 'premium', status: 'canceled' });
      expect(container.innerHTML).toBe('');
    });
  });

  // ── Trial banner ──

  describe('trial state', () => {
    it('shows trial banner with days remaining', () => {
      const futureDate = new Date(Date.now() + 5 * 86400000).toISOString();
      renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: futureDate });
      expect(screen.getByText(/day.*left in your free trial/)).toBeDefined();
    });

    it('displays correct days remaining for a 7-day trial', () => {
      const futureDate = new Date(Date.now() + 7 * 86400000).toISOString();
      renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: futureDate });
      expect(screen.getByText(/7 days left in your free trial/)).toBeDefined();
    });

    it('displays correct days remaining for 1 day left', () => {
      // Use a time that is between 0 and 1 day from now (half a day into the future)
      const futureDate = new Date(Date.now() + 0.5 * 86400000).toISOString();
      renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: futureDate });
      expect(screen.getByText('1 day left in your free trial')).toBeDefined();
    });

    it('uses singular "day" for exactly 1 day left', () => {
      const futureDate = new Date(Date.now() + 0.5 * 86400000).toISOString();
      renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: futureDate });
      const text = screen.getByText(/left in your free trial/).textContent!;
      expect(text).toContain('1 day left');
      expect(text).not.toContain('1 days');
    });

    it('uses plural "days" for multiple days left', () => {
      const futureDate = new Date(Date.now() + 3 * 86400000).toISOString();
      renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: futureDate });
      expect(screen.getByText('3 days left in your free trial')).toBeDefined();
    });

    it('shows 0 days when trial ends today (past currentPeriodEnd)', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: pastDate });
      expect(screen.getByText('0 days left in your free trial')).toBeDefined();
    });

    it('applies trial CSS class', () => {
      const futureDate = new Date(Date.now() + 3 * 86400000).toISOString();
      const { container } = renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: futureDate });
      expect(container.querySelector('.subscription-banner--trial')).not.toBeNull();
    });

    it('renders nothing when trialing but no currentPeriodEnd', () => {
      const { container } = renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: null });
      // Falls through to plan === 'premium' which is not 'free', so returns null
      expect(container.innerHTML).toBe('');
    });
  });

  // ── Past due banner ──

  describe('past due state', () => {
    it('shows past_due warning message', () => {
      renderBanner({ plan: 'premium', status: 'past_due' });
      expect(screen.getByText('Payment failed. Update your billing info to keep your plan.')).toBeDefined();
    });

    it('shows "Update Billing" button', () => {
      renderBanner({ plan: 'premium', status: 'past_due' });
      expect(screen.getByText('Update Billing')).toBeDefined();
    });

    it('calls onUpgrade when "Update Billing" button is clicked', () => {
      const onUpgrade = vi.fn();
      renderBanner({ plan: 'premium', status: 'past_due', onUpgrade });
      fireEvent.click(screen.getByText('Update Billing'));
      expect(onUpgrade).toHaveBeenCalledTimes(1);
    });

    it('applies warning CSS class', () => {
      const { container } = renderBanner({ plan: 'premium', status: 'past_due' });
      expect(container.querySelector('.subscription-banner--warning')).not.toBeNull();
    });

    it('shows past_due for free plan too', () => {
      renderBanner({ plan: 'free', status: 'past_due' });
      expect(screen.getByText('Payment failed. Update your billing info to keep your plan.')).toBeDefined();
    });
  });

  // ── Free plan upgrade prompt ──

  describe('free plan upgrade prompt', () => {
    it('shows upgrade prompt for free active users', () => {
      renderBanner({ plan: 'free', status: 'active' });
      expect(screen.getByText(/Upgrade for unlimited AI coaching/)).toBeDefined();
    });

    it('shows "Upgrade" button', () => {
      renderBanner({ plan: 'free', status: 'active' });
      expect(screen.getByText('Upgrade')).toBeDefined();
    });

    it('calls onUpgrade when "Upgrade" button is clicked', () => {
      const onUpgrade = vi.fn();
      renderBanner({ plan: 'free', status: 'active', onUpgrade });
      fireEvent.click(screen.getByText('Upgrade'));
      expect(onUpgrade).toHaveBeenCalledTimes(1);
    });

    it('applies upgrade CSS class', () => {
      const { container } = renderBanner({ plan: 'free', status: 'active' });
      expect(container.querySelector('.subscription-banner--upgrade')).not.toBeNull();
    });

    it('shows dismiss button with aria-label "Dismiss"', () => {
      renderBanner({ plan: 'free', status: 'active' });
      expect(screen.getByLabelText('Dismiss')).toBeDefined();
    });
  });

  // ── Dismiss behavior ──

  describe('dismiss behavior', () => {
    it('hides banner when dismiss button is clicked', () => {
      const { container } = renderBanner({ plan: 'free', status: 'active' });
      expect(container.querySelector('.subscription-banner')).not.toBeNull();

      fireEvent.click(screen.getByLabelText('Dismiss'));
      expect(container.querySelector('.subscription-banner')).toBeNull();
    });

    it('persists dismissal to localStorage via safeSetItem', () => {
      renderBanner({ plan: 'free', status: 'active' });
      fireEvent.click(screen.getByLabelText('Dismiss'));
      expect(mockSafeSetItem).toHaveBeenCalledWith('sim-upgrade-dismissed', '1');
    });

    it('renders nothing initially when previously dismissed', () => {
      mockSafeGetItem.mockReturnValue('1');
      const { container } = renderBanner({ plan: 'free', status: 'active' });
      expect(container.innerHTML).toBe('');
    });

    it('reads dismissal state from safeGetItem on mount', () => {
      mockSafeGetItem.mockReturnValue('1');
      renderBanner({ plan: 'free', status: 'active' });
      expect(mockSafeGetItem).toHaveBeenCalledWith('sim-upgrade-dismissed');
    });

    it('dismissal hides trialing banner too', () => {
      mockSafeGetItem.mockReturnValue('1');
      const futureDate = new Date(Date.now() + 5 * 86400000).toISOString();
      const { container } = renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: futureDate });
      expect(container.innerHTML).toBe('');
    });

    it('dismissal hides past_due banner too', () => {
      mockSafeGetItem.mockReturnValue('1');
      const { container } = renderBanner({ plan: 'premium', status: 'past_due' });
      expect(container.innerHTML).toBe('');
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('trial with exactly 0ms remaining shows 0 days', () => {
      const exactNow = new Date(Date.now()).toISOString();
      renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: exactNow });
      // Math.ceil of 0 or very small negative = 0 due to Math.max(0, ...)
      expect(screen.getByText('0 days left in your free trial')).toBeDefined();
    });

    it('does not show dismiss button on trial banner', () => {
      const futureDate = new Date(Date.now() + 3 * 86400000).toISOString();
      renderBanner({ plan: 'premium', status: 'trialing', currentPeriodEnd: futureDate });
      expect(screen.queryByLabelText('Dismiss')).toBeNull();
    });

    it('does not show dismiss button on past_due banner', () => {
      renderBanner({ plan: 'premium', status: 'past_due' });
      expect(screen.queryByLabelText('Dismiss')).toBeNull();
    });

    it('free + canceled status still shows upgrade prompt', () => {
      renderBanner({ plan: 'free', status: 'canceled' });
      expect(screen.getByText(/Upgrade for unlimited AI coaching/)).toBeDefined();
    });
  });
});
