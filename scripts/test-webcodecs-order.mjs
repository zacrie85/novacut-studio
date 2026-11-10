// Uji empiris: urutan output WebCodecs VideoDecoder utk video ber-B-frame.
// Memakai parser MP4 milik NOVACUT sendiri (mp4Demux) — sama dengan mesin Turbo.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

let demuxJs = readFileSync("/tmp/demuxjs/mp4Demux.js", "utf8");
// ubah ES module → classic script, ekspor ke window
demuxJs = demuxJs.replace(/^export /gm, "");
demuxJs += "\nwindow.__demux = { parseMp4, keyframeIndexAt, firstSampleAtOrAfter };\n";

const fileB64 = readFileSync("/tmp/btest.mp4").toString("base64");

const srv = createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/html" });
  res.end("<!doctype html><title>t</title>");
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const port = srv.address().port;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/`);
await page.addScriptTag({ content: demuxJs });
const result = await page.evaluate(async (b64) => {
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const blob = new Blob([bin], { type: "video/mp4" });
  const { parseMp4 } = window.__demux;
  const info = await parseMp4(blob);
  const vtr = info.tracks.find((t) => t.kind === "video");
  if (!vtr) return { error: "no video track" };

  // ==== 1. decode SEMUA sampel — feed urut DECODE (dts), timestamp = cts ====
  const out = []; // {arrival, ts}
  let err = null;
  const dec = new VideoDecoder({
    output: (f) => {
      out.push(f.timestamp);
      f.close();
    },
    error: (e) => (err = String(e)),
  });
  dec.configure({ codec: vtr.codec, description: vtr.description, optimizeForLatency: false });
  for (const s of vtr.samples) {
    const data = new Uint8Array(await blob.slice(s.offset, s.offset + s.size).arrayBuffer());
    dec.decode(new EncodedVideoChunk({ type: s.sync ? "key" : "delta", timestamp: Math.round(s.cts * 1e6), data }));
  }
  await dec.flush();
  dec.close();

  // bandingkan: urutan kedatangan vs urutan presentasi
  const sorted = [...out].sort((a, b) => a - b);
  let inversions = 0;
  for (let i = 1; i < out.length; i++) if (out[i] < out[i - 1]) inversions++;
  const first12 = out.slice(0, 12).map((t) => (t / 1e6).toFixed(3));
  const first12Sorted = sorted.slice(0, 12).map((t) => (t / 1e6).toFixed(3));

  // ==== 2. keyframeIndexAt: akuratkah start decode-nya? ====
  const { keyframeIndexAt } = window.__demux;
  const t1 = 0.5; // cari keyframe utk mulai decode di 0.5s
  const ki = keyframeIndexAt(vtr, t1);
  const kfSample = vtr.samples[ki];
  // sampel dts/cts di sekitar hasil
  const around = vtr.samples.slice(Math.max(0, ki - 1), ki + 3).map((s) => ({ dts: +s.dts.toFixed(3), cts: +s.cts.toFixed(3), sync: s.sync }));

  return {
    totalSamples: vtr.samples.length,
    decoded: out.length,
    err,
    arrivalIsSorted: inversions === 0,
    inversions,
    first12,
    first12Sorted,
    keyframeTest: { t1, idx: ki, dts: +kfSample.dts.toFixed(3), cts: +kfSample.cts.toFixed(3), sync: kfSample.sync, around },
  };
}, fileB64);

console.log(JSON.stringify(result, null, 2));
await browser.close();
srv.close();
