import { config } from '../config.js';
import { streamChatResponse, type ClaudeStream } from './claude.js';
import { streamChatResponseSdk } from './claudeSdk.js';
import type { ChatRequest } from '../types.js';

export type AIBackend = 'cli' | 'sdk';

export interface AIStream {
  onText: (cb: (text: string) => void) => void;
  onDone: (cb: () => void) => void;
  onError: (cb: (err: string) => void) => void;
  kill: () => void;
}

export function getAIBackend(): AIBackend {
  return config.anthropicApiKey ? 'sdk' : 'cli';
}

export function streamChat(
  request: ChatRequest,
  signal?: AbortSignal,
): AIStream {
  const backend = getAIBackend();

  if (backend === 'sdk') {
    const stream = streamChatResponseSdk(request, signal);
    return {
      onText: stream.onText,
      onDone: (cb) => stream.onDone(() => cb()),
      onError: stream.onError,
      kill: stream.kill,
    };
  }

  // CLI backend
  const stream: ClaudeStream = streamChatResponse(request, signal);
  return {
    onText: stream.onText,
    onDone: stream.onDone,
    onError: stream.onError,
    kill: stream.kill,
  };
}
