import { spawn, type ChildProcess } from 'node:child_process';
import { config } from '../config.js';
import { buildSessionContext } from './systemPrompt.js';
import type { ChatRequest, ChatMessagePayload } from '../types.js';

const MAX_MESSAGES = 40;

function buildPrompt(messages: ChatMessagePayload[], context?: ChatRequest['context']): string {
  const trimmed = messages.slice(-MAX_MESSAGES);
  const parts: string[] = [];

  // Session context
  const sessionContext = buildSessionContext(context);
  if (sessionContext) {
    parts.push(sessionContext);
    parts.push('---');
  }

  // Format conversation history — all messages except the last one
  if (trimmed.length > 1) {
    parts.push('Conversation so far:');
    const history = trimmed.slice(0, -1);
    for (const m of history) {
      const role = m.role === 'user' ? 'User' : 'Mentor';
      parts.push(`${role}: ${m.content}`);
    }
    parts.push('---');
  }

  // Latest user message
  const last = trimmed[trimmed.length - 1];
  if (last) {
    parts.push(last.content);
  }

  return parts.join('\n\n');
}

export interface ClaudeStream {
  process: ChildProcess;
  onText: (cb: (text: string) => void) => void;
  onDone: (cb: () => void) => void;
  onError: (cb: (err: string) => void) => void;
  kill: () => void;
}

export function streamChatResponse(
  request: ChatRequest,
  signal?: AbortSignal,
): ClaudeStream {
  const prompt = buildPrompt(request.messages, request.context);

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║       PROMPT SENT TO CLAUDE CLI      ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(prompt);
  console.log('╚══════════════════════════════════════╝\n');

  const env = { ...process.env };
  if (config.gitBashPath) {
    env.CLAUDE_CODE_GIT_BASH_PATH = config.gitBashPath;
  }

  const args = ['-p', '--output-format', 'stream-json', '--verbose'];

  // On Windows, call node with the CLI script directly to avoid cmd.exe shell issues
  const useDirectNode = !!(config.claudeCliPath && process.platform === 'win32');
  const command = useDirectNode ? process.execPath : 'claude';
  const spawnArgs = useDirectNode ? [config.claudeCliPath!, ...args] : args;

  const child = spawn(command, spawnArgs, {
    cwd: config.projectRoot,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: !useDirectNode,
    env,
  });

  // Send prompt via stdin
  child.stdin.write(prompt);
  child.stdin.end();

  if (signal) {
    signal.addEventListener('abort', () => {
      child.kill();
    });
  }

  let textCallback: ((text: string) => void) | null = null;
  let doneCallback: (() => void) | null = null;
  let errorCallback: ((err: string) => void) | null = null;

  let buffer = '';
  let textSent = false;

  child.stdout.on('data', (chunk: Buffer) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const event = JSON.parse(trimmed);
        if (!textSent) {
          const text = extractText(event);
          if (text && textCallback) {
            textCallback(text);
            textSent = true;
          }
        }
      } catch {
        // skip non-JSON lines
      }
    }
  });

  let stderrOutput = '';
  child.stderr.on('data', (chunk: Buffer) => {
    stderrOutput += chunk.toString();
  });

  child.on('close', (code) => {
    // Process remaining buffer
    if (buffer.trim() && !textSent) {
      try {
        const event = JSON.parse(buffer.trim());
        const text = extractText(event);
        if (text && textCallback) {
          textCallback(text);
          textSent = true;
        }
      } catch {
        // ignore
      }
    }

    if (code !== 0 && code !== null && !textSent && errorCallback) {
      const msg = stderrOutput.trim() || `Claude CLI exited with code ${code}`;
      errorCallback(msg);
    } else if (doneCallback) {
      doneCallback();
    }
  });

  child.on('error', (err) => {
    if (errorCallback) {
      errorCallback(`Failed to start Claude CLI: ${err.message}`);
    }
  });

  return {
    process: child,
    onText: (cb) => { textCallback = cb; },
    onDone: (cb) => { doneCallback = cb; },
    onError: (cb) => { errorCallback = cb; },
    kill: () => { child.kill(); },
  };
}

/**
 * Extract text from a stream-json event.
 * Real format from `claude -p --output-format stream-json --verbose`:
 *   {"type":"assistant","message":{"content":[{"type":"text","text":"..."}]}}
 */
function extractText(event: Record<string, unknown>): string | null {
  if (event.type === 'assistant' && event.message) {
    const msg = event.message as Record<string, unknown>;
    if (Array.isArray(msg.content)) {
      const texts: string[] = [];
      for (const block of msg.content) {
        if (
          typeof block === 'object' &&
          block !== null &&
          'type' in block &&
          (block as Record<string, unknown>).type === 'text' &&
          typeof (block as Record<string, unknown>).text === 'string'
        ) {
          texts.push((block as Record<string, unknown>).text as string);
        }
      }
      return texts.join('') || null;
    }
  }
  return null;
}
