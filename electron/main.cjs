// NOVACUT Studio - Electron main process
// Menyajikan build statis (folder out/) lewat HTTP lokal lalu membukanya di window.

const { app, BrowserWindow, Menu, Notification, dialog, ipcMain, shell, clipboard } = require("electron");
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
    // v1.0.43: rantai model vision — glm-4.6v-flash (gratis) dulu; bila model
    // sudah tidak tersedia/berubah di akun, coba glm-5.3-flash (VLM docs.z.ai).
    const visPrompt =
      "Describe this video frame as a cinematic movie-poster scene brief in English (max 120 words): " +
      "HOW MANY people are in the frame and each person's exact appearance (gender, age, hair, clothing colors), " +
      "their pose, emotion, props, the setting/background, lighting and color mood. " +
      "The poster must redraw EXACTLY these people and this setting — same identity, same clothes, same place. " +
      "IGNORE any burned-in subtitles, captions or watermarks — do not mention them.";
    let pesanTerakhir = "";
    for (const model of ["glm-4.6v-flash", "glm-5.3-flash"]) {
      try {
        const json = await zaiPubFetch("/chat/completions", key, {
          model,
          messages: [
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: dataUrl } },
                { type: "text", text: visPrompt },
              ],
            },
          ],
          max_tokens: 300,
        });
        const teks = String(json?.choices?.[0]?.message?.content || "").trim();
        if (teks) return teks;
        pesanTerakhir = "respons vision kosong";
      } catch (err) {
        pesanTerakhir = String((err && err.message) || err).slice(0, 160);
      }
    }
    throw new Error(pesanTerakhir || "vision gagal");
  };
  // unduh gambar dari URL sementara (30 hari) → base64 — dipakai txt2img & img2img
  const unduhGambar = async (url) => {
    if (url.startsWith("data:")) return url;
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
  // glm-image: gambar poster Hollywood utuh (hd/standard). Respons = URL sementara → unduh → base64.
  // v1.0.38: quality mengikuti preferensi pengguna — hd (terbaik, ±20 dtk) atau standard (cepat, 5-10 dtk).
  const pubGeneratePoster = async (prompt, key, size, quality) => {
    const json = await zaiPubFetch("/images/generations", key, {
      model: "glm-image",
      prompt: prompt.slice(0, 4000),
      quality: quality === "standard" ? "standard" : "hd",
      size,
    });
    // v1.0.43: terima url ATAU b64_json (bentuk respons bisa berganti antar versi API)
    const url = json?.data?.[0]?.url || (json?.data?.[0]?.b64_json ? `data:image/png;base64,${json.data[0].b64_json}` : "");
    if (!url) throw new Error("respons gambar kosong");
    return unduhGambar(url);
  };
  // v1.0.44: IMG2IMG DULU — frame utuh dikirim ke glm-image via endpoint edit ala
  // SDK (POST /images/generations/edit) → wajah/pakaian/adegan VIDEO terjaga
  // (keluhan: "gambar poster bukan dari adegan video"). Endpoint ini belum ada di
  // docs publik (SDK internal memakainya); bila gagal/404 → null → caller kembali
  // ke txt2img pubGeneratePoster dgn deskripsi adegan (jalur lama tetap utuh).
  const pubEditPoster = async (dataUrl, prompt, key, size, quality) => {
    const q = quality === "standard" ? "standard" : "hd";
    for (const body of [
      { model: "glm-image", prompt: prompt.slice(0, 4000), images: [{ url: dataUrl }], quality: q, size },
      { model: "glm-image", prompt: prompt.slice(0, 4000), image: dataUrl, quality: q, size },
      { model: "glm-image", prompt: prompt.slice(0, 4000), image_url: dataUrl, quality: q, size },
    ]) {
      try {
        const json = await zaiPubFetch("/images/generations/edit", key, body);
        const url = json?.data?.[0]?.url || (json?.data?.[0]?.b64_json ? `data:image/png;base64,${json.data[0].b64_json}` : "");
        if (url) return unduhGambar(url);
      } catch {
        /* bentuk/endpoint tak didukung → coba bentuk berikutnya */
      }
    }
    return null;
  };
  // v1.0.44: ADEGAN MENANG — deskripsi frame jadi prioritas tertinggi; instruksi
  // gaya pengguna (termasuk default "2-3 karakter berhadapan") hanya GAYA, dan
  // karakternya WAJIB orang-orang dari adegan video — dulu glm-image bebas
  // mengarang karakter/latar baru sehingga poster terasa "bukan dari video".
  // v1.0.46: mode TEXTFREE — renderer mengirim marker [TEXTFREE] berarti poster
  // harus MURNI tanpa teks (judul ditulis aplikasi via template, ejaan selalu
  // benar). Marker dibuang dari prompt, aturan judul diganti aturan tanpa-teks.
  const bersihTextFree = (prompt) => {
    const textFree = /\[TEXTFREE\]/.test(prompt);
    return { textFree, prompt: String(prompt).replace(/\[TEXTFREE\]\s*/g, "").trim() };
  };
  const aturanTanpaTeks =
    `ABSOLUTELY NO TEXT anywhere in the image: no words, no letters, no numbers, no titles, no logos, no credits, no subtitles, no watermarks — pure artwork only; the app will add the title itself. `;
  const posterPromptPublik = (prompt, deskripsi) => {
    const { textFree, prompt: bersih } = bersihTextFree(prompt);
    // v1.0.47: arah "FOTO ASLI + SENTUHAN AI REALISTIS" — kata "Hollywood movie
    // poster" membuat model bergeser ke ilustrasi/kartun; kini fotoreal wajib.
    return `Create ONE modern cinematic movie poster that looks like a REAL PHOTOGRAPH (photorealistic): real people with natural skin texture, real hair and fabric, shot on a professional cinema camera; NOT an illustration — no cartoon, no anime, no drawing, no painting, no 3D render, no CGI. ` +
      `SCENE BASIS (HIGHEST PRIORITY — the poster MUST depict exactly the people and setting described): ${deskripsi}. ` +
      `If the style instructions mention 2-3 characters, use THE PEOPLE FROM THE SCENE above in that composition — never invent new characters, faces, or locations. ` +
      `Style instructions from the user: ${bersih}. ` +
      (textFree
        ? aturanTanpaTeks
        : `Rules: all text fully inside the image with safe margins from every edge; the movie title must be large, dramatic, positioned at the BOTTOM area of the poster, and spelled EXACTLY as given in the instructions; `) +
      `no subtitles, no captions, no watermarks, no timestamps; single cohesive composition, dramatic realistic lighting.`;
  };

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
    if (!/^https:\/\/(www\.)?(z\.ai|docs\.z\.ai|bigmodel\.cn|dash\.cloudflare\.com|developers\.cloudflare\.com|(docs\.)?mage\.space|platform\.minimax\.io|mivo\.com)/.test(url)) return { ok: false, error: "url tidak diizinkan" };
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
  // v1.0.47: penyedia ke-3 Mage (mage.space) — kunci mage_sk_ + saldo Gems
  const mageKeyPath = path.join(app.getPath("userData"), "mage_key.json");
  const readMageKey = () => {
    try {
      return String(JSON.parse(fs.readFileSync(mageKeyPath, "utf-8")).apiKey || "").trim();
    } catch {
      return "";
    }
  };
  // v1.0.55: penyedia ke-4 MiniMax H3 (platform.minimax.io) — mesin "Minimax H3"
  // yang sama dengan yang dipakai pengguna di mivo.com/generate/studio, kini via
  // API resminya sendiri (OpenAI-style images API).
  const minimaxKeyPath = path.join(app.getPath("userData"), "minimax_key.json");
  const readMiniMaxKey = () => {
    try {
      return String(JSON.parse(fs.readFileSync(minimaxKeyPath, "utf-8")).apiKey || "").trim();
    } catch {
      return "";
    }
  };
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
      return { provider: j.provider === "cloudflare" ? "cloudflare" : j.provider === "mage" ? "mage" : j.provider === "minimax" ? "minimax" : "zai", quality: j.quality === "standard" ? "standard" : "hd" };
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
  // Vision gratis: deskripsi adegan frame sebagai dasar poster (Inggris, ≤120 kata;
  // takarir/watermark diabaikan) — llama-3.2-11b-vision-instruct. v1.0.40: deskripsi
  // lebih kaya (umur/rambut/pakaian/pose/properti/palette) agar lukisan lebih mirip.
  const cfDescribeScene = async (dataUrl, cf) => {
    const visPrompt =
      "Describe this video frame as a cinematic movie-poster scene brief in English (max 120 words): " +
      "subject's age, gender, hair, clothing, expression and exact pose; key props; " +
      "setting and background; lighting direction; dominant color palette; overall mood. " +
      "IGNORE any burned-in subtitles, captions or watermarks — do not mention them.";
    try {
      const r = await cfRun(cf, "@cf/meta/llama-3.2-11b-vision-instruct", {
        messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: dataUrl } }, { type: "text", text: visPrompt }] }],
        max_tokens: 300,
      }, 90000);
      return String(r?.response || "").trim();
    } catch (err) {
      // v1.0.41: lisensi Meta Llama minta persetujuan SEKALI per akun ("Model
      // Agreement") — kirim {"prompt":"agree"} otomatis lalu ulang vision sekali.
      if (/model agreement|agree/i.test(String((err && err.message) || ""))) {
        try {
          await cfRun(cf, "@cf/meta/llama-3.2-11b-vision-instruct", { prompt: "agree" }, 30000);
          const r = await cfRun(cf, "@cf/meta/llama-3.2-11b-vision-instruct", {
            messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: dataUrl } }, { type: "text", text: visPrompt }] }],
            max_tokens: 300,
          }, 90000);
          return String(r?.response || "").trim();
        } catch { return ""; }
      }
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
  // v1.0.40 — FLUX.2 Klein 4B (model EDITING): frame video dikirim UTUH sebagai
  // gambar input, poster dilukis DARI frame itu (wajah/adegan terjaga).
  // v1.0.49 — RANTAI ROBUST (keluhan: "poster masih bukan adegan asli"): jalur
  // edit dulu GAGAL diam-diam (Model Agreement BFL / bentuk payload) → jatuh ke
  // txt2img yang MENGARANG orang baru. Kini:
  //  (1) urutan disusun ulang — multipart TANPA width/height dulu (edit murni:
  //      komposisi, framing & aspek frame asli dijaga persis);
  //  (2) attempt OpenAI-compatible POST /ai/v1/images/edits;
  //  (3) FLUX.2 dev (multi-reference, identitas terkuat) sebagai kuat terakhir;
  //  (4) Model Agreement BFL disetujui OTOMATIS (pola fix Llama v1.0.41) lalu
  //      seluruh rantai diulang SEKALI;
  //  (5) setiap attempt diberi label sehingga alasan gagal terlihat di UI.
  const dataUrlToBuf = (dataUrl) => Buffer.from(String(dataUrl || "").replace(/^data:[^,]+,/, ""), "base64");
  const cfAgreeModel = async (cf, model) => {
    try {
      await cfRun(cf, model, { prompt: "agree" }, 30000);
    } catch { /* agreement percobaan — biarkan gagal diam-diam */ }
  };
  const ambilGambar = (r) => (r?.image ? `data:image/jpeg;charset=utf-8;base64,${r.image}` : null);
  const cfEditKlein = async (model, prompt, dataUrl, cf, wide) => {
    const url = `${CF_BASE}/accounts/${cf.account}/ai/run/${model}`;
    const auth = { Authorization: `Bearer ${cf.token}` };
    const body64 = String(dataUrl).split(",").pop() || "";
    const rasio = wide ? { width: 1280, height: 720 } : { width: 720, height: 1280 };
    let lastErr = null;
    const coba = async (label, eksekusi) => {
      try {
        const img = await eksekusi();
        if (img) return img;
        throw new Error("respons gambar kosong");
      } catch (err) {
        lastErr = new Error(`${label}: ${String((err && err.message) || err).slice(0, 140)}`);
        return null;
      }
    };
    const multipart = async (dgnRasio) => {
      const fd = new FormData();
      fd.append("prompt", prompt.slice(0, 1800));
      fd.append("image", new Blob([dataUrlToBuf(dataUrl)], { type: "image/jpeg" }), "frame.jpg");
      if (dgnRasio) {
        fd.append("width", String(rasio.width));
        fd.append("height", String(rasio.height));
      }
      const res = await fetch(url, { method: "POST", headers: auth, body: fd, signal: AbortSignal.timeout(180000) });
      const json = await res.json().catch(() => ({}));
      const img = ambilGambar(json?.result);
      if (res.ok && json?.success !== false && img) return img;
      throw new Error(json?.errors?.[0]?.message || `HTTP ${res.status}`);
    };
    // 1) multipart TANPA rasio — edit murni: keluaran mengikuti aspek frame asli
    const a1 = await coba("multipart", () => multipart(false));
    if (a1) return a1;
    // 2) multipart + rasio proyek (skema resmi; jaring aman moderation)
    const a2 = await coba("multipart-rasio", () => multipart(true));
    if (a2) return a2;
    // 3) JSON {prompt, image: base64}
    const a3 = await coba("json-image", async () => ambilGambar(await cfRun(cf, model, { prompt: prompt.slice(0, 1800), image: body64 }, 180000)));
    if (a3) return a3;
    // 4) JSON {prompt, images: [base64]} (nama multi-reference)
    const a4 = await coba("json-images", async () => ambilGambar(await cfRun(cf, model, { prompt: prompt.slice(0, 1800), images: [body64] }, 180000)));
    if (a4) return a4;
    // 5) OpenAI-compatible: POST /ai/v1/images/edits (multipart model+prompt+image)
    const a5 = await coba("images-edits", async () => {
      const fd = new FormData();
      fd.append("model", model);
      fd.append("prompt", prompt.slice(0, 1800));
      fd.append("image", new Blob([dataUrlToBuf(dataUrl)], { type: "image/jpeg" }), "frame.jpg");
      const res = await fetch(`${CF_BASE}/accounts/${cf.account}/ai/v1/images/edits`, { method: "POST", headers: auth, body: fd, signal: AbortSignal.timeout(180000) });
      const json = await res.json().catch(() => ({}));
      const b64 = json?.data?.[0]?.b64_json || json?.result?.image || json?.image || "";
      if (res.ok && b64) return `data:image/jpeg;charset=utf-8;base64,${b64}`;
      throw new Error(json?.error?.message || json?.errors?.[0]?.message || `HTTP ${res.status}`);
    });
    if (a5) return a5;
    throw lastErr || new Error("semua bentuk payload edit gagal");
  };
  const cfEditPoster = async (prompt, dataUrl, cf, wide) => {
    const rantai = async () => {
      try {
        return await cfEditKlein("@cf/black-forest-labs/flux-2-klein-4b", prompt, dataUrl, cf, wide);
      } catch (errKlein) {
        // 6) kuat terakhir: FLUX.2 dev — multi-reference, identitas paling kuat
        return await cfEditKlein("@cf/black-forest-labs/flux-2-dev", prompt, dataUrl, cf, wide);
      }
    };
    try {
      return await rantai();
    } catch (err) {
      // v1.0.49: Model Agreement BFL wajib disetujui SEKALI per akun (pola sama
      // dgn fix Llama v1.0.41) — setujui otomatis lalu ulang rantai SEKALI.
      if (/agree|terms|agreement|licens/i.test(String((err && err.message) || err))) {
        await cfAgreeModel(cf, "@cf/black-forest-labs/flux-2-klein-4b");
        await cfAgreeModel(cf, "@cf/black-forest-labs/flux-2-dev");
        return await rantai();
      }
      throw err;
    }
  };
  // v1.0.40: prompt poster diperbaiki — judul ASLI dari video diekstrak dan
  // diwajibkan jadi satu-satunya teks besar; kata "Hollywood" tidak dipakai lagi
  // (bocor jadi judul poster), credits/nama/logoran diblokir (tidak jadi coretan).
  const cfPosterPrompt = (prompt, deskripsi, judul) => {
    const { textFree, prompt: bersih } = bersihTextFree(prompt);
    const m = textFree ? "" : judul || (bersih.match(/judul "([^"]+)"/) || [])[1] || "";
    const judulPart = m
      ? `The ONLY large text on the poster is the movie title: "${m.slice(0, 60).toUpperCase()}" spelled exactly letter by letter, all caps, large bold typography positioned at the BOTTOM area of the poster, inside safe margins. `
      : "";
    // v1.0.41: kata "Hollywood" juga dibersihkan dari instruksi pengguna
    // (prompt default berbahasa Indonesia menyebut "film Hollywood") — jika
    // tidak, model bisa menulis HOLLYWOOD sebagai judul poster.
    const tema = bersih
      .replace(/dengan menggunakan judul "[^"]+" sebagai judul di poster\.?/i, "")
      .replace(/film\s+Hollywood/gi, "film")
      .replace(/\bHollywood\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    // v1.0.47: txt2img juga fotoreal — "blockbuster key art" mendorong model ke
    // gaya ilustrasi; kini wajib seperti foto asli (permintaan pengguna).
    return `Create ONE cinematic movie poster that looks like a REAL PHOTOGRAPH (photorealistic key art): real people with natural skin texture and realistic proportions, shot on a professional cinema camera — shallow depth of field, fine film grain; NOT an illustration: no cartoon, no anime, no drawing, no painting, no 3D render, no CGI. ${judulPart}` +
      // v1.0.45: SCENE BASIS jadi PRIORITAS TERTINGGI dan berada di awal — dulu
      // instruksi pengguna ("2-3 karakter saling berhadapan", "background kolosal")
      // mendominasi → txt2img mengarang orang/latar baru, poster terasa bukan
      // dari video. Kini karakter WAJIB orang adegan; instruksi pengguna hanya gaya.
      `SCENE BASIS (HIGHEST PRIORITY — draw EXACTLY the people and setting described below, do NOT invent new characters, faces, or locations): ${deskripsi || "dramatic cinematic scene"}. ` +
      `If the style instructions mention a number of characters, compose THE PEOPLE FROM THE SCENE in that arrangement. ` +
      `NO other words anywhere: no actor names, no credits block, no studio logos, no small text, no subtitles, no watermarks, no timestamps. ` +
      `Single cohesive composition, dramatic lighting, rich color grade. ` +
      `Style instructions (styling only — never override the scene): ${tema || "cinematic movie poster"}.`;
  };
  // v1.0.45: prompt jalur EDIT dibangun ulang — IDENTITAS ADEGAN MENANG. Dulu
  // prompt ini menempelkan cfPosterPrompt utuh (dengan instruksi pengguna
  // "2-3 karakter berhadapan", "background kolosal", "frame futuristik") → model
  // edit menerima perintah BERTENTANGAN (pertahankan subjek VS buat karakter baru)
  // → poster melenceng jauh dari video. Kini instruksi pengguna hanya diambil
  // sebagai GAYA (pencahayaan/warna/bingkai), orang & latar terkunci dari foto.
  const cfEditPrompt = (prompt, deskripsi, judul) => {
    // v1.0.46: TEXTFREE — poster art polos tanpa teks; judul ditulis app via frame
    const { textFree, prompt: bersih } = bersihTextFree(prompt);
    const m = textFree ? "" : judul || (bersih.match(/judul "([^"]+)"/) || [])[1] || "";
    const judulPart = m
      ? `The ONLY large text on the poster is the title: "${m.slice(0, 60).toUpperCase()}" spelled exactly letter by letter, all caps, large bold typography positioned at the BOTTOM area of the poster, inside safe margins. `
      : "";
    return (
      // v1.0.47: arah "FOTO ASLI + SENTUHAN AI REALISTIS" (permintaan pengguna) —
      // dulu "Redraw as ONE cinematic movie poster" membaca "poster" sebagai key art
      // BERGAMBAR → hasil kartun. Kini foto asli dipertahankan, AI hanya menyentuh gaya.
      `Transform this REAL PHOTOGRAPH into a cinematic movie poster while keeping it a REAL PHOTO — the output must look like an actual photograph, NOT an illustration. ` +
      `REAL-PHOTO LOOK (HIGHEST PRIORITY): real people with natural skin texture, real hair, real fabric, real background; shot on a professional cinema camera; NO cartoon, no anime, no drawing, no painting, no 3D render, no CGI, no plastic skin, no beauty filter. ` +
      `IDENTITY LOCK (HIGHEST PRIORITY): keep EXACTLY the same person(s) from the input photo — same number of people, same faces, hairstyle, clothing, props — and the same setting/background. ` +
      // v1.0.49: instruksi SUBTLE EDIT — dulu model boleh mere-imagine adegan walau
      // orangnya "dipertahankan" (komposisi berubah total). Kini edit-tingkat-kecil
      // diwajibkan: komposisi/framing/crop/aspek foto asli TIDAK berubah.
      `SUBTLE EDIT (img2img, HIGHEST PRIORITY): the input photo IS the poster background — keep its EXACT composition, framing, crop, camera angle, aspect ratio and subject placement; output the SAME photograph with ONLY lighting, color grade and atmosphere changed; do NOT re-imagine, re-frame, or re-draw the scene. ` +
      `Do NOT add, remove, or replace any person; do NOT invent a new location. ` +
      `If the style instructions mention a number of characters, arrange THE PEOPLE FROM THE PHOTO in that composition — never invent new people. ` +
      `Apply ONLY realistic AI touches: dramatic cinematic lighting, professional color grade, subtle atmosphere (rim light, haze, soft glow) — everything else stays the real photo. ` +
      (textFree
        ? aturanTanpaTeks + `Leave the top area and the bottom edges relatively uncluttered — the app will overlay a title there. `
        : judulPart) +
      `NO other words anywhere: no credits, no studio logos, no small text, no subtitles, no watermarks, no timestamps.` +
      (deskripsi ? ` Scene reference: ${deskripsi}.` : "")
    );
  };
  // v1.0.52: jalur OUTPAINT model edit DIHAPUS — v1.0.51 gagal total: model edit
  // CF mengarang ULANG seluruh adegan (identitas hilang, poster penuh gambar AI).
  // Pengganti: mode "aslihitam" kini KOMPOSIT di renderer — AI hanya melukis
  // LATAR KOSONG via bgOnly (txt2img, identitas mustahil rusak), adegan asli
  // digambar renderer di atasnya (lihat posterKompositCineDataURL).

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
  // ===== v1.0.47: MAGE.SPACE — penyedia ke-3 (per gambar ±9 Gems ≈ Rp145) =====
  // Kunci mage_sk_ disimpan lokal (mode 0600). Tes kunci TANPA biaya: POST ke
  // model yang tidak ada — bila auth lolos server menjawab 404/400/422 (model
  // tak dikenal), bila kunci salah 401/403. Tidak ada gambar digambar → 0 Gems.
  const MAGE_BASE = "https://api.mage.space/v1";
  ipcMain.handle("mage:set-key", (_e, payload) => {
    try {
      const key = String(payload?.apiKey || "").trim();
      if (!key) return { ok: false, error: "kunci kosong" };
      fs.mkdirSync(path.dirname(mageKeyPath), { recursive: true });
      fs.writeFileSync(mageKeyPath, JSON.stringify({ apiKey: key }), { mode: 0o600 });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  ipcMain.handle("mage:key-status", () => ({ hasKey: !!readMageKey() }));
  ipcMain.handle("mage:clear-key", () => {
    try {
      fs.rmSync(mageKeyPath, { force: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  ipcMain.handle("mage:test-key", async () => {
    const mk = readMageKey();
    if (!mk) return { ok: false, error: "kunci belum dipasang" };
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(`${MAGE_BASE}/nova-tes-koneksi/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${mk}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "test", model_id: "nova-tes-koneksi" }),
        signal: ctrl.signal,
      });
      if (res.status === 401 || res.status === 403) return { ok: false, error: "Kunci Mage salah/kedaluwarsa" };
      // 404/400/422 = model tak dikenal TAPI auth lolos → kunci valid (0 Gems)
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    } finally {
      clearTimeout(to);
    }
  });
  // v1.0.55: penyedia ke-4 MiniMax H3 — tes koneksi via GET /v1/models (gratis,
  // 0 kredit) — 401/403 = kunci salah, selain itu auth lolos.
  ipcMain.handle("minimax:set-key", (_e, payload) => {
    try {
      const key = String(payload?.apiKey || "").trim();
      if (!key) return { ok: false, error: "kunci kosong" };
      fs.mkdirSync(path.dirname(minimaxKeyPath), { recursive: true });
      fs.writeFileSync(minimaxKeyPath, JSON.stringify({ apiKey: key }), { mode: 0o600 });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  ipcMain.handle("minimax:key-status", () => ({ hasKey: !!readMiniMaxKey() }));
  ipcMain.handle("minimax:clear-key", () => {
    try {
      fs.rmSync(minimaxKeyPath, { force: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  ipcMain.handle("minimax:test-key", async () => {
    const mk = readMiniMaxKey();
    if (!mk) return { ok: false, error: "kunci belum dipasang" };
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch("https://api.minimax.io/v1/models", {
        method: "GET",
        headers: { Authorization: `Bearer ${mk}` },
        signal: ctrl.signal,
      });
      if (res.status === 401 || res.status === 403) return { ok: false, error: "Kunci MiniMax salah/kedaluwarsa" };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    } finally {
      clearTimeout(to);
    }
  });
  // ===== v1.0.56: JEMBATAN MIVO — jalur semi-otomatis via web mivo.com =====
  // Mivo tidak punya API publik, jadi: app menyiapkan SEMUA otomatis (folder
  // NOVACUT-Mivo + frame referensi + prompt FINAL tersalin ke clipboard + buka
  // studio Mivo), pengguna hanya paste → generate → unduh hasil ke folder;
  // poll scan folder tiap 3 dtk otomatis mengambil gambar terbaru → lanjut jadi
  // cover. Tanpa kunci API, memakai kredit Mivo (QRIS), sesuai ketentuan Mivo.
  let mivoBridge = null; // { id, dir, startedAt } — satu jembatan aktif
  const mivoDir = () => {
    let base = app.getPath("userData");
    try {
      base = app.getPath("documents") || base;
    } catch {}
    const dir = path.join(base, "NOVACUT-Mivo");
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
    return dir;
  };
  ipcMain.handle("mivo:bridge-start", (_e, payload) => {
    try {
      const dir = mivoDir();
      const { textFree: mf, prompt: mp } = bersihTextFree(String(payload?.prompt || ""));
      const promptFinal =
        mp +
        (mf ? ` ${aturanTanpaTeks}` : "") +
        ` The result must look like a REAL PHOTOGRAPH (photorealistic) — no cartoon, no anime, no illustration, no 3D render.`;
      // frame referensi ditulis ke folder (awalan REFERENSI- agar tak dianggap hasil)
      const src = String(payload?.image || "");
      if (src.startsWith("data:")) {
        const b64 = src.slice(src.indexOf(",") + 1);
        if (b64) fs.writeFileSync(path.join(dir, "REFERENSI-frame.png"), Buffer.from(b64, "base64"));
      }
      clipboard.writeText(promptFinal.slice(0, 6000));
      mivoBridge = { id: `mivo-${Date.now()}`, dir, startedAt: Date.now() };
      return { ok: true, id: mivoBridge.id, dir, prompt: promptFinal.slice(0, 6000) };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  ipcMain.handle("mivo:bridge-poll", (_e, payload) => {
    const b = mivoBridge;
    if (!b || String(payload?.id || "") !== b.id) return { done: true, error: "jembatan Mivo tidak aktif — klik Buat Ulang Poster lagi" };
    // scan folder: gambar TERBARU yang dibuat setelah jembatan dimulai
    try {
      const kandidat = fs
        .readdirSync(b.dir)
        .filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !f.startsWith("REFERENSI-") && !f.startsWith("."))
        .map((f) => {
          try {
            const p = path.join(b.dir, f);
            return { p, m: fs.statSync(p).mtimeMs };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .filter((x) => x.m >= b.startedAt - 2000)
        .sort((a, z) => z.m - a.m);
      if (kandidat.length) {
        try {
          const buf = fs.readFileSync(kandidat[0].p);
          if (buf.length > 1024) {
            const ext = path.extname(kandidat[0].p).toLowerCase();
            const ct = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".webp" ? "image/webp" : "image/png";
            mivoBridge = null;
            return { done: true, image: `data:${ct};base64,${buf.toString("base64")}` };
          }
        } catch {
          // file masih ditulis (unduhan setengah jadi) — tunggu poll berikutnya
        }
      }
    } catch {
      // folder belum siap dibaca — tunggu poll berikutnya
    }
    if (Date.now() - b.startedAt > 12 * 60 * 1000) {
      mivoBridge = null;
      return { done: true, error: "waktu tunggu jembatan Mivo habis (12 menit) — klik Buat Ulang Poster lagi" };
    }
    return { done: false };
  });
  ipcMain.handle("mivo:open-folder", () => {
    try {
      const dir = mivoDir();
      shell.openPath(dir);
      return { ok: true, dir };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err).slice(0, 160) };
    }
  });
  // Preferensi penyedia & kualitas poster (disimpan lokal, mode 0600).
  ipcMain.handle("ai:get-prefs", () => readAIPrefs());
  ipcMain.handle("ai:set-prefs", (_e, payload) => {
    try {
      const cur = readAIPrefs();
      const next = {
        provider: payload?.provider === "cloudflare" ? "cloudflare" : payload?.provider === "mage" ? "mage" : payload?.provider === "minimax" ? "minimax" : payload?.provider === "zai" ? "zai" : cur.provider,
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
    // v1.0.52/54: bgOnly (plate latar kosong) & direct (poster kisah) — Cloudflare
    // langsung txt2img TANPA describe/edit (describe/edit butuh frame & hanya
    // mengubah adegan sedikit). Z.ai & Mage tetap lewat jalur normal (frame dikirim
    // sbg referensi img2img → wajah asli terbawa, ala gpt-image-2.5-flare).
    if ((payload?.bgOnly || payload?.direct) && payload?.provider === "cloudflare") {
      const cf = readCFKey();
      if (!cf.account || !cf.token) return { ok: false, error: "Kredensial Cloudflare belum diisi" };
      // v1.0.54: hormati marker [TEXTFREE] (poster kisah) — bersihkan + aturan tanpa-teks
      const { textFree: tfD, prompt: pD } = bersihTextFree(prompt);
      const promptD = tfD ? `${pD} ${aturanTanpaTeks}` : prompt;
      try {
        try {
          const poster = await cfGeneratePoster(promptD, cf, payload?.size !== "768x1344");
          return { ok: true, image: poster, via: "cloudflare-txt2img" };
        } catch (e1) {
          // agreement BFL utk schnell — setujui sekali lalu ulang
          const a1 = String((e1 && e1.message) || e1);
          if (/agree|terms|agreement|licens/i.test(a1)) {
            await cfAgreeModel(cf, "@cf/black-forest-labs/flux-1-schnell");
            const poster = await cfGeneratePoster(promptD, cf, payload?.size !== "768x1344");
            return { ok: true, image: poster, via: "cloudflare-txt2img" };
          }
          throw e1;
        }
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err).slice(0, 200) };
      }
    }
    // v1.0.38: penyedia Cloudflare (GRATIS) — vision llama + FLUX.1 schnell;
    // gagal → ok:false (fallback grade lokal), TIDAK diam-diam pindah ke z.ai
    // supaya pengguna tidak terekspos biaya tanpa sengaja.
    if (payload?.provider === "cloudflare") {
      const cf = readCFKey();
      if (!cf.account || !cf.token) return { ok: false, error: "Kredensial Cloudflare belum diisi" };
      const judul = (prompt.match(/judul "([^"]+)"/) || [])[1] || "";
      try {
        const deskripsi = await cfDescribeScene(image, cf);
        // v1.0.40: EDIT dulu — frame utuh dikirim ke FLUX.2 Klein 4B (wajah &
        // adegan terjaga); bila gagal → txt2img FLUX.1 schnell (deskripsi adegan).
      try {
        const poster = await cfEditPoster(cfEditPrompt(prompt, deskripsi, judul), image, cf, payload?.size !== "768x1344");
        return { ok: true, image: poster, via: "cloudflare-edit" };
      } catch (errEdit) {
        // v1.0.49: alasan gagal edit dikirim ke UI (label status) — dulu diam-diam
        const alasanEdit = String((errEdit && errEdit.message) || errEdit).slice(0, 140);
        // v1.0.49: agreement BFL juga berlaku utk schnell (txt2img) — setujui + lanjut
        if (/agree|terms|agreement|licens/i.test(alasanEdit)) await cfAgreeModel(cf, "@cf/black-forest-labs/flux-1-schnell");
        const poster = await cfGeneratePoster(cfPosterPrompt(prompt, deskripsi, judul), cf, payload?.size !== "768x1344");
        return { ok: true, image: poster, via: "cloudflare-txt2img", detail: alasanEdit };
      }
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err).slice(0, 200) };
      }
    }
    // v1.0.47: penyedia Mage (mage.space) — gpt-image-2.5-flare (±9 Gems ≈ Rp145),
    // edit img2img dulu (field image data URL), gagal → txt2img; async: submit →
    // poll status_url s.d. 150 dtk → unduh hasil → dataURL.
    if (payload?.provider === "mage") {
      const mk = readMageKey();
      if (!mk) return { ok: false, error: "Kunci mage.space belum diisi" };
      const mageModel = "gpt-image-2.5-flare";
      const mageAr = payload?.size === "768x1344" ? "9:16" : "16:9";
      const { textFree: mf, prompt: mp } = bersihTextFree(prompt);
      const magePrompt =
        mp +
        (mf ? ` ${aturanTanpaTeks}` : "") +
        ` The result must look like a REAL PHOTOGRAPH (photorealistic) — no cartoon, no anime, no illustration, no 3D render.`;
      const mageRun = async (denganGambar) => {
        const body = { prompt: magePrompt.slice(0, 4000), model_id: mageModel, aspect_ratio: mageAr };
        if (denganGambar) body.image = image;
        const sub = await fetch(`${MAGE_BASE}/${mageModel}/generate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${mk}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `novacut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          },
          body: JSON.stringify(body),
        });
        const js = await sub.json().catch(() => ({}));
        if (!sub.ok) throw new Error(String(js?.error?.message || js?.message || `HTTP ${sub.status}`).slice(0, 160));
        const stUrl = js.status_url || js?.request?.status_url;
        if (!stUrl) throw new Error("respons Mage tidak berisi status_url");
        const t0 = Date.now();
        while (Date.now() - t0 < 150000) {
          await new Promise((r) => setTimeout(r, 3000));
          const st = await fetch(stUrl, { headers: { Authorization: `Bearer ${mk}` } });
          const sj = await st.json().catch(() => ({}));
          const stat = sj.status || sj?.request?.status;
          if (stat === "completed") {
            const url = sj?.result?.url || sj?.request?.result?.url;
            if (!url) throw new Error("hasil Mage tidak berisi url gambar");
            const imgRes = await fetch(url);
            const buf = Buffer.from(await imgRes.arrayBuffer());
            const ct = imgRes.headers.get("content-type") || "image/png";
            return `data:${ct};base64,${buf.toString("base64")}`;
          }
          if (stat === "failed" || stat === "cancelled") throw new Error(String(sj?.error?.message || sj?.failure_reason || "generasi Mage gagal").slice(0, 160));
        }
        throw new Error("waktu tunggu Mage habis (150 dtk)");
      };
      try {
        const poster = await mageRun(!!image);
        return { ok: true, image: poster, via: image ? "mage-edit" : "mage-txt2img" };
      } catch (errEdit) {
        if (!image) return { ok: false, error: String((errEdit && errEdit.message) || errEdit).slice(0, 160) };
        try {
          const poster = await mageRun(false);
          return { ok: true, image: poster, via: "mage-txt2img" };
        } catch (errGen) {
          return { ok: false, error: String((errGen && errGen.message) || errGen).slice(0, 160) };
        }
      }
    }
    // v1.0.55: penyedia ke-4 MiniMax H3 — mesin "Minimax H3" yang dipakai pengguna
    // di mivo.com/generate/studio, via API RESMI platform.minimax.io (kunci sendiri).
    // OpenAI-style: /v1/images/edits (frame sbg referensi img2img, seperti "Add
    // reference images" di Mivo) → /v1/images/generations (txt2img); respons
    // LANGSUNG data[0].b64_json tanpa polling. Prompt rewrite otomatis ada di
    // sisi API — sama dgn "Prompt rewrite" di studio Mivo.
    if (payload?.provider === "minimax") {
      const mk = readMiniMaxKey();
      if (!mk) return { ok: false, error: "Kunci MiniMax belum diisi" };
      const mxSize = payload?.size === "768x1344" ? "768x1344" : "1344x768"; // keduanya kelipatan 32
      const { textFree: xf, prompt: xp } = bersihTextFree(prompt);
      const mxPrompt =
        xp +
        (xf ? ` ${aturanTanpaTeks}` : "") +
        ` The result must look like a REAL PHOTOGRAPH (photorealistic) — no cartoon, no anime, no illustration, no 3D render.`;
      const mxRun = async (denganGambar) => {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 240000);
        try {
          const body = { model: "MiniMax-H3-Image", prompt: mxPrompt.slice(0, 6000), size: mxSize, n: 1, response_format: "b64_json", output_format: "png" };
          if (denganGambar) body.images = [{ image_url: image }];
          const res = await fetch(`https://api.minimax.io/v1/images/${denganGambar ? "edits" : "generations"}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${mk}`, "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: ctrl.signal,
          });
          const js = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(String(js?.error?.message || js?.message || js?.base_resp?.status_msg || `HTTP ${res.status}`).slice(0, 160));
          const item = js?.data?.[0];
          if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
          if (item?.url) {
            const r2 = await fetch(item.url, { signal: ctrl.signal });
            const buf = Buffer.from(await r2.arrayBuffer());
            return `data:${r2.headers.get("content-type") || "image/png"};base64,${buf.toString("base64")}`;
          }
          throw new Error(String(item?.error || js?.message || "respons MiniMax tidak berisi gambar").slice(0, 160));
        } finally {
          clearTimeout(to);
        }
      };
      try {
        const poster = await mxRun(!!image);
        return { ok: true, image: poster, via: image ? "minimax-edit" : "minimax-txt2img" };
      } catch (errEdit) {
        if (!image) return { ok: false, error: String((errEdit && errEdit.message) || errEdit).slice(0, 160) };
        try {
          const poster = await mxRun(false);
          return { ok: true, image: poster, via: "minimax-txt2img" };
        } catch (errGen) {
          return { ok: false, error: String((errGen && errGen.message) || errGen).slice(0, 160) };
        }
      }
    }
    const key = readAIKey();
    if (key) {
      // v1.0.43: vision TIDAK FATAL lagi — dahulu satu kegagalan glm-4.6v-flash
      // (model tua/pensiun/saldo/kunci) membatalkan SELURUH blok → poster Z.ai
      // tidak pernah jadi dan selalu jatuh ke cover bawaan. Kini kegagalan
      // deskripsi hanya dilewati (judul tetap terbawa di prompt), poster tetap
      // digambar; pesan kegagalan disimpan agar toast di app menunjukkan SEBAB.
      let deskripsi = "";
      try {
        deskripsi = await pubDescribeScene(image, key);
      } catch (errVis) {
        lastAIPosterError = String((errVis && errVis.message) || errVis).slice(0, 200);
      }
      try {
        // v1.0.44: img2img dulu (frame utuh → adegan video terjaga di poster);
        // gagal/tak didukung → txt2img dgn deskripsi adegan scene-first
        const promptPublik = posterPromptPublik(prompt, deskripsi || "dramatic cinematic scene");
        const posterEdit = await pubEditPoster(image, promptPublik, key, sizePub, payload?.quality);
        if (posterEdit) return { ok: true, image: posterEdit, via: "publik-edit" };
        const poster = await pubGeneratePoster(promptPublik, key, sizePub, payload?.quality);
        if (poster) return { ok: true, image: poster, via: "publik" };
        lastAIPosterError = "respons gambar kosong";
      } catch (err) {
        // kunci ada tapi gagal (saldo/koneksi/model) → simpan pesan untuk toast
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
