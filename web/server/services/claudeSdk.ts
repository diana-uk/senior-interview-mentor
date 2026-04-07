import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';
import { buildChatPrompt } from '../utils/promptBuilder.js';
import type { ChatRequest } from '../types.js';

const MODEL = 'claude-sonnet-4-5-20250929';

export interface SdkStream {
  onText: (cb: (text: string) => void) => void;
  onDone: (cb: (usage?: { inputTokens: number; outputTokens: number }) => void) => void;
  onError: (cb: (err: string) => void) => void;
  kill: () => void;
}

export function streamChatResponseSdk(
  request: ChatRequest,
  signal?: AbortSignal,
): SdkStream {
  const prompt = buildChatPrompt(request.messages, request.context);

  console.log(`\n[Anthropic SDK] Prompt length: ${prompt.length} chars, Messages: ${request.messages.length}`);

  const callbacks = {
    text: null as ((text: string) => void) | null,
    done: null as ((usage?: { inputTokens: number; outputTokens: number }) => void) | null,
    error: null as ((err: string) => void) | null,
  };
  let aborted = false;

  if (signal) {
    signal.addEventListener('abort', () => { aborted = true; });
  }

  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  // Run the request asynchronously
  (async () => {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });

      if (aborted) return;

      // Extract full text from response
      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      if (text && callbacks.text) {
        callbacks.text(text);
      }

      const usage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };

      console.log(`[Anthropic SDK] Tokens — input: ${usage.inputTokens}, output: ${usage.outputTokens}`);

      if (callbacks.done) {
        callbacks.done(usage);
      }
    } catch (err) {
      if (aborted) return;
      const message = err instanceof Error ? err.message : 'Anthropic SDK error';
      console.error('[Anthropic SDK Error]', message);
      if (callbacks.error) {
        callbacks.error(message);
      }
    }
  })();

  return {
    onText: (cb) => { callbacks.text = cb; },
    onDone: (cb) => { callbacks.done = cb; },
    onError: (cb) => { callbacks.error = cb; },
    kill: () => { aborted = true; },
  };
}
