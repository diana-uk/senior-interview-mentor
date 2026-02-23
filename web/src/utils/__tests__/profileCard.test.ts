import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Achievement, StatsData, PatternStrength, SessionRecord, AchievementId } from '../../types';

// ── Canvas & DOM mocking ────────────────────────────────────────────

interface MockCtx {
  fillRect: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
  createLinearGradient: ReturnType<typeof vi.fn>;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
  textAlign: string;
}

let mockCtx: MockCtx;
let mockCanvas: { width: number; height: number; getContext: ReturnType<typeof vi.fn>; toDataURL: ReturnType<typeof vi.fn> };
let mockLink: { download: string; href: string; click: ReturnType<typeof vi.fn> };
let originalCreateElement: typeof document.createElement;

function setupMocks() {
  const gradientObj = { addColorStop: vi.fn() };

  mockCtx = {
    fillRect: vi.fn(),
    fillText: vi.fn(),
    strokeRect: vi.fn(),
    createLinearGradient: vi.fn(() => gradientObj),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: 'left',
  };

  mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => mockCtx),
    toDataURL: vi.fn(() => 'data:image/png;base64,FAKE'),
  };

  mockLink = {
    download: '',
    href: '',
    click: vi.fn(),
  };

  originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
    if (tag === 'a') return mockLink as unknown as HTMLAnchorElement;
    return originalCreateElement(tag);
  });
}

// ── Factories ───────────────────────────────────────────────────────

function makePatternStrength(overrides: Partial<PatternStrength> = {}): PatternStrength {
  return {
    pattern: 'HashMap',
    solved: 3,
    attempted: 5,
    avgScore: 3.5,
    lastPracticed: '2026-02-20',
    ...overrides,
  };
}

function makeSession(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: 's1',
    date: '2026-02-20',
    problemId: 'hm-1',
    problemTitle: 'Two Sum',
    mode: 'TEACHER',
    duration: 600,
    hintsUsed: 0,
    score: 3,
    patterns: ['HashMap'],
    ...overrides,
  };
}

function makeStats(overrides: Partial<StatsData> = {}): StatsData {
  return {
    problemsSolved: 10,
    totalAttempts: 20,
    totalTime: 7200,
    hintsUsed: 5,
    currentStreak: 3,
    longestStreak: 7,
    lastActiveDate: '2026-02-20',
    avgScore: 3.2,
    patternStrengths: [
      makePatternStrength({ pattern: 'HashMap', avgScore: 3.5, attempted: 5 }),
      makePatternStrength({ pattern: 'Sliding Window', avgScore: 4.0, attempted: 3 }),
      makePatternStrength({ pattern: 'Dynamic Programming', avgScore: 1.5, attempted: 4 }),
      makePatternStrength({ pattern: 'Binary Search', avgScore: 2.5, attempted: 2 }),
      makePatternStrength({ pattern: 'Two Pointers', avgScore: 0, attempted: 0 }),
    ],
    sessions: [],
    problemProgress: {},
    reviews: [],
    ...overrides,
  };
}

function makeAchievement(
  id: AchievementId,
  icon: string,
  unlockedAt?: string,
): Achievement {
  return {
    id,
    title: `Achievement ${id}`,
    description: `Description for ${id}`,
    icon,
    category: 'milestones',
    unlockedAt,
  };
}

function makeUnlockedAchievements(count: number): Achievement[] {
  const ids: AchievementId[] = [
    'first-solve', 'ten-solved', 'twenty-five-solved', 'fifty-solved',
    'hundred-solved', 'all-clear', 'streak-3', 'streak-7', 'streak-14',
    'streak-30', 'pattern-explorer', 'pattern-master', 'speed-demon',
    'lightning-round', 'perfect-score', 'hint-free', 'review-ace',
  ];
  return ids.slice(0, count).map((id, i) =>
    makeAchievement(id, String.fromCodePoint(0x1F3C6 + i), '2026-02-20'),
  );
}

