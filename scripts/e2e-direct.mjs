// UJI LANGSUNG MESIN EXPORT — tanpa UI: panggil exportRangeFast & exportSegmentTurbo
// langsung di browser dengan RenderState bersih (604x938 = ukuran sumber, tanpa teks).
// Skenario: (1) fast berurutan, (2) fast PARALEL 3 bagian (skenario kedip lama),
// (3) turbo paralel 3 bagian (sumber MP4 ber-B-frame).
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";

const SRC = process.argv[2] || "/tmp/turbotest/ramp.webm";
const OUT_DIR = process.argv[3] || "/tmp/repro/direct";
mkdirSync(OUT_DIR, { recursive: true });

const srv = createServer((_q, r) => {
  r.writeHead(200, { "content-type": "text/html" });
  r.end("<!doctype html><title>e2e</title>");
});
await new Promise((res) => srv.listen(0, "127.0.0.1", res));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", String(e).slice(0, 200)));
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => !!window.__NOVA_TEST__, null, { timeout: 120000 });
console.log("hook uji siap");

const b64 = (await import("node:fs")).readFileSync(SRC).toString("base64");
const mime = SRC.endsWith(".webm") ? "video/webm" : "video/mp4";
const name = SRC.split("/").pop();

// ===== skenario A: fast engine — 3 bagian PARALEL (berebut elemen dulu) =====
const runs = await page.evaluate(async ([b, nm, m]) => {
  const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  const file = new File([bin], nm, { type: m });
  const url = URL.createObjectURL(file);
  const asset = { id: "as-direct", name: nm, type: "video", url, duration: 30, width: 604, height: 938, file };
  const mkClip = (start, dur) => ({
    id: `c-${start}`, kind: "video", assetId: "as-direct", start, duration: dur,
    inPoint: start, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0,
    trackId: "t1", effects: [], zoom: 1,
  });
  const rsBase = () => ({
    clips: [mkClip(0, 10)], // klip 0-10 di timeline; inPoint diganti per bagian
    tracks: [{ id: "t1", kind: "video", name: "", muted: false, hidden: false }],
    assets: [asset],
    project: { width: 604, height: 938 },
  });
  const rsFor = (segStart) => {
    const rs = rsBase();
    rs.clips[0].inPoint = segStart;
    return rs;
  };
  const blobToB64 = async (blob) => {
    const ab = await blob.arrayBuffer();
    let s = "";
    const u8 = new Uint8Array(ab);
    for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
    return btoa(s);
  };
  const T = window.__NOVA_TEST__;
  const out = {};
  const t0 = performance.now();
  // A1: fast PARALEL 3 bagian (0-10, 10-20, 20-30) — inPoint = mulai segmen
  const fastJobs = [0, 10, 20].map(async (s0, i) => {
    const res = await T.exportRangeFast({ start: 0, end: 10, rs: rsFor(s0), bitrate: 6_000_000, fps: 30 });
    return { i, b64: await blobToB64(res.blob) };
  });
  const fastResults = await Promise.all(fastJobs);
  out.fastMs = Math.round(performance.now() - t0);
  out.fast = [];
  for (const r of fastResults) out.fast.push(r.b64);
  return out;
}, [b64, name, mime]);

for (let i = 0; i < runs.fast.length; i++) {
  writeFileSync(`${OUT_DIR}/fast-${String(i + 1).padStart(2, "0")}.mp4`, Buffer.from(runs.fast[i], "base64"));
}
console.log(`fast paralel: ${runs.fast.length} bagian dalam ${runs.fastMs}ms`);

// ===== skenario B: turbo engine — 3 bagian PARALEL (perlu File + turbo path) =====
if (mime === "video/mp4") {
  const runsB = await page.evaluate(async ([b, nm, m]) => {
    const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
    const file = new File([bin], nm, { type: m });
    const url = URL.createObjectURL(file);
    const asset = { id: "as-direct2", name: nm, type: "video", url, duration: 30, width: 604, height: 938, file };
    const mkClip = (start, dur) => ({
      id: `c-${start}`, kind: "video", assetId: "as-direct2", start, duration: dur,
      inPoint: start, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0,
      trackId: "t1", effects: [], zoom: 1,
    });
    const rsFor = (segStart) => {
      const c = mkClip(0, 10);
      c.inPoint = segStart; // bagian N mulai dari detik ke-segStart sumber
      return {
        clips: [c],
        tracks: [{ id: "t1", kind: "video", name: "", muted: false, hidden: false }],
        assets: [asset],
        project: { width: 604, height: 938 },
      };
    };
    const blobToB64 = async (blob) => {
      const ab = await blob.arrayBuffer();
      let s = "";
      const u8 = new Uint8Array(ab);
      for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
      return btoa(s);
    };
    const T = window.__NOVA_TEST__;
    const t0 = performance.now();
    const jobs = [0, 10, 20].map(async (s0, i) => {
      const res = await T.exportSegmentTurbo({
        rs: rsFor(s0), clip: rsFor(s0).clips[0], asset,
        start: 0, end: 10, shift: 0, bitrate: 6_000_000, fps: 30, audioCopy: false,
      });
      return { i, b64: await blobToB64(res.blob) };
    });
    const results = await Promise.all(jobs);
    return { turboMs: Math.round(performance.now() - t0), turbo: results.map((r) => r.b64) };
  }, [b64, name, mime]);
  for (let i = 0; i < runsB.turbo.length; i++) {
    writeFileSync(`${OUT_DIR}/turbo-${String(i + 1).padStart(2, "0")}.mp4`, Buffer.from(runsB.turbo[i], "base64"));
  }
  console.log(`turbo paralel: ${runsB.turbo.length} bagian dalam ${runsB.turboMs}ms`);
}

await browser.close();
srv.close();
console.log("selesai —", OUT_DIR);
