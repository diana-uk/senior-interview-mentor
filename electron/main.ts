import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  shell,
  dialog,
} from 'electron';
import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import Store from 'electron-store';
import dotenv from 'dotenv';
import { detectClaude } from './claude-detector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(appRoot, '.env') });

const isDev = !app.isPackaged;
const SERVER_PORT = 3001;
const VITE_PORT = 5173;

// ── Window State Persistence ──────────────────────────────────

interface WindowBounds {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

const store = new Store<{
  windowBounds: WindowBounds;
  isMaximized: boolean;
  minimizeToTray: boolean;
}>({
  defaults: {
    windowBounds: { width: 1400, height: 900 },
    isMaximized: false,
    minimizeToTray: true,
  },
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let serverProcess: ChildProcess | null = null;
let isQuitting = false;

// ── Icon Helpers ──────────────────────────────────────────────

function getIconPath(): string | undefined {
  const iconFile =
    process.platform === 'win32'
      ? 'icon.ico'
      : process.platform === 'darwin'
        ? 'icon.icns'
        : 'icon.png';

  const candidates = isDev
    ? [path.join(appRoot, 'electron', 'icons', iconFile)]
    : [
        path.join(process.resourcesPath, 'icons', iconFile),
        path.join(appRoot, 'electron', 'icons', iconFile),
      ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

// ── Claude CLI Check ──────────────────────────────────────────

async function checkClaude(): Promise<boolean> {
  const result = await detectClaude();

  if (result.installed) {
    console.log(
      `[electron] Claude CLI found: ${result.path} (v${result.version ?? 'unknown'})`,
    );
    return true;
  }

  const { response } = await dialog.showMessageBox({
    type: 'warning',
    title: 'Claude CLI Not Found',
    message: 'Claude CLI is required for AI features.',
    detail:
      'The Claude CLI was not found on your system. AI chat and code review features require it.\n\n' +
      'Install with: npm install -g @anthropic-ai/claude-code\n' +
      'Then run: claude login',
    buttons: ['Install Guide', 'Continue Anyway', 'Quit'],
    defaultId: 0,
    cancelId: 2,
  });

  if (response === 0) {
    shell.openExternal(
      'https://docs.anthropic.com/en/docs/claude-code/overview',
    );
    return false;
  }
  if (response === 2) {
    return false;
  }
  return true; // Continue anyway
}

// ── Express Server Management ─────────────────────────────────

function spawnServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const webDir = path.join(appRoot, 'web');
    const serverEntry = path.join(webDir, 'server', 'index.ts');

    // Find tsx — check direct module first, then binary wrapper
    const tsxCandidates = [
      path.join(webDir, 'node_modules', 'tsx', 'dist', 'cli.mjs'),
      path.join(
        webDir,
        'node_modules',
        '.bin',
        process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
      ),
    ];

    let tsxPath: string | undefined;
    for (const p of tsxCandidates) {
      if (fs.existsSync(p)) {
        tsxPath = p;
        break;
      }
    }

    const env: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(SERVER_PORT),
    };

    if (tsxPath?.endsWith('.mjs') || tsxPath?.endsWith('.js')) {
      // Run tsx module via Electron's Node runtime
      serverProcess = spawn(process.execPath, [tsxPath, serverEntry], {
        cwd: webDir,
        env: { ...env, ELECTRON_RUN_AS_NODE: '1' },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });
    } else if (tsxPath) {
      // Run tsx binary wrapper
      serverProcess = spawn(tsxPath, [serverEntry], {
        cwd: webDir,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32',
        windowsHide: true,
      });
    } else {
      reject(new Error('tsx not found in web/node_modules. Run: npm install --prefix web'));
      return;
    }

    let resolved = false;

    serverProcess.stdout?.on('data', (data: Buffer) => {
      const text = data.toString().trim();
      if (text) console.log(`[server] ${text}`);
      if (!resolved && text.includes('Running on http://localhost:')) {
        resolved = true;
        resolve();
      }
    });

    serverProcess.stderr?.on('data', (data: Buffer) => {
      const text = data.toString().trim();
      if (text) console.error(`[server:err] ${text}`);
    });

    serverProcess.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Failed to start server: ${err.message}`));
      }
    });

    serverProcess.on('exit', (code) => {
      console.log(`[server] Exited with code ${code}`);
      if (!resolved) {
        resolved = true;
        reject(new Error(`Server exited unexpectedly with code ${code}`));
      }
      serverProcess = null;
    });

    // Timeout after 30s
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Server failed to start within 30 seconds'));
      }
    }, 30_000);
  });
}

function killServer(): void {
  if (!serverProcess) return;

  console.log('[electron] Stopping server...');
  const pid = serverProcess.pid;

  if (pid && process.platform === 'win32') {
    // Kill process tree on Windows (server may have Claude CLI children)
    try {
      spawn('taskkill', ['/pid', String(pid), '/f', '/t'], {
        windowsHide: true,
        stdio: 'ignore',
      });
    } catch {
      serverProcess.kill('SIGKILL');
    }
  } else {
    serverProcess.kill('SIGTERM');
    const proc = serverProcess;
    setTimeout(() => {
      try {
        proc.kill('SIGKILL');
      } catch {
        /* already dead */
      }
    }, 5000);
  }

  serverProcess = null;
}

// ── Window Creation ───────────────────────────────────────────

async function createWindow(): Promise<void> {
  const bounds = store.get('windowBounds');
  const wasMaximized = store.get('isMaximized');

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 1200,
    minHeight: 700,
    title: 'Senior Interview Mentor',
    icon: getIconPath(),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (wasMaximized) {
    mainWindow.maximize();
  }

  // Show when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Persist window bounds
  const saveState = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    store.set('isMaximized', mainWindow.isMaximized());
    if (!mainWindow.isMaximized()) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  };
  mainWindow.on('resize', saveState);
  mainWindow.on('move', saveState);

  // External links open in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost:')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Minimize to tray instead of closing (configurable)
  mainWindow.on('close', (event) => {
    if (store.get('minimizeToTray') && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  const url = isDev
    ? `http://localhost:${VITE_PORT}`
    : `http://localhost:${SERVER_PORT}`;

  await mainWindow.loadURL(url);
}

// ── System Tray ───────────────────────────────────────────────

function createTray(): void {
  const iconPath = getIconPath();
  if (!iconPath) return; // Skip tray if no icon available

  try {
    tray = new Tray(iconPath);
  } catch {
    console.warn('[electron] Failed to create tray icon');
    return;
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Senior Interview Mentor');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

// ── Auto-Updater ──────────────────────────────────────────────

async function checkForUpdates(): Promise<void> {
  if (isDev) return;

  try {
    const { autoUpdater } = await import('electron-updater');
    autoUpdater.checkForUpdatesAndNotify();
  } catch (err) {
    console.warn('[updater] Auto-update check failed:', err);
  }
}

// ── App Lifecycle ─────────────────────────────────────────────

app.whenReady().then(async () => {
  const shouldContinue = await checkClaude();
  if (!shouldContinue) {
    app.quit();
    return;
  }

  // Production: spawn Express server
  if (!isDev) {
    try {
      await spawnServer();
    } catch (err) {
      dialog.showErrorBox(
        'Server Error',
        `Failed to start the backend server:\n\n${err instanceof Error ? err.message : String(err)}\n\nPlease try restarting the application.`,
      );
      app.quit();
      return;
    }
  }

  await createWindow();
  createTray();
  checkForUpdates();

  // macOS: recreate window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  killServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    isQuitting = true;
    app.quit();
  }
});
