import { Router } from 'express';
import { chatRequestSchema } from '../types.js';
import { validate } from '../middleware/validate.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { streamChat } from '../services/ai.js';

/**
 * Extract specially-tagged code blocks from Claude's /solve response.
 * Returns the blocks (starterCode, testCode) and the cleaned text
 * with tags removed so the chat still renders normal code fences.
 */
function extractEditorBlocks(text: string) {
  const starterRe = /```typescript\s+starter-code\s*\n([\s\S]*?)```/;
  const testRe = /```typescript\s+test-code\s*\n([\s\S]*?)```/;
  const starterMatch = text.match(starterRe);
  const testMatch = text.match(testRe);

  if (!starterMatch && !testMatch) return { blocks: null, cleaned: text };

  let cleaned = text;
  if (starterMatch) cleaned = cleaned.replace(starterRe, '```typescript\n' + starterMatch[1] + '```');
  if (testMatch) cleaned = cleaned.replace(testRe, '```typescript\n' + testMatch[1] + '```');

  return {
    blocks: {
      starterCode: starterMatch?.[1]?.trimEnd() ?? '',
      testCode: testMatch?.[1]?.trimEnd() ?? '',
    },
    cleaned,
  };
}

/**
 * Drip-feed text to the SSE response in word-sized chunks.
 * Creates a typing effect since `claude -p` returns the full response at once.
 */
async function simulateStream(
  text: string,
  write: (chunk: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const chunks = text.match(/\S+\s*/g) || [text];
  for (const chunk of chunks) {
    if (signal.aborted) return;
    write(chunk);
    await new Promise((r) => setTimeout(r, 15));
  }
}

const router = Router();

router.post('/chat', chatLimiter, validate(chatRequestSchema), (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const abortController = new AbortController();
  let streamingDone: Promise<void> = Promise.resolve();

  req.on('close', () => {
    abortController.abort();
  });

  const stream = streamChat(req.body, abortController.signal);

  stream.onText((text) => {
    // Extract editor blocks from the full response
    const { blocks, cleaned } = extractEditorBlocks(text);

    // Send editor-update event before streaming the text
    if (blocks && (blocks.starterCode || blocks.testCode)) {
      res.write(`data: ${JSON.stringify({ type: 'editor-update', ...blocks })}\n\n`);
    }

    // Simulate streaming for the cleaned text (typing effect)
    streamingDone = simulateStream(
      cleaned,
      (chunk) => {
        if (!abortController.signal.aborted) {
          const data = JSON.stringify({ type: 'delta', text: chunk });
          res.write(`data: ${data}\n\n`);
        }
      },
      abortController.signal,
    );
  });

  stream.onDone(() => {
    // Wait for simulated streaming to finish before sending done
    streamingDone.then(() => {
      if (!abortController.signal.aborted) {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      }
      res.end();
    });
  });

  stream.onError((message) => {
    if (abortController.signal.aborted) {
      res.end();
      return;
    }
    console.error('[Chat Stream Error]', message);
    res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
    res.end();
  });
});

export default router;
