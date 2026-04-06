import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InterviewLauncher from '../InterviewLauncher';

vi.mock('lucide-react', () => ({
  X:         () => <span data-testid="icon-x" />,
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
}));

const BASE_PROPS = {
  open: true,
  onClose: vi.fn(),
  onStart: vi.fn(),
};

beforeEach(() => {
  BASE_PROPS.onClose.mockClear();
  BASE_PROPS.onStart.mockClear();
});

describe('InterviewLauncher', () => {
  describe('visibility', () => {
    it('renders nothing when open=false', () => {
      const { container } = render(<InterviewLauncher {...BASE_PROPS} open={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when open=true', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      expect(screen.getByText('Configure New Session')).toBeDefined();
    });
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      expect(() => render(<InterviewLauncher {...BASE_PROPS} />)).not.toThrow();
    });

    it('shows "Select Interview Stage" section header', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      expect(screen.getByText('Select Interview Stage')).toBeDefined();
    });

    it('shows all 5 stage cards', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      expect(screen.getByText('Technical Coding')).toBeDefined();
      expect(screen.getByText('Phone Screen')).toBeDefined();
      expect(screen.getByText('System Design')).toBeDefined();
      expect(screen.getByText('Behavioral')).toBeDefined();
      expect(screen.getByText('Technical Q&A')).toBeDefined();
    });

    it('Start Interview button is disabled initially', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      const startBtn = screen.getByRole('button', { name: /Start Interview/i });
      expect(startBtn.hasAttribute('disabled')).toBe(true);
    });

    it('close button has aria-label "Close interview launcher"', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      expect(screen.getByRole('button', { name: 'Close interview launcher' })).toBeDefined();
    });

    it('clicking close button calls onClose', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByRole('button', { name: 'Close interview launcher' }));
      expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
    });
  });

  describe('Phone Screen stage', () => {
    it('selecting Phone Screen enables Start Interview', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Phone Screen'));
      const startBtn = screen.getByRole('button', { name: /Start Interview/i });
      expect(startBtn.hasAttribute('disabled')).toBe(false);
    });

    it('clicking Start Interview calls onStart with stage=phone', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Phone Screen'));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));
      expect(BASE_PROPS.onStart).toHaveBeenCalledOnce();
      expect(BASE_PROPS.onStart.mock.calls[0][0].stage).toBe('phone');
    });

    it('Start Interview calls onClose', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Phone Screen'));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));
      expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
    });
  });

  describe('Behavioral stage', () => {
    it('selecting Behavioral enables Start Interview', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Behavioral'));
      expect(screen.getByRole('button', { name: /Start Interview/i }).hasAttribute('disabled')).toBe(false);
    });

    it('clicking Start Interview calls onStart with stage=behavioral', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Behavioral'));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));
      expect(BASE_PROPS.onStart.mock.calls[0][0].stage).toBe('behavioral');
    });
  });

  describe('Technical Coding stage — format selection', () => {
    it('selecting Technical Coding shows format section', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      expect(screen.getByText('Coding Format')).toBeDefined();
    });

    it('shows LeetCode Style and Project-Based format cards', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      expect(screen.getByText('LeetCode Style')).toBeDefined();
      expect(screen.getByText('Project-Based')).toBeDefined();
    });

    it('Start Interview stays disabled until format selected', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      expect(screen.getByRole('button', { name: /Start Interview/i }).hasAttribute('disabled')).toBe(true);
    });

    it('selecting Project-Based format enables Start Interview', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      fireEvent.click(screen.getByText('Project-Based'));
      expect(screen.getByRole('button', { name: /Start Interview/i }).hasAttribute('disabled')).toBe(false);
    });

    it('onStart called with stage=technical and format=project', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      fireEvent.click(screen.getByText('Project-Based'));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));
      const config = BASE_PROPS.onStart.mock.calls[0][0];
      expect(config.stage).toBe('technical');
      expect(config.format).toBe('project');
    });

    it('selecting LeetCode format shows Topic & Difficulty section', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      fireEvent.click(screen.getByText('LeetCode Style'));
      expect(screen.getByText('Topic & Difficulty')).toBeDefined();
    });

    it('LeetCode format keeps Start disabled until topic AND difficulty selected', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      fireEvent.click(screen.getByText('LeetCode Style'));
      // Only topic selected — still disabled
      fireEvent.click(screen.getByRole('button', { name: 'Arrays & Hashing' }));
      expect(screen.getByRole('button', { name: /Start Interview/i }).hasAttribute('disabled')).toBe(true);
    });

    it('LeetCode format enables Start when both topic AND difficulty are selected', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      fireEvent.click(screen.getByText('LeetCode Style'));
      fireEvent.click(screen.getByRole('button', { name: 'Arrays & Hashing' }));
      fireEvent.click(screen.getByRole('button', { name: /^Easy$/ }));
      expect(screen.getByRole('button', { name: /Start Interview/i }).hasAttribute('disabled')).toBe(false);
    });

    it('onStart called with topic and difficulty for leetcode format', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      fireEvent.click(screen.getByText('LeetCode Style'));
      fireEvent.click(screen.getByRole('button', { name: 'Arrays & Hashing' }));
      fireEvent.click(screen.getByRole('button', { name: /^Medium$/ }));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));
      const config = BASE_PROPS.onStart.mock.calls[0][0];
      expect(config.stage).toBe('technical');
      expect(config.format).toBe('leetcode');
      expect(config.topic).toBe('Arrays');
      expect(config.difficulty).toBe('Medium');
    });
  });

  describe('Technical Q&A stage — category selection', () => {
    it('selecting Technical Q&A shows Question Category section', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Q&A'));
      expect(screen.getByText('Question Category')).toBeDefined();
    });

    it('shows Mixed category button', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Q&A'));
      expect(screen.getByRole('button', { name: 'Mixed' })).toBeDefined();
    });

    it('selecting Mixed category enables Start Interview', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Q&A'));
      fireEvent.click(screen.getByRole('button', { name: 'Mixed' }));
      expect(screen.getByRole('button', { name: /Start Interview/i }).hasAttribute('disabled')).toBe(false);
    });

    it('onStart called with stage=technical-questions and category=mixed', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Q&A'));
      fireEvent.click(screen.getByRole('button', { name: 'Mixed' }));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));
      const config = BASE_PROPS.onStart.mock.calls[0][0];
      expect(config.stage).toBe('technical-questions');
      expect(config.category).toBe('mixed');
    });

    it('selecting Custom category keeps Start disabled until prompt filled', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Q&A'));
      fireEvent.click(screen.getByRole('button', { name: 'Custom Topic' }));
      expect(screen.getByRole('button', { name: /Start Interview/i }).hasAttribute('disabled')).toBe(true);
    });
  });

  describe('System Design stage', () => {
    it('selecting System Design shows Choose Design Problem section', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('System Design'));
      expect(screen.getByText('Choose Design Problem')).toBeDefined();
    });

    it('shows URL Shortener design problem', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('System Design'));
      expect(screen.getByText('URL Shortener')).toBeDefined();
    });

    it('selecting a design problem enables Start Interview', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('System Design'));
      fireEvent.click(screen.getByText('URL Shortener'));
      expect(screen.getByRole('button', { name: /Start Interview/i }).hasAttribute('disabled')).toBe(false);
    });

    it('onStart called with systemDesignTopic=url-shortener', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('System Design'));
      fireEvent.click(screen.getByText('URL Shortener'));
      fireEvent.click(screen.getByRole('button', { name: /Start Interview/i }));
      const config = BASE_PROPS.onStart.mock.calls[0][0];
      expect(config.stage).toBe('system-design');
      expect(config.systemDesignTopic).toBe('url-shortener');
    });
  });

  describe('Back button', () => {
    it('shows Back button after stage selected', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Phone Screen'));
      expect(screen.getByRole('button', { name: /Back/i })).toBeDefined();
    });

    it('clicking Back resets stage selection', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Phone Screen'));
      fireEvent.click(screen.getByRole('button', { name: /Back/i }));
      // After reset, Start Interview should be disabled again
      expect(screen.getByRole('button', { name: /Start Interview/i }).hasAttribute('disabled')).toBe(true);
    });
  });

  describe('estimated duration', () => {
    it('shows estimated duration after stage selected', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Phone Screen'));
      expect(screen.getByText('Estimated duration')).toBeDefined();
    });

    it('shows ~30 Minutes for Phone Screen', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Phone Screen'));
      expect(screen.getByText('~30 Minutes')).toBeDefined();
    });

    it('shows ~45 Minutes for Technical Coding default', () => {
      render(<InterviewLauncher {...BASE_PROPS} />);
      fireEvent.click(screen.getByText('Technical Coding'));
      expect(screen.getByText('~45 Minutes')).toBeDefined();
    });
  });
});
