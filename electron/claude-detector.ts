import path from 'node:path';
import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface ClaudeDetectionResult {
  installed: boolean;
  path?: string;
  version?: string;
}

/**
 * Detect Claude CLI installation.
 * Reuses the same detection logic as web/server/config.ts:findClaudeCliPath()
 */
export async function detectClaude(): Promise<ClaudeDetectionResult> {
  const knownPath = findClaudePath();

  if (knownPath) {
    const version = await getClaudeVersion();
    return { installed: true, path: knownPath, version };
  }

  // Fallback: try claude on PATH
  const version = await getClaudeVersion();
  if (version) {
    return { installed: true, path: 'claude', version };
  }

  return { installed: false };
}

function findClaudePath(): string | undefined {
  // 1. npm global install (Node.js script)
  const npmGlobal = process.env.APPDATA
    ? path.join(process.env.APPDATA, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')
    : undefined;
  if (npmGlobal && fs.existsSync(npmGlobal)) return npmGlobal;

  // 2. Native binary install (~/.local/bin/claude.exe on Windows)
  const userHome = process.env.USERPROFILE || process.env.HOME;
  if (userHome) {
    const ext = process.platform === 'win32' ? '.exe' : '';
    const localBin = path.join(userHome, '.local', 'bin', `claude${ext}`);
    if (fs.existsSync(localBin)) return localBin;
  }

  return undefined;
}

async function getClaudeVersion(): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync('claude', ['--version'], {
      shell: true,
      timeout: 10000,
      windowsHide: true,
    });
    return stdout.trim().match(/[\d.]+/)?.[0];
  } catch {
    return undefined;
  }
}
