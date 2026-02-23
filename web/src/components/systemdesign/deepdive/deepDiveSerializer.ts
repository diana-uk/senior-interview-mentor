import type { DeepDiveChallenge } from '../../../types';

export function serializeDeepDivesToText(challenges: DeepDiveChallenge[]): string {
  if (challenges.length === 0) return 'No deep dive challenges defined yet.';

  const lines: string[] = [`Deep Dive Challenges (${challenges.length}):`];

  for (let i = 0; i < challenges.length; i++) {
    const ch = challenges[i];
    lines.push('');
    lines.push(`${i + 1}. ${ch.title.trim() || '(untitled)'}`);
    lines.push(`   Problem: ${ch.problem.trim() || '(none)'}`);

    if (ch.approaches.length > 0) {
      lines.push(`   Approaches:`);
      for (let j = 0; j < ch.approaches.length; j++) {
        const a = ch.approaches[j];
        const marker = j === ch.chosenIndex ? ' [CHOSEN]' : '';
        lines.push(`     ${j + 1}. ${a.name.trim() || '(unnamed)'}${marker}`);
        lines.push(`        Pros: ${a.pros.trim() || '(none)'}`);
        lines.push(`        Cons: ${a.cons.trim() || '(none)'}`);
      }
    }

    lines.push(`   Justification: ${ch.justification.trim() || '(none)'}`);
    lines.push(`   Tradeoffs: ${ch.tradeoffs.trim() || '(none)'}`);
  }

  return lines.join('\n');
}
