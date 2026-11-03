// Preload uji E2E: meniru novacutFS (preload asli) lewat IPC khusus test
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("novacutFS", {
  isDesktop: true,
  saveFileBegin: (dir, name) => ipcRenderer.invoke("t:begin", { dir, name }),
  saveFileChunk: (id, data, position) => ipcRenderer.invoke("t:chunk", id, data, position),
  saveFileEnd: (id) => ipcRenderer.invoke("t:end", id),
  statFile: (dir, name) => ipcRenderer.invoke("t:stat", { dir, name }),
});
