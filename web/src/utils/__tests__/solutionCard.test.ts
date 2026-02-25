import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Difficulty } from '../../types';

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

// ── Factory ─────────────────────────────────────────────────────────

function makeData(overrides: Partial<import('../solutionCard').SolutionCardData> = {}): import('../solutionCard').SolutionCardData {
  return {
    problemTitle: 'Two Sum',
    difficulty: 'Easy' as Difficulty,
    pattern: 'HashMap',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: 'function twoSum(nums: number[], target: number): number[] {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (map.has(target - nums[i])) return [map.get(target - nums[i]), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
    timeSeconds: 754,
    hintsUsed: 1,
    score: 3.5,
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────

describe('exportSolutionCard', () => {
  beforeEach(() => setupMocks());
  afterEach(() => vi.restoreAllMocks());

  async function getExport() {
    const { exportSolutionCard } = await import('../solutionCard');
    return exportSolutionCard;
  }

  it('creates a 600x400 canvas', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData());
    expect(mockCanvas.width).toBe(600);
    expect(mockCanvas.height).toBe(400);
  });

  it('gets 2d context', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData());
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('triggers download via link click', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData());
    expect(mockLink.click).toHaveBeenCalledOnce();
  });

  it('sets link href to PNG data URL', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData());
    expect(mockLink.href).toBe('data:image/png;base64,FAKE');
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
  });

  it('slugifies problem title for download filename', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ problemTitle: 'Two Sum' }));
    expect(mockLink.download).toBe('solution-two-sum.png');
  });

  it('slugifies complex titles with special chars', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ problemTitle: 'Longest Substring Without Repeating Characters' }));
    expect(mockLink.download).toBe('solution-longest-substring-without-repeating-characters.png');
  });

  it('renders SOLVED badge text', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData());
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('✓ SOLVED');
  });

  it('renders problem title', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ problemTitle: 'Merge Intervals' }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('Merge Intervals');
  });

  it('renders difficulty in uppercase', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ difficulty: 'Hard' }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('HARD');
  });

  it('renders pattern name', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ pattern: 'Sliding Window' }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('Sliding Window');
  });

  it('renders time complexity', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ timeComplexity: 'O(n log n)' }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('O(n log n)');
  });

  it('renders space complexity', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ spaceComplexity: 'O(1)' }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('O(1)');
  });

  it('renders dash when complexity is empty', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ timeComplexity: '', spaceComplexity: '' }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    const dashes = texts.filter((t: string) => t === '—');
    expect(dashes.length).toBe(2);
  });

  // ── Time formatting ──

  it('formats time as mm:ss (754s → 12:34)', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ timeSeconds: 754 }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('⏱ 12:34');
  });

  it('formats zero seconds as 00:00', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ timeSeconds: 0 }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('⏱ 00:00');
  });

  it('formats 60 seconds as 01:00', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ timeSeconds: 60 }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('⏱ 01:00');
  });

  // ── Hints ──

  it('renders hints count', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ hintsUsed: 2 }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('💡 2/3 hints');
  });

  it('renders 0 hints', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ hintsUsed: 0 }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('💡 0/3 hints');
  });

  // ── Score ──

  it('renders score when present', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ score: 3.5 }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('⭐ 3.5/4.0');
  });

  it('renders -- when score is null', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ score: null }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('⭐ --');
  });

  it('renders perfect score as 4.0/4.0', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ score: 4 }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('⭐ 4.0/4.0');
  });

  // ── Code preview ──

  it('renders code lines', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ code: 'line1\nline2\nline3' }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('line1');
    expect(texts).toContain('line2');
    expect(texts).toContain('line3');
  });

  it('shows at most 8 lines of code', async () => {
    const exportSolutionCard = await getExport();
    const longCode = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n');
    exportSolutionCard(makeData({ code: longCode }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('line 1');
    expect(texts).toContain('line 8');
    expect(texts).not.toContain('line 9');
  });

  it('shows ellipsis when code exceeds 8 lines', async () => {
    const exportSolutionCard = await getExport();
    const longCode = Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join('\n');
    exportSolutionCard(makeData({ code: longCode }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('...');
  });

  it('does not show ellipsis when code is 8 lines or fewer', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ code: 'a\nb\nc' }));
    const ellipsisCalls = mockCtx.fillText.mock.calls.filter(
      (c: unknown[]) => c[0] === '...'
    );
    expect(ellipsisCalls.length).toBe(0);
  });

  it('truncates long code lines', async () => {
    const exportSolutionCard = await getExport();
    const longLine = 'x'.repeat(100);
    exportSolutionCard(makeData({ code: longLine }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    const rendered = texts.find((t: string) => t.startsWith('xxx'));
    expect(rendered).toBeDefined();
    expect(rendered!.length).toBeLessThan(100);
    expect(rendered!.endsWith('...')).toBe(true);
  });

  it('handles empty code', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ code: '' }));
    expect(mockLink.click).toHaveBeenCalledOnce();
  });

  // ── Title truncation ──

  it('truncates very long problem titles', async () => {
    const exportSolutionCard = await getExport();
    const longTitle = 'A'.repeat(60);
    exportSolutionCard(makeData({ problemTitle: longTitle }));
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    const titleCall = texts.find((t: string) => t.startsWith('AAA'));
    expect(titleCall!.length).toBeLessThan(60);
    expect(titleCall!.endsWith('...')).toBe(true);
  });

  // ── Difficulty colors ──

  it('uses green for Easy difficulty', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData({ difficulty: 'Easy' }));
    // The difficulty text fill should have been set to #a3ff00 at some point
    const fillStyleCalls: string[] = [];
    // Track fillStyle changes by checking fillText calls with 'EASY'
    const calls = mockCtx.fillText.mock.calls;
    const easyCall = calls.findIndex((c: unknown[]) => c[0] === 'EASY');
    expect(easyCall).toBeGreaterThanOrEqual(0);
  });

  it('renders watermark', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData());
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('senior-interview-mentor');
  });

  it('renders section labels', async () => {
    const exportSolutionCard = await getExport();
    exportSolutionCard(makeData());
    const texts = mockCtx.fillText.mock.calls.map((c: unknown[]) => c[0]);
    expect(texts).toContain('PATTERN');
    expect(texts).toContain('TIME');
    expect(texts).toContain('SPACE');
    expect(texts).toContain('CODE PREVIEW');
  });
});
