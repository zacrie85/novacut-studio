// NOVACUT Studio - Pembuat cover: 100 template populer + AI auto-cover

import { COVER_TEMPLATES, POSTER_TEMPLATES, fontStack, type CoverTemplate } from "./constants";
import { wrapCanvasText } from "./textwrap";
import type { CoverFrameStyle } from "./types";

export interface CoverRenderInput {
  img: CanvasImageSource | null;
  title: string;
  part?: string; // mis. "Part 2/5"
  template: CoverTemplate;
  /** "hitam" = latar hitam polos (abaikan gambar); "adegan"/default = gambar adegan video.
   *  v1.0.35: "poster" TIDAK lewat renderCover lagi — poster dibuat AI langsung (lihat aiPosterizeDataURL) */
  bgStyle?: "adegan" | "hitam" | "poster";
  /** v1.0.19: bingkai di sekeliling cover — digambar transparan 75% di atas latar & teks */
  frame?: CoverFrameStyle;
  w: number;
  h: number;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  // pakai helper bersama: kata panjang tanpa spasi dipecah per karakter
  // agar judul film yang panjang tetap terbaca (bersambung ke baris bawah)
  return wrapCanvasText(ctx, text, maxWidth, { maxLines });
}

function drawBackground(ctx: CanvasRenderingContext2D, input: CoverRenderInput, darken: number) {
  const { w, h } = input;
  // latar hitam polos — pilihan pengguna, tanpa gambar adegan
  if (input.bgStyle === "hitam") {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    // sedikit vignette halus agar tetap terlihat sinematik
    const gv = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
    gv.addColorStop(0, "rgba(30,30,34,0.35)");
    gv.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gv;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (input.img) {
    const sw = (input.img as HTMLCanvasElement).width || (input.img as HTMLImageElement).naturalWidth || 2;
    const sh = (input.img as HTMLCanvasElement).height || (input.img as HTMLImageElement).naturalHeight || 2;
    const s = Math.max(w / sw, h / sh) * 1.02;
    const dw = sw * s;
    const dh = sh * s;
    ctx.drawImage(input.img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, input.template.palette.bg1);
    g.addColorStop(1, input.template.palette.bg2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  // gradasi gelap agar teks terbaca
  const g2 = ctx.createLinearGradient(0, 0, 0, h);
  g2.addColorStop(0, `rgba(0,0,0,${darken * 0.7})`);
  g2.addColorStop(0.5, `rgba(0,0,0,${darken * 0.25})`);
  g2.addColorStop(1, `rgba(0,0,0,${darken})`);
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, w, h);
}

function drawPartBadge(ctx: CanvasRenderingContext2D, part: string, pal: { fg: string; accent: string }, x: number, y: number, size: number, align: CanvasTextAlign = "left") {
  if (!part) return;
  ctx.font = `700 ${size}px ${fontStack("condensed")}`;
  ctx.textAlign = align;
  const tw = ctx.measureText(part.toUpperCase()).width;
  const padX = size * 0.5;
  const boxW = tw + padX * 2;
  const boxH = size * 1.6;
  const bx = align === "center" ? x - boxW / 2 : align === "right" ? x - boxW : x;
  ctx.fillStyle = pal.accent;
  ctx.fillRect(bx, y, boxW, boxH);
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.fillText(part.toUpperCase(), bx + padX, y + boxH / 2 + size * 0.04);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
}

function glowText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, glow: string) {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 28;
  ctx.fillStyle = ctx.fillStyle;
  ctx.fillText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ===== v1.0.19: BINGKAI COVER — KLASIK / MODERN / FUTURISTIK =====

/** Daftar pilihan bingkai cover (dipakai UI pemilih di Mode Sederhana & Cover Studio) */
export const COVER_FRAMES: { id: CoverFrameStyle; label: string; desc: string }[] = [
  { id: "none", label: "Tanpa Bingkai", desc: "Cover polos — tanpa hiasan tepi." },
  { id: "klasik", label: "Klasik", desc: "Bingkai ganda emas + hiasan sudut, gaya poster bioskop vintage." },
  { id: "modern", label: "Modern", desc: "Garis bersih minimalis dengan aksen sudut." },
  { id: "futuristik", label: "Futuristik", desc: "Sudut HUD menyala + garis teknis, gaya sci-fi." },
];

/** Transparansi bingkai: tampil 75% (latar cover masih sedikit terlihat) */
const FRAME_ALPHA = 0.75;

/** Gambar bingkai di sekeliling cover. Dipanggil SETELAH latar & teks (paling atas).
 * Semua gaya digambar dengan globalAlpha 0.75 — semi-transparan sesuai permintaan. */
export function drawCoverFrame(ctx: CanvasRenderingContext2D, w: number, h: number, style: CoverFrameStyle, accent = "#5ec8f8") {
  if (!style || style === "none") return;
  ctx.save();
  ctx.globalAlpha = FRAME_ALPHA;
  const m = Math.min(w, h) * 0.05; // jarak bingkai dari tepi
  if (style === "klasik") drawFrameKlasik(ctx, w, h, m);
  else if (style === "modern") drawFrameModern(ctx, w, h, m, accent);
  else drawFrameFuturistik(ctx, w, h, m, accent);
  ctx.restore();
}

/** KLASIK: bingkai ganda emas + belah ketupat di sudut — poster bioskop vintage */
function drawFrameKlasik(ctx: CanvasRenderingContext2D, w: number, h: number, m: number) {
  const gold = "#ecd9a0";
  const deep = "#c9a24b";
  // garis luar tebal
  ctx.strokeStyle = gold;
  ctx.lineWidth = Math.max(2, h * 0.006);
  ctx.strokeRect(m, m, w - m * 2, h - m * 2);
  // garis dalam tipis
  const m2 = m * 1.6;
  ctx.lineWidth = Math.max(1, h * 0.0022);
  ctx.strokeRect(m2, m2, w - m2 * 2, h - m2 * 2);
  // hiasan sudut: belah ketupat + titik pusat di tiap sudut bingkai luar
  const d = m * 0.6;
  for (const [cx, cy] of [[m, m], [w - m, m], [m, h - m], [w - m, h - m]]) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = deep;
    ctx.fillRect(-d / 2, -d / 2, d, d);
    ctx.restore();
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.arc(cx, cy, d * 0.26, 0, Math.PI * 2);
    ctx.fill();
  }
  // lengkung kecil di tengah tiap sisi (sentuhan ukiran)
  ctx.strokeStyle = gold;
  ctx.lineWidth = Math.max(1.5, h * 0.003);
  const a = m * 0.5;
  for (const [x, y, dx, dy] of [[w / 2, m, 1, 0], [w / 2, h - m, 1, 0], [m, h / 2, 0, 1], [w - m, h / 2, 0, 1]]) {
    ctx.beginPath();
    if (dx) ctx.arc(x, y, a, Math.PI * 0.15, Math.PI * 0.85, dy === 0);
    else ctx.arc(x, y, a, Math.PI * (dy > 0 ? 0.65 : -0.35), Math.PI * (dy > 0 ? 0.35 : -0.65));
    ctx.stroke();
  }
}

/** MODERN: satu garis rounded bersih + garis tipis luar + aksen persegi di 2 sudut */
function drawFrameModern(ctx: CanvasRenderingContext2D, w: number, h: number, m: number, accent: string) {
  const r = h * 0.022;
  // garis utama putih
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(2.5, h * 0.0075);
  ctx.beginPath();
  ctx.roundRect(m, m, w - m * 2, h - m * 2, r);
  ctx.stroke();
  // garis tipis kedua sedikit di luarnya
  ctx.save();
  ctx.globalAlpha *= 0.55;
  ctx.lineWidth = Math.max(1, h * 0.002);
  const mo = m * 0.62;
  ctx.beginPath();
  ctx.roundRect(mo, mo, w - mo * 2, h - mo * 2, r * 0.7);
  ctx.stroke();
  ctx.restore();
  // aksen: kotak kecil di sudut kanan-atas & kiri-bawah
  const s = Math.min(w, h) * 0.02;
  ctx.fillStyle = accent;
  ctx.fillRect(w - m - s / 2, m - s / 2, s, s);
  ctx.fillRect(m - s / 2, h - m - s / 2, s, s);
}

/** FUTURISTIK: sudut HUD menyala + bingkai chamfer + garis tick teknis */
function drawFrameFuturistik(ctx: CanvasRenderingContext2D, w: number, h: number, m: number, accent: string) {
  // garis penuh tipis dengan sudut terpotong 45° (chamfer)
  ctx.save();
  ctx.globalAlpha *= 0.5;
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(1, h * 0.0022);
  const ch = Math.min(w, h) * 0.035;
  ctx.beginPath();
  ctx.moveTo(m + ch, m);
  ctx.lineTo(w - m - ch, m);
  ctx.lineTo(w - m, m + ch);
  ctx.lineTo(w - m, h - m - ch);
  ctx.lineTo(w - m - ch, h - m);
  ctx.lineTo(m + ch, h - m);
  ctx.lineTo(m, h - m - ch);
  ctx.lineTo(m, m + ch);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  // 4 bracket sudut menyala
  const L = Math.min(w, h) * 0.13;
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(3, h * 0.0085);
  ctx.shadowColor = accent;
  ctx.shadowBlur = Math.max(6, h * 0.018);
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]] as const) {
    ctx.beginPath();
    ctx.moveTo(x + sx * L, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * L);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  // garis tick teknis di tepi atas & bawah
  ctx.fillStyle = accent;
  const n = 14;
  const tw = Math.max(1.5, h * 0.0028);
  for (let i = 3; i < n - 2; i++) {
    const x = m + ((w - m * 2) * i) / n;
    const len = i % 2 === 0 ? h * 0.014 : h * 0.008;
    ctx.fillRect(x - tw / 2, m + h * 0.004, tw, len);
    ctx.fillRect(x - tw / 2, h - m - h * 0.004 - len, tw, len);
  }
  // segitiga penunjuk kecil di tengah sisi kiri & kanan
  const tri = Math.min(w, h) * 0.011;
  ctx.beginPath();
  ctx.moveTo(m, h / 2 - tri);
  ctx.lineTo(m + tri * 1.3, h / 2);
  ctx.lineTo(m, h / 2 + tri);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w - m, h / 2 - tri);
  ctx.lineTo(w - m - tri * 1.3, h / 2);
  ctx.lineTo(w - m, h / 2 + tri);
  ctx.closePath();
  ctx.fill();
}

