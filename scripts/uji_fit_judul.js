// Uji posterJudulFit v1.0.48 — bukti bug "font terkunci maksimum + judul terpotong …" hilang.
// Replika PERSIS logika wrapCanvasText (textwrap.ts) + posterJudulFit (covers.ts, versi tetap)
// dgn mock measureText (lebar huruf ≈ 0.5em — mendekati Anton/Alfa Slab yang sempit).
"use strict";

// mock sederhana: lebar teks = jumlah karakter x 0.5 x ukuran font aktif
function mockCtx() {
  const ctx = { font: "100px X" };
  const ukuran = () => {
    const m = ctx.font.match(/([\d.]+)px/);
    return m ? parseFloat(m[1]) : 100;
  };
  ctx.measureText = (s) => ({ width: [...String(s)].length * 0.5 * ukuran() });
  return ctx;
}

// === salinan wrapCanvasText (tanpa maxLines — perilaku tanpa pemotongan) ===
function wrapCanvasText(ctx, text, maxWidth) {
  if (!text) return [];
  maxWidth = Math.max(8, maxWidth);
  const hardBreak = (word) => {
    if (ctx.measureText(word).width <= maxWidth) return [word];
    const out = [];
    let cur = "";
    for (const ch of [...word]) {
      const test = cur + ch;
      if (cur && ctx.measureText(test).width > maxWidth) { out.push(cur); cur = ch; } else cur = test;
    }
    if (cur) out.push(cur);
    return out;
  };
  const lines = [];
  for (const raw of String(text).split("\n")) {
    const words = raw.split(/\s+/).filter(Boolean);
    let cur = "";
    for (const word of words) {
      const pieces = !cur && ctx.measureText(word).width > maxWidth ? hardBreak(word) : [word];
      for (const piece of pieces) {
        const test = cur ? `${cur} ${piece}` : piece;
        if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = piece; } else cur = test;
      }
    }
    if (cur) lines.push(cur);
  }
  if (!lines.length) lines.push("");
  return lines;
}

// === salinan posterJudulFit VERSI TETAP (v1.0.48) ===
function posterJudulFit(ctx, text, family, weight, maxW, fsMax, fsMin, maxLines) {
  let fs = fsMax;
  for (; fs > fsMin; fs -= Math.max(2, fsMax * 0.04)) {
    ctx.font = `${weight} ${Math.round(fs)}px ${family}`;
    const lines = wrapCanvasText(ctx, text, maxW);
    if (lines.length <= maxLines) return { lines, fs };
  }
  ctx.font = `${weight} ${Math.round(fsMin)}px ${family}`;
  return { lines: wrapCanvasText(ctx, text, maxW), fs: fsMin };
}

// === salinan versi LAMA (berbug) utk pembanding ===
function posterJudulFitLama(ctx, text, family, weight, maxW, fsMax, fsMin, maxLines) {
  const potong = (ls) => { if (ls.length > maxLines) { const k = ls.slice(0, maxLines); k[maxLines - 1] = k[maxLines - 1].replace(/\s+\S*$/, "") + "…"; return k; } return ls; };
  let fs = fsMax;
  for (; fs > fsMin; fs -= Math.max(2, fsMax * 0.04)) {
    ctx.font = `${weight} ${Math.round(fs)}px ${family}`;
    const lines = potong(wrapCanvasText(ctx, text, maxW));
    if (lines.length <= maxLines) return { lines, fs };
  }
  return { lines: potong(wrapCanvasText(ctx, text, maxW)), fs: fsMin };
}

const W = 1080, H = 1920;
const kasus = [
  { nama: "judul user (31 huruf)", teks: "AJENG FEBRIA X KADES TURU MANAH", maxW: W * 0.9, fsMax: H * 0.075, fsMin: H * 0.032, maxLines: 3 },
  { nama: "pendek (8 huruf)", teks: "NGAMEN 5", maxW: W * 0.9, fsMax: H * 0.075, fsMin: H * 0.032, maxLines: 3 },
  { nama: "panjang (60 huruf)", teks: "ENY SAGITA NGAMEN 5 LIVE MUSIC VIDEO KONSER LENGKAP HD", maxW: W * 0.9, fsMax: H * 0.075, fsMin: H * 0.032, maxLines: 3 },
  { nama: "sangat panjang (100 huruf)", teks: "KUMPULAN LAGU DANGDUT KOPLO TERBARU 2026 PALING POPULER SEPANJANG MASA YANG WAJIB DENGARKAN", maxW: W * 0.9, fsMax: H * 0.075, fsMin: H * 0.032, maxLines: 3 },
];

let gagal = 0;
console.log("=== PEMBANDING: LAMA (berbug) vs BARU (v1.0.48) ===");
for (const k of kasus) {
  const ctxL = mockCtx();
  const lama = posterJudulFitLama(ctxL, k.teks, "Anton", "400", k.maxW, k.fsMax, k.fsMin, k.maxLines);
  const ctxB = mockCtx();
  const baru = posterJudulFit(ctxB, k.teks, "Anton", "400", k.maxW, k.fsMax, k.fsMin, k.maxLines);
  const utuh = baru.lines.join(" ").replace(/\s+/g, " ").trim() === k.teks.replace(/\s+/g, " ").trim();
  const adaPotong = baru.lines.some((l) => l.includes("…"));
  const blokBawah = H * 0.115 + baru.lines.length * baru.fs * 1.04;
  console.log(`\n[${k.nama}]`);
  console.log(`  LAMA: fs=${lama.fs.toFixed(0)}px (${(lama.fs / H).toFixed(3)}h) baris=${lama.lines.length} → ${JSON.stringify(lama.lines)}`);
  console.log(`  BARU: fs=${baru.fs.toFixed(0)}px (${(baru.fs / H).toFixed(3)}h) baris=${baru.lines.length} → ${JSON.stringify(baru.lines)}`);
  console.log(`  BARU utuh=${utuh ? "YA" : "TIDAK"} ada"…"=${adaPotong ? "YA(BURUK)" : "tidak"} blok s.d. y=${blokBawah.toFixed(0)} (${(blokBawah / H).toFixed(2)}h)`);
  if (adaPotong || !utuh) gagal++;
  if (baru.fs > k.fsMax + 0.5) gagal++;
}

console.log("\n=== KESIMPULAN ===");
console.log(gagal === 0 ? "SEMUA UJI LULUS ✓ — font menyesuaikan, judul UTUH, tanpa pemotongan" : `${gagal} KASUS GAGAL ✗`);
process.exit(gagal === 0 ? 0 : 1);
