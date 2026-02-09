import { Router } from 'express';
import { chatRequestSchema } from '../types.js';
import { validate } from '../middleware/validate.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import { streamChatResponse } from '../services/claude.js';

const router = Router();

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

  const stream = streamChatResponse(req.body, abortController.signal);

  stream.onText((text) => {
    streamingDone = simulateStream(
      text,
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
