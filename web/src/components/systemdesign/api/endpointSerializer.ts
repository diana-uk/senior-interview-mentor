import type { Endpoint } from '../../../types';

export function isEmptyBody(body: string): boolean {
  const trimmed = body.trim();
  return trimmed === '' || trimmed === '{}' || trimmed === '{\n}' || /^\{\s*\}$/.test(trimmed);
}

export function formatBody(body: string): string {
  if (isEmptyBody(body)) return '(none)';
  return body
    .split('\n')
    .map((line) => `   ${line}`)
    .join('\n')
    .trimEnd();
}

export function serializeEndpointsToText(endpoints: Endpoint[]): string {
  if (endpoints.length === 0) return 'No endpoints defined yet.';

  const lines: string[] = [`API Endpoints (${endpoints.length}):`];

  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    lines.push('');
    lines.push(`${i + 1}. ${ep.method} ${ep.path || '(no path)'}`);
    lines.push(`   Description: ${ep.description.trim() || '(none)'}`);
    lines.push(`   Request Body:`);
    lines.push(formatBody(ep.requestBody));
    lines.push(`   Response Body:`);
    lines.push(formatBody(ep.responseBody));
  }

  return lines.join('\n');
}
