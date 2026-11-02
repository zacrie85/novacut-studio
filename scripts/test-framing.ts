// Verifikasi rumus kadro baru: zoom 1 = ukuran asli (contain), ISI FRAME = cover
import { framingLayout, fillZoomFor } from "../src/lib/editor/visual";

// Frame proyek 9:16 (720x1280), video sumber 16:9 (1280x720)
const W = 720, H = 1280, SW = 1280, SH = 720;

console.log("== Sumber 1280x720 (16:9) di frame 720x1280 (9:16) ==");
for (const z of [1, 1.5, 2, 3, 3.17, 5]) {
  const L = framingLayout(SW, SH, W, H, z);
  const fills = L.dh >= H - 0.5 && L.dw >= W - 0.5;
  const bars = H - L.dh;
  console.log(
    `zoom ${z.toFixed(2)}x -> ${Math.round(L.dw)}x${Math.round(L.dh)} | overX=${Math.round(L.overX)} overY=${Math.round(L.overY)} | bar vertikal total=${Math.round(Math.max(0, bars))}px | mengisi penuh: ${fills}`
  );
}

console.log("\nfillZoomFor(1280x720 -> 720x1280) =", fillZoomFor(SW, SH, W, H), "(harus ~3.16)");
console.log("fillZoomFor(1280x720 -> 1280x720) =", fillZoomFor(SW, SH, 1280, 720), "(harus 1)");

// Frame 16:9, video sumber vertikal 720x1280
console.log("\n== Sumber 720x1280 (9:16) di frame 1280x720 (16:9) ==");
const L1 = framingLayout(720, 1280, 1280, 720, 1);
console.log(`zoom 1.00x -> ${Math.round(L1.dw)}x${Math.round(L1.dh)} | bar kiri/kanan total=${Math.round(1280 - L1.dw)}px (utuh, tanpa potong)`);
console.log("fillZoomFor =", fillZoomFor(720, 1280, 1280, 720), "(harus ~3.16)");

// Video 9:16 di frame 9:16 → zoom 1 langsung penuh
const L2 = framingLayout(720, 1280, 720, 1280, 1);
console.log("\nSumber 9:16 di frame 9:16, zoom 1 ->", Math.round(L2.dw) + "x" + Math.round(L2.dh), "(harus 720x1280, penuh)");
