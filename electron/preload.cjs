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
  // Tulis file STREAMING per potongan (v1.0.14, hemat memori utk export batch besar):
  // begin -> { ok, id? }, chunk(id, ArrayBuffer, position?) -> { ok }, end(id) -> { ok, path? }
  saveFileBegin: (dir, name) => ipcRenderer.invoke("fs:save-begin", { dir, name }),
  saveFileChunk: (id, data, position) => ipcRenderer.invoke("fs:save-chunk", { id, data, position }),
  saveFileEnd: (id) => ipcRenderer.invoke("fs:save-end", { id }),
  // Buka folder di Windows Explorer -> { ok, error? }
  openFolder: (dir) => ipcRenderer.invoke("fs:open-folder", dir),
  // v1.0.16: cek keberadaan & ukuran file di folder (resume batch) -> { ok, size? }
  statFile: (dir, name) => ipcRenderer.invoke("fs:stat-file", { dir, name }),
  // v1.0.16: notifikasi Windows (tampil walau jendela diminimalkan)
  notify: (title, body) => ipcRenderer.invoke("app:notify", { title, body }),
  // v1.0.16: matikan PC otomatis setelah batch selesai (jeda 60 detik)
  shutdownPC: () => ipcRenderer.invoke("app:shutdown"),
});
