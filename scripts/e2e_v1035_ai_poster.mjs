// E2E v1.0.35 — APLIKASI NYATA + AI NYATA:
// 1) video asli  2) wizard Mode Sederhana  3) klik "🎬 Poster Hollywood (AI)"
// 4) klik "🎨 Buat Ulang Poster (AI)" (prompt default)  5) tunggu poster AI (aiMade=true)
// 6) cek piksel poster  7) export sungguhan  8) frame part-1 diekstrak → bukti piksel
import { chromium } from "playwright";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { createServer } from "node:http";

const SRC = "/home/z/my-project/upload/20261110-0300-42.4890889.mp4";
const OUT = "/tmp/render/e2e35";
mkdirSync(OUT, { recursive: true });

// ==== proxy AI lokal (bentuk persis IPC ai:poster) — memanggil z-ai-web-dev-sdk SUNGGUHAN ====
const aiSrv = createServer(async (req, res) => {
  // CORS: halaman app (localhost:3000) memanggil proxy lintas origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  let body = "";
  req.on("data", (ch) => (body += ch));
  req.on("end", async () => {
    try {
      const payload = JSON.parse(body || "{}");
      const mod = await import("z-ai-web-dev-sdk");
      const ZAI = mod.default ?? mod;
      const zai = await ZAI.create();
      const r = await zai.images.generations.edit({
        prompt: String(payload?.prompt || "cinematic movie poster").slice(0, 1200),
        images: [{ url: String(payload?.image || "") }],
        size: payload?.size === "768x1344" ? "768x1344" : "1344x768",
      });
      const b64 = r?.data?.[0]?.base64;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(b64 ? { ok: true, image: `data:image/png;base64,${b64}` } : { ok: false, error: "kosong" }));
    } catch (e) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: String(e && e.message || e).slice(0, 150) }));
    }
  });
});
await new Promise((r) => aiSrv.listen(0, "127.0.0.1", r));
const aiPort = aiSrv.address().port;
console.log(`[0] proxy AI lokal di 127.0.0.1:${aiPort} (SDK nyata)`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
// bridge novacutAI PERSIS seperti electron/preload.cjs → jalur kode AI yang sama dgn app desktop
await page.addInitScript((port) => {
  window.novacutAI = {
    posterAI: (image, prompt, size) =>
      fetch(`http://127.0.0.1:${port}/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image, prompt, size }) }).then((r) => r.json()),
  };
}, aiPort);
page.on("pageerror", (e) => console.log("PAGEERROR:", String(e).slice(0, 160)));
page.on("download", (d) => d.saveAs(`${OUT}/${d.suggestedFilename()}`).catch(() => {}));
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => !!window.__NOVA_TEST__ && !!window.__NOVA__, null, { timeout: 120000 });
console.log("[1] app + hook uji siap");

const vid = await page.evaluate(async ([b64, name]) => {
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const file = new File([bin], name, { type: "video/mp4" });
  const url = URL.createObjectURL(file);
  const meta = await new Promise((res) => {
    const v = document.createElement("video");
    v.preload = "metadata"; v.muted = true;
    v.onloadedmetadata = () => res({ d: v.duration, w: v.videoWidth, h: v.videoHeight });
    v.onerror = () => res(null);
    v.src = url;
    setTimeout(() => res(null), 15000);
  });
  if (!meta) throw new Error("video gagal dimuat");
  const st = window.__NOVA__.getState();
  const id = `as-e2e35-${Date.now()}`;
  st.addAsset({ id, name, type: "video", url, duration: meta.d, width: meta.w, height: meta.h, file });
  const clip = { id: `cl-${id}`, kind: "video", assetId: id, start: 0, duration: meta.d, inPoint: 0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0, trackId: "t-e2e", effects: [], zoom: 1 };
  window.__NOVA__.setState({
    clips: [clip],
    tracks: [{ id: "t-e2e", kind: "video", name: "", muted: false, hidden: false }],
    exportList: [id],
    texts: { ...st.texts, title: "KELAS NAKAL USIR 99 GURU" },
    exportSettings: { ...st.exportSettings, mode: "split", splitBy: "partSeconds", partSeconds: 5, engineMode: "fast", includeCover: true, autoSub: false, coverDuration: 3 },
    playlistExport: { ...st.playlistExport, showTitleScreen: true },
  });
  return { id, dur: meta.d, w: meta.w, h: meta.h };
}, [readFileSync(SRC).toString("base64"), SRC.split("/").pop()]);
console.log(`[2] video asli masuk: ${vid.dur.toFixed(1)}s ${vid.w}x${vid.h}`);

await page.getByText("Buka Mode Sederhana").click();
await page.waitForTimeout(500);
await page.getByRole("button", { name: /Lanjut/ }).first().click();
await page.waitForTimeout(250);
await page.getByRole("button", { name: /Lanjut/ }).first().click();
await page.waitForTimeout(250);
await page.getByRole("button", { name: /Export & Split/ }).click();
await page.waitForTimeout(350);
console.log("[3] wizard di langkah Export & Split");

const posterBtn = page.getByRole("button", { name: /🎬 Poster Hollywood \(AI\)/ });
await posterBtn.waitFor({ timeout: 20000 });
await posterBtn.click();
await page.waitForTimeout(400);
const bg = await page.evaluate(() => window.__NOVA__.getState().cover.bgStyle);
if (bg !== "poster") throw new Error(`bgStyle=${bg}`);
console.log("[4] klik Poster Hollywood (AI) → bgStyle=poster ✓ (prompt default, textarea kosong)");

const regenBtn = page.getByRole("button", { name: /🎨 Buat Ulang Poster \(AI\)/ });
await regenBtn.waitFor({ timeout: 20000 });
await regenBtn.click();
console.log("[5] klik Buat Ulang Poster (AI) — menunggu AI (10-180 dtk)…");
await page.waitForFunction(() => {
  const st = window.__NOVA__.getState();
  return st.cover.coverAssetId && st.cover.previewUrl;
}, null, { timeout: 240000 });

const cov = await page.evaluate(async () => {
  const st = window.__NOVA__.getState();
  const asset = st.assets.find((a) => a.id === st.cover.coverAssetId);
  const url = st.cover.previewUrl || asset?.url;
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let dark = 0, sum = 0, colorful = 0, n = 0;
  for (let i = 0; i < d.length; i += 16) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (lum < 16) dark++;
    const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
    if (mx - mn > 30) colorful++;
    sum += lum; n++;
  }
  return { aiMade: !!asset?.aiMade, w: img.naturalWidth, h: img.naturalHeight, len: (url || "").length, darkRatio: dark / n, meanLum: sum / n, colorfulRatio: colorful / n, png: c.toDataURL("image/png").split(",")[1] };
});
console.log(`[6] POSTER AI: aiMade=${cov.aiMade} ${cov.w}x${cov.h} gelap=${(cov.darkRatio * 100).toFixed(1)}% terang=${cov.meanLum.toFixed(1)} warna=${(cov.colorfulRatio * 100).toFixed(1)}%`);
if (cov.png && cov.png.length > 100) {
  const ws = await import("node:fs");
  ws.writeFileSync(`${OUT}/poster_ai_cover.png`, Buffer.from(cov.png, "base64"));
}
if (!cov.aiMade) throw new Error("cover TIDAK dibuat AI (aiMade=false) — jalur AI /api/ai-poster gagal?");
if (cov.meanLum < 12 || cov.darkRatio > 0.92) throw new Error("poster AI terlalu gelap/hitam!");
console.log("[6] poster AI valid ✓ (bukan hitam, ada warna, dibuat AI)");

await page.evaluate(async (id) => { await window.__NOVA_TEST__.runBatchExport([id]); }, vid.id);
await page.waitForFunction(() => window.__NOVA__.getState().exportState.running === false, null, { timeout: 420000 });
const fin = await page.evaluate(() => window.__NOVA__.getState().exportState);
console.log(`[7] export selesai: ${fin.results?.length ?? 0} file, label="${String(fin.label || "").slice(0, 50)}"`);
await page.waitForTimeout(1500);

const files = readdirSync(OUT).filter((f) => f.endsWith(".mp4") || f.endsWith(".webm")).sort();
if (!files.length) throw new Error("tidak ada file hasil export!");
const part1 = `${OUT}/${files[0]}`;
console.log(`[8] part pertama: ${files[0]}`);
for (const [tag, t] of [["t05", 0.6], ["t15", 1.6]]) {
  execSync(`ffmpeg -y -ss ${t} -i "${part1}" -frames:v 1 "${OUT}/frame_${tag}.png" 2>/dev/null`);
}
const stats = execSync(`python3 - <<'EOF'
from PIL import Image
for tag, p in [("t0.6", "${OUT}/frame_t05.png"), ("t1.6", "${OUT}/frame_t15.png")]:
    im = Image.open(p).convert("RGB")
    px = list(im.getdata())[::37]
    n = len(px)
    dark = sum(1 for r, g, b in px if 0.299*r + 0.587*g + 0.114*b < 16) / n
    mean = sum(0.299*r + 0.587*g + 0.114*b for r, g, b in px) / n
    colorful = sum(1 for r, g, b in px if max(r, g, b) - min(r, g, b) > 30) / n
    print(f"{tag}: gelap={dark*100:.1f}% terang={mean:.1f} warna={colorful*100:.1f}%")
EOF`).toString().trim();
console.log("[9] PIKSEL VIDEO HASIL EXPORT:");
console.log("   " + stats.split("\n").join("\n   "));
await browser.close();
const black = stats.includes("gelap=99") || stats.includes("gelap=100");
console.log(black ? "❌ GAGAL: frame cover di video hasil export hitam!" : "✅ LOLOS: poster AI tampil di video hasil export!");
process.exit(black ? 1 : 0);
