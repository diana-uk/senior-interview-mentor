import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SessionHistoryPanel from '../SessionHistoryPanel';
import type { SessionRecord } from '../../../types';

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  Clock: () => <span data-testid="icon-clock" />,
  Target: () => <span data-testid="icon-target" />,
  Lightbulb: () => <span data-testid="icon-lightbulb" />,
}));

// EmptyState uses lucide icon via prop — the Clock mock above handles it
vi.mock('../../ui/EmptyState', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

function makeSession(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: 'sess-1',
    date: '2026-01-15T10:00:00.000Z',
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    mode: 'TEACHER',
    duration: 300,
    hintsUsed: 1,
    score: 3.5,
    patterns: [],
    ...overrides,
  };
}

describe('SessionHistoryPanel', () => {
  describe('empty state', () => {
    it('shows EmptyState when sessions is empty', () => {
      render(<SessionHistoryPanel sessions={[]} />);
      expect(screen.getByTestId('empty-state')).toBeDefined();
    });

    it('empty state title is "No sessions yet"', () => {
      render(<SessionHistoryPanel sessions={[]} />);
      expect(screen.getByText('No sessions yet')).toBeDefined();
    });

    it('shows "0 sessions" count when empty', () => {
      render(<SessionHistoryPanel sessions={[]} />);
      expect(screen.getByText('0 sessions')).toBeDefined();
    });
  });

  describe('session list', () => {
    it('renders session count text', () => {
      render(<SessionHistoryPanel sessions={[makeSession(), makeSession({ id: 's2' })]} />);
      expect(screen.getByText('2 sessions')).toBeDefined();
    });

    it('singular "session" for count of 1', () => {
      render(<SessionHistoryPanel sessions={[makeSession()]} />);
      expect(screen.getByText('1 session')).toBeDefined();
    });

    it('renders a card for each session', () => {
      const sessions = [
        makeSession({ id: 's1', problemTitle: 'Two Sum' }),
        makeSession({ id: 's2', problemTitle: 'Binary Search' }),
      ];
      render(<SessionHistoryPanel sessions={sessions} />);
      expect(screen.getByText('Two Sum')).toBeDefined();
      expect(screen.getByText('Binary Search')).toBeDefined();
    });

    it('shows mode label in list', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ mode: 'TEACHER' })]} />);
      expect(screen.getByText('Teacher')).toBeDefined();
    });

    it('shows INTERVIEWER mode label as "Interview"', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ mode: 'INTERVIEWER' })]} />);
      expect(screen.getByText('Interview')).toBeDefined();
    });

    it('shows REVIEWER mode label as "Review"', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ mode: 'REVIEWER' })]} />);
      expect(screen.getByText('Review')).toBeDefined();
    });

    it('does not show EmptyState when sessions exist', () => {
      render(<SessionHistoryPanel sessions={[makeSession()]} />);
      expect(screen.queryByTestId('empty-state')).toBeNull();
    });
  });

  describe('detail view — navigation', () => {
    it('clicking a session card shows detail view', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ problemTitle: 'Two Sum' })]} />);
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      // Detail view shows problem title prominently
      expect(screen.getAllByText('Two Sum').length).toBeGreaterThan(0);
    });

    it('detail view shows Back button', () => {
      render(<SessionHistoryPanel sessions={[makeSession()]} />);
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      expect(screen.getByRole('button', { name: /back/i })).toBeDefined();
    });

    it('clicking Back returns to list view', () => {
      render(<SessionHistoryPanel sessions={[makeSession()]} />);
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByText('1 session')).toBeDefined();
    });
  });

  describe('detail view — content', () => {
    it('shows mode in detail', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ mode: 'INTERVIEWER' })]} />);
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      expect(screen.getByText('Interview')).toBeDefined();
    });

    it('shows hints used in detail', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ hintsUsed: 3 })]} />);
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      expect(screen.getByText('3')).toBeDefined();
    });

    it('shows formatted score in detail', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ score: 3.5 })]} />);
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      expect(screen.getByText('3.5/4')).toBeDefined();
    });

    it('shows "—" for null score in detail', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ score: null })]} />);
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      // "—" appears for score
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('shows patterns as chips when present', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ patterns: ['HashMap', 'Two Pointers'] })]} />);
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      expect(screen.getByText('HashMap')).toBeDefined();
      expect(screen.getByText('Two Pointers')).toBeDefined();
    });
  });

  describe('Go to Problem button', () => {
    it('shows Go to Problem button when problemId and onResumeSession are present', () => {
      render(
        <SessionHistoryPanel
          sessions={[makeSession({ problemId: 'two-sum' })]}
          onResumeSession={vi.fn()}
        />,
      );
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      expect(screen.getByRole('button', { name: /go to problem/i })).toBeDefined();
    });

    it('does not show Go to Problem when onResumeSession is absent', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ problemId: 'two-sum' })]} />);
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      expect(screen.queryByRole('button', { name: /go to problem/i })).toBeNull();
    });

    it('calls onResumeSession with problemId on click', () => {
      const onResumeSession = vi.fn();
      render(
        <SessionHistoryPanel
          sessions={[makeSession({ problemId: 'two-sum' })]}
          onResumeSession={onResumeSession}
        />,
      );
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      fireEvent.click(screen.getByRole('button', { name: /go to problem/i }));
      expect(onResumeSession).toHaveBeenCalledWith('two-sum');
    });

    it('returns to list view after clicking Go to Problem', () => {
      const onResumeSession = vi.fn();
      render(
        <SessionHistoryPanel
          sessions={[makeSession({ problemId: 'two-sum' })]}
          onResumeSession={onResumeSession}
        />,
      );
      fireEvent.click(screen.getByText('Two Sum').closest('button')!);
      fireEvent.click(screen.getByRole('button', { name: /go to problem/i }));
      expect(screen.getByText('1 session')).toBeDefined();
    });
  });

  describe('formatDuration', () => {
    it('shows "—" for 0 seconds', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ duration: 0 })]} />);
      // "—" should appear in the duration chip
      expect(screen.getByText('—')).toBeDefined();
    });

    it('shows seconds-only format for < 60s', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ duration: 45 })]} />);
      expect(screen.getByText('45s')).toBeDefined();
    });

    it('shows minutes format for >= 60s', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ duration: 90 })]} />);
      expect(screen.getByText('1m 30s')).toBeDefined();
    });
  });

  describe('hint chip', () => {
    it('shows hint chip when hintsUsed > 0', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ hintsUsed: 2 })]} />);
      expect(screen.getByText('2 hints')).toBeDefined();
    });

    it('singular "hint" when hintsUsed is 1', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ hintsUsed: 1 })]} />);
      expect(screen.getByText('1 hint')).toBeDefined();
    });

    it('no hint chip when hintsUsed is 0', () => {
      render(<SessionHistoryPanel sessions={[makeSession({ hintsUsed: 0 })]} />);
      expect(screen.queryByText(/hint/)).toBeNull();
    });
  });
});
