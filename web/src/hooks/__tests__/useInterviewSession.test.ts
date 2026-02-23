import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useInterviewSession,
  DEFAULT_PROBLEM,
  DEFAULT_GATE,
  DEFAULT_HINTS,
} from '../useInterviewSession';
import type { CommitmentGateItem, HintLevel, Problem } from '../../types';

// ── Exported Constants ──

describe('exported constants', () => {
  describe('DEFAULT_PROBLEM', () => {
    it('has id "hm-1"', () => {
      expect(DEFAULT_PROBLEM.id).toBe('hm-1');
    });

    it('has title "Two Sum"', () => {
      expect(DEFAULT_PROBLEM.title).toBe('Two Sum');
    });

    it('has difficulty "Easy"', () => {
      expect(DEFAULT_PROBLEM.difficulty).toBe('Easy');
    });

    it('has pattern "HashMap"', () => {
      expect(DEFAULT_PROBLEM.pattern).toBe('HashMap');
    });

    it('has a non-empty description', () => {
      expect(DEFAULT_PROBLEM.description.length).toBeGreaterThan(0);
    });

    it('has at least one example', () => {
      expect(DEFAULT_PROBLEM.examples.length).toBeGreaterThanOrEqual(1);
    });

    it('has constraints array', () => {
      expect(Array.isArray(DEFAULT_PROBLEM.constraints)).toBe(true);
      expect(DEFAULT_PROBLEM.constraints.length).toBeGreaterThan(0);
    });

    it('has starterCode string', () => {
      expect(typeof DEFAULT_PROBLEM.starterCode).toBe('string');
    });

    it('has 3 test cases', () => {
      expect(DEFAULT_PROBLEM.testCases).toHaveLength(3);
    });
  });

  describe('DEFAULT_GATE', () => {
    it('has exactly 5 items', () => {
      expect(DEFAULT_GATE).toHaveLength(5);
    });

    it('all items have completed=false', () => {
      DEFAULT_GATE.forEach((item) => {
        expect(item.completed).toBe(false);
      });
    });

    it('contains the expected gate ids', () => {
      const ids = DEFAULT_GATE.map((item) => item.id);
      expect(ids).toEqual(['constraints', 'pattern', 'approach', 'complexity', 'edges']);
    });

    it('each item has id, label, description, and completed fields', () => {
      DEFAULT_GATE.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('completed');
      });
    });
  });

  describe('DEFAULT_HINTS', () => {
    it('has exactly 3 levels', () => {
      expect(DEFAULT_HINTS).toHaveLength(3);
    });

    it('levels are 1, 2, 3', () => {
      expect(DEFAULT_HINTS.map((h) => h.level)).toEqual([1, 2, 3]);
    });

    it('all hints are unlocked=false', () => {
      DEFAULT_HINTS.forEach((hint) => {
        expect(hint.unlocked).toBe(false);
      });
    });

    it('each hint has label, description, content, and color', () => {
      DEFAULT_HINTS.forEach((hint) => {
        expect(typeof hint.label).toBe('string');
        expect(typeof hint.description).toBe('string');
        expect(typeof hint.content).toBe('string');
        expect(typeof hint.color).toBe('string');
      });
    });
  });
});

// ── Hook Behavior ──

