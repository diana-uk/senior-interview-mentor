import { useState } from 'react';
import type { Difficulty } from '../../types';

interface PriorityArea {
  id: string;
  icon: string;
  name: string;
  rubricScore: number;
  color: string;
  spacedRepStatus: string;
  progressWidth: number;
  isUrgent: boolean;
}

interface MistakeRow {
  id: string;
  problemName: string;
  coreMistake: string;
  highlightedText: string;
  difficulty: Difficulty;
  lastAttempt: string;
}

interface MistakesDashboardProps {
  onNavigate?: (panel: string) => void;
  activeNav?: string;
  priorityAreas?: PriorityArea[];
  mistakes?: MistakeRow[];
  onRetry?: (id: string) => void;
}

const defaultPriorityAreas: PriorityArea[] = [
  {
    id: 'dp',
    icon: 'dynamic_form',
    name: 'Dynamic Programming',
    rubricScore: 42,
    color: 'var(--neon-amber)',
    spacedRepStatus: 'Due in 2 days',
    progressWidth: 80,
    isUrgent: false,
  },
  {
    id: 'graphs',
    icon: 'account_tree',
    name: 'Graphs (DFS/BFS)',
    rubricScore: 58,
    color: 'var(--neon-purple)',
    spacedRepStatus: 'Due Today',
    progressWidth: 100,
    isUrgent: true,
  },
  {
    id: 'sliding',
    icon: 'rebase_edit',
    name: 'Sliding Window',
    rubricScore: 65,
    color: 'var(--neon-cyan)',
    spacedRepStatus: 'Due in 5 days',
    progressWidth: 30,
    isUrgent: false,
  },
  {
    id: 'heap',
    icon: 'heap_snapshot_thumbnail',
    name: 'Heap / Priority Queue',
    rubricScore: 79,
    color: 'var(--neon-lime)',
    spacedRepStatus: 'Mastered',
    progressWidth: 10,
    isUrgent: false,
  },
];

const defaultMistakes: MistakeRow[] = [
  {
    id: '1',
    problemName: 'Trapping Rain Water',
    coreMistake: 'Failed to account for the',
    highlightedText: 'empty array constraint',
    difficulty: 'Hard',
    lastAttempt: '2 hours ago',
  },
  {
    id: '2',
    problemName: 'Longest Substring Without Repeating...',
    coreMistake: 'Incorrect',
    highlightedText: 'window shrink condition',
    difficulty: 'Medium',
    lastAttempt: 'Yesterday',
  },
  {
    id: '3',
    problemName: 'Word Ladder II',
    coreMistake: 'Over-complicated',
    highlightedText: 'graph construction',
    difficulty: 'Hard',
    lastAttempt: '3 days ago',
  },
];

const navItems = [
  { id: 'launcher', icon: 'rocket_launch', label: 'Launcher' },
  { id: 'problems', icon: 'list_alt', label: 'Problem List' },
  { id: 'mistakes', icon: 'assignment_late', label: 'Mistakes' },
  { id: 'stats', icon: 'leaderboard', label: 'Stats' },
];

