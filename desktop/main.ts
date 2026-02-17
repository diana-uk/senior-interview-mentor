import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn, type ChildProcess } from 'node:child_process';
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  shell,
  dialog,
  nativeImage,
} from 'electron';
import ElectronStore from 'electron-store';
import electronUpdater from 'electron-updater';
import dotenv from 'dotenv';

const { autoUpdater } = electronUpdater;
const Store = ElectronStore as unknown as typeof import('electron-store').default;
import { detectClaude } from './claude-detector.js';

// ─── Paths ───────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.resolve(__dirname, '..');          // desktop/
const projectRoot = path.resolve(desktopRoot, '..');         // senior-interview-mentor/
const webRoot = path.join(projectRoot, 'web');

// Load .env from project root
dotenv.config({ path: path.join(projectRoot, '.env') });

// ─── Config ──────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;
const isDev = !app.isPackaged;
const SERVER_URL = `http://localhost:${PORT}`;

// ─── Persistent settings ─────────────────────────────────────────────
const store = new Store({
  defaults: {
    windowBounds: { width: 1400, height: 900, x: undefined as number | undefined, y: undefined as number | undefined },
    maximized: false,
    minimizeToTray: true,
  },
});

// ─── State ───────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let serverProcess: ChildProcess | null = null;
let isQuitting = false;

// ─── Single instance lock ────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

// ─── Claude CLI check ────────────────────────────────────────────────
async function checkClaude(): Promise<boolean> {
  const result = detectClaude();
  if (result.installed) {
    console.log(`[electron] Claude CLI found: ${result.path || 'on PATH'} (${result.version || 'unknown version'})`);
    return true;
  }

  const { response } = await dialog.showMessageBox({
    type: 'warning',
    title: 'Claude CLI Not Found',
    message: 'Claude CLI is required for AI features.',
    detail:
      'The app can still run, but AI chat will not work.\n\n' +
      'Install with: npm install -g @anthropic-ai/claude-code\n' +
      'Then run: claude login',
    buttons: ['Install Guide', 'Continue Anyway', 'Quit'],
    defaultId: 0,
    cancelId: 2,
  });

  if (response === 0) {
    await shell.openExternal('https://docs.anthropic.com/en/docs/claude-code/overview');
    return false; // Let them install, then relaunch
  }
  if (response === 2) {
    app.quit();
    return false;
  }
  return true; // Continue anyway
}

// ─── Find system Node.js ─────────────────────────────────────────────
function findNodeBinary(): string {
  // In Electron, process.execPath is the Electron binary.
  // We need the system Node.js to run tsx/server.
  const candidates: string[] = [];

  // Check NVM_SYMLINK / NVM_HOME (Windows nvm)
  const nvmSymlink = process.env.NVM_SYMLINK;
  if (nvmSymlink) {
    candidates.push(path.join(nvmSymlink, 'node.exe'));
  }

  // Check PATH for node
  const pathDirs = (process.env.PATH || '').split(path.delimiter);
  const ext = process.platform === 'win32' ? '.exe' : '';
  for (const dir of pathDirs) {
    candidates.push(path.join(dir, `node${ext}`));
  }

  // Common locations
  if (process.platform === 'win32') {
    candidates.push('C:\\Program Files\\nodejs\\node.exe');
  } else {
    candidates.push('/usr/local/bin/node', '/usr/bin/node');
  }

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        return p;
      }
    } catch {
      // skip
    }
  }

  // Last resort: assume 'node' is on PATH and use shell
  return 'node';
}

// ─── Server management ───────────────────────────────────────────────
function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const env: Record<string, string> = {
      ...process.env as Record<string, string>,
      PORT: String(PORT),
      NODE_ENV: isDev ? 'development' : 'production',
    };

    // In production (packaged), serve built frontend from web/dist
    // In dev, the Vite dev server is running separately

    const serverScript = path.join(webRoot, 'server', 'index.ts');
    console.log(`[electron] Starting server: ${serverScript} on port ${PORT}`);

    // In Electron, process.execPath points to the Electron binary, not Node.js.
    // We must find the system Node.js to run tsx.
    const nodeBin = findNodeBinary();
    const tsxCli = path.join(webRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

    console.log(`[electron] Node: ${nodeBin}, tsx: ${tsxCli}`);

    serverProcess = spawn(nodeBin, [tsxCli, serverScript], {
      cwd: webRoot,
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
    });

    let started = false;

    serverProcess.stdout?.on('data', (data: Buffer) => {
      const text = data.toString();
      process.stdout.write(`[server] ${text}`);
      if (!started && text.includes('Running on')) {
        started = true;
        resolve();
      }
    });

    serverProcess.stderr?.on('data', (data: Buffer) => {
      process.stderr.write(`[server:err] ${data.toString()}`);
    });

    serverProcess.on('error', (err) => {
      console.error('[electron] Failed to start server:', err.message);
      if (!started) reject(err);
    });

    serverProcess.on('exit', (code) => {
      console.log(`[electron] Server exited with code ${code}`);
      serverProcess = null;
      if (!started) reject(new Error(`Server exited with code ${code}`));
    });

    // Timeout fallback: poll /api/health
    const timeout = setTimeout(() => {
      if (!started) {
        pollHealth(resolve, reject);
      }
    }, 3000);

    // Clear timeout once resolved
    const origResolve = resolve;
    resolve = (...args) => {
      clearTimeout(timeout);
      origResolve(...args);
    };
  });
}

