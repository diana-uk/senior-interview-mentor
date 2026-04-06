import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Tooltip from '../Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('renders children', () => {
      render(<Tooltip content="Hint text"><button>Hover me</button></Tooltip>);
      expect(screen.getByRole('button', { name: 'Hover me' })).toBeDefined();
    });

    it('tooltip is hidden by default', () => {
      render(<Tooltip content="Hint text"><button>Hover me</button></Tooltip>);
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('renders tooltip-wrapper root element', () => {
      const { container } = render(<Tooltip content="Hint text"><span>child</span></Tooltip>);
      expect(container.querySelector('.tooltip-wrapper')).not.toBeNull();
    });
  });

  describe('mouseenter — show after delay', () => {
    it('tooltip not shown before 300ms delay', () => {
      const { container } = render(<Tooltip content="Hint text"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      vi.advanceTimersByTime(299);
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('tooltip shown after 300ms delay', () => {
      const { container } = render(<Tooltip content="Hint text"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      act(() => { vi.advanceTimersByTime(300); });
      expect(screen.getByRole('tooltip')).toBeDefined();
    });

    it('tooltip shows the content text', () => {
      const { container } = render(<Tooltip content="My hint"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      act(() => { vi.advanceTimersByTime(300); });
      expect(screen.getByText('My hint')).toBeDefined();
    });
  });

  describe('mouseleave — hide immediately', () => {
    it('tooltip hides on mouseleave', () => {
      const { container } = render(<Tooltip content="Hint"><span>child</span></Tooltip>);
      const wrapper = container.querySelector('.tooltip-wrapper')!;
      fireEvent.mouseEnter(wrapper);
      act(() => { vi.advanceTimersByTime(300); });
      expect(screen.getByRole('tooltip')).toBeDefined();
      fireEvent.mouseLeave(wrapper);
      expect(screen.queryByRole('tooltip')).toBeNull();
    });

    it('mouseleave before delay cancels the pending show', () => {
      const { container } = render(<Tooltip content="Hint"><span>child</span></Tooltip>);
      const wrapper = container.querySelector('.tooltip-wrapper')!;
      fireEvent.mouseEnter(wrapper);
      vi.advanceTimersByTime(100);
      fireEvent.mouseLeave(wrapper);
      act(() => { vi.advanceTimersByTime(300); });
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  describe('focus / blur events', () => {
    it('tooltip shown after 300ms on focus', () => {
      const { container } = render(<Tooltip content="Focus hint"><span>child</span></Tooltip>);
      fireEvent.focus(container.querySelector('.tooltip-wrapper')!);
      act(() => { vi.advanceTimersByTime(300); });
      expect(screen.getByRole('tooltip')).toBeDefined();
    });

    it('tooltip hides on blur', () => {
      const { container } = render(<Tooltip content="Focus hint"><span>child</span></Tooltip>);
      const wrapper = container.querySelector('.tooltip-wrapper')!;
      fireEvent.focus(wrapper);
      act(() => { vi.advanceTimersByTime(300); });
      fireEvent.blur(wrapper);
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  describe('position classes', () => {
    it('defaults to tooltip-right class', () => {
      const { container } = render(<Tooltip content="x"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      act(() => { vi.advanceTimersByTime(300); });
      expect(container.querySelector('.tooltip-right')).not.toBeNull();
    });

    it('applies tooltip-top class for position="top"', () => {
      const { container } = render(<Tooltip content="x" position="top"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      act(() => { vi.advanceTimersByTime(300); });
      expect(container.querySelector('.tooltip-top')).not.toBeNull();
    });

    it('applies tooltip-bottom class for position="bottom"', () => {
      const { container } = render(<Tooltip content="x" position="bottom"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      act(() => { vi.advanceTimersByTime(300); });
      expect(container.querySelector('.tooltip-bottom')).not.toBeNull();
    });

    it('applies tooltip-left class for position="left"', () => {
      const { container } = render(<Tooltip content="x" position="left"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      act(() => { vi.advanceTimersByTime(300); });
      expect(container.querySelector('.tooltip-left')).not.toBeNull();
    });

    it('applies tooltip-right class for position="right"', () => {
      const { container } = render(<Tooltip content="x" position="right"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      act(() => { vi.advanceTimersByTime(300); });
      expect(container.querySelector('.tooltip-right')).not.toBeNull();
    });
  });

  describe('role', () => {
    it('visible tooltip has role="tooltip"', () => {
      const { container } = render(<Tooltip content="tip"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      act(() => { vi.advanceTimersByTime(300); });
      expect(screen.getByRole('tooltip')).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('unmounting does not throw (pending timeout cleaned up)', () => {
      const { container, unmount } = render(<Tooltip content="tip"><span>child</span></Tooltip>);
      fireEvent.mouseEnter(container.querySelector('.tooltip-wrapper')!);
      expect(() => { unmount(); vi.advanceTimersByTime(300); }).not.toThrow();
    });
  });
});
