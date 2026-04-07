import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemDesignEditor from '../SystemDesignEditor';

vi.mock('lucide-react', () => ({
  ChevronDown:  () => <span data-testid="icon-chevron-down" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Send:         () => <span data-testid="icon-send" />,
}));

const BASE_PROPS = {
  value: '',
  onChange: vi.fn(),
  topicId: 'url-shortener' as const,
  onSubmitSection: undefined as undefined | ((title: string, content: string) => void),
};

beforeEach(() => {
  BASE_PROPS.onChange.mockClear();
  BASE_PROPS.onSubmitSection = undefined;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SystemDesignEditor', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<SystemDesignEditor {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows System Design Workspace title', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      expect(screen.getByText('System Design Workspace')).toBeDefined();
    });

    it('shows subtitle text', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      expect(screen.getByText(/Fill out each section below/)).toBeDefined();
    });

    it('shows 0/6 sections progress initially', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      expect(screen.getByText('0/6 sections')).toBeDefined();
    });
  });

  describe('section headers', () => {
    const SECTION_TITLES = [
      'Requirements & Scope',
      'API Design',
      'Data Model & Storage',
      'High-Level Architecture',
      'Deep Dives & Bottlenecks',
      'Scaling & Reliability',
    ];

    SECTION_TITLES.forEach((title) => {
      it(`shows ${title} section title`, () => {
        render(<SystemDesignEditor {...BASE_PROPS} />);
        expect(screen.getByText(title)).toBeDefined();
      });
    });
  });

  describe('locked/unlocked sections', () => {
    it('first section (Requirements) is unlocked — shows textarea', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      // Should have at least one textarea visible
      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    });

    it('sections after empty Requirements are locked — show badge', () => {
      render(<SystemDesignEditor {...BASE_PROPS} value="" />);
      expect(screen.getAllByText('Complete previous section').length).toBeGreaterThan(0);
    });

    it('5 sections are locked when value is empty', () => {
      render(<SystemDesignEditor {...BASE_PROPS} value="" />);
      expect(screen.getAllByText('Complete previous section').length).toBe(5);
    });

    it('subsequent section unlocks when previous has content', () => {
      const value = '## [requirements]\nDefine scale and constraints here\n\n## [api]\n';
      render(<SystemDesignEditor {...BASE_PROPS} value={value} />);
      // API section should be unlocked (not locked)
      const badges = screen.queryAllByText('Complete previous section');
      // With requirements filled, api is unlocked — so only 4 locked
      expect(badges.length).toBe(4);
    });

    it('all sections unlocked when all have content', () => {
      const value = [
        '## [requirements]\nContent',
        '## [api]\nContent',
        '## [data]\nContent',
        '## [architecture]\nContent',
        '## [deepdive]\nContent',
        '## [scaling]\nContent',
      ].join('\n\n');
      render(<SystemDesignEditor {...BASE_PROPS} value={value} />);
      expect(screen.queryAllByText('Complete previous section').length).toBe(0);
    });
  });

  describe('section collapse/expand', () => {
    it('section is expanded by default', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      // ChevronDown icon shown when expanded
      expect(screen.getAllByTestId('icon-chevron-down').length).toBeGreaterThan(0);
    });

    it('clicking section header collapses it', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      const headers = document.querySelectorAll('.sd-section-header:not(.sd-section-header-locked)');
      fireEvent.click(headers[0]);
      // After collapsing, ChevronRight should appear
      expect(screen.getAllByTestId('icon-chevron-right').length).toBeGreaterThan(0);
    });

    it('clicking collapsed section re-expands it', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      const header = document.querySelector('.sd-section-header:not(.sd-section-header-locked)')!;
      fireEvent.click(header); // collapse
      fireEvent.click(header); // expand
      expect(screen.getAllByTestId('icon-chevron-down').length).toBeGreaterThan(0);
    });

    it('collapsed section hides textarea', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      const initialCount = screen.getAllByRole('textbox').length;
      const header = document.querySelector('.sd-section-header:not(.sd-section-header-locked)')!;
      fireEvent.click(header); // collapse
      expect(screen.queryAllByRole('textbox').length).toBe(initialCount - 1);
    });
  });

  describe('section content', () => {
    it('shows hint text for Requirements section', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      expect(screen.getByText(/Start here\. Clarify what/)).toBeDefined();
    });

    it('shows filled badge when section has content', () => {
      const value = '## [requirements]\nSome requirements here';
      render(<SystemDesignEditor {...BASE_PROPS} value={value} />);
      expect(screen.getByText('filled')).toBeDefined();
    });

    it('does not show filled badge when section is empty', () => {
      render(<SystemDesignEditor {...BASE_PROPS} value="" />);
      expect(screen.queryByText('filled')).toBeNull();
    });

    it('progress counter updates when value has filled sections', () => {
      const value = '## [requirements]\nContent\n\n## [api]\nContent';
      render(<SystemDesignEditor {...BASE_PROPS} value={value} />);
      expect(screen.getByText('2/6 sections')).toBeDefined();
    });

    it('textarea shows current section content', () => {
      const value = '## [requirements]\nMy requirements text';
      render(<SystemDesignEditor {...BASE_PROPS} value={value} />);
      const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
      expect(textareas[0].value).toBe('My requirements text');
    });
  });

  describe('section input changes', () => {
    it('typing in textarea updates local content immediately', () => {
      render(<SystemDesignEditor {...BASE_PROPS} />);
      const textarea = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'New content' } });
      expect(textarea.value).toBe('New content');
    });
  });

  describe('submit for review', () => {
    it('does not show Submit button when onSubmitSection is not provided', () => {
      render(<SystemDesignEditor {...BASE_PROPS} onSubmitSection={undefined} />);
      expect(screen.queryByText('Submit for Review')).toBeNull();
    });

    it('shows Submit button when onSubmitSection is provided', () => {
      render(<SystemDesignEditor {...BASE_PROPS} onSubmitSection={vi.fn()} />);
      expect(screen.getByText('Submit for Review')).toBeDefined();
    });

    it('Submit button is disabled when section is empty', () => {
      render(<SystemDesignEditor {...BASE_PROPS} onSubmitSection={vi.fn()} />);
      expect((screen.getByText('Submit for Review') as HTMLButtonElement).disabled).toBe(true);
    });

    it('Submit button is enabled when section has content', () => {
      const onSubmit = vi.fn();
      const value = '## [requirements]\nSome requirements';
      render(<SystemDesignEditor {...BASE_PROPS} value={value} onSubmitSection={onSubmit} />);
      // Multiple unlocked sections each have a button; the first (requirements) is enabled
      const btns = screen.getAllByText('Submit for Review') as HTMLButtonElement[];
      expect(btns.some(b => !b.disabled)).toBe(true);
    });

    it('clicking Submit calls onSubmitSection with section title and content', () => {
      const onSubmit = vi.fn();
      const value = '## [requirements]\nMy requirements here';
      render(<SystemDesignEditor {...BASE_PROPS} value={value} onSubmitSection={onSubmit} />);
      // Click the first enabled Submit button (requirements section)
      const btns = screen.getAllByText('Submit for Review') as HTMLButtonElement[];
      const enabledBtn = btns.find(b => !b.disabled)!;
      fireEvent.click(enabledBtn);
      expect(onSubmit).toHaveBeenCalledWith('Requirements & Scope', 'My requirements here');
    });
  });

  describe('topicId placeholders', () => {
    it('shows url-shortener placeholder for requirements textarea', () => {
      render(<SystemDesignEditor {...BASE_PROPS} topicId="url-shortener" />);
      const textarea = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement;
      expect(textarea.placeholder).toContain('Shorten URLs');
    });

    it('shows custom placeholder for unknown topic', () => {
      render(<SystemDesignEditor {...BASE_PROPS} topicId={'custom' as never} />);
      const textarea = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement;
      expect(textarea.placeholder).toContain('Functional:');
    });
  });
});
