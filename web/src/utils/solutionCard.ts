import type { Difficulty } from '../types';

export interface SolutionCardData {
  problemTitle: string;
  difficulty: Difficulty;
  pattern: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: string;
  timeSeconds: number;
  hintsUsed: number;
  score: number | null;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: '#a3ff00',
  Medium: '#ffaa00',
  Hard: '#ff3366',
};

const FONT = '"JetBrains Mono", "Fira Code", monospace';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function truncateLine(line: string, maxChars: number): string {
  return line.length > maxChars ? line.slice(0, maxChars - 3) + '...' : line;
}

/**
 * Renders a shareable solution card to a canvas and downloads as PNG.
 * 600x400 with neo-terminal dark styling.
 */
export function exportSolutionCard(data: SolutionCardData): void {
  const W = 600;
  const H = 400;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0a0a12');
  bg.addColorStop(1, '#12121e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Border glow
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // ── Header: solved badge + difficulty ──
  const diffColor = DIFFICULTY_COLORS[data.difficulty];

  ctx.fillStyle = '#a3ff00';
  ctx.font = `bold 11px ${FONT}`;
  ctx.fillText('✓ SOLVED', 24, 30);

  ctx.fillStyle = diffColor;
  ctx.font = `bold 12px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText(data.difficulty.toUpperCase(), W - 24, 30);
  ctx.textAlign = 'left';

  // Problem title (truncated if too long)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 18px ${FONT}`;
  const title = truncateLine(data.problemTitle, 40);
  ctx.fillText(title, 24, 56);

  // Divider
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(24, 68, W - 48, 1);

  // ── Pattern + Complexity row ──
  const metaY = 90;
  const colWidth = (W - 48) / 3;

  // Pattern
  ctx.fillStyle = '#606078';
  ctx.font = `10px ${FONT}`;
  ctx.fillText('PATTERN', 24, metaY);
  ctx.fillStyle = '#c0c0d0';
  ctx.font = `12px ${FONT}`;
  ctx.fillText(truncateLine(data.pattern, 20), 24, metaY + 16);

  // Time complexity
  ctx.fillStyle = '#606078';
  ctx.font = `10px ${FONT}`;
  ctx.fillText('TIME', 24 + colWidth, metaY);
  ctx.fillStyle = '#00f0ff';
  ctx.font = `12px ${FONT}`;
  ctx.fillText(data.timeComplexity || '—', 24 + colWidth, metaY + 16);

  // Space complexity
  ctx.fillStyle = '#606078';
  ctx.font = `10px ${FONT}`;
  ctx.fillText('SPACE', 24 + colWidth * 2, metaY);
  ctx.fillStyle = '#00f0ff';
  ctx.font = `12px ${FONT}`;
  ctx.fillText(data.spaceComplexity || '—', 24 + colWidth * 2, metaY + 16);

  // Divider
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(24, 120, W - 48, 1);

  // ── Code preview ──
  ctx.fillStyle = '#606078';
  ctx.font = `10px ${FONT}`;
  ctx.fillText('CODE PREVIEW', 24, 140);

  // Code background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.fillRect(24, 148, W - 48, 160);

  const codeLines = data.code.split('\n').slice(0, 8);
  ctx.fillStyle = '#9090a8';
  ctx.font = `11px ${FONT}`;
  codeLines.forEach((line, i) => {
    const truncated = truncateLine(line, 65);
    ctx.fillText(truncated, 32, 166 + i * 18);
  });

  if (data.code.split('\n').length > 8) {
    ctx.fillStyle = '#606078';
    ctx.font = `11px ${FONT}`;
    ctx.fillText('...', 32, 166 + 8 * 18);
  }

  // Divider
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(24, 320, W - 48, 1);

  // ── Bottom stats bar ──
  const statsY = 345;

  // Timer
  ctx.fillStyle = '#606078';
  ctx.font = `11px ${FONT}`;
  ctx.fillText(`⏱ ${formatTime(data.timeSeconds)}`, 24, statsY);

  // Hints
  ctx.fillStyle = '#606078';
  ctx.fillText(`💡 ${data.hintsUsed}/3 hints`, 160, statsY);

  // Score
  const scoreText = data.score !== null ? `${data.score.toFixed(1)}/4.0` : '--';
  ctx.fillStyle = '#606078';
  ctx.fillText(`⭐ ${scoreText}`, 310, statsY);

  // Watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.font = `10px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText('senior-interview-mentor', W - 24, H - 12);
  ctx.textAlign = 'left';

  // Download
  const link = document.createElement('a');
  link.download = `solution-${slugify(data.problemTitle)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
