const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron');
const path = require('path');
const http = require('http');
const { fork } = require('child_process');

let mainWindow = null;
let backendProcess = null;

function checkBackendRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5001/api/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
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

    backendProcess = fork(script, [], {
      cwd,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        PORT: '5001',
        NODE_ENV: process.env.NODE_ENV || 'production'
      },
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
      backendProcess = null;
    });
  } catch (err) {
    console.error('[Failed to start backend process]:', err);
  }
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    try {
      backendProcess.kill('SIGTERM');
    } catch {
      try {
        backendProcess.kill('SIGKILL');
      } catch {}
    }
    backendProcess = null;
  }
}

async function waitForBackend(maxAttempts = 15, delayMs = 300) {
  for (let i = 0; i < maxAttempts; i++) {
    const isUp = await checkBackendRunning();
    if (isUp) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
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
  return await checkBackendRunning();
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

  const isAlreadyRunning = await checkBackendRunning();
  if (!isAlreadyRunning) {
    startBackend();
    await waitForBackend();
  }

  createWindow();
});