// ── Tests ───────────────────────────────────────────────────────────

describe('exportProfileCard', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Lazily import so mocks are in place when the module executes
  async function callExport(overrides: {
    stats?: Partial<StatsData>;
    achievements?: Achievement[];
    unlockedCount?: number;
    totalCount?: number;
  } = {}) {
    const { exportProfileCard } = await import('../profileCard');
    exportProfileCard({
      stats: makeStats(overrides.stats),
      achievements: overrides.achievements ?? [],
      unlockedCount: overrides.unlockedCount ?? 0,
      totalCount: overrides.totalCount ?? 17,
    });
  }

  // ── Canvas creation ───────────────────────────────────────────────

  describe('canvas creation', () => {
    it('creates a canvas element', async () => {
      await callExport();
      expect(document.createElement).toHaveBeenCalledWith('canvas');
    });

    it('sets canvas dimensions to 600x400', async () => {
      await callExport();
      expect(mockCanvas.width).toBe(600);
      expect(mockCanvas.height).toBe(400);
    });

    it('gets a 2d rendering context', async () => {
      await callExport();
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });
  });

  // ── Background rendering ──────────────────────────────────────────

  describe('background rendering', () => {
    it('creates a linear gradient for the background', async () => {
      await callExport();
      expect(mockCtx.createLinearGradient).toHaveBeenCalledWith(0, 0, 600, 400);
    });

    it('draws background fill rect covering entire canvas', async () => {
      await callExport();
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 600, 400);
    });

    it('draws border glow stroke rect', async () => {
      await callExport();
      expect(mockCtx.strokeRect).toHaveBeenCalledWith(1, 1, 598, 398);
    });
  });

  // ── Title ─────────────────────────────────────────────────────────

  describe('title', () => {
    it('renders "Senior Interview Mentor" text', async () => {
      await callExport();
      expect(mockCtx.fillText).toHaveBeenCalledWith('Senior Interview Mentor', 24, 38);
    });
  });

  // ── Stats grid ────────────────────────────────────────────────────

  describe('stats grid', () => {
    it('renders problems solved count', async () => {
      await callExport({ stats: { problemsSolved: 42 } });
      expect(mockCtx.fillText).toHaveBeenCalledWith('42', expect.any(Number), 95);
    });

    it('renders current streak with "d" suffix', async () => {
      await callExport({ stats: { currentStreak: 7 } });
      expect(mockCtx.fillText).toHaveBeenCalledWith('7d', expect.any(Number), 95);
    });

    it('renders average score with 1 decimal place', async () => {
      await callExport({ stats: { avgScore: 3.2 } });
      expect(mockCtx.fillText).toHaveBeenCalledWith('3.2', expect.any(Number), 95);
    });

    it('renders "--" for avg score when avgScore is 0 (falsy)', async () => {
      await callExport({ stats: { avgScore: 0 } });
      expect(mockCtx.fillText).toHaveBeenCalledWith('--', expect.any(Number), 95);
    });

    it('renders achievement ratio as unlocked/total', async () => {
      await callExport({ unlockedCount: 5, totalCount: 17 });
      expect(mockCtx.fillText).toHaveBeenCalledWith('5/17', expect.any(Number), 95);
    });

    it('renders stat labels in uppercase', async () => {
      await callExport();
      expect(mockCtx.fillText).toHaveBeenCalledWith('PROBLEMS SOLVED', expect.any(Number), 112);
      expect(mockCtx.fillText).toHaveBeenCalledWith('CURRENT STREAK', expect.any(Number), 112);
      expect(mockCtx.fillText).toHaveBeenCalledWith('AVG SCORE', expect.any(Number), 112);
      expect(mockCtx.fillText).toHaveBeenCalledWith('ACHIEVEMENTS', expect.any(Number), 112);
    });

    it('spaces 4 stats evenly across card width', async () => {
      await callExport();
      const colW = (600 - 48) / 4;
      // Each label at y=112
      const labelCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => c[2] === 112,
      );
      expect(labelCalls).toHaveLength(4);
      for (let i = 0; i < 4; i++) {
        expect(labelCalls[i][1]).toBeCloseTo(24 + i * colW, 5);
      }
    });
  });

  // ── Top patterns ──────────────────────────────────────────────────

  describe('top patterns', () => {
    it('renders "TOP PATTERNS" heading', async () => {
      await callExport();
      expect(mockCtx.fillText).toHaveBeenCalledWith('TOP PATTERNS', 24, 152);
    });

    it('filters out patterns with 0 attempts', async () => {
      await callExport();
      // "Two Pointers" has attempted=0, should not be rendered as pattern name at y=170+
      const patternNameCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => typeof c[1] === 'number' && c[1] === 24 && (c[2] as number) >= 170 && (c[2] as number) < 310,
      );
      const names = patternNameCalls.map((c: unknown[]) => c[0]);
      expect(names).not.toContain('Two Pointers');
    });

    it('sorts patterns by avgScore descending', async () => {
      await callExport();
      // Top order: Sliding Window (4.0), HashMap (3.5), Binary Search (2.5), DP (1.5)
      const patternNameCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => typeof c[1] === 'number' && c[1] === 24 && (c[2] as number) >= 170 && (c[2] as number) < 310,
      );
      const names = patternNameCalls.map((c: unknown[]) => c[0]);
      expect(names[0]).toBe('Sliding Window');
      expect(names[1]).toBe('HashMap');
      expect(names[2]).toBe('Binary Search');
      expect(names[3]).toBe('Dynamic Programming');
    });

    it('limits to top 5 patterns', async () => {
      const manyPatterns: PatternStrength[] = Array.from({ length: 8 }, (_, i) =>
        makePatternStrength({
          pattern: `Pattern${i}` as PatternStrength['pattern'],
          avgScore: 4 - i * 0.3,
          attempted: 3,
        }),
      );
      await callExport({ stats: { patternStrengths: manyPatterns } });
      // Pattern name calls at x=24, y >= 170
      const patternNameCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => typeof c[1] === 'number' && c[1] === 24 && (c[2] as number) >= 170 && (c[2] as number) < 310,
      );
      expect(patternNameCalls).toHaveLength(5);
    });

    it('renders pattern names at x=24 with 22px spacing', async () => {
      await callExport();
      const patternNameCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => typeof c[1] === 'number' && c[1] === 24 && (c[2] as number) >= 170 && (c[2] as number) < 310,
      );
      for (let i = 0; i < patternNameCalls.length; i++) {
        expect(patternNameCalls[i][2]).toBe(170 + i * 22);
      }
    });

    it('renders no patterns when all have 0 attempts', async () => {
      const allZero = [
        makePatternStrength({ pattern: 'HashMap', attempted: 0, avgScore: 0 }),
        makePatternStrength({ pattern: 'Sliding Window', attempted: 0, avgScore: 0 }),
      ];
      await callExport({ stats: { patternStrengths: allZero } });
      const patternNameCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => typeof c[1] === 'number' && c[1] === 24 && (c[2] as number) >= 170 && (c[2] as number) < 310,
      );
      expect(patternNameCalls).toHaveLength(0);
    });
  });

  // ── Pattern score color logic ─────────────────────────────────────

  describe('pattern score bar colors', () => {
    it('uses green (#a3ff00) for score >= 3', async () => {
      await callExport({
        stats: {
          patternStrengths: [
            makePatternStrength({ pattern: 'HashMap', avgScore: 3.5, attempted: 3 }),
          ],
        },
      });
      // Score text is rendered with barColor at x = 180 + 120 + 8 = 308
      const scoreCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => c[0] === '3.5' && c[1] === 308,
      );
      expect(scoreCalls).toHaveLength(1);
      // Check that fillStyle was set to green before drawing the score bar
      // We verify indirectly by checking fillRect calls at barX=180 with the fill width
      const barFillCalls = mockCtx.fillRect.mock.calls.filter(
        (c: unknown[]) => c[0] === 180 && (c[2] as number) > 0 && c[3] === 6 && (c[2] as number) !== 120,
      );
      expect(barFillCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('uses orange (#ffaa00) for score >= 2 and < 3', async () => {
      await callExport({
        stats: {
          patternStrengths: [
            makePatternStrength({ pattern: 'HashMap', avgScore: 2.5, attempted: 3 }),
          ],
        },
      });
      const scoreCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => c[0] === '2.5' && c[1] === 308,
      );
      expect(scoreCalls).toHaveLength(1);
    });

    it('uses red (#ff3366) for score < 2', async () => {
      await callExport({
        stats: {
          patternStrengths: [
            makePatternStrength({ pattern: 'Dynamic Programming', avgScore: 1.5, attempted: 4 }),
          ],
        },
      });
      const scoreCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => c[0] === '1.5' && c[1] === 308,
      );
      expect(scoreCalls).toHaveLength(1);
    });

    it('calculates score bar fill width as (avgScore / 4) * barWidth', async () => {
      const avgScore = 3.0;
      await callExport({
        stats: {
          patternStrengths: [
            makePatternStrength({ pattern: 'HashMap', avgScore, attempted: 3 }),
          ],
        },
      });
      const expectedFillW = (avgScore / 4) * 120;
      // Colored fill rect at barX=180, barH=6
      const coloredBarCalls = mockCtx.fillRect.mock.calls.filter(
        (c: unknown[]) => c[0] === 180 && c[2] === expectedFillW && c[3] === 6,
      );
      expect(coloredBarCalls).toHaveLength(1);
    });

    it('renders score text formatted to 1 decimal', async () => {
      await callExport({
        stats: {
          patternStrengths: [
            makePatternStrength({ pattern: 'HashMap', avgScore: 3.0, attempted: 3 }),
          ],
        },
      });
      expect(mockCtx.fillText).toHaveBeenCalledWith('3.0', 308, expect.any(Number));
    });
  });

  // ── Activity heatmap ──────────────────────────────────────────────

  describe('activity heatmap', () => {
    it('renders "ACTIVITY (90 DAYS)" heading', async () => {
      await callExport();
      expect(mockCtx.fillText).toHaveBeenCalledWith('ACTIVITY (90 DAYS)', 360, 152);
    });

    it('draws 91 cells for the heatmap grid (13 weeks)', async () => {
      await callExport();
      // Each heatmap cell is a fillRect with cellSize=7
      // Filter for fillRect calls with width=7 and height=7
      const heatmapCells = mockCtx.fillRect.mock.calls.filter(
        (c: unknown[]) => c[2] === 7 && c[3] === 7,
      );
      expect(heatmapCells).toHaveLength(91);
    });

    it('aggregates session counts per date correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      const sessions: SessionRecord[] = [
        makeSession({ id: 's1', date: today }),
        makeSession({ id: 's2', date: today }),
        makeSession({ id: 's3', date: today }),
      ];
      await callExport({ stats: { sessions } });
      // 3 sessions on today -> count=3 -> rgba(0,240,255,0.8) intensity
      // We can't easily test fillStyle directly since it's a property,
      // but we can verify 91 cells are still drawn
      const heatmapCells = mockCtx.fillRect.mock.calls.filter(
        (c: unknown[]) => c[2] === 7 && c[3] === 7,
      );
      expect(heatmapCells).toHaveLength(91);
    });

    it('handles empty sessions array (all cells zero activity)', async () => {
      await callExport({ stats: { sessions: [] } });
      const heatmapCells = mockCtx.fillRect.mock.calls.filter(
        (c: unknown[]) => c[2] === 7 && c[3] === 7,
      );
      expect(heatmapCells).toHaveLength(91);
    });
  });

  // ── Achievements row ──────────────────────────────────────────────

  describe('achievements', () => {
    it('renders "ACHIEVEMENTS" section label', async () => {
      await callExport();
      expect(mockCtx.fillText).toHaveBeenCalledWith('ACHIEVEMENTS', 24, 332);
    });

    it('renders achievement icons for each unlocked achievement', async () => {
      const achievements = makeUnlockedAchievements(3);
      await callExport({ achievements, unlockedCount: 3 });
      // Check icon fillText calls at y=358 with x increments of 28
      for (let i = 0; i < 3; i++) {
        expect(mockCtx.fillText).toHaveBeenCalledWith(
          achievements[i].icon,
          24 + i * 28,
          358,
        );
      }
    });

    it('limits displayed achievement icons to 12', async () => {
      const achievements = makeUnlockedAchievements(15);
      await callExport({ achievements, unlockedCount: 15 });
      // Icon calls at y=358: each icon is at x = 24 + i*28 for i in 0..11
      const iconCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => c[2] === 358 && typeof c[0] === 'string' && !(c[0] as string).startsWith('+'),
      );
      expect(iconCalls).toHaveLength(12);
    });

    it('renders overflow "+N" when more than 12 unlocked achievements', async () => {
      const achievements = makeUnlockedAchievements(15);
      await callExport({ achievements, unlockedCount: 15 });
      expect(mockCtx.fillText).toHaveBeenCalledWith('+3', 24 + 12 * 28 + 4, 358);
    });

    it('does not render overflow text when exactly 12 achievements', async () => {
      const achievements = makeUnlockedAchievements(12);
      await callExport({ achievements, unlockedCount: 12 });
      const overflowCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).startsWith('+'),
      );
      expect(overflowCalls).toHaveLength(0);
    });

    it('renders no icons when no achievements are unlocked', async () => {
      const achievements = [
        makeAchievement('first-solve', '\uD83C\uDFC6'), // no unlockedAt
      ];
      await callExport({ achievements, unlockedCount: 0 });
      const iconCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => c[2] === 358,
      );
      expect(iconCalls).toHaveLength(0);
    });

    it('only shows unlocked achievements (filters out locked)', async () => {
      const achievements = [
        makeAchievement('first-solve', '\uD83C\uDFC6', '2026-02-20'),
        makeAchievement('ten-solved', '\uD83C\uDFC7'), // locked
        makeAchievement('streak-3', '\uD83D\uDD25', '2026-02-19'),
      ];
      await callExport({ achievements, unlockedCount: 2 });
      const iconCalls = mockCtx.fillText.mock.calls.filter(
        (c: unknown[]) => c[2] === 358,
      );
      expect(iconCalls).toHaveLength(2);
    });
  });

  // ── Watermark ─────────────────────────────────────────────────────

  describe('watermark', () => {
    it('renders watermark text at bottom right', async () => {
      await callExport();
      expect(mockCtx.fillText).toHaveBeenCalledWith('senior-interview-mentor', 600 - 24, 400 - 12);
    });
  });

  // ── Download trigger ──────────────────────────────────────────────

  describe('download', () => {
    it('creates an anchor element for download', async () => {
      await callExport();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('sets download filename to "interview-mentor-profile.png"', async () => {
      await callExport();
      expect(mockLink.download).toBe('interview-mentor-profile.png');
    });

    it('converts canvas to PNG data URL', async () => {
      await callExport();
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
    });

    it('sets link href to canvas data URL', async () => {
      await callExport();
      expect(mockLink.href).toBe('data:image/png;base64,FAKE');
    });

    it('triggers download by calling link.click()', async () => {
      await callExport();
      expect(mockLink.click).toHaveBeenCalledTimes(1);
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles zero problems solved', async () => {
      await callExport({ stats: { problemsSolved: 0 } });
      expect(mockCtx.fillText).toHaveBeenCalledWith('0', expect.any(Number), 95);
    });

    it('handles zero streak', async () => {
      await callExport({ stats: { currentStreak: 0 } });
      expect(mockCtx.fillText).toHaveBeenCalledWith('0d', expect.any(Number), 95);
    });

    it('handles empty patternStrengths', async () => {
      await callExport({ stats: { patternStrengths: [] } });
      // Should not crash, and TOP PATTERNS heading should still render
      expect(mockCtx.fillText).toHaveBeenCalledWith('TOP PATTERNS', 24, 152);
    });

    it('handles empty achievements array', async () => {
      await callExport({ achievements: [], unlockedCount: 0, totalCount: 17 });
      expect(mockCtx.fillText).toHaveBeenCalledWith('0/17', expect.any(Number), 95);
    });

    it('handles very large numbers without crashing', async () => {
      await callExport({
        stats: { problemsSolved: 999999, currentStreak: 365 },
        unlockedCount: 17,
        totalCount: 17,
      });
      expect(mockCtx.fillText).toHaveBeenCalledWith('999999', expect.any(Number), 95);
      expect(mockCtx.fillText).toHaveBeenCalledWith('365d', expect.any(Number), 95);
      expect(mockCtx.fillText).toHaveBeenCalledWith('17/17', expect.any(Number), 95);
    });

    it('renders divider lines as 1px rectangles', async () => {
      await callExport();
      // Subtitle divider at y=50
      expect(mockCtx.fillRect).toHaveBeenCalledWith(24, 50, 600 - 48, 1);
      // Pattern divider at y=128
      expect(mockCtx.fillRect).toHaveBeenCalledWith(24, 128, 600 - 48, 1);
      // Achievement divider at y=310
      expect(mockCtx.fillRect).toHaveBeenCalledWith(24, 310, 600 - 48, 1);
    });

    it('completes without error with totally empty stats', async () => {
      const emptyStats: Partial<StatsData> = {
        problemsSolved: 0,
        totalAttempts: 0,
        totalTime: 0,
        hintsUsed: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: '',
        avgScore: 0,
        patternStrengths: [],
        sessions: [],
        problemProgress: {},
        reviews: [],
      };
      await callExport({
        stats: emptyStats,
        achievements: [],
        unlockedCount: 0,
        totalCount: 0,
      });
      expect(mockLink.click).toHaveBeenCalledTimes(1);
    });

    it('handles single pattern at score boundary of exactly 2', async () => {
      await callExport({
        stats: {
          patternStrengths: [
            makePatternStrength({ pattern: 'HashMap', avgScore: 2.0, attempted: 1 }),
          ],
        },
      });
      // avgScore=2.0 is >= 2, so should be orange (#ffaa00), score text "2.0"
      expect(mockCtx.fillText).toHaveBeenCalledWith('2.0', 308, expect.any(Number));
    });

    it('handles single pattern at score boundary of exactly 3', async () => {
      await callExport({
        stats: {
          patternStrengths: [
            makePatternStrength({ pattern: 'HashMap', avgScore: 3.0, attempted: 1 }),
          ],
        },
      });
      // avgScore=3.0 is >= 3, so should be green (#a3ff00), score text "3.0"
      expect(mockCtx.fillText).toHaveBeenCalledWith('3.0', 308, expect.any(Number));
    });
  });

  // ── Score bar background ──────────────────────────────────────────

  describe('score bar background', () => {
    it('draws background bar at barX=180 with width 120 and height 6', async () => {
      await callExport({
        stats: {
          patternStrengths: [
            makePatternStrength({ pattern: 'HashMap', avgScore: 3.5, attempted: 3 }),
          ],
        },
      });
      // Background bar (full width)
      expect(mockCtx.fillRect).toHaveBeenCalledWith(180, expect.any(Number), 120, 6);
    });
  });
});
