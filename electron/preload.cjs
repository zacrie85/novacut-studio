// NOVACUT Studio - Electron preload
// Menyediakan API aman (contextBridge) untuk memilih folder hasil render
// dan menyimpan file langsung ke folder tersebut tanpa dialog unduh browser.

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("novacutFS", {
  isDesktop: true,
  // Buka dialog native "Pilih Folder" -> { canceled, path }
  chooseDirectory: (current) => ipcRenderer.invoke("fs:choose-dir", current),
  // Tulis satu file (ArrayBuffer) ke dalam folder terpilih -> { ok, path?, error? }
  saveFile: (dir, name, data) => ipcRenderer.invoke("fs:save-file", { dir, name, data }),
  // Buka folder di Windows Explorer -> { ok, error? }
  openFolder: (dir) => ipcRenderer.invoke("fs:open-folder", dir),
});
