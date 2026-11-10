// REPRO KEDIP — alur asli: import sumber WebM (Turbo otomatis gagal → mesin kilat)
// → Export & Split 6 bagian paralel → simpan hasil utk analisis frame-per-frame
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";

const OUT_DIR = process.argv[2] || "/tmp/repro/parts";
const SRC = process.argv[3] || "/tmp/turbotest/flick.webm";
const NAME = process.argv[4] || "flick.webm";
const N_PARTS = Number(process.argv[5] || 6);
mkdirSync(OUT_DIR, { recursive: true });

const srv = createServer((_q, r) => {
  r.writeHead(200, { "content-type": "text/html" });
  r.end("<!doctype html><title>e2e</title>");
});
await new Promise((res) => srv.listen(0, "127.0.0.1", res));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => {
  const t = m.text();
  logs.push(t.slice(0, 200));
  if (logs.length > 300) logs.shift();
});
page.on("pageerror", (e) => logs.push("PAGEERROR " + String(e).slice(0, 200)));

console.log("buka app...");
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => !!window.__NOVA__, null, { timeout: 120000 });
console.log("store siap");

const b64 = (await import("node:fs")).readFileSync(SRC).toString("base64");
const MIME = SRC.endsWith(".webm") ? "video/webm" : "video/mp4";
const info = await page.evaluate(async ([b, nm, mime]) => {
  const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  const file = new File([bin], nm, { type: mime });
  const url = URL.createObjectURL(file);
  const v = document.createElement("video");
  v.src = url;
  v.muted = true;
  await new Promise((res) => { v.onloadedmetadata = res; v.onerror = res; setTimeout(res, 8000); });
  const st = window.__NOVA__.getState();
  const id = "as-repro-flick";
  st.addAsset({ id, name: nm, type: "video", url, duration: v.duration || 30, width: v.videoWidth || 604, height: v.videoHeight || 938, file });
  st.setProject({ width: 604, height: 938, ratio: "9:16" });
  st.setUiMode("simple");
  st.addToAssetList("export", [id]);
  st.setExportSettings({
    mode: "split", splitBy: "count", parts: 6,
    includeCover: false, coverDuration: 2,
    autoPartText: false, showTitleText: false,
    engineMode: "fast", exportDir: "",
  });
  st.setPlaylistExport({ titleDuringVideo: false, description: "REPRO KEDIP", labelStyle: "Part", quality: "tajam", parallel: 2, autoSub: false });
  return { duration: v.duration, w: v.videoWidth, h: v.videoHeight };
}, [b64, NAME, MIME]);
console.log("asset terpasang:", JSON.stringify(info));

let clicked = false;
for (let i = 0; i < 8; i++) {
  const names = await page.evaluate(() => Array.from(document.querySelectorAll("button")).map((b) => (b.textContent || "").trim().slice(0, 50)).filter(Boolean));
  if (names.some((n) => /Mulai Export/i.test(n))) {
    await page.getByRole("button", { name: /Mulai Export/i }).click();
    clicked = true;
    console.log("Mulai Export ditekan");
    break;
  }
  const next = names.find((n) => /^Lanjut/i.test(n));
  if (!next) { await page.waitForTimeout(700); continue; }
  await page.getByRole("button", { name: new RegExp(`^${next.replace(/[.*+?${}()|[\]\\]/g, "\\$&").slice(0, 20)}`) }).first().click();
  await page.waitForTimeout(900);
}
if (!clicked) { console.log("GAGAL klik Mulai. Tombol:", JSON.stringify(logs.slice(-5))); process.exit(1); }

const t0 = Date.now();
let done = false;
while (Date.now() - t0 < 600000) {
  await page.waitForTimeout(3000);
  const st = await page.evaluate(() => {
    const s = window.__NOVA__.getState().exportState;
    return { running: s.running, label: s.label, n: s.results.length };
  });
  console.log(`  ${Math.round((Date.now() - t0) / 1000)}s running=${st.running} n=${st.n} — ${st.label}`);
  if (!st.running && st.n > 0) { done = true; break; }
}
if (!done) { console.log("TIMEOUT — log:", JSON.stringify(logs.slice(-10))); process.exit(1); }

const results = await page.evaluate(() => window.__NOVA__.getState().exportState.results.map((r) => ({ name: r.name, url: r.url, part: r.part })));
console.log("hasil:", results.length, "bagian");
for (const r of results) {
  const b64v = await page.evaluate(async (u) => {
    const ab = await (await fetch(u)).arrayBuffer();
    let s = "";
    const u8 = new Uint8Array(ab);
    for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
    return btoa(s);
  }, r.url);
  writeFileSync(`${OUT_DIR}/part-${String(r.part).padStart(2, "0")}.mp4`, Buffer.from(b64v, "base64"));
}
console.log("tersimpan di", OUT_DIR);
console.log("CONSOLE:", JSON.stringify(logs.slice(-6)));
await browser.close();
srv.close();
