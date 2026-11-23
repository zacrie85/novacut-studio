// NOVACUT Studio - Electron main process
// Menyajikan build statis (folder out/) lewat HTTP lokal lalu membukanya di window.

const { app, BrowserWindow, Menu, Notification, dialog, ipcMain, shell } = require("electron");
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

  // ===== TULIS FILE STREAMING (v1.0.14) =====
  // Menulis video hasil render LANGSUNG ke disk per potongan — tanpa menahan
  // blob utuh di memori renderer. Memecahkan hang/layar hitam saat export
  // batch besar (puluhan film): memori tetap rendah walau file ratusan MB.
  const liveWrites = new Map(); // id -> { fh, path }
  let writeSeq = 0;

  ipcMain.handle("fs:save-begin", async (_event, payload) => {
    try {
      const dir = typeof payload?.dir === "string" ? payload.dir : "";
      if (!dir) return { ok: false, error: "Folder belum dipilih" };
      let stat = null;
      try { stat = await fs.promises.stat(dir); } catch { /* tidak ada */ }
      if (!stat || !stat.isDirectory()) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      const target = path.join(dir, safeFileName(payload?.name));
      const fh = await fs.promises.open(target, "w");
      const id = `w${++writeSeq}`;
      liveWrites.set(id, { fh, path: target });
      return { ok: true, id };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });

  ipcMain.handle("fs:save-chunk", async (_event, payload) => {
    try {
      const w = liveWrites.get(payload?.id);
      if (!w) return { ok: false, error: "Sesi tulis tidak ditemukan" };
      const buf = Buffer.from(payload?.data ?? []);
      if (!buf.length) return { ok: true };
      const pos = typeof payload?.position === "number" ? payload.position : null;
      if (pos === null) await w.fh.write(buf);
      else await w.fh.write(buf, 0, buf.length, pos);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });

  ipcMain.handle("fs:save-end", async (_event, payload) => {
    try {
      const w = liveWrites.get(payload?.id);
      if (!w) return { ok: false, error: "Sesi tulis tidak ditemukan" };
      liveWrites.delete(payload?.id);
      await w.fh.sync();
      await w.fh.close();
      return { ok: true, path: w.path };
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

  // ===== v1.0.16: RESUME BATCH, NOTIFIKASI & AUTO-SHUTDOWN =====
  // Cek ukuran file di folder hasil — untuk melewatkan bagian yang SUDAH
  // lengkap (lanjutkan batch yang terputus listrik / aplikasi ditutup).
  ipcMain.handle("fs:stat-file", async (_event, payload) => {
    try {
      const dir = typeof payload?.dir === "string" ? payload.dir : "";
      const name = safeFileName(payload?.name);
      if (!dir || !name) return { ok: false };
      const st = await fs.promises.stat(path.join(dir, name));
      return { ok: true, size: st.size, path: path.join(dir, name) };
    } catch {
      return { ok: false };
    }
  });

  // Notifikasi Windows — tampil walau jendela NOVACUT diminimalkan, jadi user
  // yang menjalankan batch semalaman tahu kapan batch selesai.
  ipcMain.handle("app:notify", async (_event, payload) => {
    try {
      if (!Notification.isSupported()) return { ok: false, error: "Notifikasi tidak didukung" };
      const iconPath = path.join(__dirname, "..", "build", "icon.png");
      const n = new Notification({
        title: String(payload?.title || "NOVACUT Studio").slice(0, 80),
        body: String(payload?.body || "").slice(0, 200),
        ...(fs.existsSync(iconPath) ? { icon: iconPath } : {}),
        silent: false,
      });
      n.on("click", () => {
        const w = BrowserWindow.getAllWindows()[0];
        if (w) {
          if (w.isMinimized()) w.restore();
          w.focus();
        }
      });
      n.show();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });

  // ===== v1.0.36: MESIN POSTER AI PUBLIK (Z.ai API + kunci milik pengguna) =====
  // v1.0.35 sebelumnya hanya jalan bila ada .z-ai-config (internal) — di PC pengguna
  // file itu tidak ada, jadi AI TIDAK PERNAH jalan (selalu fallback). Kini: pengguna
  // menempel kunci API Z.ai sendiri (disimpan lokal), aplikasi memanggil API publik:
  //   frame → glm-5.3-flashx (vision: deskripsi adegan) → glm-image hd (poster utuh,
  //   judul ditulis AI). Tanpa kunci → jalur SDK lama → fallback grade lokal.
  const ZAI_PUB = "https://api.z.ai/api/paas/v4";
  let lastAIPosterError = "";
  const keyPath = path.join(app.getPath("userData"), "zai_key.json");
  const readAIKey = () => {
    try {
      return String(JSON.parse(fs.readFileSync(keyPath, "utf-8")).apiKey || "").trim();
    } catch {
      return "";
    }
  };
  const zaiPubFetch = async (endpoint, key, body) => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 150000);
    try {
      const res = await fetch(`${ZAI_PUB}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.error?.message || json?.message || `HTTP ${res.status}`;
        throw new Error(String(msg).slice(0, 160));
      }
      return json;
    } finally {
      clearTimeout(to);
    }
  };
  // Vision: deskripsikan adegan frame (subjek, suasana, cahaya, warna) untuk
  // menjadi dasar lukisan poster — takarir/watermark pada frame diabaikan.
  // v1.0.37: pakai glm-4.6v-flash yang GRATIS — satu-satunya biaya = gambar poster.
  const pubDescribeScene = async (dataUrl, key) => {
    const json = await zaiPubFetch("/chat/completions", key, {
      model: "glm-4.6v-flash",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl } },
            {
              type: "text",
              text:
                "Describe this video frame as a cinematic movie-poster scene brief in English (max 100 words): " +
                "main subject appearance, pose, emotion, setting, lighting, color mood. " +
                "IGNORE any burned-in subtitles, captions or watermarks — do not mention them.",
            },
          ],
        },
      ],
      max_tokens: 300,
    });
    return String(json?.choices?.[0]?.message?.content || "").trim();
  };
  // glm-image: gambar poster Hollywood utuh (hd/standard). Respons = URL sementara → unduh → base64.
  // v1.0.38: quality mengikuti preferensi pengguna — hd (terbaik, ±20 dtk) atau standard (cepat, 5-10 dtk).
  const pubGeneratePoster = async (prompt, key, size, quality) => {
    const json = await zaiPubFetch("/images/generations", key, {
      model: "glm-image",
      prompt: prompt.slice(0, 4000),
      quality: quality === "standard" ? "standard" : "hd",
      size,
    });
    const url = json?.data?.[0]?.url;
    if (!url) throw new Error("respons gambar kosong");
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 60000);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error(`unduh poster gagal HTTP ${r.status}`);
      return `data:image/png;base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`;
    } finally {
      clearTimeout(to);
    }
  };
  const posterPromptPublik = (prompt, deskripsi) =>
    `Create ONE professional modern Hollywood movie poster, cinematic style. Follow these user instructions: ${prompt}. ` +
    `Scene basis (from the user's video frame): ${deskripsi}. ` +
    `Rules: all text fully inside the image with safe margins from every edge; the movie title must be large, dramatic and spelled EXACTLY as given in the instructions; ` +
    `no subtitles, no captions, no watermarks, no timestamps; single cohesive composition, dramatic lighting.`;

  ipcMain.handle("ai:set-key", (_e, payload) => {
    try {
      const key = String(payload?.apiKey || "").trim();
      if (!key) return { ok: false, error: "kunci kosong" };
      fs.mkdirSync(path.dirname(keyPath), { recursive: true });
      fs.writeFileSync(keyPath, JSON.stringify({ apiKey: key }), { mode: 0o600 });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  ipcMain.handle("ai:key-status", () => ({ hasKey: !!readAIKey() }));
  ipcMain.handle("ai:clear-key", () => {
    try {
      fs.rmSync(keyPath, { force: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  // Tes kunci: chat ping — validasi kunci + saldo tanpa menggambar poster.
  // v1.0.37: pakai glm-4.7-flash yang GRATIS — tes tidak makan saldo.
  ipcMain.handle("ai:test-key", async () => {
    const key = readAIKey();
    if (!key) return { ok: false, error: "kunci belum dipasang" };
    try {
      await zaiPubFetch("/chat/completions", key, {
        model: "glm-4.7-flash",
        messages: [{ role: "user", content: "Reply with exactly: OK" }],
        max_tokens: 5,
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  ipcMain.handle("app:open-url", (_e, payload) => {
    const url = String(payload?.url || "");
    if (!/^https:\/\/(www\.)?(z\.ai|docs\.z\.ai|bigmodel\.cn|dash\.cloudflare\.com|developers\.cloudflare\.com)/.test(url)) return { ok: false, error: "url tidak diizinkan" };
    return shell.openExternal(url).then(() => ({ ok: true })).catch((err) => ({ ok: false, error: String(err) }));
  });

  // ===== v1.0.38: CLOUDFLARE WORKERS AI — jalur poster GRATIS (tanpa kartu) =====
  // Free plan: 10.000 Neuron/hari gratis (reset 00:00 UTC). Biaya per poster:
  // vision llama-3.2-11b ±30 Neuron + flux-1-schnell (4 tile × 4.8 + 4 step × 9.6)
  // ≈ 58 Neuron → ±170 poster/hari gratis. Pengguna hanya membuat Account ID +
  // API Token gratis di dash.cloudflare.com — tidak perlu kartu kredit.
  const CF_BASE = "https://api.cloudflare.com/client/v4";
  const cfKeyPath = path.join(app.getPath("userData"), "cf_key.json");
  const prefsPath = path.join(app.getPath("userData"), "ai_prefs.json");
  const readCFKey = () => {
    try {
      const j = JSON.parse(fs.readFileSync(cfKeyPath, "utf-8"));
      return { account: String(j.account || "").trim(), token: String(j.token || "").trim() };
    } catch {
      return { account: "", token: "" };
    }
  };
  const readAIPrefs = () => {
    try {
      const j = JSON.parse(fs.readFileSync(prefsPath, "utf-8"));
      return { provider: j.provider === "cloudflare" ? "cloudflare" : "zai", quality: j.quality === "standard" ? "standard" : "hd" };
    } catch {
      return { provider: "zai", quality: "hd" };
    }
  };
  const cfRun = async (cf, model, body, timeoutMs = 120000) => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${CF_BASE}/accounts/${cf.account}/ai/run/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${cf.token}` },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        const msg = json?.errors?.[0]?.message || json?.messages?.[0]?.message || `HTTP ${res.status}`;
        throw new Error(String(msg).slice(0, 160));
      }
      return json?.result ?? {};
    } finally {
      clearTimeout(to);
    }
  };
  // Vision gratis: deskripsi adegan frame sebagai dasar lukisan poster (Inggris,
  // ≤100 kata; takarir/watermark diabaikan) — llama-3.2-11b-vision-instruct.
  const cfDescribeScene = async (dataUrl, cf) => {
    const visPrompt =
      "Describe this video frame as a cinematic movie-poster scene brief in English (max 100 words): " +
      "main subject appearance, pose, emotion, setting, lighting, color mood. " +
      "IGNORE any burned-in subtitles, captions or watermarks — do not mention them.";
    try {
      const r = await cfRun(cf, "@cf/meta/llama-3.2-11b-vision-instruct", {
        messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: dataUrl } }, { type: "text", text: visPrompt }] }],
        max_tokens: 300,
      }, 90000);
      return String(r?.response || "").trim();
    } catch {
      return ""; // vision gagal → lanjut tanpa deskripsi (prompt tetap membawa judul)
    }
  };
  // FLUX.1 schnell: poster utuh (steps 4, ±58 Neuron). Coba ikut rasio proyek;
  // bila skema menolak width/height → ulangi tanpa keduanya (hasil persegi).
  const cfGeneratePoster = async (prompt, cf, wide) => {
    const dasar = { prompt: prompt.slice(0, 1800), steps: 4 };
    try {
      const r = await cfRun(cf, "@cf/black-forest-labs/flux-1-schnell", { ...dasar, ...(wide ? { width: 1024, height: 576 } : { width: 576, height: 1024 }) });
      if (r?.image) return `data:image/jpeg;charset=utf-8;base64,${r.image}`;
      throw new Error("respons gambar kosong");
    } catch (err) {
      const r = await cfRun(cf, "@cf/black-forest-labs/flux-1-schnell", dasar);
      if (r?.image) return `data:image/jpeg;charset=utf-8;base64,${r.image}`;
      throw err;
    }
  };
  const cfPosterPrompt = (prompt, deskripsi) =>
    `Create ONE professional modern Hollywood movie poster, cinematic style. Follow these user instructions: ${prompt}. ` +
    `Scene basis (from the user's video frame): ${deskripsi || "dramatic cinematic scene"}. ` +
    `Rules: all text fully inside the image with safe margins from every edge; ` +
    `no subtitles, no captions, no watermarks, no timestamps; single cohesive composition, dramatic lighting.`;

  ipcMain.handle("cf:set-key", (_e, payload) => {
    try {
      const account = String(payload?.account || "").trim();
      const token = String(payload?.token || "").trim();
      if (!account || !token) return { ok: false, error: "Account ID dan API Token wajib diisi" };
      fs.mkdirSync(path.dirname(cfKeyPath), { recursive: true });
      fs.writeFileSync(cfKeyPath, JSON.stringify({ account, token }), { mode: 0o600 });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  ipcMain.handle("cf:key-status", () => {
    const cf = readCFKey();
    return { hasKey: !!(cf.account && cf.token) };
  });
  ipcMain.handle("cf:clear-key", () => {
    try {
      fs.rmSync(cfKeyPath, { force: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  // Tes Cloudflare: daftar model (0 Neuron) — validasi Account ID + Token sekaligus.
  ipcMain.handle("cf:test-key", async () => {
    const cf = readCFKey();
    if (!cf.account || !cf.token) return { ok: false, error: "Account ID / Token belum lengkap" };
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(`${CF_BASE}/accounts/${cf.account}/ai/models/search?per_page=1`, {
        headers: { Authorization: `Bearer ${cf.token}` },
        signal: ctrl.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        const msg = json?.errors?.[0]?.message || `HTTP ${res.status}`;
        return { ok: false, error: String(msg).slice(0, 160) };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    } finally {
      clearTimeout(to);
    }
  });
  // Preferensi penyedia & kualitas poster (disimpan lokal, mode 0600).
  ipcMain.handle("ai:get-prefs", () => readAIPrefs());
  ipcMain.handle("ai:set-prefs", (_e, payload) => {
    try {
      const cur = readAIPrefs();
      const next = {
        provider: payload?.provider === "cloudflare" ? "cloudflare" : payload?.provider === "zai" ? "zai" : cur.provider,
        quality: payload?.quality === "standard" ? "standard" : payload?.quality === "hd" ? "hd" : cur.quality,
      };
      fs.mkdirSync(path.dirname(prefsPath), { recursive: true });
      fs.writeFileSync(prefsPath, JSON.stringify(next), { mode: 0o600 });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });

  // POSTER AI — jalur utama: kunci pengguna → API publik (vision + glm-image);
  // tanpa kunci: jalur SDK lama (lingkungan yg punya .z-ai-config); keduanya
  // gagal → ok:false, renderer lanjut memakai grade lokal (cover tetap jadi).
  ipcMain.handle("ai:poster", async (_event, payload) => {
    const prompt = String(payload?.prompt || "cinematic movie poster");
    const image = String(payload?.image || "");
    const sizePub = payload?.size === "768x1344" ? "960x1728" : "1728x960";
    // v1.0.38: penyedia Cloudflare (GRATIS) — vision llama + FLUX.1 schnell;
    // gagal → ok:false (fallback grade lokal), TIDAK diam-diam pindah ke z.ai
    // supaya pengguna tidak terekspos biaya tanpa sengaja.
    if (payload?.provider === "cloudflare") {
      const cf = readCFKey();
      if (!cf.account || !cf.token) return { ok: false, error: "Kredensial Cloudflare belum diisi" };
      try {
        const deskripsi = await cfDescribeScene(image, cf);
        const poster = await cfGeneratePoster(cfPosterPrompt(prompt, deskripsi), cf, payload?.size !== "768x1344");
        return { ok: true, image: poster, via: "cloudflare" };
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err).slice(0, 200) };
      }
    }
    const key = readAIKey();
    if (key) {
      try {
        const deskripsi = await pubDescribeScene(image, key);
        const poster = await pubGeneratePoster(posterPromptPublik(prompt, deskripsi || "dramatic cinematic scene"), key, sizePub, payload?.quality);
        if (poster) return { ok: true, image: poster, via: "publik" };
      } catch (err) {
        // kunci ada tapi gagal (saldo/koneksi) → lanjut coba jalur SDK bila ada
        lastAIPosterError = String((err && err.message) || err).slice(0, 200);
      }
    }
    try {
      const mod = await import("z-ai-web-dev-sdk");
      const ZAI = mod.default ?? mod;
      const zai = await ZAI.create();
      const res = await zai.images.generations.edit({
        prompt: prompt.slice(0, 1200),
        images: [{ url: image }],
        size: payload?.size === "768x1344" ? "768x1344" : "1344x768",
      });
      const b64 = res?.data?.[0]?.base64;
      if (!b64) return { ok: false, error: lastAIPosterError || "respons AI kosong" };
      return { ok: true, image: `data:image/png;base64,${b64}`, via: "sdk" };
    } catch (err) {
      return { ok: false, error: (lastAIPosterError || String((err && err.message) || err)).slice(0, 200) };
    }
  });

  // Matikan PC (Windows) setelah batch selesai — jeda 60 detik memberi kesempatan
  // membatalkan lewat terminal (`shutdown /a`) bila berubah pikiran.
  ipcMain.handle("app:shutdown", async () => {
    try {
      const { exec } = require("child_process");
      exec("shutdown /s /t 60");
      return { ok: true };
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
