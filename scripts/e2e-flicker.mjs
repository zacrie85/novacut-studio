// E2E NOVACUT — alur asli pengguna: import video → Export & Split 30 bagian
// (tanpa cover, teks part+judul aktif) via store nyata di http://localhost:3000
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { createServer } from "node:http";

const OUT_DIR = "/tmp/e2e/parts";
const N_PARTS = Number(process.argv[2] || 30);
const SRC = process.argv[3] || "/tmp/turbotest/drama65.mp4";

mkdirSync(OUT_DIR, { recursive: true });

// server statik kecil utk secure context (WebCodecs butuh localhost/https)
const srv = createServer((_q, r) => {
  r.writeHead(200, { "content-type": "text/html" });
  r.end("<!doctype html><title>e2e</title>");
});
await new Promise((res) => srv.listen(0, "127.0.0.1", res));
const port = srv.address().port;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => {
  const t = m.text();
  logs.push(t.slice(0, 250));
  if (logs.length > 400) logs.shift();
});
page.on("pageerror", (e) => logs.push("PAGEERROR " + String(e).slice(0, 250)));

console.log("buka app...");
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => !!(window).__NOVA__, null, { timeout: 120000 });
console.log("store siap");

// masukkan ke daftar export + atur setelan lewat store (identik dengan menu UI)
const b64 = (await import("node:fs")).readFileSync(SRC).toString("base64");
const assetInfo = await page.evaluate(async (b) => {
  const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  const file = new File([bin], "drama65.mp4", { type: "video/mp4" });
  const url = URL.createObjectURL(file);
  const v = document.createElement("video");
  v.src = url;
  v.muted = true;
  await new Promise((res) => { v.onloadedmetadata = res; v.onerror = res; setTimeout(res, 8000); });
  const st = (window).__NOVA__.getState();
  const id = "as-e2e-flicker";
  st.addAsset({
    id, name: "drama65.mp4", type: "video", url,
    duration: v.duration || 65, width: v.videoWidth || 604, height: v.videoHeight || 938,
    file,
  });
  st.setUiMode("simple");
  st.addToAssetList("export", [id]);
  st.setExportSettings({
    mode: "split", splitBy: "count", parts: 30,
    includeCover: false, coverDuration: 2,
    autoPartText: true, showTitleText: true,
    engineMode: "fast", exportDir: "",
  });
  st.setPlaylistExport({
    titleDuringVideo: true, description: "UJI KEDIP E2E",
    labelStyle: "Part", quality: "tajam", parallel: 2, autoSub: false,
  });
  return { duration: v.duration, w: v.videoWidth, h: v.videoHeight };
}, b64);
console.log("asset terpasang:", JSON.stringify(assetInfo));

// alur UI asli: lanjut semua langkah sampai tombol Mulai Export, lalu tekan
let clickedMulai = false;
for (let i = 0; i < 8; i++) {
  const names = await page.evaluate(() =>
    Array.from(document.querySelectorAll("button")).map((b) => (b.textContent || "").trim().slice(0, 50)).filter(Boolean)
  );
  if (names.some((n) => /Mulai Export/i.test(n))) {
    await page.getByRole("button", { name: /Mulai Export/i }).click();
    clickedMulai = true;
    console.log("tombol Mulai Export ditekan");
    break;
  }
  const next = names.find((n) => /^Lanjut/i.test(n));
  if (!next) { await page.waitForTimeout(700); continue; }
  const re = new RegExp(`^${next.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 20)}`);
  await page.getByRole("button", { name: re }).first().click();
  await page.waitForTimeout(900);
}
if (!clickedMulai) {
  const btns = await page.evaluate(() => Array.from(document.querySelectorAll("button")).map((b) => (b.textContent || "").trim().slice(0, 50)).filter(Boolean));
  console.log("GAGAL: tombol Mulai tidak ada. Tombol:", JSON.stringify(btns));
  console.log("LOG:", JSON.stringify(logs.slice(-15)));
  process.exit(1);
}

// tunggu selesai (poll exportState)
const t0 = Date.now();
let done = false;
while (Date.now() - t0 < 600000) {
  await page.waitForTimeout(3000);
  const st = await page.evaluate(() => {
    const s = (window).__NOVA__.getState().exportState;
    return { running: s.running, label: s.label, progress: s.progress, n: s.results.length };
  });
  console.log(`  ${Math.round((Date.now() - t0) / 1000)}s running=${st.running} n=${st.n} p=${st.progress.toFixed(2)} — ${st.label}`);
  if (!st.running && st.n > 0) { done = true; break; }
  if (!st.running && st.n === 0 && Date.now() - t0 > 30000) {
    console.log("TIDAK JALAN — log:", JSON.stringify(logs.slice(-20)));
    process.exit(1);
  }
}
if (!done) { console.log("TIMEOUT — log terakhir:", logs.slice(-12)); process.exit(1); }

// ambil semua hasil
const results = await page.evaluate(() => {
  const s = (window).__NOVA__.getState().exportState;
  return s.results.map((r) => ({ name: r.name, url: r.url, size: r.size, part: r.part, total: r.total }));
});
console.log("hasil:", results.length, "bagian");
for (const r of results) {
  const b64v = await page.evaluate(async (u) => {
    const ab = await (await fetch(u)).arrayBuffer();
    let s = "";
    const u8 = new Uint8Array(ab);
    for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
    return btoa(s);
  }, r.url);
  const p = r.part;
  writeFileSync(`${OUT_DIR}/part-${String(p).padStart(2, "0")}.mp4`, Buffer.from(b64v, "base64"));
}
console.log("tersimpan di", OUT_DIR);
console.log("CONSOLE:", JSON.stringify(logs.slice(-8)));
await browser.close();
srv.close();
