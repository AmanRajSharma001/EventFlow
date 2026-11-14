const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  version: process.versions.electron,
  appVersion: '1.0.0',
  isDesktop: true,
  checkBackendHealth: () => ipcRenderer.invoke('check-backend-health')
});
