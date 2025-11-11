const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sendNotification: (title, body) => {
    ipcRenderer.send('show-notification', { title, body });
  },
  platform: process.platform
});
