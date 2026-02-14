export interface FillerReport {
  totalFillers: number;
  fillers: Record<string, number>;
  wordCount: number;
  fillerRate: number;
}

const FILLER_PATTERNS: [RegExp, string][] = [
  // Hesitation fillers
  [/\bum\b/gi, 'um'],
  [/\buh\b/gi, 'uh'],
  [/\bhmm+\b/gi, 'hmm'],
  [/\ber\b/gi, 'er'],
  [/\bah\b/gi, 'ah'],
  // Hedge words
  [/\blike\b/gi, 'like'],
  [/\bbasically\b/gi, 'basically'],
  [/\bactually\b/gi, 'actually'],
  [/\bliterally\b/gi, 'literally'],
  [/\bhonestly\b/gi, 'honestly'],
  // Filler phrases
  [/\byou know\b/gi, 'you know'],
  [/\bsort of\b/gi, 'sort of'],
  [/\bkind of\b/gi, 'kind of'],
  [/\bi mean\b/gi, 'I mean'],
  [/\bright\b/gi, 'right'],
];

export function detectFillers(text: string): FillerReport {
  const fillers: Record<string, number> = {};
  let totalFillers = 0;

  for (const [pattern, label] of FILLER_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      fillers[label] = (fillers[label] || 0) + matches.length;
      totalFillers += matches.length;
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const fillerRate = wordCount > 0 ? (totalFillers / wordCount) * 100 : 0;

  return { totalFillers, fillers, wordCount, fillerRate };
}

export function getFillerFeedback(report: FillerReport): string {
  if (report.totalFillers === 0) {
    return 'No filler words detected. Clean communication!';
  }

  const details = Object.entries(report.fillers)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => `'${word}' \u00d7${count}`)
    .join(', ');

  const rate = report.fillerRate.toFixed(1);
  const summary = `${report.totalFillers} filler${report.totalFillers === 1 ? '' : 's'} in ${report.wordCount} words (${rate} per 100 words)`;

  let tip = '';
  if (report.fillerRate > 5) {
    tip = ' Try pausing silently instead of using filler words.';
  } else if (report.fillerRate > 2) {
    tip = ' Mostly clean — a few pauses could replace the remaining fillers.';
  }

  return `${summary} — ${details}.${tip}`;
}
