import type { DbChoice } from '../../../types';

const DB_LABELS: Record<string, string> = {
  sql: 'SQL (Relational)',
  nosql: 'NoSQL (Document/KV)',
  both: 'Polyglot Persistence',
};

export function serializeDataModelToText(
  schema: string,
  dbChoice: DbChoice,
  dbJustification: string,
): string {
  const trimmedSchema = schema.trim();
  const trimmedJustification = dbJustification.trim();

  const lines: string[] = ['Data Model:', ''];

  lines.push('Schema:');
  lines.push(trimmedSchema || '(none defined)');
  lines.push('');

  lines.push(`Database Choice: ${dbChoice ? DB_LABELS[dbChoice] ?? dbChoice : '(not selected)'}`);
  lines.push(`Justification: ${trimmedJustification || '(none)'}`);

  return lines.join('\n');
}