export default function MistakesDashboard({
  onNavigate,
  activeNav = 'mistakes',
  priorityAreas = defaultPriorityAreas,
  mistakes = defaultMistakes,
  onRetry,
}: MistakesDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMistakes = searchQuery
    ? mistakes.filter(
        (m) =>
          m.problemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.coreMistake.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mistakes;

  return (
    <div className="md">
      {/* Sidebar */}
      <div className="md__sidebar">
        <div className="md__sidebar-logo">S</div>
        <div className="md__sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`md__sidebar-btn ${activeNav === item.id ? 'md__sidebar-btn--active' : ''}`}
              onClick={() => onNavigate?.(item.id)}
              title={item.label}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </button>
          ))}
        </div>
        <div className="md__sidebar-bottom">
          <button className="md__sidebar-btn" title="Settings" onClick={() => onNavigate?.('settings')}>
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md__main">
        {/* Header */}
        <div className="md__header">
          <div className="md__header-title">
            <h1>Mistakes & Progress</h1>
            <span className="md__header-divider">|</span>
            <span className="md__header-subtitle">Dashboard</span>
          </div>
          <div className="md__header-right">
            <div className="md__search">
              <span className="material-symbols-outlined md__search-icon">search</span>
              <input
                type="text"
                className="md__search-input"
                placeholder="Search patterns or problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md__user">
              <div className="md__user-info">
                <span className="md__user-name">Alex Chen</span>
                <span className="md__user-role">Senior Engineer</span>
              </div>
              <div className="md__user-avatar">
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="md__content">
          {/* Priority Review Areas */}
          <div className="md__section">
            <div className="md__section-header">
              <span className="md__section-title">PRIORITY REVIEW AREAS</span>
              <button className="md__section-link">View All Patterns</button>
            </div>
            <div className="md__priority-grid">
              {priorityAreas.map((area) => (
                <div key={area.id} className="md__priority-card">
                  <div className="md__priority-top">
                    <div className="md__priority-icon" style={{ background: `${area.color}20`, color: area.color }}>
                      <span className="material-symbols-outlined">{area.icon}</span>
                    </div>
                    <div className="md__priority-score">
                      <span className="md__priority-score-value">{area.rubricScore}%</span>
                      <span className="md__priority-score-label">RUBRIC SCORE</span>
                    </div>
                  </div>
                  <div className="md__priority-name">{area.name}</div>
                  <div className="md__priority-footer">
                    <span className="md__priority-rep-label">SPACED REPETITION</span>
                    <span className={`md__priority-rep-status ${area.isUrgent ? 'md__priority-rep-status--urgent' : ''}`}>
                      {area.spacedRepStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="md__priority-bar-track">
                    <div
                      className="md__priority-bar-fill"
                      style={{
                        width: `${area.progressWidth}%`,
                        background: area.color,
                        boxShadow: area.isUrgent ? `0 0 10px ${area.color}60` : 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trend */}
          <div className="md__section">
            <div className="md__trend-card">
              <div className="md__trend-header">
                <div>
                  <h3 className="md__trend-title">Performance Trend</h3>
                  <p className="md__trend-subtitle">Average rubric scores over the last 30 days</p>
                </div>
                <div className="md__trend-legend">
                  <span className="md__trend-legend-item">
                    <span className="md__trend-legend-dot" style={{ background: 'var(--neon-cyan)' }} />
                    PROBLEM SOLVING
                  </span>
                  <span className="md__trend-legend-item">
                    <span className="md__trend-legend-dot" style={{ background: 'var(--neon-lime)' }} />
                    COMMUNICATION
                  </span>
                  <span className="md__trend-legend-item">
                    <span className="md__trend-legend-dot" style={{ background: 'var(--neon-purple)' }} />
                    TECHNICAL
                  </span>
                  <span className="md__trend-legend-item">
                    <span className="md__trend-legend-dot" style={{ background: 'var(--neon-amber)' }} />
                    EDGE CASES
                  </span>
                </div>
              </div>
              <div className="md__chart-container">
                <svg viewBox="0 0 960 320" className="md__chart" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="960" height="320" fill="url(#grid)" />

                  {/* Y-axis labels */}
                  <text x="8" y="16" fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-mono)">100</text>
                  <text x="8" y="96" fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-mono)">75</text>
                  <text x="8" y="176" fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-mono)">50</text>
                  <text x="8" y="256" fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-mono)">25</text>
                  <text x="8" y="316" fill="var(--text-secondary)" fontSize="11" fontFamily="var(--font-mono)">0</text>

                  {/* Problem Solving (blue) — trending up */}
                  <polyline
                    points="40,240 160,220 280,200 400,180 520,160 640,130 760,100 880,60"
                    fill="none"
                    stroke="var(--neon-cyan)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Communication (green) — steady climb */}
                  <polyline
                    points="40,260 160,250 280,230 400,210 520,180 640,160 760,130 880,90"
                    fill="none"
                    stroke="var(--neon-lime)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Technical (purple) — moderate climb */}
                  <polyline
                    points="40,280 160,260 280,240 400,220 520,200 640,180 760,160 880,130"
                    fill="none"
                    stroke="var(--neon-purple)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Edge Cases (orange) — slowest climb */}
                  <polyline
                    points="40,300 160,290 280,270 400,260 520,240 640,220 760,200 880,170"
                    fill="none"
                    stroke="var(--neon-amber)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Dots at endpoints */}
                  <circle cx="40" cy="240" r="4" fill="var(--neon-cyan)" />
                  <circle cx="880" cy="60" r="4" fill="var(--neon-cyan)" />
                  <circle cx="40" cy="260" r="4" fill="var(--neon-lime)" />
                  <circle cx="880" cy="90" r="4" fill="var(--neon-lime)" />
                  <circle cx="40" cy="280" r="4" fill="var(--neon-purple)" />
                  <circle cx="880" cy="130" r="4" fill="var(--neon-purple)" />
                  <circle cx="40" cy="300" r="4" fill="var(--neon-amber)" />
                  <circle cx="880" cy="170" r="4" fill="var(--neon-amber)" />
                </svg>
                <div className="md__chart-xaxis">
                  <span>30 Days ago</span>
                  <span>20 Days ago</span>
                  <span>10 Days ago</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Mistakes Table */}
          <div className="md__section">
            <div className="md__table-card">
              <h3 className="md__table-title">Recent Mistakes & Learning Log</h3>
              <table className="md__table">
                <thead>
                  <tr>
                    <th>PROBLEM NAME</th>
                    <th>CORE MISTAKE</th>
                    <th>DIFFICULTY</th>
                    <th>LAST ATTEMPT</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMistakes.map((row) => {
                    const diffClass = row.difficulty === 'Easy' ? 'easy' : row.difficulty === 'Medium' ? 'medium' : 'hard';
                    return (
                      <tr key={row.id}>
                        <td className="md__table-problem">{row.problemName}</td>
                        <td>
                          {row.coreMistake}{' '}
                          <span className="md__table-highlight">{row.highlightedText}</span>
                          {row.id === '2' ? ' (set instead of map)' : row.id === '3' ? ' causing TLE' : ''}
                        </td>
                        <td>
                          <span className={`difficulty-badge difficulty-badge--${diffClass}`}>
                            {row.difficulty}
                          </span>
                        </td>
                        <td className="md__table-time">{row.lastAttempt}</td>
                        <td>
                          <button
                            className="md__retry-btn"
                            onClick={() => onRetry?.(row.id)}
                          >
                            Re-try
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="md__footer">
          <div className="md__footer-left">
            <span className="md__footer-dot" />
            <span>Analytics Updated</span>
            <span className="md__footer-sep">|</span>
            <span>Last Sync: 10:42 AM</span>
          </div>
          <div className="md__footer-right">
            <span className="md__footer-link">Export Performance Data</span>
            <span className="md__footer-sep">|</span>
            <span className="md__footer-link">Documentation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
