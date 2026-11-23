// E2E v1.0.34 — APLIKASI NYATA (Vite :3000) + video ASLI pengguna:
// 1) video masuk via store  2) wizard Mode Sederhana ke langkah Export
// 3) klik tombol "🎬 Poster Hollywood" (UI nyata!)  4) tunggu contoh cover dibuat
// 5) cek piksel cover (BUKAN hitam)  6) runBatchExport sungguhan (mesin kilat)
// 7) frame part-1 diekstrak ffmpeg → bukti piksel poster di video hasil export
import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

const SRC = "/home/z/my-project/upload/20261110-0300-42.4890889.mp4";
const OUT = "/tmp/render/e2e34";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", String(e).slice(0, 160)));
page.on("download", (d) => d.saveAs(`${OUT}/${d.suggestedFilename()}`).catch(() => {}));
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => !!window.__NOVA_TEST__ && !!window.__NOVA__, null, { timeout: 120000 });
console.log("[1] app + hook uji siap");

// ==== video asli pengguna → aset nyata (durasi & dimensi diprobe browser) ====
const vid = await page.evaluate(async ([b64, name]) => {
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const file = new File([bin], name, { type: "video/mp4" });
  const url = URL.createObjectURL(file);
  const meta = await new Promise((res) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.onloadedmetadata = () => res({ d: v.duration, w: v.videoWidth, h: v.videoHeight });
    v.onerror = () => res(null);
    v.src = url;
    setTimeout(() => res(null), 15000);
  });
  if (!meta) throw new Error("video gagal dimuat");
  const st = window.__NOVA__.getState();
  const id = `as-e2e-${Date.now()}`;
  st.addAsset({ id, name, type: "video", url, duration: meta.d, width: meta.w, height: meta.h, file });
  const clip = { id: `cl-${id}`, kind: "video", assetId: id, start: 0, duration: meta.d, inPoint: 0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0, trackId: "t-e2e", effects: [], zoom: 1 };
  window.__NOVA__.setState({
    clips: [clip],
    tracks: [{ id: "t-e2e", kind: "video", name: "", muted: false, hidden: false }],
    exportList: [id],
    texts: { ...st.texts, title: "KELAS NAKAL USIR 99 GURU, TAPI TAK TAHU GURU BARU BOS MAFIA BAWAH TANAH." },
    exportSettings: { ...st.exportSettings, mode: "split", splitBy: "partSeconds", partSeconds: 5, engineMode: "fast", includeCover: true, autoSub: false, coverDuration: 2.5 },
    playlistExport: { ...st.playlistExport, showTitleScreen: true },
  });
  return { id, dur: meta.d, w: meta.w, h: meta.h };
}, [readFileSync(SRC).toString("base64"), SRC.split("/").pop()]);
console.log(`[2] video asli masuk: ${vid.dur.toFixed(1)}s ${vid.w}x${vid.h}`);

// ==== layar welcome → Mode Sederhana, lalu wizard langkah 1 → 4 lewat TOMBOL NYATA ====
await page.getByText("Buka Mode Sederhana").click();
await page.waitForTimeout(600);
await page.getByRole("button", { name: /Lanjut/ }).first().click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /Lanjut/ }).first().click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /Export & Split/ }).click();
await page.waitForTimeout(400);
console.log("[3] wizard sampai langkah Export & Split");

// ==== klik tombol POSTER HOLLYWOOD (UI nyata — keluhan utama pengguna) ====
const posterBtn = page.getByRole("button", { name: /🎬 Poster Hollywood/ });
await posterBtn.waitFor({ timeout: 20000 });
await posterBtn.click();
await page.waitForTimeout(500);
const bg = await page.evaluate(() => window.__NOVA__.getState().cover.bgStyle);
if (bg !== "poster") throw new Error(`bgStyle TIDAK menjadi poster: ${bg}`);
console.log("[4] klik Poster Hollywood → state bgStyle=poster ✓");

// ==== pilih gaya spesifik (99 gaya) lewat select nyata? — biarkan "acak" (default) ====

