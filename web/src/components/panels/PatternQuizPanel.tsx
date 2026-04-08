import { useState, useCallback, useMemo } from 'react';
import { CheckCircle, XCircle, SkipForward, Play, Brain } from 'lucide-react';
import { usePatternQuiz } from '../../hooks/usePatternQuiz';
import { allFullProblems } from '../../data/problems';
import type { PatternName } from '../../types';
import { pickRandom, buildChoices, ALL_QUIZ_PATTERNS } from '../../utils/quizUtils.js';

const ALL_PATTERNS = ALL_QUIZ_PATTERNS;

interface PatternQuizPanelProps {
  onSelectProblem: (id: string) => void;
}

const PATTERN_HINTS: Partial<Record<PatternName, string>> = {
  'Sliding Window': 'Maintains a window of elements that expands/contracts to meet constraints.',
  'Two Pointers': 'Uses two indices moving toward each other or in the same direction.',
  'HashMap': 'Trades space for O(1) lookups to avoid nested loops.',
  'Binary Search': 'Eliminates half the search space each step — works on sorted data or answer-space.',
  'BFS/DFS': 'Explores graphs/trees level-by-level (BFS) or depth-first (DFS) to find paths or connected regions.',
  'Dynamic Programming': 'Breaks problem into overlapping subproblems and caches results.',
  'Heap': 'Maintains a sorted top-k or streaming median efficiently.',
  'Intervals': 'Sorts by start time and merges/processes overlapping ranges.',
  'Trees': 'Recursively processes tree nodes, often using DFS traversal.',
  'Backtracking': 'Explores all possibilities and prunes branches that violate constraints.',
  'Greedy': 'Makes the locally optimal choice at each step, hoping for global optimum.',
  'Two Pointers': 'Uses two indices moving in tandem — common for sorted arrays and palindromes.',
  'Topological Sort': 'Orders nodes in a DAG so each node appears before its dependents.',
  'Union-Find': 'Efficiently groups elements and queries connectivity.',
  'Prefix Sum': 'Precomputes cumulative sums for O(1) range queries.',
};

type QuizState = 'answering' | 'correct' | 'wrong';

