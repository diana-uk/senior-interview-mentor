import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OfflineBanner from '../OfflineBanner';

vi.mock('lucide-react', () => ({
  WifiOff: ({ size, 'aria-hidden': ariaHidden }: { size?: number; 'aria-hidden'?: string }) => (
    <svg data-testid="wifi-off-icon" data-size={size} aria-hidden={ariaHidden} />
  ),
}));

describe('OfflineBanner', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<OfflineBanner />);
    });

    it('displays the offline message text', () => {
      render(<OfflineBanner />);
      expect(screen.getByText(/You're offline/)).toBeDefined();
    });

    it('mentions chat is unavailable', () => {
      render(<OfflineBanner />);
      expect(screen.getByText(/chat is unavailable/)).toBeDefined();
    });

    it('mentions progress is saved locally', () => {
      render(<OfflineBanner />);
      expect(screen.getByText(/Your progress is saved locally/)).toBeDefined();
    });

    it('renders the WifiOff icon', () => {
      render(<OfflineBanner />);
      expect(screen.getByTestId('wifi-off-icon')).toBeDefined();
    });

    it('icon has aria-hidden true', () => {
      render(<OfflineBanner />);
      const icon = screen.getByTestId('wifi-off-icon');
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('accessibility', () => {
    it('has role="status"', () => {
      render(<OfflineBanner />);
      const banner = screen.getByRole('status');
      expect(banner).toBeDefined();
    });

    it('has aria-live="polite"', () => {
      render(<OfflineBanner />);
      const banner = screen.getByRole('status');
      expect(banner.getAttribute('aria-live')).toBe('polite');
    });

    it('has aria-label for screen readers', () => {
      render(<OfflineBanner />);
      const banner = screen.getByRole('status');
      expect(banner.getAttribute('aria-label')).toBe('Offline notification');
    });
  });

  describe('styling', () => {
    it('applies the offline-banner CSS class', () => {
      render(<OfflineBanner />);
      const banner = screen.getByRole('status');
      expect(banner.classList.contains('offline-banner')).toBe(true);
    });
  });
});