// ==== tunggu CONTOH cover dibuat otomatis (v1.0.33) lalu cek pikselnya ====
await page.waitForFunction(() => {
  const st = window.__NOVA__.getState();
  return st.cover.coverAssetId && st.cover.previewUrl;
}, null, { timeout: 180000 });
const cov = await page.evaluate(async () => {
  const st = window.__NOVA__.getState();
  const url = st.cover.previewUrl;
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
  return { darkRatio: dark / n, meanLum: sum / n, colorfulRatio: colorful / n };
});
console.log(`[5] CONTOH COVER: gelap=${(cov.darkRatio * 100).toFixed(1)}% terang-rata=${cov.meanLum.toFixed(1)} berwarna=${(cov.colorfulRatio * 100).toFixed(1)}%`);
// ==== DIAGNOSTIK: simpan PNG cover + dump state (bukti visual) ====
const diag = await page.evaluate(async () => {
  const st = window.__NOVA__.getState();
  const c = st.cover;
  const asset = st.assets.find((a) => a.id === c.coverAssetId);
  const url = c.previewUrl || asset?.url || "";
  let png = null;
  try {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const cv = document.createElement("canvas");
    cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    cv.getContext("2d").drawImage(img, 0, 0);
    png = cv.toDataURL("image/png").split(",")[1];
  } catch (e) { png = "ERR:" + String(e).slice(0, 80); }
  return {
    coverSig: c.coverSig, bgStyle: c.bgStyle, mode: c.mode, posterStyleId: c.posterStyleId,
    coverAssetId: c.coverAssetId, previewLen: (c.previewUrl || "").length,
    asset: asset ? { type: asset.type, w: asset.width, h: asset.height, urlLen: asset.url.length } : null,
    project: st.project, png,
  };
});
if (typeof diag.png === "string" && diag.png.length > 100) writeFileSync(`${OUT}/cover_sample.png`, Buffer.from(diag.png, "base64"));
console.log("[5d] DIAG:", JSON.stringify({ ...diag, png: undefined }));
// (blok debug presisi dihapus setelah akar bug ditemukan & diperbaiki)

const coverOk = cov.meanLum > 25 && cov.darkRatio < 0.5;
if (!coverOk) throw new Error("contoh cover MASIH hitam! (PNG disimpan: cover_sample.png)");
console.log("[5] contoh cover BUKAN hitam ✓");

// ==== EXPORT SUNGGUHAN (jalur yang sama persis dgn tombol Mulai Export) ====
const st0 = await page.evaluate(() => window.__NOVA__.getState().exportState);
await page.evaluate(async (id) => { await window.__NOVA_TEST__.runBatchExport([id]); }, vid.id);
await page.waitForFunction(() => window.__NOVA__.getState().exportState.running === false, null, { timeout: 420000 });
const fin = await page.evaluate(() => window.__NOVA__.getState().exportState);
console.log(`[6] export selesai: ${fin.results?.length ?? 0} file, label="${String(fin.label || "").slice(0, 60)}"`);
await page.waitForTimeout(1500);

// ==== ekstrak frame cover dari part-1 hasil export + cek piksel ====
const files = readdirSync(OUT).filter((f) => f.endsWith(".mp4") || f.endsWith(".webm")).sort();
if (!files.length) throw new Error("tidak ada file hasil export tersimpan!");
const part1 = `${OUT}/${files[0]}`;
console.log(`[7] part pertama: ${files[0]}`);
for (const [tag, t] of [["t0.5", 0.5], ["t1.5", 1.5]]) {
  execSync(`ffmpeg -y -ss ${t} -i "${part1}" -frames:v 1 "${OUT}/frame_${tag}.png" 2>/dev/null`);
}
const stats = execSync(`python3 - <<'EOF'
from PIL import Image
for tag in ["t05", "t15"]:
    p = "${OUT}/frame_" + ("t0.5" if tag == "t05" else "t1.5") + ".png"
    im = Image.open(p).convert("RGB")
    px = list(im.getdata())[::37]
    n = len(px)
    dark = sum(1 for r, g, b in px if 0.299*r + 0.587*g + 0.114*b < 16) / n
    mean = sum(0.299*r + 0.587*g + 0.114*b for r, g, b in px) / n
    colorful = sum(1 for r, g, b in px if max(r, g, b) - min(r, g, b) > 30) / n
    print(f"{tag}: gelap={dark*100:.1f}% terang={mean:.1f} warna={colorful*100:.1f}%")
EOF`).toString().trim();
console.log("[8] PIKSEL VIDEO HASIL EXPORT:");
console.log("   " + stats.split("\n").join("\n   "));

await browser.close();
const black = stats.includes("gelap=99") || stats.includes("gelap=100");
console.log(black ? "❌ GAGAL: frame cover di video hasil export masih hitam!" : "✅ LOLOS: frame cover di video hasil export BUKAN hitam (poster tampil)!");
process.exit(black ? 1 : 0);
