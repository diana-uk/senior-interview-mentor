import type { Achievement, StatsData } from '../types';

interface ProfileData {
  stats: StatsData;
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

/**
 * Renders a shareable profile card to a canvas and downloads as PNG.
 * 600x400 with neo-terminal dark styling.
 */
export function exportProfileCard(data: ProfileData): void {
  const W = 600;
  const H = 400;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0a0a12');
  bg.addColorStop(1, '#12121e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Border glow
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // Title
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 20px "JetBrains Mono", "Fira Code", monospace';
  ctx.fillText('Senior Interview Mentor', 24, 38);

  // Subtitle line
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(24, 50, W - 48, 1);

  // Stats grid
  const statsItems = [
    { label: 'Problems Solved', value: String(data.stats.problemsSolved), color: '#ffffff' },
    { label: 'Current Streak', value: `${data.stats.currentStreak}d`, color: '#a3ff00' },
    { label: 'Avg Score', value: data.stats.avgScore ? data.stats.avgScore.toFixed(1) : '--', color: '#ffffff' },
    { label: 'Achievements', value: `${data.unlockedCount}/${data.totalCount}`, color: '#00f0ff' },
  ];

  const colW = (W - 48) / 4;
  statsItems.forEach((item, i) => {
    const x = 24 + i * colW;
    ctx.fillStyle = item.color;
    ctx.font = 'bold 28px "JetBrains Mono", "Fira Code", monospace';
    ctx.fillText(item.value, x, 95);
    ctx.fillStyle = '#606078';
    ctx.font = '11px "JetBrains Mono", "Fira Code", monospace';
    ctx.fillText(item.label.toUpperCase(), x, 112);
  });

  // Divider
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(24, 128, W - 48, 1);

  // Top patterns
  const practiced = data.stats.patternStrengths
    .filter(p => p.attempted > 0)
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  ctx.fillStyle = '#9090a8';
  ctx.font = '11px "JetBrains Mono", "Fira Code", monospace';
  ctx.fillText('TOP PATTERNS', 24, 152);

  practiced.forEach((p, i) => {
    const y = 170 + i * 22;
    // Pattern name
    ctx.fillStyle = '#c0c0d0';
    ctx.font = '12px "JetBrains Mono", "Fira Code", monospace';
    ctx.fillText(p.pattern, 24, y);

    // Score bar
    const barX = 180;
    const barW = 120;
    const barH = 6;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(barX, y - 5, barW, barH);

    const fillW = (p.avgScore / 4) * barW;
    const barColor = p.avgScore >= 3 ? '#a3ff00' : p.avgScore >= 2 ? '#ffaa00' : '#ff3366';
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, y - 5, fillW, barH);

    // Score text
    ctx.fillStyle = barColor;
    ctx.font = '11px "JetBrains Mono", "Fira Code", monospace';
    ctx.fillText(p.avgScore.toFixed(1), barX + barW + 8, y);
  });

  // Activity heatmap thumbnail (right side)
  const hmX = 360;
  const hmY = 148;
  ctx.fillStyle = '#9090a8';
  ctx.font = '11px "JetBrains Mono", "Fira Code", monospace';
  ctx.fillText('ACTIVITY (90 DAYS)', hmX, 152);

  // Build day counts for last 90 days
  const dayCounts: Record<string, number> = {};
  for (const s of data.stats.sessions) {
    dayCounts[s.date] = (dayCounts[s.date] || 0) + 1;
  }

  const cellSize = 7;
  const cellGap = 2;
  const days = 91; // 13 weeks
  const now = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const key = date.toISOString().split('T')[0];
    const count = dayCounts[key] || 0;
    const dayOfWeek = date.getDay();
    const weekIndex = Math.floor((days - 1 - d) / 7);

    const cx = hmX + weekIndex * (cellSize + cellGap);
    const cy = hmY + 16 + dayOfWeek * (cellSize + cellGap);

    if (count === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    } else if (count === 1) {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    } else if (count === 2) {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
    } else {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
    }

    ctx.fillRect(cx, cy, cellSize, cellSize);
  }

  // Unlocked achievements row
  const unlockedAchievements = data.achievements.filter(a => a.unlockedAt);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(24, 310, W - 48, 1);

  ctx.fillStyle = '#9090a8';
  ctx.font = '11px "JetBrains Mono", "Fira Code", monospace';
  ctx.fillText('ACHIEVEMENTS', 24, 332);

  const achievementIcons = unlockedAchievements.slice(0, 12);
  ctx.font = '20px serif';
  achievementIcons.forEach((a, i) => {
    ctx.fillText(a.icon, 24 + i * 28, 358);
  });

  if (unlockedAchievements.length > 12) {
    ctx.fillStyle = '#606078';
    ctx.font = '12px "JetBrains Mono", "Fira Code", monospace';
    ctx.fillText(`+${unlockedAchievements.length - 12}`, 24 + 12 * 28 + 4, 358);
  }

  // Watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.font = '10px "JetBrains Mono", "Fira Code", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('senior-interview-mentor', W - 24, H - 12);
  ctx.textAlign = 'left';

  // Download
  const link = document.createElement('a');
  link.download = 'interview-mentor-profile.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
