import { spawn, type ChildProcess } from 'node:child_process';
import { config } from '../config.js';
import { buildSessionContext } from './systemPrompt.js';
import type { ChatRequest, ChatMessagePayload } from '../types.js';

const MAX_MESSAGES = 40;

function buildPrompt(messages: ChatMessagePayload[], context?: ChatRequest['context']): string {
  const trimmed = messages.slice(-MAX_MESSAGES);
  const parts: string[] = [];

  // Core identity — prevent tool use and file reading
  parts.push(
    'You are Senior Mentor, an AI coding interview coach. ' +
    'Respond ONLY with text. You have NO tools available — do NOT output <tool_call>, ' +
    'do NOT attempt to read files, and do NOT reference tool names like Read, Grep, or Bash. ' +
    'Answer directly based on what the user provides.',
  );
  parts.push('---');

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

  console.log(`\n[Claude CLI] Prompt length: ${prompt.length} chars, Messages: ${request.messages.length}`);

  const env = { ...process.env };
  // Remove ALL Claude-related env vars to prevent "nested session" detection when
  // the dev server is launched from within a Claude Code terminal/IDE.
  // Claude Code sets: CLAUDECODE=1, CLAUDE_CODE_*, CLAUDE_AGENT_*, etc.
  const removedKeys: string[] = [];
  for (const key of Object.keys(env)) {
    if (key === 'CLAUDECODE' || key.startsWith('CLAUDE_')) {
      removedKeys.push(key);
      delete env[key];
    }
  }
  if (removedKeys.length > 0) {
    console.log(`[Claude CLI] Stripped env vars to avoid nesting: ${removedKeys.join(', ')}`);
  }
  // Re-add git bash path for Windows (needed by CLI for shell operations)
  if (config.gitBashPath) {
    env.CLAUDE_CODE_GIT_BASH_PATH = config.gitBashPath;
  }
  // Ensure TERM is set (some shells need it)
  env.TERM = env.TERM || 'xterm-256color';

  const args = [
    '-p',
    '--output-format', 'stream-json',
    '--verbose',
    '--tools', '',              // Disable all tools — we only need text responses
    '--strict-mcp-config',      // Skip loading MCP servers from user config
  ];

  // Resolve command: prefer direct path to avoid cmd.exe shell issues on Windows
  let command: string;
  let spawnArgs: string[];
  let useShell: boolean;

  if (config.claudeCliPath) {
    if (config.claudeCliPath.endsWith('.js')) {
      // npm-installed Node.js script — run via node
      command = process.execPath;
      spawnArgs = [config.claudeCliPath, ...args];
    } else {
      // Native binary — run directly
      command = config.claudeCliPath;
      spawnArgs = args;
    }
    useShell = false;
  } else {
    // Fallback: hope 'claude' is on PATH — need shell on all platforms
    // (Windows needs it for .cmd wrappers, Unix for PATH resolution)
    command = 'claude';
    spawnArgs = args;
    useShell = true;
  }

  console.log(`[Claude CLI] Spawning: ${command} ${spawnArgs.join(' ')} (shell=${useShell})`);

  const child = spawn(command, spawnArgs, {
    cwd: config.projectRoot,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: useShell,
    env,
    windowsHide: true,   // Prevent console allocation issues (0xC0000142) on Windows
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
  let resultText = '';

  child.stdout.on('data', (chunk: Buffer) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const event = JSON.parse(trimmed);

        // Accumulate text from assistant messages
        const text = extractText(event);
        if (text) resultText += (resultText ? '' : '') + text;

        // Also capture the final result text (most reliable)
        if (event.type === 'result' && typeof event.result === 'string') {
          resultText = event.result;
        }
      } catch {
        // skip non-JSON lines
      }
    }
  });

  let stderrOutput = '';
  child.stderr.on('data', (chunk: Buffer) => {
    const text = chunk.toString();
    stderrOutput += text;
    // Log stderr in real time for debugging
    if (text.trim()) {
      console.error(`[Claude CLI stderr] ${text.trim()}`);
    }
  });

  child.on('close', (code) => {
    console.log(`[Claude CLI] Process exited with code ${code}${code !== 0 ? ` (0x${(code! >>> 0).toString(16).toUpperCase()})` : ''}`);
    if (stderrOutput.trim()) {
      console.error(`[Claude CLI] Full stderr:\n${stderrOutput.trim()}`);
    }
    // Process remaining buffer
    if (buffer.trim()) {
      try {
        const event = JSON.parse(buffer.trim());
        const text = extractText(event);
        if (text) resultText = text;
        if (event.type === 'result' && typeof event.result === 'string') {
          resultText = event.result;
        }
      } catch {
        // ignore
      }
    }

    // Strip any tool call syntax the model may have emitted as text
    resultText = stripToolCalls(resultText);

    // Send accumulated text, then done
    if (resultText && textCallback) {
      textCallback(resultText);
      if (doneCallback) doneCallback();
    } else if (code !== 0 && code !== null && errorCallback) {
      let msg = stderrOutput.trim();
      if (!msg) {
        const hex = (code >>> 0).toString(16).toUpperCase();
        msg = `Claude CLI exited with code ${code} (0x${hex})`;
        // Windows STATUS_DLL_INIT_FAILED — common when console/env is misconfigured
        if (hex === 'C0000142') {
          msg += '. This is a Windows DLL initialization error. Try restarting the server outside of VS Code, or run: claude --version';
        }
      }
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
/**
 * Strip <tool_call>...</tool_call> blocks and their preamble from the response.
 * The CLI subprocess sometimes emits tool call syntax as plain text when
 * it thinks it should read files (especially for system design reviews).
 */
export function stripToolCalls(text: string): string {
  if (!text) return text;

  // Remove <tool_call> ... </tool_call> blocks (with or without whitespace)
  let cleaned = text.replace(/<tool_call>\s*[\s\S]*?<\/tool_call>/g, '');

  // Remove common preamble lines like "Let me read the relevant backend files..."
  // that precede tool calls and have no value on their own
  cleaned = cleaned.replace(/^Let me (?:read|check|look at|examine|search|find|grep|open|review) (?:the |some |these |those |relevant )?(?:backend |frontend |server |client )?files?[^\n]*\n*/gmi, '');

  return cleaned.trim();
}

export function extractText(event: Record<string, unknown>): string | null {
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
