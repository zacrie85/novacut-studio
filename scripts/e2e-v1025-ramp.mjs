// UJI TRIM v1.0.25 — mapping konten: rentang mulai detik SRC_START selama LEN detik
// harus menghasilkan frame sumber SRC_START..SRC_START+LEN (mesin kilat & Turbo).
// Sumber: ramp.webm / ramp.mp4 (30 dtk, terang menyapu 30..210, MP4 ber-B-frame).
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";

const URL_BASE = process.argv[2] || "http://localhost:3210/";
const SRC_START = 5; // detik mulai potong
const LEN = 10; // panjang rentang
const OUT_DIR = "/tmp/v1025/ramp";
mkdirSync(OUT_DIR, { recursive: true });

const srv = createServer((_q, r) => {
  r.writeHead(200, { "content-type": "text/html" });
  r.end("<!doctype html><title>e2e</title>");
});
await new Promise((res) => srv.listen(0, "127.0.0.1", res));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", String(e).slice(0, 200)));
await page.goto(URL_BASE, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => !!window.__NOVA_TEST__, null, { timeout: 120000 });
console.log("hook uji siap");

const runEngine = async (srcPath, tag, turbo) => {
  const b64 = readFileSync(srcPath).toString("base64");
  const mime = srcPath.endsWith(".webm") ? "video/webm" : "video/mp4";
  const name = srcPath.split("/").pop();
  const res = await page.evaluate(
    async ([b, nm, m, s0, len, isTurbo]) => {
      const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
      const file = new File([bin], nm, { type: m });
      const url = URL.createObjectURL(file);
      const asset = { id: "as-trim", name: nm, type: "video", url, duration: 30, width: 604, height: 938, file };
      // klip 0..len di timeline; inPoint = s0 (mulai potong) — persis buildBatchClip
      const clip = {
        id: "c-trim", kind: "video", assetId: "as-trim", start: 0, duration: len,
        inPoint: s0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0,
        trackId: "t1", effects: [], zoom: 1,
      };
      const rs = {
        clips: [clip],
        tracks: [{ id: "t1", kind: "video", name: "", muted: false, hidden: false }],
        assets: [asset],
        project: { width: 604, height: 938 },
      };
      const blobToB64 = async (blob) => {
        const ab = await blob.arrayBuffer();
        let s = "";
        const u8 = new Uint8Array(ab);
        for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
        return btoa(s);
      };
      const T = window.__NOVA_TEST__;
      const r = isTurbo
        ? await T.exportSegmentTurbo({ rs, clip, asset, start: 0, end: len, shift: 0, bitrate: 6_000_000, fps: 30, audioCopy: false })
        : await T.exportRangeFast({ start: 0, end: len, rs, bitrate: 6_000_000, fps: 30 });
      return await blobToB64(r.blob);
    },
    [b64, name, mime, SRC_START, LEN, turbo]
  );
  const out = `${OUT_DIR}/${tag}.mp4`;
  writeFileSync(out, Buffer.from(res, "base64"));
  console.log(`${tag} tersimpan: ${out}`);
};

await runEngine("/tmp/turbotest/ramp.webm", "fast-trim", false);
await runEngine("/tmp/turbotest/ramp.mp4", "turbo-trim", true);

await browser.close();
srv.close();
console.log("selesai — verifikasi mapping dengan scripts/verify_trim_mapping.py");
