import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PricingPage from '../PricingPage';

const BASE_PROPS = {
  currentPlan: 'free' as const,
  onCheckout: vi.fn(),
  onEnterApp: vi.fn(),
  isAuthenticated: false,
};

beforeEach(() => {
  BASE_PROPS.onCheckout.mockClear();
  BASE_PROPS.onEnterApp.mockClear();
});

describe('PricingPage', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<PricingPage {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows page title', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText('Simple, transparent pricing')).toBeDefined();
    });

    it('shows page subtitle', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText(/Start free\. Upgrade/)).toBeDefined();
    });

    it('shows plan names Free, Premium, Pro', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText('Free')).toBeDefined();
      expect(screen.getByText('Premium')).toBeDefined();
      expect(screen.getByText('Pro')).toBeDefined();
    });

    it('shows MOST POPULAR badge on Premium', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText('MOST POPULAR')).toBeDefined();
    });
  });

  describe('interval toggle', () => {
    it('Monthly button has active class by default', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText('Monthly').closest('button')!.classList.contains('pricing-toggle__btn--active')).toBe(true);
    });

    it('Monthly button has aria-pressed=true by default', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText('Monthly').closest('button')!.getAttribute('aria-pressed')).toBe('true');
    });

    it('Yearly button does not have active class by default', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText('Yearly').closest('button')!.classList.contains('pricing-toggle__btn--active')).toBe(false);
    });

    it('clicking Yearly activates it', () => {
      render(<PricingPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Yearly').closest('button')!);
      expect(screen.getByText('Yearly').closest('button')!.classList.contains('pricing-toggle__btn--active')).toBe(true);
    });

    it('clicking Yearly deactivates Monthly', () => {
      render(<PricingPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Yearly').closest('button')!);
      expect(screen.getByText('Monthly').closest('button')!.classList.contains('pricing-toggle__btn--active')).toBe(false);
    });

    it('shows Save ~35% on Yearly button', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText('Save ~35%')).toBeDefined();
    });
  });

  describe('plan pricing display', () => {
    it('shows $0 for Free plan', () => {
      render(<PricingPage {...BASE_PROPS} />);
      const amounts = screen.getAllByText('$0');
      expect(amounts.length).toBeGreaterThan(0);
    });

    it('shows $19 for Premium monthly', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText('$19')).toBeDefined();
    });

    it('shows /mo period for monthly interval', () => {
      render(<PricingPage {...BASE_PROPS} />);
      const periods = screen.getAllByText('/mo');
      expect(periods.length).toBe(2); // premium + pro
    });

    it('shows $149 for Premium yearly', () => {
      render(<PricingPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Yearly').closest('button')!);
      expect(screen.getByText('$149')).toBeDefined();
    });

    it('shows /yr period for yearly interval', () => {
      render(<PricingPage {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Yearly').closest('button')!);
      const periods = screen.getAllByText('/yr');
      expect(periods.length).toBe(2); // premium + pro
    });

    it('shows forever for Free plan', () => {
      render(<PricingPage {...BASE_PROPS} />);
      expect(screen.getByText('forever')).toBeDefined();
    });
  });

  describe('current plan card', () => {
    it('current plan card has --current class', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="premium" />);
      const cards = document.querySelectorAll('.pricing-card');
      const premiumCard = Array.from(cards).find(c => c.querySelector('.pricing-card__name')?.textContent === 'Premium')!;
      expect(premiumCard.classList.contains('pricing-card--current')).toBe(true);
    });

    it('non-current plan cards do not have --current class', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="free" />);
      const cards = document.querySelectorAll('.pricing-card');
      const nonFree = Array.from(cards).filter(c => c.querySelector('.pricing-card__name')?.textContent !== 'Free');
      nonFree.forEach(c => expect(c.classList.contains('pricing-card--current')).toBe(false));
    });
  });

  describe('CTA buttons', () => {
    it('Free plan shows Get Started button', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="premium" />);
      expect(screen.getByText('Get Started')).toBeDefined();
    });

    it('clicking Get Started on free plan calls onEnterApp', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="premium" />);
      fireEvent.click(screen.getByText('Get Started'));
      expect(BASE_PROPS.onEnterApp).toHaveBeenCalledOnce();
    });

    it('shows Current Plan on the current paid plan', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="premium" />);
      expect(screen.getByText('Current Plan')).toBeDefined();
    });

    it('Current Plan button is disabled', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="premium" />);
      expect((screen.getByText('Current Plan') as HTMLButtonElement).disabled).toBe(true);
    });

    it('shows Start 7-Day Trial on non-current paid plan', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="free" />);
      const trialBtns = screen.getAllByText('Start 7-Day Trial');
      expect(trialBtns.length).toBe(2); // premium + pro
    });

    it('clicking Premium trial (monthly) calls onCheckout with monthly priceId', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="free" />);
      // Click the first "Start 7-Day Trial" button (Premium)
      const [premiumBtn] = screen.getAllByText('Start 7-Day Trial');
      fireEvent.click(premiumBtn);
      expect(BASE_PROPS.onCheckout).toHaveBeenCalledWith('price_premium_monthly', 'month');
    });

    it('clicking Premium trial (yearly) calls onCheckout with yearly priceId', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="free" />);
      fireEvent.click(screen.getByText('Yearly').closest('button')!);
      const [premiumBtn] = screen.getAllByText('Start 7-Day Trial');
      fireEvent.click(premiumBtn);
      expect(BASE_PROPS.onCheckout).toHaveBeenCalledWith('price_premium_yearly', 'year');
    });
  });

  describe('trial text', () => {
    it('shows trial text for non-current paid plans', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="free" />);
      const trialTexts = screen.getAllByText(/7-day free trial, cancel anytime/);
      expect(trialTexts.length).toBe(2); // premium + pro
    });

    it('does not show trial text for free plan', () => {
      render(<PricingPage {...BASE_PROPS} currentPlan="free" />);
      // The free card has no trial text
      const cards = document.querySelectorAll('.pricing-card');
      const freeCard = Array.from(cards).find(c => c.querySelector('.pricing-card__name')?.textContent === 'Free')!;
      expect(freeCard.querySelector('.pricing-card__trial')).toBeNull();
    });
  });
});