/** Render satu cover ke ctx sesuai template */
export function renderCover(ctx: CanvasRenderingContext2D, input: CoverRenderInput) {
  const { w, h, template, title, part } = input;
  const pal = template.palette;
  const accent = pal.accent;
  const fg = pal.fg;
  ctx.clearRect(0, 0, w, h);
  ctx.textBaseline = "alphabetic";

  const layouts: Record<string, () => void> = {
    impact: () => {
      drawBackground(ctx, input, 0.45);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.115}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title, w * 0.84, 3);
      const startY = h / 2 - ((lines.length - 1) * h * 0.125) / 2 + h * 0.03;
      ctx.fillStyle = fg;
      lines.forEach((ln, i) => {
        const y = startY + i * h * 0.125;
        ctx.fillStyle = "#000";
        ctx.fillText(ln, w / 2 + h * 0.006, y + h * 0.006);
        ctx.fillStyle = fg;
        ctx.fillText(ln, w / 2, y);
      });
      ctx.fillStyle = accent;
      ctx.fillRect(w / 2 - w * 0.08, startY + lines.length * h * 0.125 - h * 0.06, w * 0.16, h * 0.012);
      drawPartBadge(ctx, part ?? "", pal, w / 2, h * 0.74, h * 0.032, "center");
    },
    lower: () => {
      drawBackground(ctx, input, 0.3);
      ctx.fillStyle = "rgba(0,0,0,0.72)";
      ctx.fillRect(0, h * 0.68, w * 0.72, h * 0.24);
      ctx.fillStyle = accent;
      ctx.fillRect(0, h * 0.68, w * 0.012, h * 0.24);
      ctx.textAlign = "left";
      ctx.font = `900 ${h * 0.085}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title, w * 0.64, 2);
      lines.forEach((ln, i) => {
        ctx.fillStyle = "#000";
        ctx.fillText(ln, w * 0.04 + 3, h * 0.79 + i * h * 0.095 + 3);
        ctx.fillStyle = fg;
        ctx.fillText(ln, w * 0.04, h * 0.79 + i * h * 0.095);
      });
      if (part) {
        ctx.font = `700 ${h * 0.03}px ${fontStack("sans")}`;
        ctx.fillStyle = accent;
        ctx.fillText(part.toUpperCase(), w * 0.04, h * 0.885);
      }
    },
    banner: () => {
      drawBackground(ctx, input, 0.3);
      ctx.fillStyle = pal.bg1;
      ctx.fillRect(0, 0, w, h * 0.22);
      ctx.fillStyle = accent;
      ctx.fillRect(0, h * 0.22, w, h * 0.012);
      ctx.textAlign = "center";
      // judul panjang: kecilkan font & turun jadi 2 baris di dalam banner
      let bsz = h * 0.1;
      ctx.font = `900 ${bsz}px ${fontStack("condensed")}`;
      let blines = wrapText(ctx, title, w * 0.86, 1);
      if (blines.length > 1) {
        bsz = h * 0.062;
        ctx.font = `900 ${bsz}px ${fontStack("condensed")}`;
        blines = wrapText(ctx, title, w * 0.86, 2);
      }
      ctx.fillStyle = fg;
      if (blines.length > 1) {
        blines.forEach((ln, i) => ctx.fillText(ln.toUpperCase(), w / 2, h * 0.095 + i * h * 0.08));
      } else {
        ctx.fillText(blines[0]?.toUpperCase() ?? "", w / 2, h * 0.15);
      }
      if (part) drawPartBadge(ctx, part, pal, w / 2, h * 0.8, h * 0.032, "center");
    },
    side: () => {
      drawBackground(ctx, input, 0.25);
      const g = ctx.createLinearGradient(0, 0, w * 0.62, 0);
      g.addColorStop(0, pal.bg1);
      g.addColorStop(0.75, pal.bg2);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w * 0.62, h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, w * 0.014, h);
      ctx.textAlign = "left";
      ctx.font = `900 ${h * 0.095}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title, w * 0.5, 3);
      lines.forEach((ln, i) => ctx.fillText(ln, w * 0.05, h * 0.42 + i * h * 0.11));
      ctx.fillStyle = accent;
      ctx.font = `700 ${h * 0.028}px ${fontStack("sans")}`;
      if (part) ctx.fillText(part.toUpperCase(), w * 0.05, h * 0.42 - h * 0.06);
    },
    boxed: () => {
      drawBackground(ctx, input, 0.35);
      ctx.strokeStyle = fg;
      ctx.lineWidth = h * 0.006;
      ctx.strokeRect(w * 0.09, h * 0.3, w * 0.82, h * 0.4);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.09}px ${fontStack("condensed")}`;
      const lines = wrapText(ctx, title, w * 0.72, 2);
      lines.forEach((ln, i) => {
        ctx.fillStyle = fg;
        const y = h * 0.47 + (i - (lines.length - 1) / 2) * h * 0.105;
        ctx.fillText(ln.toUpperCase(), w / 2, y);
      });
      ctx.fillStyle = pal.bg1;
      ctx.fillRect(w * 0.34, h * 0.28, w * 0.32, h * 0.045);
      ctx.fillStyle = accent;
      ctx.font = `700 ${h * 0.026}px ${fontStack("sans")}`;
      ctx.fillText((part || "VIDEO").toUpperCase(), w / 2, h * 0.312);
    },
    neon: () => {
      drawBackground(ctx, input, 0.55);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.1}px ${fontStack("display")}`;
      const lines = wrapText(ctx, title, w * 0.8, 2);
      lines.forEach((ln, i) => {
        const y = h * 0.48 + (i - (lines.length - 1) / 2) * h * 0.13;
        ctx.fillStyle = accent;
        glowText(ctx, ln.toUpperCase(), w / 2, y, accent);
        ctx.fillStyle = "#fff";
        ctx.fillText(ln.toUpperCase(), w / 2, y);
      });
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
      ctx.globalAlpha = 1;
      if (part) {
        ctx.font = `700 ${h * 0.028}px ${fontStack("sans")}`;
        ctx.fillStyle = "#fff";
        ctx.fillText(part.toUpperCase(), w / 2, h * 0.62);
      }
    },
    bars: () => {
      drawBackground(ctx, input, 0.2);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h * 0.14);
      ctx.fillRect(0, h * 0.86, w, h * 0.14);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.075}px ${fontStack("condensed")}`;
      const lines = wrapText(ctx, title, w * 0.8, 2);
      lines.forEach((ln, i) => {
        ctx.fillStyle = fg;
        ctx.fillText(ln.toUpperCase(), w / 2, h * 0.62 + (i - (lines.length - 1) / 2) * h * 0.085);
      });
      ctx.fillStyle = accent;
      ctx.font = `700 ${h * 0.024}px ${fontStack("sans")}`;
      ctx.fillText((part || "").toUpperCase(), w / 2, h * 0.8);
      // garis film
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let x = w * 0.03; x < w; x += w * 0.09) {
        ctx.fillRect(x, h * 0.055, w * 0.03, h * 0.03);
        ctx.fillRect(x, h * 0.915, w * 0.03, h * 0.03);
      }
    },
    sticker: () => {
      drawBackground(ctx, input, 0.3);
      ctx.save();
      ctx.translate(w * 0.72, h * 0.24);
      ctx.rotate(-0.12);
      ctx.fillStyle = accent;
      ctx.beginPath();
      const bw = w * 0.2;
      const bh = h * 0.13;
      ctx.roundRect(-bw / 2, -bh / 2, bw, bh, h * 0.02);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = `900 ${h * 0.032}px ${fontStack("impact")}`;
      ctx.textAlign = "center";
      ctx.fillText((part || "HOT").toUpperCase().slice(0, 12), 0, h * 0.012);
      ctx.restore();
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.105}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title, w * 0.8, 3);
      lines.forEach((ln, i) => {
        const y = h * 0.62 + (i - (lines.length - 1) / 2) * h * 0.115;
        ctx.fillStyle = "#000";
        ctx.fillText(ln, w / 2 + 4, y + 4);
        ctx.fillStyle = fg;
        ctx.fillText(ln, w / 2, y);
      });
    },
    outline: () => {
      drawBackground(ctx, input, 0.25);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.17}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title.toUpperCase(), w * 0.9, 2);
      lines.forEach((ln, i) => {
        const y = h * 0.52 + (i - (lines.length - 1) / 2) * h * 0.17;
        ctx.strokeStyle = fg;
        ctx.lineWidth = h * 0.008;
        ctx.strokeText(ln, w / 2, y);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillText(ln, w / 2, y);
      });
      ctx.fillStyle = accent;
      ctx.fillRect(w * 0.2, h * 0.7, w * 0.6, h * 0.05);
      ctx.fillStyle = "#000";
      ctx.font = `900 ${h * 0.032}px ${fontStack("impact")}`;
      ctx.fillText((part || title.slice(0, 30)).toUpperCase(), w / 2, h * 0.74);
    },
    band: () => {
      drawBackground(ctx, input, 0.25);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.06);
      const g = ctx.createLinearGradient(-w * 0.55, 0, w * 0.55, 0);
      g.addColorStop(0, pal.bg1);
      g.addColorStop(1, pal.bg2);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.95;
      ctx.fillRect(-w * 0.6, -h * 0.14, w * 1.2, h * 0.28);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.fillRect(-w * 0.6, -h * 0.14, w * 1.2, h * 0.012);
      ctx.fillRect(-w * 0.6, h * 0.128, w * 1.2, h * 0.012);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.085}px ${fontStack("condensed")}`;
      const lines = wrapText(ctx, title, w * 0.84, 2);
      lines.forEach((ln, i) => {
        ctx.fillStyle = fg;
        ctx.fillText(ln.toUpperCase(), 0, (i - (lines.length - 1) / 2) * h * 0.095 + h * 0.032);
      });
      ctx.restore();
      if (part) drawPartBadge(ctx, part, pal, w * 0.06, h * 0.78, h * 0.03);
    },
  };

  // v1.0.35: mode "poster" tidak lagi dirender di sini (poster = gambar AI utuh dari
  // makeCoverAsset). bgStyle "poster" yang masih lewat jalur ini diperlakukan sbg adegan.
  (layouts[template.layout] ?? layouts.impact)();

  // v1.0.19: bingkai cover — digambar PALING ATAS mengelilingi tepi gambar
  if (input.frame && input.frame !== "none") drawCoverFrame(ctx, w, h, input.frame, accent);
}