describe('useInterviewSession', () => {
  // ── Default Initialization ──

  describe('default initialization (no params)', () => {
    it('mode defaults to TEACHER', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.mode).toBe('TEACHER');
    });

    it('currentProblem defaults to DEFAULT_PROBLEM', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.currentProblem).toEqual(DEFAULT_PROBLEM);
    });

    it('hintsUsed defaults to 0', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.hintsUsed).toBe(0);
    });

    it('interviewStage defaults to null', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.interviewStage).toBeNull();
    });

    it('interviewCategory defaults to null', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.interviewCategory).toBeNull();
    });

    it('sdTopicId defaults to null', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.sdTopicId).toBeNull();
    });

    it('commitmentGate defaults to DEFAULT_GATE', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.commitmentGate).toEqual(DEFAULT_GATE);
    });

    it('hints defaults to DEFAULT_HINTS', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.hints).toEqual(DEFAULT_HINTS);
    });

    it('hintLadderOpen defaults to false', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.hintLadderOpen).toBe(false);
    });

    it('commitmentGateOpen defaults to false', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.commitmentGateOpen).toBe(false);
    });

    it('reviewRubricOpen defaults to false', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.reviewRubricOpen).toBe(false);
    });

    it('interviewModalOpen defaults to false', () => {
      const { result } = renderHook(() => useInterviewSession());
      expect(result.current.interviewModalOpen).toBe(false);
    });
  });

  // ── Custom Initialization ──

  describe('custom initialization', () => {
    it('accepts custom mode', () => {
      const { result } = renderHook(() => useInterviewSession({ mode: 'INTERVIEWER' }));
      expect(result.current.mode).toBe('INTERVIEWER');
    });

    it('accepts custom currentProblem', () => {
      const custom: Problem = {
        id: 'test-1',
        title: 'Custom Problem',
        difficulty: 'Hard',
        pattern: 'DFS',
        description: 'A test problem',
        examples: ['example'],
        constraints: ['constraint'],
        starterCode: 'function test() {}',
        testCases: [{ input: 'test()', expected: 'true' }],
      };
      const { result } = renderHook(() => useInterviewSession({ currentProblem: custom }));
      expect(result.current.currentProblem).toEqual(custom);
    });

    it('coalesces null currentProblem to DEFAULT_PROBLEM (nullish coalescing)', () => {
      const { result } = renderHook(() => useInterviewSession({ currentProblem: null }));
      // ?? treats null as nullish, so falls through to defaultProblem
      expect(result.current.currentProblem).toEqual(DEFAULT_PROBLEM);
    });

    it('accepts custom interviewStage', () => {
      const { result } = renderHook(() => useInterviewSession({ interviewStage: 'technical' }));
      expect(result.current.interviewStage).toBe('technical');
    });

    it('accepts custom interviewCategory', () => {
      const { result } = renderHook(() =>
        useInterviewSession({ interviewCategory: 'react-frontend' }),
      );
      expect(result.current.interviewCategory).toBe('react-frontend');
    });

    it('accepts custom sdTopicId', () => {
      const { result } = renderHook(() =>
        useInterviewSession({ sdTopicId: 'url-shortener' as any }),
      );
      expect(result.current.sdTopicId).toBe('url-shortener');
    });

    it('accepts custom hintsUsed', () => {
      const { result } = renderHook(() => useInterviewSession({ hintsUsed: 2 }));
      expect(result.current.hintsUsed).toBe(2);
    });

    it('accepts custom commitmentGate', () => {
      const customGate: CommitmentGateItem[] = [
        { id: 'test', label: 'Test', description: 'Test item', completed: true },
      ];
      const { result } = renderHook(() => useInterviewSession({ commitmentGate: customGate }));
      expect(result.current.commitmentGate).toEqual(customGate);
    });

    it('accepts custom hints', () => {
      const customHints: HintLevel[] = [
        { level: 1, label: 'H1', description: 'd1', content: 'c1', unlocked: true, color: 'red' },
        { level: 2, label: 'H2', description: 'd2', content: 'c2', unlocked: false, color: 'blue' },
        { level: 3, label: 'H3', description: 'd3', content: 'c3', unlocked: false, color: 'green' },
      ];
      const { result } = renderHook(() => useInterviewSession({ hints: customHints }));
      expect(result.current.hints).toEqual(customHints);
    });

    it('partial init only overrides provided fields', () => {
      const { result } = renderHook(() => useInterviewSession({ mode: 'REVIEWER' }));
      expect(result.current.mode).toBe('REVIEWER');
      expect(result.current.currentProblem).toEqual(DEFAULT_PROBLEM);
      expect(result.current.hintsUsed).toBe(0);
      expect(result.current.interviewStage).toBeNull();
    });
  });

  // ── Setter Functions ──

  describe('setMode', () => {
    it('changes mode to INTERVIEWER', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setMode('INTERVIEWER'));
      expect(result.current.mode).toBe('INTERVIEWER');
    });

    it('changes mode to REVIEWER', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setMode('REVIEWER'));
      expect(result.current.mode).toBe('REVIEWER');
    });

    it('changes mode back to TEACHER', () => {
      const { result } = renderHook(() => useInterviewSession({ mode: 'INTERVIEWER' }));
      act(() => result.current.setMode('TEACHER'));
      expect(result.current.mode).toBe('TEACHER');
    });
  });

  describe('setCurrentProblem', () => {
    it('changes to a new problem', () => {
      const { result } = renderHook(() => useInterviewSession());
      const newProblem: Problem = {
        id: 'sw-1',
        title: 'Max Subarray',
        difficulty: 'Medium',
        pattern: 'Sliding Window',
        description: 'Find the max subarray sum',
        examples: ['[1,-2,3] => 3'],
        constraints: ['1 <= n'],
        starterCode: 'function maxSub() {}',
        testCases: [{ input: 'maxSub([1])', expected: '1' }],
      };
      act(() => result.current.setCurrentProblem(newProblem));
      expect(result.current.currentProblem).toEqual(newProblem);
    });

    it('sets problem to null', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setCurrentProblem(null));
      expect(result.current.currentProblem).toBeNull();
    });
  });

  describe('setHintsUsed', () => {
    it('updates hints used count', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setHintsUsed(3));
      expect(result.current.hintsUsed).toBe(3);
    });

    it('can set to zero', () => {
      const { result } = renderHook(() => useInterviewSession({ hintsUsed: 2 }));
      act(() => result.current.setHintsUsed(0));
      expect(result.current.hintsUsed).toBe(0);
    });
  });

  describe('setInterviewStage', () => {
    it('sets stage to system-design', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setInterviewStage('system-design'));
      expect(result.current.interviewStage).toBe('system-design');
    });

    it('sets stage to null', () => {
      const { result } = renderHook(() => useInterviewSession({ interviewStage: 'phone' }));
      act(() => result.current.setInterviewStage(null));
      expect(result.current.interviewStage).toBeNull();
    });
  });

  describe('setInterviewCategory', () => {
    it('sets category', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setInterviewCategory('javascript-typescript'));
      expect(result.current.interviewCategory).toBe('javascript-typescript');
    });

    it('sets category to null', () => {
      const { result } = renderHook(() =>
        useInterviewSession({ interviewCategory: 'databases' }),
      );
      act(() => result.current.setInterviewCategory(null));
      expect(result.current.interviewCategory).toBeNull();
    });
  });

  describe('setSdTopicId', () => {
    it('sets topic id', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setSdTopicId('url-shortener' as any));
      expect(result.current.sdTopicId).toBe('url-shortener');
    });

    it('sets topic id to null', () => {
      const { result } = renderHook(() =>
        useInterviewSession({ sdTopicId: 'url-shortener' as any }),
      );
      act(() => result.current.setSdTopicId(null));
      expect(result.current.sdTopicId).toBeNull();
    });
  });

  describe('setCommitmentGate', () => {
    it('updates gate items', () => {
      const { result } = renderHook(() => useInterviewSession());
      const updatedGate = DEFAULT_GATE.map((item, i) =>
        i === 0 ? { ...item, completed: true } : item,
      );
      act(() => result.current.setCommitmentGate(updatedGate));
      expect(result.current.commitmentGate[0].completed).toBe(true);
      expect(result.current.commitmentGate[1].completed).toBe(false);
    });
  });

  describe('setHints', () => {
    it('updates hint items', () => {
      const { result } = renderHook(() => useInterviewSession());
      const updatedHints = DEFAULT_HINTS.map((hint, i) =>
        i === 0 ? { ...hint, unlocked: true } : hint,
      );
      act(() => result.current.setHints(updatedHints));
      expect(result.current.hints[0].unlocked).toBe(true);
      expect(result.current.hints[1].unlocked).toBe(false);
    });
  });

  // ── Modal Toggles ──

  describe('modal toggles', () => {
    it('setHintLadderOpen opens hint ladder', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setHintLadderOpen(true));
      expect(result.current.hintLadderOpen).toBe(true);
    });

    it('setHintLadderOpen closes hint ladder', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setHintLadderOpen(true));
      act(() => result.current.setHintLadderOpen(false));
      expect(result.current.hintLadderOpen).toBe(false);
    });

    it('setCommitmentGateOpen opens commitment gate', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setCommitmentGateOpen(true));
      expect(result.current.commitmentGateOpen).toBe(true);
    });

    it('setCommitmentGateOpen closes commitment gate', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setCommitmentGateOpen(true));
      act(() => result.current.setCommitmentGateOpen(false));
      expect(result.current.commitmentGateOpen).toBe(false);
    });

    it('setReviewRubricOpen opens review rubric', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setReviewRubricOpen(true));
      expect(result.current.reviewRubricOpen).toBe(true);
    });

    it('setReviewRubricOpen closes review rubric', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setReviewRubricOpen(true));
      act(() => result.current.setReviewRubricOpen(false));
      expect(result.current.reviewRubricOpen).toBe(false);
    });

    it('setInterviewModalOpen opens interview modal', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setInterviewModalOpen(true));
      expect(result.current.interviewModalOpen).toBe(true);
    });

    it('setInterviewModalOpen closes interview modal', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setInterviewModalOpen(true));
      act(() => result.current.setInterviewModalOpen(false));
      expect(result.current.interviewModalOpen).toBe(false);
    });
  });

  // ── State Independence ──

  describe('state independence', () => {
    it('changing mode does not affect currentProblem', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setMode('INTERVIEWER'));
      expect(result.current.currentProblem).toEqual(DEFAULT_PROBLEM);
    });

    it('changing mode does not affect hintsUsed', () => {
      const { result } = renderHook(() => useInterviewSession({ hintsUsed: 2 }));
      act(() => result.current.setMode('REVIEWER'));
      expect(result.current.hintsUsed).toBe(2);
    });

    it('changing mode does not affect interviewStage', () => {
      const { result } = renderHook(() => useInterviewSession({ interviewStage: 'phone' }));
      act(() => result.current.setMode('TEACHER'));
      expect(result.current.interviewStage).toBe('phone');
    });

    it('changing currentProblem does not affect mode', () => {
      const { result } = renderHook(() => useInterviewSession({ mode: 'INTERVIEWER' }));
      act(() => result.current.setCurrentProblem(null));
      expect(result.current.mode).toBe('INTERVIEWER');
    });

    it('opening a modal does not affect other modals', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setHintLadderOpen(true));
      expect(result.current.commitmentGateOpen).toBe(false);
      expect(result.current.reviewRubricOpen).toBe(false);
      expect(result.current.interviewModalOpen).toBe(false);
    });

    it('changing interviewStage does not reset commitmentGate', () => {
      const { result } = renderHook(() => useInterviewSession());
      const updatedGate = DEFAULT_GATE.map((item, i) =>
        i === 0 ? { ...item, completed: true } : item,
      );
      act(() => result.current.setCommitmentGate(updatedGate));
      act(() => result.current.setInterviewStage('behavioral'));
      expect(result.current.commitmentGate[0].completed).toBe(true);
    });

    it('changing hints does not affect hintsUsed counter', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setHintsUsed(2));
      const updatedHints = DEFAULT_HINTS.map((h) => ({ ...h, unlocked: true }));
      act(() => result.current.setHints(updatedHints));
      expect(result.current.hintsUsed).toBe(2);
    });
  });

  // ── Edge Cases ──

  describe('edge cases', () => {
    it('setting problem to null then back to a problem works', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setCurrentProblem(null));
      expect(result.current.currentProblem).toBeNull();
      act(() => result.current.setCurrentProblem(DEFAULT_PROBLEM));
      expect(result.current.currentProblem).toEqual(DEFAULT_PROBLEM);
    });

    it('multiple mode changes preserve the last value', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setMode('INTERVIEWER'));
      act(() => result.current.setMode('REVIEWER'));
      act(() => result.current.setMode('TEACHER'));
      expect(result.current.mode).toBe('TEACHER');
    });

    it('all four modals can be open simultaneously', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => {
        result.current.setHintLadderOpen(true);
        result.current.setCommitmentGateOpen(true);
        result.current.setReviewRubricOpen(true);
        result.current.setInterviewModalOpen(true);
      });
      expect(result.current.hintLadderOpen).toBe(true);
      expect(result.current.commitmentGateOpen).toBe(true);
      expect(result.current.reviewRubricOpen).toBe(true);
      expect(result.current.interviewModalOpen).toBe(true);
    });

    it('setting the same mode again does not error', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setMode('TEACHER'));
      expect(result.current.mode).toBe('TEACHER');
    });

    it('setting interviewStage to null when already null works', () => {
      const { result } = renderHook(() => useInterviewSession());
      act(() => result.current.setInterviewStage(null));
      expect(result.current.interviewStage).toBeNull();
    });
  });
});