function pollHealth(resolve: () => void, reject: (err: Error) => void): void {
  const maxAttempts = 30;
  let attempts = 0;

  const check = () => {
    attempts++;
    fetch(`${SERVER_URL}/api/health`)
      .then((res) => {
        if (res.ok) {
          console.log('[electron] Server health OK');
          resolve();
        } else {
          retry();
        }
      })
      .catch(() => retry());
  };

  const retry = () => {
    if (attempts >= maxAttempts) {
      reject(new Error('Server failed to start within 30 seconds'));
    } else {
      setTimeout(check, 1000);
    }
  };

  check();
}

function stopServer(): void {
  if (!serverProcess) return;
  console.log('[electron] Stopping server...');

  try {
    // On Windows, tree-kill the process group
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(serverProcess.pid), '/T', '/F'], {
        windowsHide: true,
      });
    } else {
      serverProcess.kill('SIGTERM');
      // Force kill after 3s
      setTimeout(() => {
        if (serverProcess) {
          serverProcess.kill('SIGKILL');
        }
      }, 3000);
    }
  } catch (err) {
    console.error('[electron] Error stopping server:', err);
  }
  serverProcess = null;
}

// ─── Window management ───────────────────────────────────────────────
function createWindow(): void {
  const bounds = store.get('windowBounds') as { width: number; height: number; x?: number; y?: number };
  const maximized = store.get('maximized') as boolean;

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 1200,
    minHeight: 700,
    title: 'Senior Interview Mentor',
    icon: getIconPath(),
    show: false, // Show after ready-to-show
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Needed for preload to use contextBridge
    },
  });

  if (maximized) {
    mainWindow.maximize();
  }

  // Load the app
  mainWindow.loadURL(SERVER_URL);

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // DevTools in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Save window bounds on resize/move
  const saveBounds = () => {
    if (mainWindow && !mainWindow.isMaximized() && !mainWindow.isMinimized()) {
      store.set('windowBounds', mainWindow.getBounds());
    }
    store.set('maximized', mainWindow?.isMaximized() ?? false);
  };

  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  // Minimize to tray instead of closing (if enabled)
  mainWindow.on('close', (event) => {
    if (!isQuitting && store.get('minimizeToTray')) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── Tray ────────────────────────────────────────────────────────────
function createTray(): void {
  const iconPath = getIconPath();
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(icon);

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

function getIconPath(): string {
  const iconsDir = isDev
    ? path.join(desktopRoot, 'icons')
    : path.join(process.resourcesPath, 'icons');

  switch (process.platform) {
    case 'win32':
      return path.join(iconsDir, 'icon.ico');
    case 'darwin':
      return path.join(iconsDir, 'icon.icns');
    default:
      return path.join(iconsDir, 'icon.png');
  }
}

// ─── Auto-updates (production only) ─────────────────────────────────
function checkForUpdates(): void {
  if (isDev) return;

  autoUpdater.autoDownload = false;
  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    console.log('[electron] Auto-update check failed:', err.message);
  });
}

// ─── App lifecycle ───────────────────────────────────────────────────
app.whenReady().then(async () => {
  console.log('[electron] App ready');
  console.log(`[electron] Dev mode: ${isDev}`);
  console.log(`[electron] Platform: ${process.platform}`);

  // Check Claude CLI
  const proceed = await checkClaude();
  if (!proceed) {
    app.quit();
    return;
  }

  // Start Express server
  try {
    await startServer();
    console.log('[electron] Server started');
  } catch (err) {
    console.error('[electron] Server failed to start:', err);
    dialog.showErrorBox(
      'Server Error',
      `Failed to start the backend server.\n\n${(err as Error).message}\n\nMake sure Node.js and dependencies are installed.`,
    );
    app.quit();
    return;
  }

  createWindow();
  createTray();
  checkForUpdates();
});

app.on('activate', () => {
  // macOS: re-create window when dock icon is clicked
  if (!mainWindow) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  stopServer();
});

app.on('window-all-closed', () => {
  // On macOS, apps stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
