// NOVACUT Studio - Electron main process
// Menyajikan build statis (folder out/) lewat HTTP lokal lalu membukanya di window.

const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "out");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".wasm": "application/wasm",
  ".txt": "text/plain",
  ".map": "application/json",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

let server = null;

// ---------- IPC: folder hasil render ----------
// Renderer (NOVACUT Studio) memanggil lewat window.novacutFS (preload.cjs)

/** Bersihkan nama file agar aman untuk Windows & cegah akses di luar folder */
function safeFileName(name) {
  let base = path.basename(String(name || "video.webm"));
  const ext = path.extname(base).toLowerCase() || ".webm";
  let stem = base.slice(0, base.length - ext.length).replace(/[\\/:*?"<>|]/g, "_").trim();
  if (!stem) stem = "video";
  if (stem.length > 140) stem = stem.slice(0, 140);
  return stem + ext;
}

function registerFSIpc() {
  ipcMain.handle("fs:choose-dir", async (event, current) => {
    const parent = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const opts = {
      title: "Pilih folder untuk hasil render NOVACUT Studio",
      buttonLabel: "Pilih Folder Ini",
      properties: ["openDirectory", "createDirectory"],
    };
    if (typeof current === "string" && current.length > 0) opts.defaultPath = current;
    const res = await dialog.showOpenDialog(parent, opts);
    if (res.canceled || !res.filePaths.length) return { canceled: true };
    return { canceled: false, path: res.filePaths[0] };
  });

  ipcMain.handle("fs:save-file", async (_event, payload) => {
    try {
      const dir = typeof payload?.dir === "string" ? payload.dir : "";
      if (!dir) return { ok: false, error: "Folder belum dipilih" };
      let stat = null;
      try { stat = await fs.promises.stat(dir); } catch { /* tidak ada */ }
      if (!stat || !stat.isDirectory()) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      const target = path.join(dir, safeFileName(payload?.name));
      const data = Buffer.from(payload?.data ?? []);
      await fs.promises.writeFile(target, data);
      return { ok: true, path: target };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });

  ipcMain.handle("fs:open-folder", async (_event, dir) => {
    try {
      if (typeof dir !== "string" || !dir) return { ok: false, error: "Folder tidak valid" };
      const err = await shell.openPath(dir);
      return err ? { ok: false, error: err } : { ok: true, path: dir };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });
}

registerFSIpc();

function startServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
        let p = path.normalize(path.join(ROOT, urlPath));
        if (!p.startsWith(ROOT)) {
          res.writeHead(403);
          res.end();
          return;
        }
        let stat = fs.existsSync(p) ? fs.statSync(p) : null;
        if (!stat || stat.isDirectory()) p = path.join(ROOT, "index.html");
        const ext = path.extname(p).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME[ext] || "application/octet-stream",
          "Cache-Control": "no-cache",
        });
        fs.createReadStream(p).pipe(res);
      } catch (e) {
        res.writeHead(500);
        res.end("error");
      }
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  let win = null;

  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    const port = await startServer();
    const iconPath = path.join(__dirname, "..", "build", "icon.png");
    win = new BrowserWindow({
      width: 1500,
      height: 940,
      minWidth: 1080,
      minHeight: 680,
      backgroundColor: "#05060e",
      show: false,
      autoHideMenuBar: true,
      title: "NOVACUT Studio",
      webPreferences: {
        autoplayPolicy: "no-user-gesture-required",
        contextIsolation: true,
        nodeIntegration: false,
        spellcheck: false,
        // render kilat harus tetap jalan walau jendela diminimalkan
        backgroundThrottling: false,
        preload: path.join(__dirname, "preload.cjs"),
      },
      ...(fs.existsSync(iconPath) ? { icon: iconPath } : {}),
    });
    win.setMenuBarVisibility(false);
    win.once("ready-to-show", () => win.show());
    await win.loadURL(`http://127.0.0.1:${port}/`);
  });

  app.on("window-all-closed", () => {
    if (server) server.close();
    app.quit();
  });
}
