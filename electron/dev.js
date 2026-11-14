const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

function checkUrlReady(url, maxAttempts = 30, delayMs = 500) {
  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const req = http.get(url, (res) => {
        clearInterval(interval);
        resolve(true);
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          resolve(false);
        }
      });
    }, delayMs);
  });
}

async function run() {
  const rootDir = path.resolve(__dirname, '..');
  const frontendDir = path.join(rootDir, 'frontend');

  const vite = spawn('npm', ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true
  });

  const isReady = await checkUrlReady('http://localhost:5173');
  if (!isReady) {
    console.error('Failed to start Vite dev server.');
    vite.kill();
    process.exit(1);
  }

  const electron = spawn('npx', ['electron', '.'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: 'http://localhost:5173',
      NODE_ENV: 'development'
    }
  });

  electron.on('close', (code) => {
    vite.kill();
    process.exit(code || 0);
  });
}

run();
