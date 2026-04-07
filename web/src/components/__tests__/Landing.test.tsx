import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Landing from '../Landing';

const BASE_PROPS = {
  onEnterApp:  vi.fn(),
  onCheckout:  undefined as undefined | ((priceId: string, interval: 'month' | 'year') => void),
  isAuthenticated: false,
};

beforeEach(() => {
  BASE_PROPS.onEnterApp.mockClear();
  BASE_PROPS.onCheckout = undefined;
  BASE_PROPS.isAuthenticated = false;
});

describe('Landing', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<Landing {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows SeniorMentor logo text', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('Senior')).toBeDefined();
      expect(screen.getByText('Mentor')).toBeDefined();
    });
  });

  describe('hero section', () => {
    it('shows hero headline Stop memorizing.', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText(/Stop memorizing\./)).toBeDefined();
    });

    it('shows hero sub-headline Start thinking.', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('Start thinking.')).toBeDefined();
    });

    it('shows hero description text', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText(/An AI senior engineer that coaches you/)).toBeDefined();
    });

    it('shows Start Practicing Free button', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('Start Practicing Free')).toBeDefined();
    });

    it('clicking Start Practicing Free calls onEnterApp', () => {
      render(<Landing {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Start Practicing Free'));
      expect(BASE_PROPS.onEnterApp).toHaveBeenCalledOnce();
    });

    it('shows no signup required note', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText(/No signup required/)).toBeDefined();
    });

    it('shows Open App button in nav', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('Open App')).toBeDefined();
    });

    it('clicking Open App calls onEnterApp', () => {
      render(<Landing {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Open App'));
      expect(BASE_PROPS.onEnterApp).toHaveBeenCalledOnce();
    });
  });

  describe('nav tabs', () => {
    it('shows features, compare, pricing tabs', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('features')).toBeDefined();
      expect(screen.getByText('compare')).toBeDefined();
      expect(screen.getByText('pricing')).toBeDefined();
    });

    it('features tab is active by default (aria-pressed=true)', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('features').getAttribute('aria-pressed')).toBe('true');
    });

    it('clicking compare sets it as active', () => {
      render(<Landing {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('compare'));
      expect(screen.getByText('compare').getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByText('features').getAttribute('aria-pressed')).toBe('false');
    });

    it('clicking pricing sets it as active', () => {
      render(<Landing {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('pricing'));
      expect(screen.getByText('pricing').getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('features tab', () => {
    it('shows AI Senior Engineer Coach feature card', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('AI Senior Engineer Coach')).toBeDefined();
    });

    it('shows all 6 feature card titles', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('AI Senior Engineer Coach')).toBeDefined();
      expect(screen.getByText(/Curated Problems/)).toBeDefined();
      expect(screen.getByText(/System Design Problems/)).toBeDefined();
      expect(screen.getByText(/Behavioral Questions/)).toBeDefined();
      expect(screen.getByText('Adaptive Recommendations')).toBeDefined();
      expect(screen.getByText(/Mock Interviews/)).toBeDefined();
    });

    it('shows How it works heading', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('How it works')).toBeDefined();
    });

    it('shows 4 How it works steps', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText('Pick a problem')).toBeDefined();
      expect(screen.getByText('Think & code')).toBeDefined();
      expect(screen.getByText('Get reviewed')).toBeDefined();
      expect(screen.getByText('Track & repeat')).toBeDefined();
    });
  });

  describe('compare tab', () => {
    beforeEach(() => {
      render(<Landing {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('compare'));
    });

    it('shows Why Senior Mentor wins heading', () => {
      expect(screen.getByText('Why Senior Mentor wins')).toBeDefined();
    });

    it('shows table headers', () => {
      expect(screen.getByText('Platform')).toBeDefined();
      expect(screen.getByText('Problems')).toBeDefined();
      expect(screen.getByText('AI Coaching')).toBeDefined();
      expect(screen.getByText('Price')).toBeDefined();
    });

    it('shows LeetCode row', () => {
      expect(screen.getByText('LeetCode')).toBeDefined();
    });

    it('shows Senior Mentor row', () => {
      expect(screen.getByText('Senior Mentor')).toBeDefined();
    });

    it('shows all 5 platform rows', () => {
      expect(screen.getByText('LeetCode')).toBeDefined();
      expect(screen.getByText('AlgoExpert')).toBeDefined();
      expect(screen.getByText('NeetCode')).toBeDefined();
      expect(screen.getByText('Interviewing.io')).toBeDefined();
      expect(screen.getByText('Senior Mentor')).toBeDefined();
    });
  });

  describe('pricing tab', () => {
    beforeEach(() => {
      render(<Landing {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('pricing'));
    });

    it('shows Simple, transparent pricing heading', () => {
      expect(screen.getByText('Simple, transparent pricing')).toBeDefined();
    });

    it('shows Monthly and Yearly billing toggle buttons', () => {
      expect(screen.getByText('Monthly')).toBeDefined();
      expect(screen.getByText('Yearly')).toBeDefined();
    });

    it('Monthly is active by default (aria-pressed=true)', () => {
      expect(screen.getByText('Monthly').getAttribute('aria-pressed')).toBe('true');
    });

    it('clicking Yearly switches billing interval', () => {
      fireEvent.click(screen.getByText('Yearly'));
      expect(screen.getByText('Yearly').getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByText('Monthly').getAttribute('aria-pressed')).toBe('false');
    });

    it('shows Save ~35% badge on Yearly button', () => {
      expect(screen.getByText('Save ~35%')).toBeDefined();
    });

    it('shows Free, Premium, Pro plan names', () => {
      expect(screen.getByText('Free')).toBeDefined();
      expect(screen.getByText('Premium')).toBeDefined();
      expect(screen.getByText('Pro')).toBeDefined();
    });

    it('shows MOST POPULAR badge for Premium', () => {
      expect(screen.getByText('MOST POPULAR')).toBeDefined();
    });

    it('shows $0 price for Free plan', () => {
      expect(screen.getByText('$0')).toBeDefined();
    });

    it('shows forever period for Free plan', () => {
      expect(screen.getByText('forever')).toBeDefined();
    });

    it('shows /mo period for paid plans in monthly mode', () => {
      const periods = screen.getAllByText('/mo');
      expect(periods.length).toBeGreaterThan(0);
    });

    it('shows /yr period for paid plans in yearly mode', () => {
      fireEvent.click(screen.getByText('Yearly'));
      expect(screen.getAllByText('/yr').length).toBeGreaterThan(0);
    });

    it('Get Started CTA for Free plan calls onEnterApp', () => {
      fireEvent.click(screen.getByText('Get Started'));
      expect(BASE_PROPS.onEnterApp).toHaveBeenCalledOnce();
    });

    it('trial CTA calls onEnterApp when not authenticated', () => {
      // Not authenticated — falls back to onEnterApp
      const trialBtns = screen.getAllByText(/Start.*Trial/);
      fireEvent.click(trialBtns[0]);
      expect(BASE_PROPS.onEnterApp).toHaveBeenCalledOnce();
    });

  });

  describe('pricing checkout', () => {
    it('trial CTA calls onCheckout with priceId when authenticated', () => {
      const onCheckout = vi.fn();
      const { container } = render(
        <Landing onEnterApp={vi.fn()} onCheckout={onCheckout} isAuthenticated={true} />,
      );
      // Navigate to pricing tab in this specific container
      const pricingTab = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent === 'pricing',
      )!;
      fireEvent.click(pricingTab);
      // Click first trial button (Premium plan)
      const trialBtn = Array.from(container.querySelectorAll('button')).find(
        b => /Start.*Trial/.test(b.textContent ?? ''),
      )!;
      fireEvent.click(trialBtn);
      expect(onCheckout).toHaveBeenCalledOnce();
      expect(onCheckout.mock.calls[0][1]).toBe('month');
    });

    it('trial CTA calls onCheckout with yearly priceId when yearly selected', () => {
      const onCheckout = vi.fn();
      const { container } = render(
        <Landing onEnterApp={vi.fn()} onCheckout={onCheckout} isAuthenticated={true} />,
      );
      const pricingTab = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent === 'pricing',
      )!;
      fireEvent.click(pricingTab);
      // Switch to yearly
      const yearlyBtn = Array.from(container.querySelectorAll('button')).find(
        b => b.textContent?.includes('Yearly'),
      )!;
      fireEvent.click(yearlyBtn);
      const trialBtn = Array.from(container.querySelectorAll('button')).find(
        b => /Start.*Trial/.test(b.textContent ?? ''),
      )!;
      fireEvent.click(trialBtn);
      expect(onCheckout).toHaveBeenCalledOnce();
      expect(onCheckout.mock.calls[0][1]).toBe('year');
    });
  });

  describe('footer', () => {
    it('shows footer text', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText(/Built for engineers/)).toBeDefined();
    });

    it('shows Powered by Claude', () => {
      render(<Landing {...BASE_PROPS} />);
      expect(screen.getByText(/Powered by Claude/)).toBeDefined();
    });
  });
});
