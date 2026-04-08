/** Escape special HTML characters to prevent XSS in rendered code. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const PYTHON_KEYWORDS = [
  'class', 'def', 'return', 'if', 'else', 'elif', 'for', 'while',
  'in', 'not', 'and', 'or', 'import', 'from', 'self',
];
const PYTHON_TYPES = ['int', 'str', 'List', 'Dict', 'bool', 'None', 'True', 'False'];

/**
 * Wrap Python keywords, types, function names, and string literals
 * in `<span>` elements for syntax highlighting.
 * Input must already be HTML-safe (call escapeHtml first).
 */
export function highlightPythonTokens(text: string): string {
  let result = escapeHtml(text);

  PYTHON_KEYWORDS.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    result = result.replace(regex, `<span class="aw__syn--keyword">$1</span>`);
  });

  PYTHON_TYPES.forEach((t) => {
    const regex = new RegExp(`\\b(${t})\\b`, 'g');
    result = result.replace(regex, `<span class="aw__syn--type">$1</span>`);
  });

  // Highlight function names (word before open paren)
  result = result.replace(/\b(\w+)(\()/g, (_, name, paren) => {
    if (PYTHON_KEYWORDS.includes(name) || PYTHON_TYPES.includes(name)) return `${name}${paren}`;
    return `<span class="aw__syn--func">${name}</span>${paren}`;
  });

  // Highlight strings (already HTML-escaped quote entities)
  result = result.replace(
    /(&quot;[^&]*&quot;|&#x27;[^&]*&#x27;)/g,
    '<span class="aw__syn--string">$1</span>',
  );

  return result;
}

/**
 * Apply Python syntax highlighting to a single line of code.
 * - Blank lines return `&nbsp;` to preserve spacing.
 * - Comment portions (`# …`) are wrapped separately.
 */
export function highlightPython(line: string): string {
  if (!line.trim()) return '&nbsp;';

  const commentIdx = line.indexOf('#');
  if (commentIdx !== -1) {
    const before = line.substring(0, commentIdx);
    const comment = line.substring(commentIdx);
    return `${highlightPythonTokens(before)}<span class="aw__syn--comment">${escapeHtml(comment)}</span>`;
  }

  return highlightPythonTokens(line);
}
