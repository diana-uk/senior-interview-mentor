import { describe, it, expect, vi } from 'vitest';

// Mock config and dependencies to avoid subprocess / file system access at import time
vi.mock('../../../server/config.js', () => ({
  config: {
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    appUrl: 'http://localhost:5173',
    port: 3001,
    nodeEnv: 'test',
    anthropicApiKey: '',
    sentryDsn: '',
    projectRoot: '/mock',
    gitBashPath: undefined,
    claudeCliPath: undefined,
  },
}));

vi.mock('../../../server/services/systemPrompt.js', () => ({
  buildSessionContext: vi.fn(() => ''),
}));

import { stripToolCalls, extractText } from '../../../server/services/claude';

// ─── stripToolCalls ───────────────────────────────────────────────────────────

describe('stripToolCalls', () => {
  describe('empty / passthrough', () => {
    it('returns empty string unchanged', () => {
      expect(stripToolCalls('')).toBe('');
    });

    it('returns plain text unchanged', () => {
      expect(stripToolCalls('Hello, this is a normal response.')).toBe('Hello, this is a normal response.');
    });
  });

  describe('<tool_call> block removal', () => {
    it('removes a single tool_call block', () => {
      const input = 'Here is my answer.\n<tool_call>\n{"name":"Read","input":{}}\n</tool_call>';
      const result = stripToolCalls(input);
      expect(result).not.toContain('<tool_call>');
      expect(result).not.toContain('</tool_call>');
    });

    it('preserves text before the tool_call block', () => {
      const input = 'The answer is 42.\n<tool_call>\n{"name":"Read"}\n</tool_call>';
      const result = stripToolCalls(input);
      expect(result).toContain('The answer is 42.');
    });

    it('removes multiple tool_call blocks', () => {
      const input = 'Start.\n<tool_call>{"a":1}</tool_call>\nMiddle.\n<tool_call>{"b":2}</tool_call>\nEnd.';
      const result = stripToolCalls(input);
      expect(result).not.toContain('<tool_call>');
      expect(result).toContain('Middle.');
      expect(result).toContain('End.');
    });

    it('handles tool_call with whitespace inside', () => {
      const input = '<tool_call>  \n  {"name": "Grep"}  \n  </tool_call>';
      const result = stripToolCalls(input);
      expect(result).toBe('');
    });
  });

  describe('preamble line removal', () => {
    it('removes "Let me read the backend files..." preamble', () => {
      // Regex: "Let me read" + "the " + "backend " + "files"
      const input = 'Let me read the backend files to help you.\nHere is the answer.';
      const result = stripToolCalls(input);
      expect(result).not.toContain('Let me read');
      expect(result).toContain('Here is the answer.');
    });

    it('removes "Let me check server files..." preamble', () => {
      const input = 'Let me check server files.\nHere is what I found.';
      const result = stripToolCalls(input);
      expect(result).not.toContain('Let me check');
    });

    it('removes "Let me look at frontend files..." preamble', () => {
      const input = 'Let me look at frontend files.\nThe answer is below.';
      const result = stripToolCalls(input);
      expect(result).not.toContain('Let me look at');
    });

    it('removes "Let me search relevant files..." preamble', () => {
      const input = 'Let me search relevant files.\nDone.';
      const result = stripToolCalls(input);
      expect(result).not.toContain('Let me search');
    });

    it('removes "Let me grep the files..." preamble', () => {
      const input = 'Let me grep the files.\nResult below.';
      const result = stripToolCalls(input);
      expect(result).not.toContain('Let me grep');
    });

    it('does not remove "Let me explain..." (not a file op)', () => {
      const input = 'Let me explain the algorithm to you.\nIt works by...';
      const result = stripToolCalls(input);
      expect(result).toContain('Let me explain');
    });

    it('does not remove "Let me search the codebase..." (no "file" word)', () => {
      // Regex requires "files?" — "codebase" does not match
      const input = 'Let me search the codebase.\nDone.';
      const result = stripToolCalls(input);
      expect(result).toContain('Let me search the codebase.');
    });
  });

  describe('trimming', () => {
    it('trims leading and trailing whitespace from result', () => {
      const input = '   Hello world.   ';
      const result = stripToolCalls(input);
      expect(result).toBe('Hello world.');
    });

    it('returns empty string when only a tool_call block remains', () => {
      const result = stripToolCalls('<tool_call>{"x":1}</tool_call>');
      expect(result).toBe('');
    });
  });
});

// ─── extractText ──────────────────────────────────────────────────────────────

describe('extractText', () => {
  describe('valid assistant events', () => {
    it('extracts text from a well-formed assistant event', () => {
      const event = {
        type: 'assistant',
        message: {
          content: [
            { type: 'text', text: 'Hello from the model!' },
          ],
        },
      };
      expect(extractText(event)).toBe('Hello from the model!');
    });

    it('concatenates multiple text blocks', () => {
      const event = {
        type: 'assistant',
        message: {
          content: [
            { type: 'text', text: 'Part one. ' },
            { type: 'text', text: 'Part two.' },
          ],
        },
      };
      expect(extractText(event)).toBe('Part one. Part two.');
    });

    it('skips non-text content blocks', () => {
      const event = {
        type: 'assistant',
        message: {
          content: [
            { type: 'tool_use', id: 'abc', name: 'Read', input: {} },
            { type: 'text', text: 'Answer text.' },
          ],
        },
      };
      expect(extractText(event)).toBe('Answer text.');
    });
  });

  describe('returns null cases', () => {
    it('returns null for non-assistant event types', () => {
      expect(extractText({ type: 'system', content: 'system message' })).toBeNull();
    });

    it('returns null for result event type', () => {
      expect(extractText({ type: 'result', result: 'final text' })).toBeNull();
    });

    it('returns null for assistant event with empty content array', () => {
      const event = {
        type: 'assistant',
        message: { content: [] },
      };
      expect(extractText(event)).toBeNull();
    });

    it('returns null when content has only non-text blocks', () => {
      const event = {
        type: 'assistant',
        message: {
          content: [{ type: 'tool_use', id: 'x', name: 'Read', input: {} }],
        },
      };
      expect(extractText(event)).toBeNull();
    });

    it('returns null when message is missing', () => {
      expect(extractText({ type: 'assistant' })).toBeNull();
    });

    it('returns null for empty object', () => {
      expect(extractText({})).toBeNull();
    });
  });
});