/** Render cover ke kanvas offscreen & kembalikan dataURL */
export function renderCoverToDataURL(input: Omit<CoverRenderInput, "w" | "h">, w = 1280, h = 720): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  renderCover(ctx, { ...input, w, h });
  return c.toDataURL("image/jpeg", 0.92);
}

// ===== v1.0.46: FRAME POSTER — teks murni di atas art AI tanpa teks =====
// Meniru poster referensi pengguna: gambar diisi art Cloudflare/Z.ai, judul =
// nama video, posisi & gaya tulisan mengikuti referensi (ZOMBIELAND =
// Hollywood, HUMOR #BAPER = komik, ENIGMA = papan kapur, Beauty & the Beast
// = epik). Nama pemeran/tanggal referensi TIDAK dipalsukan — zona itu jadi
// dekorasi murni karena datanya tidak ada di video.

/** Cari ukuran font terbesar yang membuat judul muat dalam maxLines baris. */
function posterJudulFit(ctx: CanvasRenderingContext2D, text: string, family: string, weight: string, maxW: number, fsMax: number, fsMin: number, maxLines: number): { lines: string[]; fs: number } {
  // v1.0.48: BUG FATAL diperbaiki — dulu pengujian memakai wrapCanvasText DENGAN
  // {maxLines}, yang memotong hasil ke TEPAT maxLines baris (+ "…") sebelum
  // dihitung → lines.length tidak pernah melebihi maxLines → kondisi "muat"
  // selalu benar pada iterasi pertama → font terkunci di ukuran MAKSIMUM dan
  // judul terpotong "…" (inilah sebab tulisan poster raksasa & tidak utuh).
  // Kini pengujian memakai wrap TANPA batas baris → jumlah baris NYATA dihitung.
  let fs = fsMax;
  for (; fs > fsMin; fs -= Math.max(2, fsMax * 0.04)) {
    ctx.font = `${weight} ${Math.round(fs)}px ${family}`;
    const lines = wrapCanvasText(ctx, text, maxW);
    if (lines.length <= maxLines) return { lines, fs };
  }
  ctx.font = `${weight} ${Math.round(fsMin)}px ${family}`;
  // fallback: SEMUA baris tetap digambar — tidak ada teks yang hilang
  return { lines: wrapCanvasText(ctx, text, maxW), fs: fsMin };
}

