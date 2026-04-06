import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ToastContainer from '../ToastContainer';
import { showToast } from '../../../utils/toast';

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x" />,
  CheckCircle: () => <span data-testid="icon-check-circle" />,
  AlertTriangle: () => <span data-testid="icon-alert-triangle" />,
  AlertCircle: () => <span data-testid="icon-alert-circle" />,
  Info: () => <span data-testid="icon-info" />,
}));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ToastContainer', () => {
  describe('empty state', () => {
    it('renders null when there are no toasts', () => {
      const { container } = render(<ToastContainer />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('showing toasts', () => {
    it('renders toast-container when a toast is added', () => {
      render(<ToastContainer />);
      act(() => { showToast('Hello', 'info', 0); });
      expect(screen.getByText('Hello')).toBeDefined();
    });

    it('renders the toast message text', () => {
      render(<ToastContainer />);
      act(() => { showToast('Something happened', 'success', 0); });
      expect(screen.getByText('Something happened')).toBeDefined();
    });

    it('toast message has toast-message class', () => {
      const { container } = render(<ToastContainer />);
      act(() => { showToast('Msg', 'info', 0); });
      expect(container.querySelector('.toast-message')).not.toBeNull();
    });

    it('renders multiple toasts', () => {
      render(<ToastContainer />);
      act(() => {
        showToast('First', 'info', 0);
        showToast('Second', 'success', 0);
      });
      expect(screen.getByText('First')).toBeDefined();
      expect(screen.getByText('Second')).toBeDefined();
    });

    it('toast container has aria-live="polite"', () => {
      const { container } = render(<ToastContainer />);
      act(() => { showToast('msg', 'info', 0); });
      expect(container.querySelector('[aria-live="polite"]')).not.toBeNull();
    });
  });

  describe('toast types and roles', () => {
    it('success toast has toast-success class and role=status', () => {
      const { container } = render(<ToastContainer />);
      act(() => { showToast('ok', 'success', 0); });
      const toast = container.querySelector('.toast-success');
      expect(toast).not.toBeNull();
      expect(toast?.getAttribute('role')).toBe('status');
    });

    it('info toast has toast-info class and role=status', () => {
      const { container } = render(<ToastContainer />);
      act(() => { showToast('ok', 'info', 0); });
      const toast = container.querySelector('.toast-info');
      expect(toast).not.toBeNull();
      expect(toast?.getAttribute('role')).toBe('status');
    });

    it('warning toast has toast-warning class and role=status', () => {
      const { container } = render(<ToastContainer />);
      act(() => { showToast('ok', 'warning', 0); });
      const toast = container.querySelector('.toast-warning');
      expect(toast).not.toBeNull();
      expect(toast?.getAttribute('role')).toBe('status');
    });

    it('error toast has toast-error class and role=alert', () => {
      const { container } = render(<ToastContainer />);
      act(() => { showToast('err', 'error', 0); });
      const toast = container.querySelector('.toast-error');
      expect(toast).not.toBeNull();
      expect(toast?.getAttribute('role')).toBe('alert');
    });

    it('success toast renders CheckCircle icon', () => {
      render(<ToastContainer />);
      act(() => { showToast('ok', 'success', 0); });
      expect(screen.getByTestId('icon-check-circle')).toBeDefined();
    });

    it('info toast renders Info icon', () => {
      render(<ToastContainer />);
      act(() => { showToast('ok', 'info', 0); });
      expect(screen.getByTestId('icon-info')).toBeDefined();
    });

    it('warning toast renders AlertTriangle icon', () => {
      render(<ToastContainer />);
      act(() => { showToast('ok', 'warning', 0); });
      expect(screen.getByTestId('icon-alert-triangle')).toBeDefined();
    });

    it('error toast renders AlertCircle icon', () => {
      render(<ToastContainer />);
      act(() => { showToast('err', 'error', 0); });
      expect(screen.getByTestId('icon-alert-circle')).toBeDefined();
    });
  });

  describe('dismiss button', () => {
    it('renders a dismiss button', () => {
      render(<ToastContainer />);
      act(() => { showToast('msg', 'info', 0); });
      expect(screen.getByRole('button', { name: /dismiss notification/i })).toBeDefined();
    });

    it('dismiss button has toast-close class', () => {
      const { container } = render(<ToastContainer />);
      act(() => { showToast('msg', 'info', 0); });
      expect(container.querySelector('.toast-close')).not.toBeNull();
    });

    it('clicking dismiss starts exit animation (toast-exit class)', () => {
      const { container } = render(<ToastContainer />);
      act(() => { showToast('msg', 'info', 0); });
      fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));
      expect(container.querySelector('.toast-exit')).not.toBeNull();
    });

    it('toast removed from DOM after 300ms exit animation', () => {
      render(<ToastContainer />);
      act(() => { showToast('bye', 'info', 0); });
      fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));
      act(() => { vi.advanceTimersByTime(300); });
      expect(screen.queryByText('bye')).toBeNull();
    });
  });

  describe('auto-dismiss', () => {
    it('toast auto-removed after specified duration', () => {
      render(<ToastContainer />);
      act(() => { showToast('auto', 'info', 1000); });
      expect(screen.getByText('auto')).toBeDefined();
      act(() => { vi.advanceTimersByTime(1000 + 300); });
      expect(screen.queryByText('auto')).toBeNull();
    });

    it('duration=0 toast persists indefinitely', () => {
      render(<ToastContainer />);
      act(() => { showToast('persist', 'info', 0); });
      act(() => { vi.advanceTimersByTime(10000); });
      expect(screen.getByText('persist')).toBeDefined();
    });
  });
});
