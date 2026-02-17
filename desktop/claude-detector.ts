import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

export interface ClaudeDetectionResult {
  installed: boolean;
  path?: string;
  version?: string;
}

/**
 * Detect Claude CLI installation.
 * Mirrors the logic in web/server/config.ts:findClaudeCliPath()
 */
export function detectClaude(): ClaudeDetectionResult {
  // 1. npm global install (Node.js script)
  const npmGlobal = process.env.APPDATA
    ? path.join(process.env.APPDATA, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')
    : undefined;
  if (npmGlobal && fs.existsSync(npmGlobal)) {
    return { installed: true, path: npmGlobal, version: getVersion(npmGlobal) };
  }

  // 2. Native binary install (~/.local/bin/claude.exe on Windows)
  const userHome = process.env.USERPROFILE || process.env.HOME;
  if (userHome) {
    const ext = process.platform === 'win32' ? '.exe' : '';
    const localBin = path.join(userHome, '.local', 'bin', `claude${ext}`);
    if (fs.existsSync(localBin)) {
      return { installed: true, path: localBin, version: getVersion(localBin) };
    }
  }

  // 3. Fallback: try 'claude' on PATH
  try {
    const output = execSync('claude --version', {
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    }).toString().trim();
    return { installed: true, version: output };
  } catch {
    // Not found
  }

  return { installed: false };
}

function getVersion(cliPath: string): string | undefined {
  try {
    const cmd = cliPath.endsWith('.js')
      ? `"${process.execPath}" "${cliPath}" --version`
      : `"${cliPath}" --version`;
    return execSync(cmd, {
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    }).toString().trim();
  } catch {
    return undefined;
  }
}