/** Latar poster: art AI cover-fit penuh + scrim atas/bawah + vignette. */
function posterLatar(ctx: CanvasRenderingContext2D, img: CanvasImageSource | null, w: number, h: number) {
  ctx.fillStyle = "#05070c";
  ctx.fillRect(0, 0, w, h);
  if (img) {
    const sw = (img as HTMLCanvasElement).width || (img as HTMLImageElement).naturalWidth || 2;
    const sh = (img as HTMLCanvasElement).height || (img as HTMLImageElement).naturalHeight || 2;
    const s = Math.max(w / sw, h / sh) * 1.02;
    ctx.drawImage(img, (w - sw * s) / 2, (h - sh * s) / 2, sw * s, sh * s);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#1c2438");
    g.addColorStop(1, "#3a1220");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  const g1 = ctx.createLinearGradient(0, 0, 0, h * 0.36);
  g1.addColorStop(0, "rgba(0,0,0,0.44)");
  g1.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, w, h * 0.36);
  const g2 = ctx.createLinearGradient(0, h * 0.62, 0, h);
  g2.addColorStop(0, "rgba(0,0,0,0)");
  g2.addColorStop(1, "rgba(0,0,0,0.52)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

/** Bintang burst komik (dekor pop-art ala HUMOR #BAPER). */
function posterBurst(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spikes: number, fill: string, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = (i % 2 === 0 ? r : r * 0.45) * (1 + (i % 3) * 0.06);
    const a = (Math.PI * i) / spikes;
    if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.strokeStyle = "#111";
  ctx.stroke();
  ctx.restore();
}

/** Gambar teks judul dgn outline lapis (komik/Hollywood) di satu baris. */
function posterTulisOutline(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fills: [string, number][], fill: string, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.textAlign = "center";
  for (const [warna, lw] of fills) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = warna;
    ctx.lineJoin = "round";
    ctx.strokeText(text, 0, 0);
  }
  ctx.fillStyle = fill;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** v1.0.46: gabungkan art AI (tanpa teks) + frame tulisan gaya referensi. */
export function renderPosterTextDataURL(
  input: { img: CanvasImageSource | null; title: string; posterTplId: string; frame?: CoverFrameStyle },
  w = 1080,
  h = 1920,
): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  posterLatar(ctx, input.img, w, h);
  const wide = w > h;
  const teks = bersihkanJudul(input.title).toUpperCase();
  let accent = "#5ec8f8";
  if (input.posterTplId === "poster-komik") {
    // HUMOR #BAPER: kata pertama putih miring + sisanya kuning besar (Alfa Slab
    // One), outline putih-hitam lapis, bintang burst pop-art, strip premiere kuning
    accent = "#ffd400";
    const kata = teks.split(/\s+/).filter(Boolean);
    const fam = '"Alfa Slab One","Archivo Black",sans-serif';
    const yTop = wide ? h * 0.14 : h * 0.10;
    if (kata.length === 1) {
      // v1.0.48: ukuran maksimum diturunkan (keluhan: tulisan terlalu besar)
      const fit = posterJudulFit(ctx, kata[0], fam, "400", w * 0.84, h * 0.085, h * 0.03, 3);
      fit.lines.forEach((ln, i) => posterTulisOutline(ctx, ln, w / 2, yTop + i * fit.fs * 1.08, [["#fff", fit.fs * 0.24], ["#111", fit.fs * 0.11]], "#ffd400", i % 2 ? 0.03 : -0.04));
    } else {
      const fit1 = posterJudulFit(ctx, kata[0], fam, "400", w * 0.8, h * 0.06, h * 0.03, 2);
      fit1.lines.forEach((ln, i) => posterTulisOutline(ctx, ln, w / 2, yTop + i * fit1.fs * 1.08, [["#fff", fit1.fs * 0.26], ["#111", fit1.fs * 0.12]], "#ffffff", i % 2 ? 0.04 : -0.05));
      const sisa = kata.slice(1).join(" ");
      const fit2 = posterJudulFit(ctx, sisa, fam, "400", w * 0.82, h * 0.08, h * 0.032, 3);
      fit2.lines.forEach((ln, i) => posterTulisOutline(ctx, ln, w / 2, yTop + (fit1.lines.length - 1) * fit1.fs * 1.08 + fit1.fs * 1.25 + i * fit2.fs * 1.06, [["#fff", fit2.fs * 0.22], ["#111", fit2.fs * 0.1]], "#ffd400", 0.035));
    }
    // v1.0.49: burst digeser keluar zona judul (dulu menimpa baris terakhir)
    posterBurst(ctx, w * 0.06, h * 0.38, w * 0.05, 8, "#ff4757", 0.3);
    posterBurst(ctx, w * 0.945, h * 0.2, w * 0.042, 10, "#1dd1f5", -0.2);
    posterBurst(ctx, w * 0.07, h * 0.58, w * 0.05, 8, "#ffd400", 0.15);
    // strip premiere kuning di dasar (dekor, tanpa teks palsu)
    ctx.fillStyle = "#ffd400";
    ctx.fillRect(0, h * 0.918, w, h * 0.052);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.918);
    ctx.lineTo(w, h * 0.918);
    ctx.stroke();
  } else if (input.posterTplId === "poster-gala") {
    // v1.0.50 GALA MALAM (pengganti Papan Kapur & Epik — permintaan pengguna):
    // judul serif putih di BAWAH poster, garis emas tipis + berlian di atas blok,
    // garis emas pendek di bawah; scrim gelap bagian bawah agar terbaca.
    accent = "#e8c56f";
    const fam = '"Cinzel","Playfair Display",serif';
    const scrim = ctx.createLinearGradient(0, h * 0.56, 0, h);
    scrim.addColorStop(0, "rgba(0,0,0,0)");
    scrim.addColorStop(0.55, "rgba(0,0,0,0.5)");
    scrim.addColorStop(1, "rgba(0,0,0,0.88)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, h * 0.56, w, h * 0.44);
    // judul adaptif 3 baris — blok DITAMBAT ke dasar (baris terakhir posisinya tetap)
    const fit = posterJudulFit(ctx, teks, fam, "700", w * 0.84, wide ? h * 0.05 : h * 0.052, h * 0.026, 3);
    const lh = fit.fs * 1.14;
    const yDasar = wide ? h * 0.9 : h * 0.885;
    const yBlok = yDasar - (fit.lines.length - 1) * lh;
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${Math.round(fit.fs * 0.08)}px`;
    ctx.save();
    ctx.textAlign = "center";
    fit.lines.forEach((ln, i) => {
      const y = yBlok + i * lh;
      ctx.font = `700 ${Math.round(fit.fs)}px ${fam}`;
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = fit.fs * 0.22;
      ctx.fillStyle = "#f7f3e8";
      ctx.fillText(ln, w / 2, y);
    });
    ctx.restore();
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
    // garis emas terputus + berlian kecil di atas blok judul (dekor tanpa teks palsu)
    const yGaris = yBlok - fit.fs * 0.85;
    ctx.strokeStyle = "rgba(232,197,111,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, yGaris);
    ctx.lineTo(w * 0.42, yGaris);
    ctx.moveTo(w * 0.58, yGaris);
    ctx.lineTo(w * 0.7, yGaris);
    ctx.stroke();
    ctx.save();
    ctx.translate(w / 2, yGaris);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#e8c56f";
    ctx.fillRect(-w * 0.007, -w * 0.007, w * 0.014, w * 0.014);
    ctx.restore();
    ctx.strokeStyle = "rgba(232,197,111,0.6)";
    ctx.beginPath();
    ctx.moveTo(w * 0.38, yDasar + fit.fs * 0.55);
    ctx.lineTo(w * 0.62, yDasar + fit.fs * 0.55);
    ctx.stroke();
  } else if (input.posterTplId === "poster-neon") {
    // v1.0.50 NEON PANGGUNG (pengganti Papan Kapur & Epik): bingkai neon
    // cyan-magenta mengelilingi poster + judul tebal miring di BAWAH dgn glow
    // neon ganda — suasana konser/live (dekor tanpa teks palsu).
    accent = "#ff4fd8";
    const fam = '"Archivo Black","Anton",sans-serif';
    const scrim = ctx.createLinearGradient(0, h * 0.58, 0, h);
    scrim.addColorStop(0, "rgba(4,2,14,0)");
    scrim.addColorStop(0.6, "rgba(4,2,14,0.55)");
    scrim.addColorStop(1, "rgba(4,2,14,0.92)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);
    // bingkai neon: gradasi magenta→cyan + glow, garis putih tipis di dalamnya
    const nx = w * 0.032;
    const ny = w > h ? h * 0.075 : h * 0.045;
    const nw = w - nx * 2;
    const nh = h - ny * 2;
    ctx.save();
    const ngrad = ctx.createLinearGradient(nx, ny, nx + nw, ny + nh);
    ngrad.addColorStop(0, "#ff4fd8");
    ngrad.addColorStop(0.5, "#8a5cff");
    ngrad.addColorStop(1, "#1dd1f5");
    ctx.shadowColor = "rgba(255,79,216,0.8)";
    ctx.shadowBlur = w * 0.02;
    ctx.strokeStyle = ngrad;
    ctx.lineWidth = Math.max(2.5, w * 0.0042);
    ctx.beginPath();
    ctx.roundRect(nx, ny, nw, nh, w * 0.018);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(nx + w * 0.012, ny + w * 0.012, nw - w * 0.024, nh - w * 0.024, w * 0.012);
    ctx.stroke();
    ctx.restore();
    const fit = posterJudulFit(ctx, teks, fam, "400", w * 0.84, wide ? h * 0.052 : h * 0.055, h * 0.026, 3);
    const lh = fit.fs * 1.06;
    const yDasar = wide ? h * 0.885 : h * 0.86;
    const yBlok = yDasar - (fit.lines.length - 1) * lh;
    fit.lines.forEach((ln, i) => {
      const y = yBlok + i * lh;
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = `400 ${Math.round(fit.fs)}px ${fam}`;
      ctx.transform(1, 0, -0.055, 1, 0, 0);
      const ng = ctx.createLinearGradient(0, y - fit.fs, 0, y);
      ng.addColorStop(0, "#7df3ff");
      ng.addColorStop(0.55, "#c9a6ff");
      ng.addColorStop(1, "#ff9bea");
      ctx.shadowColor = "rgba(255,79,216,0.9)";
      ctx.shadowBlur = fit.fs * 0.3;
      ctx.lineWidth = fit.fs * 0.07;
      ctx.strokeStyle = "#1c0530";
      ctx.lineJoin = "round";
      ctx.strokeText(ln, w / 2, y);
      ctx.shadowColor = "rgba(29,209,245,0.75)";
      ctx.shadowBlur = fit.fs * 0.16;
      ctx.fillStyle = ng;
      ctx.fillText(ln, w / 2, y);
      ctx.restore();
    });
    // bar glow pendek di bawah judul
    ctx.save();
    ctx.shadowColor = "rgba(29,209,245,0.9)";
    ctx.shadowBlur = w * 0.016;
    const bgrad = ctx.createLinearGradient(w * 0.34, 0, w * 0.66, 0);
    bgrad.addColorStop(0, "#1dd1f5");
    bgrad.addColorStop(1, "#ff4fd8");
    ctx.fillStyle = bgrad;
    ctx.fillRect(w * 0.34, yDasar + fit.fs * 0.5, w * 0.32, Math.max(3, h * 0.006));
    ctx.restore();
  } else {
    // ZOMBIELAND: judul raksasa oranye-merah (Anton) di atas + garis putih
    accent = "#ff9b21";
    const fam = '"Anton","Archivo Black",sans-serif';
    // v1.0.48: ukuran maksimum diturunkan (keluhan tulisan terlalu besar) —
    // bug fit "selalu muat" sudah diperbaiki di posterJudulFit
    const fit = posterJudulFit(ctx, teks, fam, "400", w * 0.9, wide ? h * 0.13 : h * 0.075, h * 0.032, 3);
    const y0 = wide ? h * 0.17 : h * 0.115;
    fit.lines.forEach((ln, i) => {
      const y = y0 + i * fit.fs * 1.04;
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = `400 ${Math.round(fit.fs)}px ${fam}`;
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = fit.fs * 0.18;
      ctx.shadowOffsetY = fit.fs * 0.05;
      ctx.lineWidth = fit.fs * 0.075;
      ctx.strokeStyle = "#2a0a02";
      ctx.lineJoin = "round";
      ctx.strokeText(ln, w / 2, y);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      const g = ctx.createLinearGradient(0, y - fit.fs, 0, y);
      g.addColorStop(0, "#ffe08a");
      g.addColorStop(0.5, "#ff9b21");
      g.addColorStop(1, "#e33d1c");
      ctx.fillStyle = g;
      ctx.fillText(ln, w / 2, y);
      ctx.restore();
    });
    const yRule = y0 + (fit.lines.length - 1) * fit.fs * 1.04 + fit.fs * 0.55;
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.33, yRule);
    ctx.lineTo(w * 0.67, yRule);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.moveTo(w * 0.17, h * 0.925);
    ctx.lineTo(w * 0.83, h * 0.925);
    ctx.stroke();
  }
  if (input.frame && input.frame !== "none") drawCoverFrame(ctx, w, h, input.frame, accent);
  return c.toDataURL("image/jpeg", 0.92);
}

/** Cover polos: gambar unggahan pengguna apa adanya (tanpa teks template).
 * v1.0.19: mendukung bingkai cover opsional. */
export async function plainCoverDataURL(url: string, w: number, h: number, frame?: CoverFrameStyle): Promise<string> {
  const img = await loadImage(url);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  const sw = img.naturalWidth || 2;
  const sh = img.naturalHeight || 2;
  const s = Math.max(w / sw, h / sh);
  ctx.drawImage(img, (w - sw * s) / 2, (h - sh * s) / 2, sw * s, sh * s);
  if (frame && frame !== "none") drawCoverFrame(ctx, w, h, frame);
  return c.toDataURL("image/jpeg", 0.94);
}

// ===== AI AUTO-COVER =====

/** Muat gambar dan tunggu sampai benar-benar siap digambar */
/** v1.0.33: gambar gradasi sinematik sebagai pengganti frame video yang gagal
 * di-decode (mode adegan) — cover tetap berwarna, bukan hitam */
export async function gradientImage(w: number, h: number): Promise<HTMLImageElement | null> {
  const c = document.createElement("canvas");
  c.width = Math.max(2, w);
  c.height = Math.max(2, h);
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#14506b");
  g.addColorStop(0.55, "#0d2f42");
  g.addColorStop(1, "#05050a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const rg = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, h * 0.8);
  rg.addColorStop(0, "rgba(255,177,80,0.28)");
  rg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);
  return await loadImage(c.toDataURL("image/jpeg", 0.92)).catch(() => null);
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("Gagal memuat gambar"));
    img.src = url;
  });
}

/** Tunggu frame video benar-benar ter-render (mencegah gambar hitam) */
function waitVideoFrame(video: HTMLVideoElement, timeoutMs = 1200): Promise<void> {
  type VFCVideo = HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
  const v = video as VFCVideo;
  if (typeof v.requestVideoFrameCallback === "function") {
    return new Promise((res) => {
      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          res();
        }
      };
      v.requestVideoFrameCallback(finish);
      setTimeout(finish, timeoutMs);
    });
  }
  return new Promise((res) => setTimeout(res, 140));
}

/** Seek video ke waktu t dan tunggu frame siap digambar */
async function seekVideo(video: HTMLVideoElement, t: number) {
  await new Promise<void>((res) => {
    let settled = false;
    const done = () => {
      if (!settled) {
        settled = true;
        res();
      }
    };
    video.onseeked = done;
    try {
      video.currentTime = Math.max(0, t);
    } catch {
      done();
    }
    setTimeout(done, 3000);
  });
  await waitVideoFrame(video);
}

/** Tunggu video siap (metadata + frame pertama) */
async function loadVideo(video: HTMLVideoElement): Promise<boolean> {
  await new Promise<void>((res) => {
    if (video.readyState >= 2) return res();
    video.onloadeddata = () => res();
    video.onerror = () => res();
    setTimeout(res, 5000);
  });
  return !!video.videoWidth;
}

export interface FrameScore {
  time: number;
  score: number;
  brightness: number;
  contrast: number;
}

/** Analisis & beri skor beberapa kandidat frame dari video */
/** v1.0.43: rentang pencarian frame cover — detik 5 s/d 30 (permintaan pengguna:
 * adegan menarik di awal-awal, hindari intro, jangan jauh ke akhir).
 * Video pendek menyesuaikan otomatis (tidak pernah keluar dari durasi). */
export function posterTimeRange(duration: number): { lo: number; hi: number } {
  const hi = Math.min(30, Math.max(0.2, duration - 0.2));
  const lo = Math.min(5, hi * 0.5);
  return { lo: Math.max(0, lo), hi };
}

export async function analyzeVideoFrames(url: string, duration: number, count = 8, range?: { lo: number; hi: number }): Promise<{ scores: FrameScore[]; best: FrameScore | null }> {
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.preload = "auto";
  const ok = await loadVideo(video);
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 90;
  const ctx = c.getContext("2d");
  const scores: FrameScore[] = [];
  if (!ok || !ctx) return { scores, best: null };

  const times: number[] = [];
  if (range) {
    // v1.0.34: sampling hanya di dalam rentang yang diminta (mis. detik 5–60)
    const lo = Math.max(0, Math.min(range.lo, Math.max(0, duration - 0.2)));
    const hi = Math.max(lo + 0.1, Math.min(range.hi, duration - 0.2));
    for (let i = 0; i < count; i++) times.push(Math.min(hi, lo + ((hi - lo) * (i + 0.5)) / count));
  } else {
    for (let i = 0; i < count; i++) times.push(Math.min(duration - 0.1, 0.1 + ((duration - 0.3) * (i + 0.5)) / count));
  }

  for (const t of times) {
    await seekVideo(video, t);
    ctx.drawImage(video, 0, 0, 160, 90);
    const data = ctx.getImageData(0, 0, 160, 90).data;
    let sum = 0;
    let sumSq = 0;
    let sat = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += lum;
      sumSq += lum * lum;
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      sat += mx === 0 ? 0 : (mx - mn) / mx;
    }
    const mean = sum / n;
    const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
    const meanSat = sat / n;
    // skor: pencahayaan ideal 90-170, kontras tinggi, warna hidup
    const exposure = Math.exp(-Math.pow((mean - 128) / 62, 2));
    const contrast = Math.min(1, std / 64);
    const color = Math.min(1, meanSat / 0.42);
    scores.push({ time: t, score: exposure * 0.45 + contrast * 0.35 + color * 0.2, brightness: mean, contrast: std });
  }
  scores.sort((a, b) => b.score - a.score);
  return { scores, best: scores[0] ?? null };
}

/** Ambil frame video pada waktu tertentu sebagai dataURL */
/** v1.0.33: cek piksel kanvas — true bila frame benar-benar HITAM (decoder video
 * gagal menggambar: sebagian GPU menolak decode elemen video yang tak ter-attach
 * DOM → drawImage menghasilkan hitam murni). Sampling ±4 ribu piksel. */
function canvasIsBlack(c: HTMLCanvasElement): boolean {
  const ctx = c.getContext("2d");
  if (!ctx || !c.width || !c.height) return true;
  try {
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    let max = 0;
    let n = 0;
    const step = Math.max(4, Math.floor(d.length / 4 / 4096) * 4);
    for (let i = 0; i < d.length; i += step) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      sum += lum;
      if (lum > max) max = lum;
      n++;
    }
    return n === 0 || (sum / n < 5 && max < 24);
  } catch {
    return false;
  }
}

export async function grabFrame(url: string, time: number, maxW = 1280): Promise<string | null> {
  // v1.0.33: 3 percobaan — (1-2) elemen video lepas dgn offset waktu beda,
  // (3) elemen DITEMPEL ke DOM tersembunyi (membuka jalur decode GPU normal)
  for (let attempt = 0; attempt < 3; attempt++) {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.preload = "auto";
    (video as HTMLVideoElement & { playsInline: boolean }).playsInline = true;
    let attached = false;
    if (attempt === 2 && typeof document !== "undefined" && document.body) {
      video.style.cssText = "position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;";
      document.body.appendChild(video);
      attached = true;
    }
    try {
      const ok = await loadVideo(video);
      if (!ok || !video.videoWidth) continue;
      const t = attempt === 1 ? Math.max(0, time + 0.4) : time;
      await seekVideo(video, t);
      const scale = Math.min(1, maxW / video.videoWidth);
      const c = document.createElement("canvas");
      c.width = Math.max(2, Math.round(video.videoWidth * scale));
      c.height = Math.max(2, Math.round(video.videoHeight * scale));
      const ctx = c.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(video, 0, 0, c.width, c.height);
      if (!canvasIsBlack(c)) return c.toDataURL("image/jpeg", 0.92);
      // hitam → re-seek mundur sedikit (frame ini mungkin gagal decode) lalu gambar lagi
      await seekVideo(video, Math.max(0, t - 0.1));
      ctx.drawImage(video, 0, 0, c.width, c.height);
      if (!canvasIsBlack(c)) return c.toDataURL("image/jpeg", 0.92);
    } catch {
      /* lanjut percobaan berikutnya */
    } finally {
      if (attached) video.remove();
      video.removeAttribute("src");
      video.load();
    }
  }
  return null;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** AI: pilih kombinasi frame + template terbaik (deterministik per judul) */
export function aiRecommendTemplates(title: string, brightness: number, count = 6): CoverTemplate[] {
  const rnd = mulberry32(hashStr(title || "novacut"));
  const long = title.length > 24;
  const dark = brightness < 105;
  const bright = brightness > 165;
  // bobot layout sesuai kondisi
  const layoutWeights: Record<string, number> = {
    impact: long ? 0.6 : 2.2,
    lower: long ? 2.2 : 1.2,
    banner: 1,
    side: long ? 2 : 1.2,
    boxed: 1.1,
    neon: dark ? 2.4 : 0.8,
    bars: dark ? 1.6 : 1,
    sticker: bright ? 1.6 : 1,
    outline: long ? 0.7 : 2.2,
    band: 1.2,
  };
  const paletteWeights: Record<string, number> = {
    cyber: dark ? 2.2 : 1,
    sunset: 1.4,
    gold: 1.5,
    ice: bright ? 1.8 : 1,
    toxic: 1,
    royal: dark ? 1.6 : 1,
    blood: 1.2,
    mono: bright ? 1.4 : 0.9,
    candy: 1.1,
    ocean: 1.2,
  };
  const scored = COVER_TEMPLATES.map((t) => ({
    t,
    s: (layoutWeights[t.layout] ?? 1) * (paletteWeights[t.palette.id] ?? 1) * (t.popular ? 1.35 : 1) * (0.75 + rnd() * 0.6),
  }));
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, count).map((x) => x.t);
}

// ===== v1.0.35: POSTER HOLLYWOOD AI (frame adegan video + prompt → poster sinematik) =====

/** v1.0.36: bersihkan judul dari kode sampah yang menempel di nama file video —
 * mis. "KONGLOMERAT... SEKETIK. [42TZYEQ7MOK]" → kode bracket alfanumerik dibuang,
 * sisa pemisah kosong dipangkas. Judul yang diketik pengguna sendiri tak tersentuh
 * selama tak membawa pola kode bracket. */
export function bersihkanJudul(s: string): string {
  let t = (s || "").replace(/\[[0-9A-Za-z_-]{4,}\]/g, " ").replace(/\s*[_|\-–—]\s*$/g, "");
  // v1.0.45: strip juga jadi spasi — nama file "pengalaman-5-menit" dulu tetap
  // memakai tanda hubung (dulu hanya _ dan | yang jadi spasi)
  t = t.replace(/[_|]+/g, " ").replace(/[-–—]+/g, " ");
  // v1.0.45: buang kata sampah nama file (YouTube/detik-scrape) — dulu
  // "eny sagita ngamen 5 official live music video dc part 12 12" dipakai utuh
  // sebagai judul poster → AI mencetak coretan "OFFITIL MUSC VIEEO" di bawah judul.
  t = t
    .replace(/\b(?:part|episode|eps|ep)[- _]?\d+(?:[-_ ]?(?:of|\/|dari)?[-_ ]?\d+)?\b/gi, " ")
    .replace(/\b(?:official(?:[-_ ]?(?:live|full))?(?:[-_ ]?(?:music|lyric|audio))?(?:[-_ ]?(?:video|vid))?|live[-_ ]?music[-_ ]?video|music[-_ ]?video|video[-_ ]?official|full[-_ ]?video|videoclip|video[-_ ]?clip|lyric[-_ ]?video|hd|4k|720p|1080p|production|produksi)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+[a-z]{1,3}\s*$/i, " ")
    .replace(/\s*[_|\-–—]\s*$/g, "")
    .trim();
  return t || (s || "").trim();
}

/** v1.0.47: Prompt DEFAULT — arah "FOTO ASLI + SENTUHAN AI REALISTIS" (permintaan
 * pengguna). Dulu: "2-3 karakter berhadapan + background kolosal + frame
 * futuristik" → model mengarang komposisi baru & bergeser ke kartun/ilustrasi.
 * Kini: fotorealistis, orang asli dari adegan video, AI hanya menyentuh gaya. */
export const POSTER_PROMPT_DEFAULT =
  "BUAT POSTER FOTOREALISTIS DARI ADEGAN YANG DIAMBIL DARI VIDEO — hasil harus tampak seperti FOTO ASLI (bukan kartun, bukan ilustrasi, bukan anime): orang nyata dengan kulit, rambut, dan tekstur alami, sesuai adegan yang ada di video (adegan diambil dari detik 5 sampai detik 30). SENTUHAN AI REALISTIS hanya pada gaya: pencahayaan sinematik dramatis, gradasi warna ala film bioskop, sedikit rim light dan atmosfer halus, komposisi poster profesional. Rasio poster 9:16, area atas dan bawah agak lega untuk judul yang akan ditambahkan aplikasi.";

/** Rakit prompt final: prompt manual pengguna ATAU default + judul video, lalu
 * tambahkan ATURAN MARGIN (semua tulisan di dalam area gambar — tidak terpotong tepi).
 * v1.0.41: NAMA VIDEO SELALU JADI JUDUL POSTER — judul ikut disisipkan walau
 * prompt manual diisi (dulu judul dibuang bila prompt manual tidak kosong,
 * akibatnya poster memakai judul liar pilihan AI). Pengguna tetap bisa
 * menentukan sendiri dengan menulis judul "..." di prompt manualnya. */
export function buildPosterPrompt(custom: string | undefined, title: string, textFree = false): string {
  const judul = bersihkanJudul((title || "").trim());
  const dasar = (custom || "").trim() || POSTER_PROMPT_DEFAULT;
  // v1.0.46: mode "app" — AI melukis art TANPA teks sama sekali; judul ditulis
  // aplikasi via template (ejaan selalu benar). Marker [TEXTFREE] dibaca main
  // process untuk membuang aturan judul dari prompt CF/Z.ai.
  if (textFree) {
    // v1.0.47: arah FOTO ASLI + SENTUHAN AI REALISTIS ikut ditulis di prompt
    return `[TEXTFREE] ${dasar}. PENTING: hasil harus tampak seperti FOTO ASLI + sentuhan AI realistis (photorealistic real photograph — bukan kartun, bukan ilustrasi, bukan anime, bukan 3D render). JANGAN menulis teks/kata/huruf/angka/logo apa pun di dalam gambar — lukis hanya adegan/gambar murni (no text, no letters, no numbers, no logos, no watermarks). Judul akan ditambahkan aplikasi secara terpisah di atas poster.`;
  }
  const judulPart = judul && !/judul\s*"/i.test(dasar) ? ` dengan menggunakan judul "${judul}" sebagai judul di poster` : "";
  return `${dasar}${judulPart}. PENTING: semua tulisan pada poster harus berada di dalam area gambar dan diberi jarak aman (margin) dari tepi — tidak boleh terpotong di tepi kiri, kanan, atas, atau bawah. Jangan menulis ulang takarir, caption, atau watermark dari gambar sumber.`;
}

/** v1.0.52: prompt LATAR KOSONG (bgOnly) utk komposit "adegan asli + bg sinematik" —
 * AI HANYA melukis plate lingkungan TANPA orang (identitas mustahil rusak: adegan
 * asli tidak pernah dikirim ke AI); adegan asli digambar renderer di atasnya.
 * Prompt Poster pengguna dipakai sebagai hint atmosfer/pencahayaan saja. */
export function buildBackdropPrompt(custom: string | undefined): string {
  const gaya = (custom || "").trim().slice(0, 220);
  return (
    `Vertical 9:16 cinematic BACKGROUND PLATE for a movie poster: an EMPTY moody concert stage environment — absolutely NO people, no faces, no silhouettes, no crowd; dramatic atmospheric haze, teal and orange stage lighting, glowing bokeh lights, deep shadows, subtle film grain, photorealistic photograph, dark cinematic mood, slightly darker at the very top and bottom edges (title space).` +
    (gaya ? ` Atmosphere and lighting hints only (never add people or characters): ${gaya}.` : "") +
    ` NO text, no letters, no numbers, no logos, no watermarks anywhere.`
  );
}

/** v1.0.52: KOMPOSIT "adegan asli + bg sinematik" — latar AI (plate kosong) atau
 * gradasi lokal bila AI gagal; ADEGAN ASLI dipasang besar di tengah (lebar ±96%,
 * tinggi maks ±66% kanvas) dgn keempat tepinya di-feather agar menyatu dgn latar
 * seperti satu foto, lalu grade teal-orange penyatu di seluruh kanvas + vignette +
 * grain film + fade bawah utk zona judul template. Identitas 100%: piksel adegan
 * tidak pernah dikirim ke AI (v1.0.51: model edit mengarang ulang seluruh adegan). */
export async function posterKompositCineDataURL(frameUrl: string, bgUrl: string | null, w: number, h: number): Promise<string | null> {
  try {
    const img = await loadImage(frameUrl);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    // latar lokal: gradasi gelap + glow panggung teal/oranye (bila AI latar gagal)
    const latarLokal = () => {
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, 0, w, h);
      const g1 = ctx.createRadialGradient(w / 2, h * 0.42, Math.min(w, h) * 0.1, w / 2, h * 0.42, Math.max(w, h) * 0.75);
      g1.addColorStop(0, "rgba(46,96,150,0.4)");
      g1.addColorStop(0.55, "rgba(20,40,70,0.18)");
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);
      const g2 = ctx.createRadialGradient(w * 0.72, h * 0.6, Math.min(w, h) * 0.05, w * 0.72, h * 0.6, Math.max(w, h) * 0.5);
      g2.addColorStop(0, "rgba(190,90,20,0.22)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);
    };
    if (bgUrl) {
      try {
        const bg = await loadImage(bgUrl);
        const s = Math.max(w / (bg.naturalWidth || 2), h / (bg.naturalHeight || 2));
        ctx.drawImage(bg, (w - (bg.naturalWidth || 2) * s) / 2, (h - (bg.naturalHeight || 2) * s) / 2, (bg.naturalWidth || 2) * s, (bg.naturalHeight || 2) * s);
      } catch {
        latarLokal();
      }
    } else {
      latarLokal();
    }
    // gelapkan latar ±35% supaya adegan asli menonjol
    ctx.fillStyle = "rgba(3,6,12,0.35)";
    ctx.fillRect(0, 0, w, h);
    // ADEGAN ASLI: contain lebar ±96%, tinggi maks ±66%, pusat di 46% tinggi kanvas
    const sw = img.naturalWidth || 2;
    const sh = img.naturalHeight || 2;
    const s2 = Math.min((w * 0.96) / sw, (h * 0.66) / sh);
    const dw = sw * s2;
    const dh = sh * s2;
    const dx = (w - dw) / 2;
    const dy = h * 0.46 - dh / 2;
    // feather 4 tepi: gambar ke offscreen → mask gradasi (destination-out di mask,
    // lalu destination-in ke adegan) → tepi melebur ke latar seperti satu foto
    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.round(dw));
    off.height = Math.max(1, Math.round(dh));
    const octx = off.getContext("2d");
    if (!octx) return null;
    octx.drawImage(img, 0, 0, off.width, off.height);
    const mask = document.createElement("canvas");
    mask.width = off.width;
    mask.height = off.height;
    const mctx = mask.getContext("2d");
    if (!mctx) return null;
    mctx.fillStyle = "#ffffff";
    mctx.fillRect(0, 0, mask.width, mask.height);
    mctx.globalCompositeOperation = "destination-out";
    const f = Math.min(mask.width, mask.height) * 0.09;
    const tepi = (x0: number, y0: number, x1: number, y1: number, rx: number, ry: number, rw: number, rh: number) => {
      const g = mctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      mctx.fillStyle = g;
      mctx.fillRect(rx, ry, rw, rh);
    };
    tepi(0, 0, 0, f, 0, 0, mask.width, f);
    tepi(0, mask.height, 0, mask.height - f, 0, mask.height - f, mask.width, f);
    tepi(0, 0, f, 0, 0, 0, f, mask.height);
    tepi(mask.width, 0, mask.width - f, 0, mask.width - f, 0, f, mask.height);
    octx.globalCompositeOperation = "destination-in";
    octx.drawImage(mask, 0, 0);
    octx.globalCompositeOperation = "source-over";
    // glow/bayangan lembut di belakang adegan
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = w * 0.035;
    ctx.drawImage(off, dx, dy);
    ctx.restore();
    // grade teal-orange penyatu di SELURUH kanvas → komposit terasa satu foto
    ctx.save();
    const gradeU = ctx.createLinearGradient(0, 0, 0, h);
    gradeU.addColorStop(0, "rgba(18,55,90,0.2)");
    gradeU.addColorStop(0.5, "rgba(0,0,0,0)");
    gradeU.addColorStop(1, "rgba(150,80,15,0.18)");
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = gradeU;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    // vignette + fade bawah utk zona judul template
    const vg = ctx.createRadialGradient(w / 2, h * 0.46, Math.min(w, h) * 0.3, w / 2, h * 0.46, Math.max(w, h) * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    const fade = ctx.createLinearGradient(0, h * 0.66, 0, h);
    fade.addColorStop(0, "rgba(4,6,10,0)");
    fade.addColorStop(1, "rgba(4,6,10,0.85)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, h * 0.66, w, h * 0.34);
    // grain film di seluruh kanvas (menyatukan latar AI & adegan asli)
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 1000; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
    ctx.globalAlpha = 1;
    return c.toDataURL("image/jpeg", 0.92);
  } catch {
    return null;
  }
}

/** v1.0.54: POSTER KISAH — prompt adegan film BARU dari judul video (ala
 * gpt-image-2.5-flare): judul dipakai sbg alur cerita → komposisi poster
 * blockbuster (hero di tengah, momen aksi atas, momen emosional bawah). Frame
 * video dikirim sbg referensi tokoh utk Mage/Z.ai (img2img — wajah asli
 * terbawa); CF memakai txt2img langsung (karakter karangan, GRATIS). Marker
 * [TEXTFREE] → gambar murni tanpa teks; judul ditulis template app. */
export function buildKisahPrompt(custom: string | undefined, judul?: string): string {
  const gaya = (custom || "").trim().slice(0, 200);
  const cerita = (judul || "").replace(/\s*[-–|]\s*(part|episode|eps?|ep)\s*\d+(\s*\/\s*\d+)?\s*$/i, "").trim().slice(0, 320);
  return (
    `Epic vertical 9:16 MOVIE POSTER scene, photorealistic cinematic photography: ${cerita || "a dramatic action-romance story"}. ` +
    `Compose like a blockbuster film poster: ONE HERO in the center (upper body, intense expression, dramatic rim light), smaller story moments above and below (action beat at the top, emotional beat at the bottom), cinematic environment with atmospheric haze, volumetric light, dramatic sky, deep teal-and-orange color grade, subtle film grain, rich realistic detail, REAL-PHOTOGRAPH look — no cartoon, no anime, no illustration, no drawing, no 3D render.` +
    (gaya ? ` Style hints (atmosphere only): ${gaya}.` : "") +
    ` [TEXTFREE] Leave the top and bottom edges slightly darker for title space.`
  );
}

/** v1.0.46: pilih frame poster — "auto" = ikut judul (pendek / mengandung # →
 * komik; sedang → Gala Malam [judul di bawah]; panjang → Hollywood);
 * id dari POSTER_TEMPLATES dipakai langsung, id tak dikenal (mis. template
 * lama poster-sekolah/poster-epik yang sudah dihapus v1.0.50) → Hollywood. */
export function resolvePosterTemplateId(c: { posterTemplateId?: string }, title: string): string {
  const id = c.posterTemplateId ?? "auto";
  if (id !== "auto" && POSTER_TEMPLATES.some((t) => t.id === id)) return id;
  const n = bersihkanJudul(title).length;
  if (/#/.test(title) || n <= 10) return "poster-komik";
  return n <= 34 ? "poster-gala" : "poster-hollywood";
}

/** Poster AI: kirim frame (dataURL) + prompt ke model gambar lewat Electron
 * (IPC ai:poster). v1.0.38: penyedia & kualitas ikut preferensi tersimpan
 * (Z.ai glm-image hd/standard ATAU Cloudflare Workers AI gratis). Bila bridge
 * tidak ada (web) atau gagal → null → pemanggil lanjut ke fallback frame ter-grade. */
let _kesalahanPosterAI = "";
/** v1.0.43: pesan kegagalan AI TERAKHIR (dari main process: saldo habis, model
 * tidak ada, kunci salah, timeout) — toast di app menampilkannya agar pengguna
 * tahu SEBAB poster bawaan muncul, bukan hanya "AI gagal". */
export function kesalahanPosterAI(): string {
  return _kesalahanPosterAI;
}
let _jalurPosterAI = "";
let _alasanJalur = "";
/** v1.0.49: alasan jalur edit gagal (dari penyedia) — tampil di label status agar
 * pengguna tahu mengapa poster jatuh ke teks-saja (mis. "multipart: HTTP 403
 * model terms"). Kosong bila jalur edit sukses. */
export function alasanJalurPosterAI(): string {
  return _alasanJalur;
}
/** v1.0.45: jalur pembuatan poster TERAKHIR — "cloudflare-edit"/"publik-edit" =
 * frame video benar-benar dipakai (img2img); "cloudflare-txt2img"/"publik"/"sdk" =
 * poster digambar dari teks saja (edit frame gagal diam-diam → kini terlihat di
 * label status panel pratinjau, bukan lagi tersembunyi di balik poster). */
export function jalurPosterAI(): string {
  return _jalurPosterAI;
}
/** v1.0.44: ubah pesan kegagalan API menjadi bahasa Indonesia + LANGKAH solusi.
 * Dulu pesan mentah (mis. "Insufficient balance") hanya tampil di toast ±4 detik
 * — pengguna tidak sempat membacanya dan bingung kenapa poster Z.ai tidak jadi. */
export function terjemahkanKesalahanAI(raw: string): string {
  const s = String(raw || "");
  const cari = (p: RegExp, msg: string) => (p.test(s) ? msg : null);
  return (
    // v1.0.47: pesan mage.space (Gems) — dicek SEBELUM pola umum "insufficient"
    // agar tidak salah tampil sebagai pesan saldo Z.ai
    cari(/gems?\b|mage\.space|mage_sk_/i, "Masalah mage.space: kunci salah atau saldo Gems habis — beli Gem pack di mage.space (±Rp145/gambar) lalu klik Buat Ulang Poster lagi") ||
    cari(/insufficient|balance|arrears|余额|欠费|credit/i, "Saldo/kredit Z.ai tidak cukup — buka z.ai → Billing → isi saldo (±Rp250/poster), lalu klik Buat Ulang Poster lagi") ||
    cari(/api ?key|invalid.*(key|token)|unauthorized|authentication/i, "Kunci API Z.ai salah/kedaluwarsa — tempel ulang kunci di kartu Mesin Poster AI lalu Simpan") ||
    cari(/429|rate ?limit|too many|frequency|throttl/i, "Batas laju Z.ai tercapai — tunggu ±1 menit lalu klik Buat Ulang Poster lagi") ||
    cari(/timeout|waktu tunggu|abort|timed out/i, "Waktu tunggu habis (koneksi lambat / kualitas HD ±20 dtk) — coba lagi, atau pilih kualitas Hemat") ||
    cari(/network|fetch|enotfound|econnrefused/i, "Tidak bisa terhubung ke server AI — cek koneksi internet lalu coba lagi") ||
    cari(/model.*(not exist|not found)|invalid model/i, "Model AI tidak tersedia di akun ini — cek nama model/z.ai lalu coba lagi") ||
    (s.trim() ? s.slice(0, 160) : "AI tidak mengembalikan gambar")
  );
}
export async function aiPosterizeDataURL(frameUrl: string, prompt: string, size: "1344x768" | "768x1344" = "1344x768", timeoutMs = 180000, opts?: { expand?: boolean; bgOnly?: boolean; direct?: boolean }): Promise<string | null> {
  if (typeof window === "undefined" || !window.novacutAI?.posterAI) {
    _kesalahanPosterAI = "";
    return null;
  }
  try {
    const prefs = await window.novacutAI?.getAIPrefs?.().catch(() => null);
    // v1.0.47: penyedia ke-3 Mage (mage.space — gpt-image, ±9 Gems/poster)
    const provider = prefs?.provider === "cloudflare" ? "cloudflare" : prefs?.provider === "mage" ? "mage" : "zai";
    const quality = prefs?.quality === "standard" ? "standard" : "hd";
    const res = await Promise.race([
      // v1.0.52: opts.bgOnly → main process langsung txt2img (plate latar kosong);
      // v1.0.54: opts.direct → txt2img langsung (poster kisah; CF), frame tetap
      // dikirim utk Z.ai/Mage (img2img referensi tokoh)
      window.novacutAI.posterAI(frameUrl, prompt, size, provider, quality, opts?.expand, opts?.bgOnly, opts?.direct),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (res === null) {
      _kesalahanPosterAI = terjemahkanKesalahanAI(`waktu tunggu AI habis (>${Math.round(timeoutMs / 1000)} dtk)`);
      return null;
    }
    if (res?.ok && res.image) {
      _kesalahanPosterAI = "";
      // v1.0.45: catat jalur sukses (edit = frame dipakai; txt2img = teks saja)
      // v1.0.49: + alasan gagal edit (mis. agreement/moderation) utk label status
      _jalurPosterAI = String(res?.via || "");
      _alasanJalur = String(res?.detail || "");
      return res.image;
    }
    _kesalahanPosterAI = terjemahkanKesalahanAI(String(res?.error || ""));
    _jalurPosterAI = "";
    return null;
  } catch (err) {
    _kesalahanPosterAI = terjemahkanKesalahanAI(String(err));
    _jalurPosterAI = "";
    return null;
  }
}

/** v1.0.35: fallback poster saat AI gagal (tanpa kredensial/internet) — frame video
 * diberi grade sinematik + vignette TANPA tulisan apa pun (judul ditulis overlay
 * mesin render; aiMade=false sehingga overlay judul otomatis aktif). */
export async function posterFallbackDataURL(frameUrl: string, w: number, h: number): Promise<string | null> {
  try {
    const img = await loadImage(frameUrl);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    const sw = img.naturalWidth || 2;
    const sh = img.naturalHeight || 2;
    const s = Math.max(w / sw, h / sh) * 1.04;
    ctx.filter = "contrast(1.08) saturate(1.18) brightness(0.98)";
    ctx.drawImage(img, (w - sw * s) / 2, (h - sh * s) / 2, sw * s, sh * s);
    ctx.filter = "none";
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.32, w / 2, h / 2, Math.max(w, h) * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    const gBot = ctx.createLinearGradient(0, h * 0.45, 0, h);
    gBot.addColorStop(0, "rgba(0,0,0,0)");
    gBot.addColorStop(1, "rgba(0,0,0,0.72)");
    ctx.fillStyle = gBot;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);
    return c.toDataURL("image/jpeg", 0.92);
  } catch {
    return null;
  }
}

/** v1.0.50: ADEGAN ASLI + BACKGROUND HITAM SINEMATIK + BINGKAI FILM (0 Neuron,
 * permintaan pengguna — grade studio dianggap terlalu biasa). Frame video dipasang
 * UTUH tanpa crop di atas kanvas hitam, glow lembut di belakang foto, grade
 * teal-orange ringan (warna saja — wajah/adegan tetap asli), bingkai garis emas
 * + bracket sudut, vignette, grain film halus; zona bawah gelap untuk judul
 * template (pas dgn Gala/Neon yang menaruh judul di bagian bawah). */
export async function posterAsliCineDataURL(frameUrl: string, w: number, h: number): Promise<string | null> {
  try {
    const img = await loadImage(frameUrl);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#04060a";
    ctx.fillRect(0, 0, w, h);
    // foto UTUH (contain, komposisi asli dijaga) di zona atas ±72% kanvas
    const margin = Math.min(w, h) * 0.05;
    const zonaTinggi = h * 0.7;
    const sw = img.naturalWidth || 2;
    const sh = img.naturalHeight || 2;
    const s = Math.min((w - margin * 2) / sw, (zonaTinggi - margin) / sh);
    const dw = sw * s;
    const dh = sh * s;
    const dx = (w - dw) / 2;
    const dy = margin + Math.max(0, (zonaTinggi - margin - dh) / 2);
    // glow lembut di belakang foto (rim sinematik)
    const glow = ctx.createRadialGradient(w / 2, dy + dh / 2, Math.min(dw, dh) * 0.25, w / 2, dy + dh / 2, Math.max(dw, dh) * 0.8);
    glow.addColorStop(0, "rgba(58,110,180,0.3)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    // foto + kontras/saturasi ringan (tetap foto asli, bukan lukisan AI)
    ctx.save();
    ctx.filter = "contrast(1.1) saturate(1.16) brightness(1.01)";
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
    // grade teal-orange halus + vignette, hanya di area foto
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, dw, dh);
    ctx.clip();
    const grade = ctx.createLinearGradient(0, dy, 0, dy + dh);
    grade.addColorStop(0, "rgba(20,60,95,0.22)");
    grade.addColorStop(0.5, "rgba(0,0,0,0)");
    grade.addColorStop(1, "rgba(150,80,15,0.2)");
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = grade;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.globalCompositeOperation = "source-over";
    const vg = ctx.createRadialGradient(dx + dw / 2, dy + dh / 2, Math.min(dw, dh) * 0.35, dx + dw / 2, dy + dh / 2, Math.max(dw, dh) * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = vg;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.restore();
    // BINGKAI SINEMATIK: garis emas tipis + bracket sudut + garis luar sekunder
    ctx.strokeStyle = "rgba(232,197,111,0.85)";
    ctx.lineWidth = Math.max(1.5, w * 0.0022);
    ctx.strokeRect(dx, dy, dw, dh);
    const bl = Math.min(dw, dh) * 0.06;
    ctx.lineWidth = Math.max(2.5, w * 0.0038);
    const sudut: Array<[number, number, number, number]> = [
      [dx, dy, 1, 1],
      [dx + dw, dy, -1, 1],
      [dx, dy + dh, 1, -1],
      [dx + dw, dy + dh, -1, -1],
    ];
    sudut.forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x + sx * bl, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + sy * bl);
      ctx.stroke();
    });
    ctx.strokeStyle = "rgba(232,197,111,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(dx - w * 0.012, dy - w * 0.012, dw + w * 0.024, dh + w * 0.024);
    // fade gelap ke bawah — zona judul template (judul di bagian bawah)
    const fade = ctx.createLinearGradient(0, dy + dh, 0, h);
    fade.addColorStop(0, "rgba(4,6,10,0)");
    fade.addColorStop(1, "rgba(4,6,10,0.92)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, dy + dh, w, h - (dy + dh));
    // grain film halus di seluruh kanvas
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 900; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 1.4, 1.4);
    ctx.globalAlpha = 1;
    return c.toDataURL("image/jpeg", 0.92);
  } catch {
    return null;
  }
}
