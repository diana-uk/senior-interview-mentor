import { describe, it, expect } from 'vitest';
import { escapeHtml, highlightPythonTokens, highlightPython } from '../syntaxHighlightUtils';

// ─── escapeHtml ───────────────────────────────────────────────────────────────

describe('escapeHtml', () => {
  it('returns empty string unchanged', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('escapes & to &amp;', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes < to &lt;', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('escapes > to &gt;', () => {
    expect(escapeHtml('x > y')).toBe('x &gt; y');
  });

  it('escapes double quote to &quot;', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quote to &#x27;', () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s');
  });

  it('escapes multiple special chars in one pass', () => {
    expect(escapeHtml('<a href="x&y">text</a>')).toBe(
      '&lt;a href=&quot;x&amp;y&quot;&gt;text&lt;/a&gt;',
    );
  });

  it('leaves plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

// ─── highlightPythonTokens ────────────────────────────────────────────────────

describe('highlightPythonTokens', () => {
  it('wraps a keyword in keyword span', () => {
    const result = highlightPythonTokens('return x');
    expect(result).toContain('<span class="aw__syn--keyword">return</span>');
  });

  it('wraps a type in type span', () => {
    const result = highlightPythonTokens('x: int = 5');
    expect(result).toContain('<span class="aw__syn--type">int</span>');
  });

  it('wraps function call name in func span', () => {
    const result = highlightPythonTokens('my_func(x)');
    expect(result).toContain('<span class="aw__syn--func">my_func</span>');
  });

  it('does not wrap keyword as a function', () => {
    const result = highlightPythonTokens('for(i)');
    expect(result).not.toContain('<span class="aw__syn--func">for</span>');
  });

  it('wraps double-quoted string in string span', () => {
    const result = highlightPythonTokens('"hello"');
    expect(result).toContain('aw__syn--string');
  });
});

// ─── highlightPython ──────────────────────────────────────────────────────────

describe('highlightPython', () => {
  it('returns &nbsp; for blank line', () => {
    expect(highlightPython('')).toBe('&nbsp;');
  });

  it('returns &nbsp; for whitespace-only line', () => {
    expect(highlightPython('   ')).toBe('&nbsp;');
  });

  it('wraps comment portion in comment span', () => {
    const result = highlightPython('x = 1 # this is a comment');
    expect(result).toContain('<span class="aw__syn--comment"># this is a comment</span>');
  });

  it('still highlights code before the comment', () => {
    const result = highlightPython('return x # done');
    expect(result).toContain('aw__syn--keyword');
    expect(result).toContain('aw__syn--comment');
  });

  it('handles a line with no comment or special tokens', () => {
    const result = highlightPython('x = 1');
    expect(result).toBe('x = 1');
  });

  it('highlights a def line correctly', () => {
    const result = highlightPython('def my_func(x):');
    expect(result).toContain('<span class="aw__syn--keyword">def</span>');
    expect(result).toContain('<span class="aw__syn--func">my_func</span>');
  });
});
