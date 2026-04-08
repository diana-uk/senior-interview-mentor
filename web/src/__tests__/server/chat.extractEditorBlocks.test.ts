import { describe, it, expect } from 'vitest';
import { extractEditorBlocks } from '../../../server/routes/chat';

// ─── No tagged blocks ─────────────────────────────────────────────────────────

describe('extractEditorBlocks — no tagged blocks', () => {
  it('returns blocks: null when no tagged blocks present', () => {
    const { blocks } = extractEditorBlocks('Hello, here is some text.');
    expect(blocks).toBeNull();
  });

  it('returns cleaned equal to input when no tagged blocks', () => {
    const input = 'Just a regular response with no code.';
    const { cleaned } = extractEditorBlocks(input);
    expect(cleaned).toBe(input);
  });

  it('returns blocks: null for regular (untagged) typescript fence', () => {
    const input = '```typescript\nconst x = 1;\n```';
    const { blocks } = extractEditorBlocks(input);
    expect(blocks).toBeNull();
  });

  it('preserves regular code blocks in cleaned', () => {
    const input = '```typescript\nconst x = 1;\n```';
    const { cleaned } = extractEditorBlocks(input);
    expect(cleaned).toBe(input);
  });
});

// ─── starter-code only ────────────────────────────────────────────────────────

describe('extractEditorBlocks — starter-code only', () => {
  const input = 'Some text.\n```typescript starter-code\nfunction foo(): void {\n  // body\n}\n```\nMore text.';

  it('blocks is not null', () => {
    expect(extractEditorBlocks(input).blocks).not.toBeNull();
  });

  it('extracts starterCode content', () => {
    const { blocks } = extractEditorBlocks(input);
    expect(blocks?.starterCode).toContain('function foo()');
  });

  it('testCode is empty string when absent', () => {
    const { blocks } = extractEditorBlocks(input);
    expect(blocks?.testCode).toBe('');
  });

  it('starter-code tag replaced with regular fence in cleaned', () => {
    const { cleaned } = extractEditorBlocks(input);
    expect(cleaned).not.toContain('starter-code');
    expect(cleaned).toContain('```typescript\n');
  });

  it('text before and after block preserved in cleaned', () => {
    const { cleaned } = extractEditorBlocks(input);
    expect(cleaned).toContain('Some text.');
    expect(cleaned).toContain('More text.');
  });

  it('starterCode is trimmed with trimEnd (no trailing newline)', () => {
    const withTrailingNewline = '```typescript starter-code\nfunction foo() {}\n\n```';
    const { blocks } = extractEditorBlocks(withTrailingNewline);
    expect(blocks?.starterCode).not.toMatch(/\n$/);
  });
});

// ─── test-code only ───────────────────────────────────────────────────────────

describe('extractEditorBlocks — test-code only', () => {
  const input = '```typescript test-code\nconsole.log(foo()); // expected: 1\n```';

  it('extracts testCode content', () => {
    const { blocks } = extractEditorBlocks(input);
    expect(blocks?.testCode).toContain('console.log');
  });

  it('starterCode is empty string when absent', () => {
    const { blocks } = extractEditorBlocks(input);
    expect(blocks?.starterCode).toBe('');
  });

  it('test-code tag replaced with regular fence in cleaned', () => {
    const { cleaned } = extractEditorBlocks(input);
    expect(cleaned).not.toContain('test-code');
    expect(cleaned).toContain('```typescript\n');
  });

  it('testCode is trimmed with trimEnd', () => {
    const withTrailing = '```typescript test-code\nconsole.log(1);\n\n```';
    const { blocks } = extractEditorBlocks(withTrailing);
    expect(blocks?.testCode).not.toMatch(/\n$/);
  });
});

// ─── Both blocks present ──────────────────────────────────────────────────────

describe('extractEditorBlocks — both blocks present', () => {
  const starterBlock = '```typescript starter-code\nfunction twoSum(nums: number[]): number[] {\n  // Your solution here\n}\n```';
  const testBlock = '```typescript test-code\nconsole.log(twoSum([2,7], 9)); // [0,1]\n```';
  const input = `Here is the problem.\n${starterBlock}\n${testBlock}\nGood luck!`;

  it('extracts starterCode from both-block input', () => {
    const { blocks } = extractEditorBlocks(input);
    expect(blocks?.starterCode).toContain('twoSum');
  });

  it('extracts testCode from both-block input', () => {
    const { blocks } = extractEditorBlocks(input);
    expect(blocks?.testCode).toContain('console.log(twoSum');
  });

  it('both tags replaced with regular fences in cleaned', () => {
    const { cleaned } = extractEditorBlocks(input);
    expect(cleaned).not.toContain('starter-code');
    expect(cleaned).not.toContain('test-code');
  });

  it('cleaned has two regular typescript fences', () => {
    const { cleaned } = extractEditorBlocks(input);
    const count = (cleaned.match(/```typescript\n/g) ?? []).length;
    expect(count).toBe(2);
  });

  it('surrounding text preserved in cleaned', () => {
    const { cleaned } = extractEditorBlocks(input);
    expect(cleaned).toContain('Here is the problem.');
    expect(cleaned).toContain('Good luck!');
  });
});
