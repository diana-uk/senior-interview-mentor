import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ──────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  messagesCreate: vi.fn(),
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: function Anthropic() {
    return { messages: { create: mocks.messagesCreate } };
  },
}));

vi.mock('../../../server/config.js', () => ({
  config: { anthropicApiKey: 'test-key' },
}));

vi.mock('../../../server/utils/promptBuilder.js', () => ({
  buildChatPrompt: vi.fn(() => 'test-prompt'),
}));

import { streamChatResponseSdk } from '../../../server/services/claudeSdk';

// Flush microtasks so the internal async IIFE in claudeSdk resolves
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function makeRequest() {
  return {
    messages: [{ role: 'user' as const, content: 'Hello' }],
  };
}

function makeResponse(overrides: Record<string, unknown> = {}) {
  return {
    content: [{ type: 'text', text: 'Model answer.' }],
    usage: { input_tokens: 10, output_tokens: 20 },
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('streamChatResponseSdk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Return value shape ────────────────────────────────────────────────────

  describe('return value', () => {
    it('has onText method', () => {
      mocks.messagesCreate.mockResolvedValue(makeResponse());
      const stream = streamChatResponseSdk(makeRequest());
      expect(typeof stream.onText).toBe('function');
    });

    it('has onDone method', () => {
      mocks.messagesCreate.mockResolvedValue(makeResponse());
      const stream = streamChatResponseSdk(makeRequest());
      expect(typeof stream.onDone).toBe('function');
    });

    it('has onError method', () => {
      mocks.messagesCreate.mockResolvedValue(makeResponse());
      const stream = streamChatResponseSdk(makeRequest());
      expect(typeof stream.onError).toBe('function');
    });

    it('has kill method', () => {
      mocks.messagesCreate.mockResolvedValue(makeResponse());
      const stream = streamChatResponseSdk(makeRequest());
      expect(typeof stream.kill).toBe('function');
    });
  });

  // ── Successful response ───────────────────────────────────────────────────

  describe('successful response', () => {
    it('emits text via onText callback', async () => {
      mocks.messagesCreate.mockResolvedValue(
        makeResponse({ content: [{ type: 'text', text: 'Hello!' }] }),
      );
      const stream = streamChatResponseSdk(makeRequest());
      const textCb = vi.fn();
      stream.onText(textCb);
      await flush();
      expect(textCb).toHaveBeenCalledWith('Hello!');
    });

    it('concatenates multiple text blocks into a single onText call', async () => {
      mocks.messagesCreate.mockResolvedValue({
        content: [
          { type: 'text', text: 'Part A. ' },
          { type: 'text', text: 'Part B.' },
        ],
        usage: { input_tokens: 10, output_tokens: 20 },
      });
      const stream = streamChatResponseSdk(makeRequest());
      const textCb = vi.fn();
      stream.onText(textCb);
      await flush();
      expect(textCb).toHaveBeenCalledWith('Part A. Part B.');
    });

    it('skips non-text blocks and still emits remaining text', async () => {
      mocks.messagesCreate.mockResolvedValue({
        content: [
          { type: 'tool_use', id: 'x', name: 'Read', input: {} },
          { type: 'text', text: 'Answer.' },
        ],
        usage: { input_tokens: 5, output_tokens: 10 },
      });
      const stream = streamChatResponseSdk(makeRequest());
      const textCb = vi.fn();
      stream.onText(textCb);
      await flush();
      expect(textCb).toHaveBeenCalledWith('Answer.');
    });

    it('does not call onText when response has only non-text blocks', async () => {
      mocks.messagesCreate.mockResolvedValue({
        content: [{ type: 'tool_use', id: 'x', name: 'Read', input: {} }],
        usage: { input_tokens: 5, output_tokens: 0 },
      });
      const stream = streamChatResponseSdk(makeRequest());
      const textCb = vi.fn();
      stream.onText(textCb);
      await flush();
      expect(textCb).not.toHaveBeenCalled();
    });

    it('does not call onText when response has empty content array', async () => {
      mocks.messagesCreate.mockResolvedValue({
        content: [],
        usage: { input_tokens: 1, output_tokens: 0 },
      });
      const stream = streamChatResponseSdk(makeRequest());
      const textCb = vi.fn();
      stream.onText(textCb);
      await flush();
      expect(textCb).not.toHaveBeenCalled();
    });

    it('calls onDone with inputTokens and outputTokens', async () => {
      mocks.messagesCreate.mockResolvedValue(
        makeResponse({ usage: { input_tokens: 7, output_tokens: 42 } }),
      );
      const stream = streamChatResponseSdk(makeRequest());
      const doneCb = vi.fn();
      stream.onDone(doneCb);
      await flush();
      expect(doneCb).toHaveBeenCalledWith({ inputTokens: 7, outputTokens: 42 });
    });

    it('calls onDone even when there is no text in the response', async () => {
      mocks.messagesCreate.mockResolvedValue({
        content: [],
        usage: { input_tokens: 2, output_tokens: 0 },
      });
      const stream = streamChatResponseSdk(makeRequest());
      const doneCb = vi.fn();
      stream.onDone(doneCb);
      await flush();
      expect(doneCb).toHaveBeenCalledWith({ inputTokens: 2, outputTokens: 0 });
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('calls onError with the Error message on API failure', async () => {
      mocks.messagesCreate.mockRejectedValue(new Error('API rate limit exceeded'));
      const stream = streamChatResponseSdk(makeRequest());
      const errorCb = vi.fn();
      stream.onError(errorCb);
      await flush();
      expect(errorCb).toHaveBeenCalledWith('API rate limit exceeded');
    });

    it('calls onError with "Anthropic SDK error" for non-Error throws', async () => {
      mocks.messagesCreate.mockRejectedValue('some string error');
      const stream = streamChatResponseSdk(makeRequest());
      const errorCb = vi.fn();
      stream.onError(errorCb);
      await flush();
      expect(errorCb).toHaveBeenCalledWith('Anthropic SDK error');
    });

    it('does not call onText or onDone on error', async () => {
      mocks.messagesCreate.mockRejectedValue(new Error('fail'));
      const stream = streamChatResponseSdk(makeRequest());
      const textCb = vi.fn();
      const doneCb = vi.fn();
      stream.onText(textCb);
      stream.onDone(doneCb);
      await flush();
      expect(textCb).not.toHaveBeenCalled();
      expect(doneCb).not.toHaveBeenCalled();
    });
  });

  // ── Abort / kill ──────────────────────────────────────────────────────────

  describe('kill()', () => {
    it('suppresses onText and onDone after kill', async () => {
      mocks.messagesCreate.mockResolvedValue(makeResponse());
      const stream = streamChatResponseSdk(makeRequest());
      const textCb = vi.fn();
      const doneCb = vi.fn();
      stream.onText(textCb);
      stream.onDone(doneCb);
      stream.kill();
      await flush();
      expect(textCb).not.toHaveBeenCalled();
      expect(doneCb).not.toHaveBeenCalled();
    });

    it('suppresses onError after kill', async () => {
      mocks.messagesCreate.mockRejectedValue(new Error('fail'));
      const stream = streamChatResponseSdk(makeRequest());
      const errorCb = vi.fn();
      stream.onError(errorCb);
      stream.kill();
      await flush();
      expect(errorCb).not.toHaveBeenCalled();
    });
  });

  describe('AbortSignal', () => {
    it('suppresses onText and onDone when signal is aborted', async () => {
      mocks.messagesCreate.mockResolvedValue(makeResponse());
      const controller = new AbortController();
      const stream = streamChatResponseSdk(makeRequest(), controller.signal);
      const textCb = vi.fn();
      const doneCb = vi.fn();
      stream.onText(textCb);
      stream.onDone(doneCb);
      controller.abort();
      await flush();
      expect(textCb).not.toHaveBeenCalled();
      expect(doneCb).not.toHaveBeenCalled();
    });

    it('suppresses onError when signal is aborted before rejection', async () => {
      mocks.messagesCreate.mockRejectedValue(new Error('fail'));
      const controller = new AbortController();
      const stream = streamChatResponseSdk(makeRequest(), controller.signal);
      const errorCb = vi.fn();
      stream.onError(errorCb);
      controller.abort();
      await flush();
      expect(errorCb).not.toHaveBeenCalled();
    });
  });
});
