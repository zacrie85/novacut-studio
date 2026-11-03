// Electron main uji E2E mesin Turbo — jendela tersembunyi + IPC tulis file
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const OUT = "/tmp/turbotest/out";
const RESULT = "/tmp/turbotest/result.json";
const files = new Map();

ipcMain.handle("t:begin", (_e, p) => {
  try {
    fs.mkdirSync(OUT, { recursive: true });
    const id = "f" + files.size;
    const full = path.join(OUT, p.name);
    const fd = fs.openSync(full, "w");
    files.set(id, { fd, path: full });
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});
ipcMain.handle("t:chunk", async (_e, id, data, position) => {
  const f = files.get(id);
  if (!f) return { ok: false, error: "no file" };
  try {
    const buf = Buffer.from(data);
    // Electron 45 / Node 24: fs.promises.write tidak ada — pakai callback fs.write
    const pos = typeof position === "number" ? position : null;
    await new Promise((res, rej) =>
      fs.write(f.fd, buf, 0, buf.byteLength, pos, (err) => (err ? rej(err) : res()))
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});
ipcMain.handle("t:end", (_e, id) => {
  const f = files.get(id);
  if (!f) return { ok: false, error: "no file" };
  try {
    fs.closeSync(f.fd);
    files.delete(id);
    return { ok: true, path: f.path };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});
ipcMain.handle("t:stat", (_e, p) => {
  try {
    const st = fs.statSync(path.join(p.dir, p.name));
    return { ok: true, size: st.size };
  } catch {
    return { ok: false };
  }
});

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      webSecurity: false,
      backgroundThrottling: false,
    },
  });
  win.webContents.on("console-message", (_e, levelOrDetails, maybeMsg) => {
    const msg = typeof levelOrDetails === "object" && levelOrDetails !== null ? levelOrDetails.message : maybeMsg;
    if (typeof msg === "string" && msg.startsWith("TURBO_RESULT ")) {
      fs.writeFileSync(RESULT, msg.slice("TURBO_RESULT ".length));
      setTimeout(() => app.exit(0), 200);
    }
  });
  try {
    await win.loadFile(path.join(__dirname, "test.html"));
  } catch (e) {
    fs.writeFileSync(RESULT, JSON.stringify({ ok: false, error: "loadFile gagal: " + e }));
    app.exit(1);
  }
  setTimeout(() => {
    try {
      fs.writeFileSync(RESULT, JSON.stringify({ ok: false, error: "timeout 240s" }));
    } catch {}
    app.exit(1);
  }, 240000);
});
