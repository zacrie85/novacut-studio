// Verifikasi algoritma buildSplitProject (potongan kode ASLI diambil langsung
// dari src/lib/editor/exporter.ts) — memastikan tiap bagian split memetakan
// sumber video dengan benar: bagian N mulai dari detik (N-1)*L, tidak ada
// dobel-hitung, bagian terakhir tidak menjjauhi akhir video (layar hitam).
import { readFileSync } from "node:fs";

const src = readFileSync("/home/z/my-project/src/lib/editor/exporter.ts", "utf8");

// --- ekstrak loop klip dari buildSplitProject (kode asli, apa adanya) ---
const startMark = "  const clips: Clip[] = [];";
const endMark = "\n\n  // gaya teks part mengikuti pilihan pengguna";
const i0 = src.indexOf(startMark);
const i1 = src.indexOf(endMark);
if (i0 < 0 || i1 < 0 || i1 <= i0) {
  console.error("GAGAL: potongan buildSplitProject tidak ditemukan");
  process.exit(1);
}
const loopCode = src.slice(i0, i1).replace(": Clip[]", "");

// --- stub minimal ---
const baseClip = (p) => ({ id: "cl", trackId: "t", kind: "video", start: 0, duration: 1, inPoint: 0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0, effects: [], zoom: 1, panX: 0, panY: 0, ...p });

const run = new Function("baseClip", "rangeStart", "rangeEnd", "shift", "st", `${loopCode}\n  return clips;`);

function build(st, rangeStart, rangeEnd, shift) {
  return run(baseClip, rangeStart, rangeEnd, shift, st);
}

// --- skenario: video 60 dtk, split tiap 10 dtk -> 6 bagian, cover 3 dtk ---
const L = 10, V = 60, shift = 3;
const st = { clips: [{ id: "c1", trackId: "tv", kind: "video", start: 0, duration: V, inPoint: 0, speed: 1, loopCount: 1 }] };

let fail = 0;
for (let n = 1; n <= 6; n++) {
  const rs = (n - 1) * L, re = n * L;
  const clips = build(st, rs, re, shift);
  const vid = clips.find((c) => c.kind === "video");
  const srcStart = vid.inPoint + (vid.start + 0 - vid.start) * vid.speed; // posisi sumber saat konten mulai (local=0 di t=vid.start)
  const srcEnd = vid.inPoint + vid.duration * vid.speed;
  const okStart = Math.abs(vid.start - shift) < 1e-9;
  const okDur = Math.abs(vid.duration - L) < 1e-9;
  const okIn = Math.abs(vid.inPoint - rs) < 1e-9;
  const okTotal = re <= V + 1e-9;
  if (!okStart || !okDur || !okIn || !okTotal) fail++;
  console.log(`Bagian ${n}: start=${vid.start} dur=${vid.duration.toFixed(2)} inPoint=${vid.inPoint.toFixed(2)} sumber=[${vid.inPoint.toFixed(1)}..${srcEnd.toFixed(1)}] ${okStart && okDur && okIn ? "OK" : "GAGAL"}`);
}

// skenario kecepatan 2x: video 60 dtk -> timeline 30 dtk, split 3 bagian @10 dtk
const st2 = { clips: [{ id: "c2", trackId: "tv", kind: "video", start: 0, duration: 30, inPoint: 0, speed: 2, loopCount: 1 }] };
for (let n = 1; n <= 3; n++) {
  const rs = (n - 1) * 10, re = n * 10;
  const clips = build(st2, rs, re, shift);
  const vid = clips.find((c) => c.kind === "video");
  const okIn = Math.abs(vid.inPoint - rs * 2) < 1e-9; // sumber = timeline * speed
  if (!okIn) fail++;
  console.log(`2x Bagian ${n}: inPoint=${vid.inPoint.toFixed(1)} (harus ${(rs * 2).toFixed(1)}) ${okIn ? "OK" : "GAGAL"}`);
}

// skenario klip audio di tengah rentang + klip pendek di luar rentang (dibuang)
const st3 = {
  clips: [
    { id: "a", trackId: "ta", kind: "audio", start: 5, duration: 30, inPoint: 2, speed: 1, loopCount: 1 },
    { id: "b", trackId: "tv", kind: "image", start: 0, duration: 3, inPoint: 0, speed: 1, loopCount: 1 },
  ],
};
const c3 = build(st3, 10, 20, shift);
const a = c3.find((c) => c.id === "a");
const bOk = !c3.some((c) => c.id === "b"); // klip [0..3] di luar rentang [10..20]
const aOk = Math.abs(a.start - shift) < 1e-9 && Math.abs(a.duration - 10) < 1e-9 && Math.abs(a.inPoint - 7) < 1e-9;
if (!aOk || !bOk) fail++;
console.log(`Audio trim: start=${a.start} dur=${a.duration} inPoint=${a.inPoint} (harus 3/10/7) ${aOk ? "OK" : "GAGAL"}; klip luar rentang dibuang: ${bOk ? "OK" : "GAGAL"}`);

console.log(fail === 0 ? "\nSEMUA TES LOJIK SPLIT: LULUS ✔" : `\n${fail} TES GAGAL ✗`);
process.exit(fail === 0 ? 0 : 1);
