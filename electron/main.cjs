const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const os = require('os');
const { fork } = require('child_process');

let mainWindow = null;
let backendProcess = null;

function sanitizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '[not configured]';
  try {
    const u = new URL(rawUrl);
    if (u.password) u.password = '******';
    return u.toString();
  } catch {
    return '[configured]';
  }
}

function resolveDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return {
      source: 'process.env.DATABASE_URL',
      url: process.env.DATABASE_URL
    };
  }

  const userDataDir = app.getPath('userData');
  const candidatePaths = [
    path.join(userDataDir, '.env'),
    path.join(os.homedir(), '.eventflow.env'),
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '../backend/.env')
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
        if (match && match[1]) {
          return {
            source: envPath,
            url: match[1].trim()
          };
        }
      } catch (err) {
        console.error(`[Electron] Error reading candidate env file ${envPath}:`, err.message);
      }
    }
  }

  if (app.isPackaged) {
    try {
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      const examplePath = path.join(userDataDir, '.env.example');
      if (!fs.existsSync(examplePath)) {
        const template = '# EventFlow Database Configuration\n# Specify your PostgreSQL connection string below and rename this file to .env\nDATABASE_URL="postgresql://user:password@localhost:5432/eventflow"\n';
        fs.writeFileSync(examplePath, template, 'utf8');
      }
    } catch {}
  }

  return null;
}

function checkEndpoint(pathname) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5001${pathname}`, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode === 200,
          status: res.statusCode,
          body
        });
      });
    });
    req.on('error', () => resolve({ ok: false, status: 0, body: '' }));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve({ ok: false, status: 0, body: '' });
    });
  });
}

function getBackendPaths() {
  if (app.isPackaged) {
    const appDir = path.dirname(app.getAppPath());
    const unpackedDir = path.join(appDir, 'app.asar.unpacked');
    return {
      script: path.join(unpackedDir, 'backend/src/server.js'),
      cwd: path.join(unpackedDir, 'backend')
    };
  }
  return {
    script: path.join(__dirname, '../backend/src/server.js'),
    cwd: path.join(__dirname, '../backend')
  };
}

function startBackend() {
  try {
    const { script, cwd } = getBackendPaths();
    const dbConfig = resolveDatabaseConfig();

    if (!fs.existsSync(script)) {
      console.error(`[Electron] Backend server script not found at: ${script}`);
      return false;
    }

    const childEnv = {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: '5001',
      NODE_ENV: process.env.NODE_ENV || (app.isPackaged ? 'production' : 'development')
    };

    if (dbConfig && dbConfig.url) {
      childEnv.DATABASE_URL = dbConfig.url;
      console.log(`[Electron] Database configured from: ${dbConfig.source} (${sanitizeUrl(dbConfig.url)})`);
    } else {
      console.warn('[Electron] No DATABASE_URL found. Checked environment, Application Support (.env), ~/.eventflow.env, and backend/.env');
    }

    console.log(`[Electron] Spawning backend process at: ${script} (cwd: ${cwd})`);

    backendProcess = fork(script, [], {
      cwd,
      env: childEnv,
      silent: true,
      execPath: process.execPath
    });

    backendProcess.stdout?.on('data', (data) => {
      console.log(`[Backend stdout] ${data.toString().trim()}`);
    });

    backendProcess.stderr?.on('data', (data) => {
      console.error(`[Backend stderr] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (err) => {
      console.error('[Backend Process Error]:', err);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log(`[Backend Process Exited] code=${code} signal=${signal}`);
      if (code !== 0 && code !== null) {
        console.error(`[Backend Process Warning] Backend exited with non-zero code ${code}`);
      }
      backendProcess = null;
    });

    return true;
  } catch (err) {
    console.error('[Failed to start backend process]:', err);
    return false;
  }
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    console.log('[Electron] Shutting down backend process gracefully...');
    try {
      backendProcess.kill('SIGTERM');
    } catch {}
    const proc = backendProcess;
    setTimeout(() => {
      try {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
      } catch {}
    }, 1500);
    backendProcess = null;
  }
}

async function waitForBackend(maxAttempts = 25, delayMs = 300) {
  let isServerUp = false;
  let isDbReady = false;

  for (let i = 0; i < maxAttempts; i++) {
    const health = await checkEndpoint('/api/health');
    if (health.ok) {
      isServerUp = true;
      const ready = await checkEndpoint('/api/ready');
      if (ready.ok) {
        isDbReady = true;
        console.log(`[Electron] Backend and database ready after attempt ${i + 1}`);
        return { serverOnline: true, dbReady: true };
      }
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }

  console.log(`[Electron] Backend wait completed: serverOnline=${isServerUp}, dbReady=${isDbReady}`);
  return { serverOnline: isServerUp, dbReady: isDbReady };
}

function setupApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : [{ role: 'close' }])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'EventFlow',
    width: 1280,
    height: 850,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    icon: path.join(__dirname, '../build/icon.png'),
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file:') && !url.startsWith('http://localhost:5173')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('check-backend-health', async () => {
  const result = await checkEndpoint('/api/health');
  return result.ok;
});

ipcMain.handle('check-backend-readiness', async () => {
  const result = await checkEndpoint('/api/ready');
  return result.ok;
});

app.on('before-quit', stopBackend);
app.on('will-quit', stopBackend);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  setupApplicationMenu();

  const healthCheck = await checkEndpoint('/api/health');
  if (healthCheck.ok) {
    console.log('[Electron] Port 5001 already has active backend service. Reusing existing instance.');
  } else {
    startBackend();
  }

  await waitForBackend();
  createWindow();
});
