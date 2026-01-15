// Preload script for Electron
// This runs in a sandboxed context with access to Node.js APIs

const { contextBridge } = require('electron');

// Expose minimal APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
});
