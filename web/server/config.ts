import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findGitBash(): string | undefined {
  // Already set
  if (process.env.CLAUDE_CODE_GIT_BASH_PATH) {
    return process.env.CLAUDE_CODE_GIT_BASH_PATH;
  }

  // Common Windows locations — check all drive letters where git might be
  const candidates: string[] = [];

  // Derive drive letter from current working directory or __dirname
  const driveLetter = __dirname.match(/^([A-Z]):/i)?.[1];
  if (driveLetter) {
    candidates.push(path.join(driveLetter + ':', path.sep, 'Program Files', 'Git', 'bin', 'bash.exe'));
    candidates.push(path.join(driveLetter + ':', path.sep, 'Program Files (x86)', 'Git', 'bin', 'bash.exe'));
  }
  candidates.push(path.join('C:', path.sep, 'Program Files', 'Git', 'bin', 'bash.exe'));
  candidates.push(path.join('C:', path.sep, 'Program Files (x86)', 'Git', 'bin', 'bash.exe'));

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

function findClaudeCliPath(): string | undefined {
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

export const config = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: (process.env.NODE_ENV ?? 'development') as 'development' | 'production',
  projectRoot: path.resolve(__dirname, '..', '..'),
  gitBashPath: findGitBash(),
  claudeCliPath: findClaudeCliPath(),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  sentryDsn: process.env.SENTRY_DSN || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  appUrl: process.env.APP_URL || 'http://localhost:5173',
};
