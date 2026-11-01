// NOVACUT Studio - Electron main process
// Menyajikan build statis (folder out/) lewat HTTP lokal lalu membukanya di window.

const { app, BrowserWindow, Menu } = require("electron");
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
