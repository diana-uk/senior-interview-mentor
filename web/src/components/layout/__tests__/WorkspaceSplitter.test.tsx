import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkspaceSplitter from '../WorkspaceSplitter';

const BASE_PROPS = {
  chatWidthPercent: 40,
  isSwapped: false,
  onResize: vi.fn(),
  onCollapseChat: vi.fn(),
  onCollapseEditor: vi.fn(),
  onReset: vi.fn(),
  minPercent: 20,
  maxPercent: 70,
};

beforeEach(() => {
  BASE_PROPS.onResize.mockClear();
  BASE_PROPS.onCollapseChat.mockClear();
  BASE_PROPS.onCollapseEditor.mockClear();
  BASE_PROPS.onReset.mockClear();
});

/** Returns the splitter div (role=separator). */
function getSplitter() {
  return screen.getByRole('separator');
}

describe('WorkspaceSplitter', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<WorkspaceSplitter {...BASE_PROPS} />)).not.toThrow();
    });

    it('renders a role=separator element', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      expect(getSplitter()).toBeDefined();
    });

    it('has aria-orientation="vertical"', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      expect(getSplitter().getAttribute('aria-orientation')).toBe('vertical');
    });

    it('has aria-label for resize', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      expect(getSplitter().getAttribute('aria-label')).toBe('Resize chat and editor panels');
    });

    it('has aria-valuenow reflecting chatWidthPercent', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} chatWidthPercent={40} />);
      expect(getSplitter().getAttribute('aria-valuenow')).toBe('40');
    });

    it('has aria-valuemin reflecting minPercent', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      expect(getSplitter().getAttribute('aria-valuemin')).toBe('20');
    });

    it('has aria-valuemax reflecting maxPercent', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      expect(getSplitter().getAttribute('aria-valuemax')).toBe('70');
    });

    it('is focusable (tabIndex=0)', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      expect(getSplitter().getAttribute('tabindex')).toBe('0');
    });

    it('has splitter-h CSS class', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      expect(getSplitter().classList.contains('splitter-h')).toBe(true);
    });
  });

  describe('keyboard resize', () => {
    it('ArrowRight calls onResize with increased value', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} chatWidthPercent={40} />);
      fireEvent.keyDown(getSplitter(), { key: 'ArrowRight' });
      expect(BASE_PROPS.onResize).toHaveBeenCalledWith(42);
    });

    it('ArrowLeft calls onResize with decreased value', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} chatWidthPercent={40} />);
      fireEvent.keyDown(getSplitter(), { key: 'ArrowLeft' });
      expect(BASE_PROPS.onResize).toHaveBeenCalledWith(38);
    });

    it('ArrowRight clamps to maxPercent', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} chatWidthPercent={70} maxPercent={70} />);
      fireEvent.keyDown(getSplitter(), { key: 'ArrowRight' });
      expect(BASE_PROPS.onResize).toHaveBeenCalledWith(70);
    });

    it('ArrowLeft clamps to minPercent', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} chatWidthPercent={20} minPercent={20} />);
      fireEvent.keyDown(getSplitter(), { key: 'ArrowLeft' });
      expect(BASE_PROPS.onResize).toHaveBeenCalledWith(20);
    });

    it('Home key calls onReset', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      fireEvent.keyDown(getSplitter(), { key: 'Home' });
      expect(BASE_PROPS.onReset).toHaveBeenCalledOnce();
    });

    it('ArrowRight is swapped direction when isSwapped=true', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} chatWidthPercent={40} isSwapped={true} />);
      // isSwapped reverses direction: ArrowRight → -2 → 40-2=38
      fireEvent.keyDown(getSplitter(), { key: 'ArrowRight' });
      expect(BASE_PROPS.onResize).toHaveBeenCalledWith(38);
    });

    it('ArrowLeft is swapped direction when isSwapped=true', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} chatWidthPercent={40} isSwapped={true} />);
      // isSwapped reverses direction: ArrowLeft → +2 → 40+2=42
      fireEvent.keyDown(getSplitter(), { key: 'ArrowLeft' });
      expect(BASE_PROPS.onResize).toHaveBeenCalledWith(42);
    });

    it('unrelated keys do not call any callback', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      fireEvent.keyDown(getSplitter(), { key: 'Enter' });
      expect(BASE_PROPS.onResize).not.toHaveBeenCalled();
      expect(BASE_PROPS.onReset).not.toHaveBeenCalled();
    });
  });

  describe('double-click to reset', () => {
    it('double-clicking the splitter calls onReset', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} />);
      fireEvent.doubleClick(getSplitter());
      expect(BASE_PROPS.onReset).toHaveBeenCalledOnce();
    });
  });

  describe('aria-valuenow updates', () => {
    it('aria-valuenow rounds fractional percent', () => {
      render(<WorkspaceSplitter {...BASE_PROPS} chatWidthPercent={40.7} />);
      expect(getSplitter().getAttribute('aria-valuenow')).toBe('41');
    });
  });
});
