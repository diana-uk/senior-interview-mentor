import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock node:fs before importing config functions ───────────────────────────
// vi.hoisted() ensures the variable is accessible inside the vi.mock factory (ESM hoisting)

const { mockExistsSync } = vi.hoisted(() => ({
  mockExistsSync: vi.fn<[unknown], boolean>(),
}));

vi.mock('node:fs', () => ({
  default: { existsSync: (...args: unknown[]) => mockExistsSync(...args) },
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
}));

import { findGitBash, findClaudeCliPath, config } from '../../../server/config';

// Snapshot of original env keys we touch in tests
const ENV_KEYS = [
  'CLAUDE_CODE_GIT_BASH_PATH',
  'ProgramFiles',
  'ProgramFiles(x86)',
  'ProgramW6432',
  'APPDATA',
  'USERPROFILE',
  'HOME',
];

function saveEnv() {
  return Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
}
function restoreEnv(snapshot: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(snapshot)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

let envSnapshot: Record<string, string | undefined>;

beforeEach(() => {
  envSnapshot = saveEnv();
  mockExistsSync.mockReturnValue(false);
  // Clear all tracked env keys for a clean slate
  for (const k of ENV_KEYS) delete process.env[k];
});

afterEach(() => {
  restoreEnv(envSnapshot);
  vi.clearAllMocks();
});

// ─── config shape ─────────────────────────────────────────────────────────────

describe('config — shape', () => {
  it('has all expected keys', () => {
    const keys = Object.keys(config);
    expect(keys).toContain('port');
    expect(keys).toContain('nodeEnv');
    expect(keys).toContain('projectRoot');
    expect(keys).toContain('gitBashPath');
    expect(keys).toContain('claudeCliPath');
    expect(keys).toContain('anthropicApiKey');
    expect(keys).toContain('sentryDsn');
    expect(keys).toContain('stripeSecretKey');
    expect(keys).toContain('stripeWebhookSecret');
    expect(keys).toContain('appUrl');
  });

  it('port defaults to 3001 when PORT env not set', () => {
    // PORT is not set in test env
    expect(config.port).toBe(3001);
  });

  it('projectRoot is a non-empty string', () => {
    expect(typeof config.projectRoot).toBe('string');
    expect(config.projectRoot.length).toBeGreaterThan(0);
  });

  it('anthropicApiKey defaults to empty string', () => {
    expect(config.anthropicApiKey).toBe('');
  });

  it('appUrl defaults to http://localhost:5173', () => {
    expect(config.appUrl).toBe('http://localhost:5173');
  });

  it('sentryDsn defaults to empty string', () => {
    expect(config.sentryDsn).toBe('');
  });
});

// ─── findGitBash ──────────────────────────────────────────────────────────────

describe('findGitBash', () => {
  it('returns CLAUDE_CODE_GIT_BASH_PATH when set', () => {
    process.env.CLAUDE_CODE_GIT_BASH_PATH = '/custom/git/bash.exe';
    expect(findGitBash()).toBe('/custom/git/bash.exe');
  });

  it('ignores fs when env var is set', () => {
    process.env.CLAUDE_CODE_GIT_BASH_PATH = '/custom/bash';
    findGitBash();
    expect(mockExistsSync).not.toHaveBeenCalled();
  });

  it('returns undefined when nothing exists', () => {
    mockExistsSync.mockReturnValue(false);
    expect(findGitBash()).toBeUndefined();
  });

  it('returns first matching path from ProgramFiles', () => {
    process.env.ProgramFiles = 'C:\\Program Files';
    const expected = 'C:\\Program Files\\Git\\bin\\bash.exe';
    mockExistsSync.mockImplementation((p: unknown) => String(p) === expected);
    expect(findGitBash()).toBe(expected);
  });

  it('returns path from ProgramFiles(x86) if ProgramFiles absent', () => {
    process.env['ProgramFiles(x86)'] = 'C:\\Program Files (x86)';
    const expected = 'C:\\Program Files (x86)\\Git\\bin\\bash.exe';
    mockExistsSync.mockImplementation((p: unknown) => String(p) === expected);
    expect(findGitBash()).toBe(expected);
  });

  it('includes C: hardcoded fallback as a candidate', () => {
    // Make only the C: hardcoded path exist
    mockExistsSync.mockImplementation((p: unknown) =>
      String(p).startsWith('C:') && String(p).includes('bash.exe'),
    );
    const result = findGitBash();
    expect(result).toBeDefined();
    expect(result).toContain('bash.exe');
  });
});

// ─── findClaudeCliPath ────────────────────────────────────────────────────────

describe('findClaudeCliPath', () => {
  it('returns undefined when neither APPDATA nor HOME is set', () => {
    expect(findClaudeCliPath()).toBeUndefined();
  });

  it('returns npm global path when APPDATA is set and file exists', () => {
    process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming';
    const expected = 'C:\\Users\\test\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\cli.js';
    mockExistsSync.mockImplementation((p: unknown) => String(p) === expected);
    expect(findClaudeCliPath()).toBe(expected);
  });

  it('returns undefined when APPDATA is set but file does not exist', () => {
    process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming';
    mockExistsSync.mockReturnValue(false);
    // Also clear HOME so it does not fall through
    delete process.env.USERPROFILE;
    delete process.env.HOME;
    expect(findClaudeCliPath()).toBeUndefined();
  });

  it('returns local bin path when USERPROFILE set and file exists', () => {
    process.env.USERPROFILE = 'C:\\Users\\test';
    const ext = process.platform === 'win32' ? '.exe' : '';
    const expected = `C:\\Users\\test\\.local\\bin\\claude${ext}`;
    mockExistsSync.mockImplementation((p: unknown) => String(p) === expected);
    expect(findClaudeCliPath()).toBe(expected);
  });

  it('falls back to HOME when USERPROFILE is not set', () => {
    delete process.env.USERPROFILE;
    const home = 'C:\\Users\\testuser';
    process.env.HOME = home;
    const ext = process.platform === 'win32' ? '.exe' : '';
    // Use path.join so the expected path uses the same OS separator as the implementation
    const expected = require('node:path').join(home, '.local', 'bin', `claude${ext}`);
    mockExistsSync.mockImplementation((p: unknown) => String(p) === expected);
    expect(findClaudeCliPath()).toBe(expected);
  });
});