export default function PatternQuizPanel({ onSelectProblem }: PatternQuizPanelProps) {
  const { scores, recordAttempt, getAccuracy } = usePatternQuiz();

  const pickProblem = useCallback(() => {
    const idx = Math.floor(Math.random() * allFullProblems.length);
    return allFullProblems[idx];
  }, []);

  const [problem, setProblem] = useState(() => pickProblem());
  const [choices, setChoices] = useState<PatternName[]>(() => buildChoices(problem.pattern as PatternName));
  const [state, setState] = useState<QuizState>('answering');
  const [selected, setSelected] = useState<PatternName | null>(null);
  const [firstTry, setFirstTry] = useState(true);

  const correctPattern = problem.pattern as PatternName;

  const totalAnswered = useMemo(
    () => Object.values(scores).reduce((s, v) => s + (v?.total ?? 0), 0),
    [scores],
  );
  const totalCorrect = useMemo(
    () => Object.values(scores).reduce((s, v) => s + (v?.correct ?? 0), 0),
    [scores],
  );

  function nextProblem() {
    const next = pickProblem();
    setProblem(next);
    setChoices(buildChoices(next.pattern as PatternName));
    setState('answering');
    setSelected(null);
    setFirstTry(true);
  }

  function handleSelect(pattern: PatternName) {
    if (state !== 'answering') return;
    setSelected(pattern);
    if (pattern === correctPattern) {
      recordAttempt(correctPattern, firstTry);
      setState('correct');
    } else {
      if (firstTry) {
        setFirstTry(false);
        recordAttempt(correctPattern, false);
      }
      setState('wrong');
    }
  }

  function handleTryAgain() {
    setSelected(null);
    setState('answering');
  }

  // Truncate description for display
  const shortDesc = problem.description.replace(/`/g, '').slice(0, 280);
  const hint = PATTERN_HINTS[correctPattern];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header with score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Brain size={14} color="var(--neon-cyan)" aria-hidden="true" />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pattern Quiz</span>
        </div>
        {totalAnswered > 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {totalCorrect}/{totalAnswered} correct
          </span>
        )}
      </div>

      {/* Problem card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 8, paddingBottom: 8 }}>
          <span className="card-title" style={{ fontSize: 13 }}>{problem.title}</span>
          <span className={`badge badge-${problem.difficulty.toLowerCase()}`} style={{ fontSize: 9 }}>
            {problem.difficulty}
          </span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {shortDesc}{problem.description.length > 280 ? '…' : ''}
          </p>
        </div>
      </div>

      {/* Question */}
      <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
        Which pattern best solves this problem?
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {choices.map((pattern) => {
          const isCorrect = pattern === correctPattern;
          const isSelected = pattern === selected;
          let bg = 'var(--bg-raised)';
          let border = 'var(--border-default)';
          let color = 'var(--text-primary)';

          if (state !== 'answering') {
            if (isCorrect) {
              bg = 'rgba(0,255,136,0.08)';
              border = 'var(--neon-lime)';
              color = 'var(--neon-lime)';
            } else if (isSelected && !isCorrect) {
              bg = 'rgba(255,68,68,0.08)';
              border = 'var(--neon-red)';
              color = 'var(--neon-red)';
            }
          }

          return (
            <button
              key={pattern}
              type="button"
              onClick={() => handleSelect(pattern)}
              disabled={state !== 'answering'}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 6,
                border: `1px solid ${border}`, background: bg, color,
                cursor: state === 'answering' ? 'pointer' : 'default',
                fontSize: 12, fontWeight: 500, textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              {state !== 'answering' && isCorrect && <CheckCircle size={13} aria-hidden="true" />}
              {state !== 'answering' && isSelected && !isCorrect && <XCircle size={13} aria-hidden="true" />}
              {(state === 'answering' || (!isCorrect && !isSelected)) && (
                <span style={{ width: 13, display: 'inline-block' }} />
              )}
              {pattern}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {state === 'correct' && (
        <div style={{ padding: '10px 12px', borderRadius: 6, background: 'rgba(0,255,136,0.06)', border: '1px solid var(--neon-lime)' }}>
          <div style={{ fontSize: 12, color: 'var(--neon-lime)', fontWeight: 600, marginBottom: 4 }}>
            Correct! {firstTry ? '(+2 pts)' : '(+1 pt)'}
          </div>
          {hint && (
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {hint}
            </p>
          )}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onSelectProblem(problem.id)}
              style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Play size={10} aria-hidden="true" />
              Start Solving
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={nextProblem}
              style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <SkipForward size={10} aria-hidden="true" />
              Next Problem
            </button>
          </div>
        </div>
      )}

      {state === 'wrong' && (
        <div style={{ padding: '10px 12px', borderRadius: 6, background: 'rgba(255,68,68,0.06)', border: '1px solid var(--neon-red)' }}>
          <div style={{ fontSize: 12, color: 'var(--neon-red)', fontWeight: 600, marginBottom: 4 }}>
            Not quite — try again!
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Think about the core constraint and what data structure or technique helps you avoid redundant work.
          </p>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTryAgain}
              style={{ fontSize: 11 }}
            >
              Try Again
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={nextProblem}
              style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <SkipForward size={10} aria-hidden="true" />
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Pattern accuracy stats */}
      {Object.keys(scores).length > 0 && (
        <div className="card" style={{ marginTop: 4 }}>
          <div className="card-header" style={{ marginBottom: 6, paddingBottom: 6 }}>
            <span className="card-title" style={{ fontSize: 11 }}>Your Pattern Accuracy</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(Object.entries(scores) as [PatternName, { correct: number; total: number }][])
              .filter(([, s]) => s.total > 0)
              .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
              .slice(0, 5)
              .map(([pattern, s]) => {
                const pct = Math.round((s.correct / s.total) * 100);
                return (
                  <div key={pattern} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 10, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pattern}
                    </span>
                    <div style={{ width: 50, height: 3, background: 'var(--bg-overlay)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: pct >= 70 ? 'var(--neon-lime)' : pct >= 40 ? 'var(--neon-amber)' : 'var(--neon-red)',
                        borderRadius: 2,
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
