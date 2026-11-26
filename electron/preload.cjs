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

// v1.0.31: API AI (opsional) — poster sinematik via z-ai-web-dev-sdk di main process.
// Bila gagal/tanpa kredensial -> { ok:false } dan renderer lanjut memakai grade lokal.
// v1.0.36: kunci API publik Z.ai milik pengguna (disimpan lokal) + tes koneksi.
// v1.0.38: penyedia poster bisa dipilih — Z.ai (per poster) ATAU Cloudflare Workers AI
// (GRATIS: 10.000 Neuron/hari ≈ 170 poster, tanpa kartu) + preferensi kualitas HD/Hemat.
contextBridge.exposeInMainWorld("novacutAI", {
  posterAI: (image, prompt, size, provider, quality, expand, bgOnly, direct, retouch) =>
    ipcRenderer.invoke("ai:poster", { image, prompt, size, provider, quality, expand, bgOnly, direct, retouch }),
  setAIKey: (apiKey) => ipcRenderer.invoke("ai:set-key", { apiKey }),
  getAIKeyStatus: () => ipcRenderer.invoke("ai:key-status"),
  clearAIKey: () => ipcRenderer.invoke("ai:clear-key"),
  testAIKey: () => ipcRenderer.invoke("ai:test-key"),
  openAIKeyPage: () => ipcRenderer.invoke("app:open-url", { url: "https://z.ai/manage-apikey/apikey-list" }),
  // v1.0.38: Cloudflare Workers AI (Account ID + API Token, keduanya gratis dibuat)
  setCFKey: (account, token) => ipcRenderer.invoke("cf:set-key", { account, token }),
  getCFKeyStatus: () => ipcRenderer.invoke("cf:key-status"),
  clearCFKey: () => ipcRenderer.invoke("cf:clear-key"),
  testCFKey: () => ipcRenderer.invoke("cf:test-key"),
  openCFDash: () => ipcRenderer.invoke("app:open-url", { url: "https://dash.cloudflare.com/profile/api-tokens" }),
  openCFHome: () => ipcRenderer.invoke("app:open-url", { url: "https://dash.cloudflare.com" }),
  // v1.0.47: penyedia ke-3 Mage (mage.space) — per gambar ±9 Gems ≈ Rp145
  setMageKey: (apiKey) => ipcRenderer.invoke("mage:set-key", { apiKey }),
  getMageKeyStatus: () => ipcRenderer.invoke("mage:key-status"),
  clearMageKey: () => ipcRenderer.invoke("mage:clear-key"),
  testMageKey: () => ipcRenderer.invoke("mage:test-key"),
  openMageAPI: () => ipcRenderer.invoke("app:open-url", { url: "https://www.mage.space/api?tab=api-keys" }),
  // v1.0.55: penyedia ke-4 MiniMax H3 (platform.minimax.io — mesin "Minimax H3" di mivo.com)
  setMiniMaxKey: (apiKey) => ipcRenderer.invoke("minimax:set-key", { apiKey }),
  getMiniMaxKeyStatus: () => ipcRenderer.invoke("minimax:key-status"),
  clearMiniMaxKey: () => ipcRenderer.invoke("minimax:clear-key"),
  testMiniMaxKey: () => ipcRenderer.invoke("minimax:test-key"),
  openMiniMaxAPI: () => ipcRenderer.invoke("app:open-url", { url: "https://platform.minimax.io/user-center/basic-information/interface-key" }),
  // v1.0.56: JEMBATAN MIVO — semi-otomatis via web mivo.com (tanpa kunci API)
  mivoBridgeStart: (image, prompt, size) => ipcRenderer.invoke("mivo:bridge-start", { image, prompt, size }),
  mivoBridgePoll: (id) => ipcRenderer.invoke("mivo:bridge-poll", { id }),
  openMivoFolder: () => ipcRenderer.invoke("mivo:open-folder"),
  openMivoStudio: () => ipcRenderer.invoke("app:open-url", { url: "https://www.mivo.com/generate/studio" }),
  // v1.0.38: preferensi penyedia & kualitas poster (disimpan lokal)
  getAIPrefs: () => ipcRenderer.invoke("ai:get-prefs"),
  setAIPrefs: (prefs) => ipcRenderer.invoke("ai:set-prefs", prefs),
});
