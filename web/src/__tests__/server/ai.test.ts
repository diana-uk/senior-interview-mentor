import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => {
  const mockCliStream = {
    onText: vi.fn(),
    onDone: vi.fn(),
    onError: vi.fn(),
    kill: vi.fn(),
  };
  const mockSdkStream = {
    onText: vi.fn(),
    onDone: vi.fn(),
    onError: vi.fn(),
    kill: vi.fn(),
  };
  const mockStreamChatResponse = vi.fn(() => mockCliStream);
  const mockStreamChatResponseSdk = vi.fn(() => mockSdkStream);

  return { mockCliStream, mockSdkStream, mockStreamChatResponse, mockStreamChatResponseSdk };
});

vi.mock('../../../server/services/claude.js', () => ({
  streamChatResponse: mocks.mockStreamChatResponse,
}));

vi.mock('../../../server/services/claudeSdk.js', () => ({
  streamChatResponseSdk: mocks.mockStreamChatResponseSdk,
}));

// Config is mutable per test — start with no API key (CLI backend)
let mockApiKey = '';

vi.mock('../../../server/config.js', () => ({
  config: new Proxy({} as Record<string, unknown>, {
    get(_, key) {
      if (key === 'anthropicApiKey') return mockApiKey;
      return '';
    },
  }),
}));

import { getAIBackend, streamChat } from '../../../server/services/ai';
import type { ChatRequest } from '../../../server/types';

const request: ChatRequest = {
  messages: [{ role: 'user', content: 'Hello' }],
};

beforeEach(() => {
  mockApiKey = '';
  mocks.mockStreamChatResponse.mockClear();
  mocks.mockStreamChatResponseSdk.mockClear();
  mocks.mockCliStream.onText.mockClear();
  mocks.mockCliStream.onDone.mockClear();
  mocks.mockCliStream.onError.mockClear();
  mocks.mockCliStream.kill.mockClear();
  mocks.mockSdkStream.onText.mockClear();
  mocks.mockSdkStream.onDone.mockClear();
  mocks.mockSdkStream.onError.mockClear();
  mocks.mockSdkStream.kill.mockClear();
});

describe('getAIBackend', () => {
  it('returns "cli" when anthropicApiKey is empty', () => {
    mockApiKey = '';
    expect(getAIBackend()).toBe('cli');
  });

  it('returns "sdk" when anthropicApiKey is set', () => {
    mockApiKey = 'sk-ant-test-key';
    expect(getAIBackend()).toBe('sdk');
  });

  it('returns "cli" when anthropicApiKey is falsy (undefined cast to empty)', () => {
    mockApiKey = '';
    expect(getAIBackend()).toBe('cli');
  });
});

describe('streamChat — CLI backend', () => {
  beforeEach(() => {
    mockApiKey = ''; // no key → CLI
  });

  it('calls streamChatResponse (not SDK) when no API key', () => {
    streamChat(request);
    expect(mocks.mockStreamChatResponse).toHaveBeenCalledOnce();
    expect(mocks.mockStreamChatResponseSdk).not.toHaveBeenCalled();
  });

  it('passes request to streamChatResponse', () => {
    streamChat(request);
    expect(mocks.mockStreamChatResponse).toHaveBeenCalledWith(request, undefined);
  });

  it('passes signal to streamChatResponse', () => {
    const signal = new AbortController().signal;
    streamChat(request, signal);
    expect(mocks.mockStreamChatResponse).toHaveBeenCalledWith(request, signal);
  });

  it('returns stream with onText from CLI stream', () => {
    const stream = streamChat(request);
    expect(stream.onText).toBe(mocks.mockCliStream.onText);
  });

  it('returns stream with onDone from CLI stream', () => {
    const stream = streamChat(request);
    expect(stream.onDone).toBe(mocks.mockCliStream.onDone);
  });

  it('returns stream with onError from CLI stream', () => {
    const stream = streamChat(request);
    expect(stream.onError).toBe(mocks.mockCliStream.onError);
  });

  it('returns stream with kill from CLI stream', () => {
    const stream = streamChat(request);
    expect(stream.kill).toBe(mocks.mockCliStream.kill);
  });
});

describe('streamChat — SDK backend', () => {
  beforeEach(() => {
    mockApiKey = 'sk-ant-api-key'; // set → SDK
  });

  it('calls streamChatResponseSdk (not CLI) when API key is set', () => {
    streamChat(request);
    expect(mocks.mockStreamChatResponseSdk).toHaveBeenCalledOnce();
    expect(mocks.mockStreamChatResponse).not.toHaveBeenCalled();
  });

  it('passes request to streamChatResponseSdk', () => {
    streamChat(request);
    expect(mocks.mockStreamChatResponseSdk).toHaveBeenCalledWith(request, undefined);
  });

  it('passes signal to streamChatResponseSdk', () => {
    const signal = new AbortController().signal;
    streamChat(request, signal);
    expect(mocks.mockStreamChatResponseSdk).toHaveBeenCalledWith(request, signal);
  });

  it('returns stream with onText from SDK stream', () => {
    const stream = streamChat(request);
    expect(stream.onText).toBe(mocks.mockSdkStream.onText);
  });

  it('wraps SDK onDone to strip callback argument', () => {
    const stream = streamChat(request);
    // The returned onDone should be a wrapper, not the raw SDK onDone
    expect(stream.onDone).not.toBe(mocks.mockSdkStream.onDone);
  });

  it('SDK onDone wrapper calls inner onDone with a no-arg callback', () => {
    const stream = streamChat(request);

    // Register a callback via the wrapper
    const userCallback = vi.fn();
    stream.onDone(userCallback);

    // Verify the SDK's onDone was called
    expect(mocks.mockSdkStream.onDone).toHaveBeenCalledOnce();

    // Simulate the SDK calling its callback (which calls userCallback internally)
    const sdkCallback = mocks.mockSdkStream.onDone.mock.calls[0][0] as () => void;
    sdkCallback();
    expect(userCallback).toHaveBeenCalledOnce();
  });

  it('returns stream with onError from SDK stream', () => {
    const stream = streamChat(request);
    expect(stream.onError).toBe(mocks.mockSdkStream.onError);
  });

  it('returns stream with kill from SDK stream', () => {
    const stream = streamChat(request);
    expect(stream.kill).toBe(mocks.mockSdkStream.kill);
  });
});
