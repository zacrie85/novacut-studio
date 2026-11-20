// NOVACUT Studio v1.0.22 - BINGKAI JUDUL (10 gaya) — digambar di belakang
// tulisan judul di dalam video. Interior bingkai SELALU KOSONG (transparan):
// hanya bagian luarnya saja yang digambar, sehingga video terlihat di dalamnya
// dan tulisan judul duduk di atasnya.
//
// 6 gaya pertama mengikuti gambar referensi pengguna (FRAME 1-6):
//   t1 Dinamis Miring, t2 Merah Biru, t3 Berlian Biru, t4 Mewah Emas,
//   t5 Emas Mahkota, t6 Kartun Oranye.
// 4 gaya terakhir versi futuristik buatan NOVACUT:
//   f1 HUD Cyber, f2 Neon Ungu, f3 Panel Sci-Fi, f4 Tech Grid.
// v1.0.25 — 6 gaya baru dari 5 gambar referensi terbaru pengguna:
//   t7 Pita Ganda TV (REF 1: pita merah PART + pita biru JUDUL, tulisan ikut
//      miring mengikuti bentuk pita — dibuat SAMA PERSIS dengan referensi),
//   t8 Banner Hitam Merah (REF 2), t9 Bola Glossy Biru & t10 Bola Glossy Merah
//      (REF 3 + varian warnanya), t11 Pita Oranye 3D (REF 4),
//   t12 Neon Biru-Pink (REF 5).
//
// Dipakai bersama oleh: pratinjau langsung menu Teks, pratinjau timeline,
// mesin kilat & mesin Turbo WebCodecs — satu jalur gambar (WYSIWYG).

export type TitleFrameId = "" | "t1" | "t2" | "t3" | "t4" | "t5" | "t6" | "t7" | "t8" | "t9" | "t10" | "t11" | "t12" | "f1" | "f2" | "f3" | "f4";

export interface TitleFrameMeta {
  id: TitleFrameId;
  label: string;
  desc: string;
}

/** Daftar lengkap (urutan = urutan tampil di menu). "" = tanpa bingkai. */
export const TITLE_FRAMES: TitleFrameMeta[] = [
  { id: "", label: "Tanpa Bingkai", desc: "Tulisan judul polos tanpa bingkai" },
  { id: "t1", label: "Dinamis Miring", desc: "Gaya FRAME 1: banner miring dengan lapisan biru & pink" },
  { id: "t2", label: "Merah Biru", desc: "Gaya FRAME 2: bingkai merah tebal + bar biru gradien atas & bawah" },
  { id: "t3", label: "Berlian Biru", desc: "Gaya FRAME 3: banner rounded + ikon belah ketupat biru di kiri" },
  { id: "t4", label: "Mewah Emas", desc: "Gaya FRAME 4: garis emas ganda + ornamen belah ketupat & manik emas" },
  { id: "t5", label: "Emas Mahkota", desc: "Gaya FRAME 5: bingkai emas klasik dengan mahkota di tengah atas" },
  { id: "t6", label: "Kartun Oranye", desc: "Gaya FRAME 6: garis hitam tebal + bayangan oranye + aksen lucu" },
  { id: "t7", label: "Pita Ganda TV", desc: "REF BARU 1: pita merah (PART) + pita biru (JUDUL) miring gaya TV — tulisan ikut miring mengikuti bentuk pita" },
  { id: "t8", label: "Banner Hitam Merah", desc: "REF BARU 2: lingkaran gelap + banner hitam aksen merah mencolok" },
  { id: "t9", label: "Bola Glossy Biru", desc: "REF BARU 3: bola glossy biru + banner metalik berbingkai silver" },
  { id: "t10", label: "Bola Glossy Merah", desc: "REF BARU 3 varian merah: bola glossy merah + banner metalik aksen kuning" },
  { id: "t11", label: "Pita Oranye 3D", desc: "REF BARU 4: pita oranye melengkung 3D, tepi ungu & ekor lipat" },
  { id: "t12", label: "Neon Biru-Pink", desc: "REF BARU 5: bingkai neon biru menyala dengan gradasi pink di bawah" },
  { id: "f1", label: "HUD Cyber", desc: "Futuristik: sudut potong 45° dengan bracket cyan menyala" },
  { id: "f2", label: "Neon Ungu", desc: "Futuristik: bingkai neon ungu-magenta menyala + sirkuit samping" },
  { id: "f3", label: "Panel Sci-Fi", desc: "Futuristik: panel sudut miring ala nameplate sci-fi aksen teal" },
  { id: "f4", label: "Tech Grid", desc: "Futuristik: garis ganda biru-putih + kotak sudut & segitiga penunjuk" },
];

/** Validasi id bingkai dari setelan tersimpan (anti nilai aneh) */
export function saneTitleFrame(v: unknown): TitleFrameId {
  if (typeof v !== "string") return "";
  return (TITLE_FRAMES.some((f) => f.id === v) ? v : "") as TitleFrameId;
}

/** skala ukuran bingkai (0.6–2.5); 1 = otomatis ikut ukuran tulisan */
export function saneFrameScale(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n) || n <= 0) return 1;
  return Math.max(0.6, Math.min(2.5, n));
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.min(w, h) / 2)));
}

/** jalur paralelogram miring (sk = geser horizontal sudut atas) */
function skewPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sk: number) {
  ctx.beginPath();
  ctx.moveTo(x + sk, y);
  ctx.lineTo(x + w + sk * 0.35, y);
  ctx.lineTo(x + w - sk, y + h);
  ctx.lineTo(x - sk * 0.35, y + h);
  ctx.closePath();
}

/** belah ketupat (persegi diputar 45°) di sekitar titik pusat */
function diamondPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
}

/** segiempat sudut-potong 45° (chamfer) */
function chamferPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: number) {
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}

function goldGrad(ctx: CanvasRenderingContext2D, x: number, y: number, h: number): CanvasGradient {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#7c4a12");
  g.addColorStop(0.28, "#f7d98c");
  g.addColorStop(0.52, "#c9922e");
  g.addColorStop(0.78, "#ffe9a8");
  g.addColorStop(1, "#8a5a1e");
  return g;
}

/** v1.0.25: paralelogram bersisi vertikal miring seragam — sudut atas digeser
 * kanan sejauh sk (meniru pita TV miring pada referensi). */
function paraPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sk: number) {
  ctx.beginPath();
  ctx.moveTo(x + sk, y);
  ctx.lineTo(x + w + sk, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

/** v1.0.25: bintang kilau 4 titik (sisi cekung) di sekitar titik pusat */
function sparklePath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const q = r * 0.18;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx + q, cy - q, cx + r, cy);
  ctx.quadraticCurveTo(cx + q, cy + q, cx, cy + r);
  ctx.quadraticCurveTo(cx - q, cy + q, cx - r, cy);
  ctx.quadraticCurveTo(cx - q, cy - q, cx, cy - r);
  ctx.closePath();
}

/** v1.0.25: ruang TAMBAHAN di ATAS kotak bingkai (fraksi tinggi kotak) —
 * dipakai engine menjepit posisi teks agar pita PART gaya "t7" (yang digambar
 * di atas pita judul) tidak terpotong tepi layar. 0 = tanpa ruang ekstra. */
export function frameTopExtraFrac(id: TitleFrameId): number {
  return id === "t7" ? 0.75 : 0;
}

/** v1.0.25: kemiringan tulisan mengikuti BENTUK bingkai (permintaan pengguna
 * untuk REF 1). Negatif = condong ke kanan ala italic, segaris dengan kemiringan
 * pita gaya "t7". 0 = tegak seperti biasa. */
export function titleFrameTextSkew(id: TitleFrameId): number {
  return id === "t7" ? -0.22 : 0;
}

/** v1.0.25: opsi gambar bingkai (teks part gaya komposit / mode pita saja) */
export interface TitleFrameOpts {
  /** teks part/episode untuk slot pita merah atas (hanya gaya komposit "t7") */
  partLine?: string;
  /** gambar teks part pada titik yang sudah dihitung — (ctx, cx, cy, lebarMaks, ukuranFontPx).
   * Isi teksnya digambar pemanggil (font/warna/wrap dari menu Teks) sehingga
   * bingkai tetap tidak memuat teks statis. */
  drawPart?: (ctx: CanvasRenderingContext2D, cx: number, cy: number, maxW: number, fontPx: number) => void;
  /** gaya "t7" versi PITA MERAH SAJA — dipakai bila bingkai dipilih untuk teks part */
  partOnly?: boolean;
}

/**
 * Gambar bingkai judul. (x,y,w,h) = kotak bingkai; ukuran garis & ornamen
 * mengikuti h (tinggi kotak) agar pas pada semua ukuran tulisan.
 * Interior TIDAK diisi — video tetap terlihat di dalam bingkai.
 */
export function drawTitleFrame(ctx: CanvasRenderingContext2D, id: TitleFrameId, x: number, y: number, w: number, h: number, opts?: TitleFrameOpts) {
  if (!id) return;
  const lw = Math.max(1, h * 0.045); // lebar garis dasar
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  switch (id) {
    // ====== GAYA REFERENSI ======
    case "t1": {
      // FRAME 1 — banner miring + lapisan biru (kiri-atas) & pink (kanan-bawah)
      const sk = h * 0.16;
      const ox = h * 0.1;
      const oy = h * 0.12;
      ctx.fillStyle = "rgba(96,165,250,0.92)";
      skewPath(ctx, x - ox * 0.4, y - oy, w, h, sk);
      ctx.fill();
      ctx.fillStyle = "rgba(244,114,182,0.92)";
      skewPath(ctx, x + ox * 0.4, y + oy, w, h, sk);
      ctx.fill();
      ctx.strokeStyle = "rgba(10,10,14,0.9)";
      ctx.lineWidth = lw;
      skewPath(ctx, x, y, w, h, sk);
      ctx.stroke();
      break;
    }
    case "t2": {
      // FRAME 2 — bingkai merah tebal + bar biru gradien atas & bawah
      const bh = h * 0.2;
      const bg = ctx.createLinearGradient(x, y, x + w, y + bh);
      bg.addColorStop(0, "#1e3fa8");
      bg.addColorStop(0.5, "#2563eb");
      bg.addColorStop(1, "#4f7cff");
      ctx.fillStyle = bg;
      ctx.fillRect(x + w * 0.02, y - bh * 0.55, w * 0.96, bh);
      ctx.fillRect(x + w * 0.02, y + h - bh * 0.45, w * 0.96, bh);
      // bayangan bingkai merah gelap (kanan-bawah)
      ctx.strokeStyle = "rgba(127,29,29,0.85)";
      ctx.lineWidth = lw * 3;
      ctx.strokeRect(x + lw * 1.6, y + lw * 1.6, w, h);
      // bingkai merah utama (gradien)
      const rg = ctx.createLinearGradient(x, y, x + w, y + h);
      rg.addColorStop(0, "#b91c1c");
      rg.addColorStop(0.5, "#ef4444");
      rg.addColorStop(1, "#dc2626");
      ctx.strokeStyle = rg;
      ctx.lineWidth = lw * 3;
      ctx.strokeRect(x, y, w, h);
      break;
    }
    case "t3": {
      // FRAME 3 — banner rounded terang + belah ketupat biru gradien di kiri
      ctx.strokeStyle = "rgba(229,231,235,0.95)";
      ctx.lineWidth = lw * 1.2;
      rr(ctx, x, y, w, h, h * 0.26);
      ctx.stroke();
      const d = h * 1.05; // ukuran belah ketupat
      const cx = x + h * 0.06;
      const cy = y + h / 2;
      // garis tepi biru tua (offset) ala referensi
      ctx.save();
      ctx.translate(cx + lw * 1.2, cy + lw * 1.2);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = "rgba(30,58,138,0.9)";
      ctx.lineWidth = lw * 1.1;
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.18);
      ctx.stroke();
      ctx.restore();
      // belah ketupat biru gradien (ornamen terisi)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      const dg = ctx.createLinearGradient(0, -d / 2, 0, d / 2);
      dg.addColorStop(0, "#3b82f6");
      dg.addColorStop(1, "#1d4ed8");
      ctx.fillStyle = dg;
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.18);
      ctx.fill();
      ctx.strokeStyle = "rgba(191,219,254,0.9)";
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
      ctx.restore();
      break;
    }
    case "t4": {
      // FRAME 4 — pil emas garis ganda + belah ketupat emas & manik
      const g = goldGrad(ctx, x, y, h);
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.1;
      rr(ctx, x, y, w, h, h / 2);
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = lw * 0.6;
      rr(ctx, x + h * 0.14, y + h * 0.14, w - h * 0.28, h - h * 0.28, (h - h * 0.28) / 2);
      ctx.stroke();
      ctx.restore();
      // ornamen belah ketupat di kiri + manik emas atas & bawah
      const cx = x + h * 0.3;
      const cy = y + h / 2;
      const d = h * 0.4;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "rgba(20,16,8,0.4)";
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.12);
      ctx.fill();
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 0.9;
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.12);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#d99a2b";
      ctx.strokeStyle = "#7c4a12";
      ctx.lineWidth = lw * 0.35;
      for (const by of [cy - d * 0.94, cy + d * 0.94]) {
        ctx.beginPath();
        ctx.arc(cx, by, h * 0.055, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case "t5": {
      // FRAME 5 — bingkai emas klasik + mahkota ornamen di tengah atas
      const g = goldGrad(ctx, x, y, h);
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.25;
      rr(ctx, x, y, w, h, h * 0.2);
      ctx.stroke();
      // mahkota: lengkung tiga (tengah runcing, sisi bulat) — hanya garis
      const cw = h * 0.42;
      const cx = x + w / 2;
      const ch = h * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx - cw / 2, y + lw * 0.6);
      ctx.arc(cx - cw * 0.28, y - ch * 0.28, cw * 0.22, Math.PI * 0.9, Math.PI * 1.9);
      ctx.quadraticCurveTo(cx - cw * 0.16, y - ch * 0.55, cx, y - ch);
      ctx.quadraticCurveTo(cx + cw * 0.16, y - ch * 0.55, cx + cw * 0.28, y - ch * 0.28);
      ctx.arc(cx + cw * 0.28, y - ch * 0.28, cw * 0.22, Math.PI * 1.1, Math.PI * 0.1);
      ctx.lineTo(cx + cw / 2, y + lw * 0.6);
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.1;
      ctx.stroke();
      break;
    }
    case "t6": {
      // FRAME 6 — garis hitam tebal + bayangan oranye kiri-bawah + aksen lucu
      // bayangan: garis oranye tebal mengikuti tepi kiri & bawah saja
      // (interior tetap kosong — tidak memenuhi bagian dalam bingkai)
      ctx.strokeStyle = "rgba(249,168,37,0.95)";
      ctx.lineWidth = lw * 2.4;
      const so = h * 0.1; // geser bayangan ke kiri-bawah
      const r = h * 0.3;
      ctx.beginPath();
      ctx.moveTo(x - so, y + h * 0.42);
      ctx.quadraticCurveTo(x - so, y + h + so * 0.9, x - so + r, y + h + so * 0.9);
      ctx.lineTo(x + w - r, y + h + so * 0.9);
      ctx.quadraticCurveTo(x + w + so * 0.4, y + h + so * 0.9, x + w + so * 0.4, y + h + so * 0.9 - r);
      ctx.stroke();
      ctx.strokeStyle = "rgba(12,12,16,0.94)";
      ctx.lineWidth = lw * 2;
      rr(ctx, x, y, w, h, h * 0.3);
      ctx.stroke();
      // aksen kiri-atas: lingkaran putih
      ctx.beginPath();
      ctx.arc(x + h * 0.04, y + h * 0.03, h * 0.13, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = lw * 0.9;
      ctx.strokeStyle = "rgba(12,12,16,0.94)";
      ctx.stroke();
      // aksen kanan-atas: belah ketupat oranye + kotak kecil
      const dx = x + w - h * 0.02;
      const dy = y + h * 0.02;
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(Math.PI / 4);
      const s = h * 0.22;
      ctx.fillStyle = "#f59e0b";
      rr(ctx, -s / 2, -s / 2, s, s, s * 0.15);
      ctx.fill();
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
      ctx.restore();
      const sq = h * 0.13;
      ctx.fillStyle = "#f59e0b";
      rr(ctx, dx - sq / 2, dy + h * 0.2, sq, sq, sq * 0.2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    // ====== VERSI FUTURISTIK ======
    case "f1": {
      // HUD Cyber — chamfer 45° + bracket cyan menyala + titik & garis tick
      ctx.shadowColor = "rgba(34,211,238,0.9)";
      ctx.shadowBlur = h * 0.22;
      ctx.strokeStyle = "rgba(34,211,238,0.9)";
      ctx.lineWidth = lw;
      chamferPath(ctx, x, y, w, h, h * 0.3);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // bracket sudut lebih tebal & terang
      const c = h * 0.3;
      const bl = h * 0.32;
      ctx.strokeStyle = "#a5f3fc";
      ctx.lineWidth = lw * 1.8;
      ctx.beginPath();
      ctx.moveTo(x + c, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + c);
      ctx.moveTo(x + w - c, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - c);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w - bl, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + bl * 0.6);
      ctx.moveTo(x, y + h - bl * 0.6);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + bl, y + h);
      ctx.stroke();
      // titik sudut chamfer
      ctx.fillStyle = "#67e8f9";
      for (const [px, py] of [[x + c, y], [x + w - c, y], [x, y + c], [x + w, y + h - c], [x + w - c, y + h], [x + c, y + h], [x + w, y + c], [x, y + h - c]] as const) {
        ctx.beginPath();
        ctx.arc(px, py, h * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }
      // tick teknis di tengah atas
      ctx.strokeStyle = "rgba(103,232,249,0.85)";
      ctx.lineWidth = lw * 0.8;
      for (let i = -2; i <= 2; i++) {
        const tx = x + w / 2 + i * h * 0.16;
        const up = i % 2 === 0;
        ctx.beginPath();
        ctx.moveTo(tx, up ? y - h * 0.1 : y - h * 0.05);
        ctx.lineTo(tx, y - h * 0.02);
        ctx.stroke();
      }
      break;
    }
    case "f2": {
      // Neon Ungu — bingkai menyala ungu-magenta + sirkuit kiri/kanan
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, "#d946ef");
      g.addColorStop(0.5, "#a855f7");
      g.addColorStop(1, "#7c3aed");
      ctx.shadowColor = "rgba(217,70,239,0.85)";
      ctx.shadowBlur = h * 0.25;
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.3;
      rr(ctx, x, y, w, h, h * 0.16);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // garis dalam tipis
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = lw * 0.6;
      rr(ctx, x + h * 0.12, y + h * 0.12, w - h * 0.24, h - h * 0.24, h * 0.1);
      ctx.stroke();
      ctx.restore();
      // sirkuit keluar dari sisi kiri & kanan
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 0.9;
      const my = y + h / 2;
      ctx.beginPath();
      ctx.moveTo(x - h * 0.2, my);
      ctx.lineTo(x, my);
      ctx.moveTo(x + w, my);
      ctx.lineTo(x + w + h * 0.2, my);
      ctx.stroke();
      ctx.fillStyle = "#e879f9";
      ctx.fillRect(x - h * 0.26, my - h * 0.05, h * 0.07, h * 0.1);
      ctx.fillRect(x + w + h * 0.19, my - h * 0.05, h * 0.07, h * 0.1);
      // dua lingkaran kecil pada bingkai
      ctx.strokeStyle = "#f0abfc";
      ctx.lineWidth = lw * 0.7;
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y, h * 0.05, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h, h * 0.05, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "f3": {
      // Panel Sci-Fi — nameplate sudut miring kiri + aksen teal
      const c1 = h * 0.5;
      const c2 = h * 0.18;
      ctx.strokeStyle = "rgba(45,212,191,0.95)";
      ctx.lineWidth = lw * 1.2;
      ctx.beginPath();
      ctx.moveTo(x + c1, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + c2, y + h);
      ctx.lineTo(x, y + h - c2);
      ctx.lineTo(x, y + c1 * 0.5);
      ctx.closePath();
      ctx.stroke();
      // garis sekunder putih di dalam
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = "#ccfbf1";
      ctx.lineWidth = lw * 0.6;
      ctx.beginPath();
      ctx.moveTo(x + c1 + h * 0.1, y + h * 0.12);
      ctx.lineTo(x + w - h * 0.12, y + h * 0.12);
      ctx.lineTo(x + w - h * 0.12, y + h - h * 0.12);
      ctx.lineTo(x + c2 + h * 0.08, y + h - h * 0.12);
      ctx.stroke();
      ctx.restore();
      // penunjuk segitiga di kiri
      ctx.fillStyle = "#2dd4bf";
      const px = x + h * 0.16;
      const py = y + h / 2;
      const ps = h * 0.12;
      ctx.beginPath();
      ctx.moveTo(px, py - ps);
      ctx.lineTo(px + ps * 1.4, py);
      ctx.lineTo(px, py + ps);
      ctx.closePath();
      ctx.fill();
      // tiga garis pendek di bawah
      ctx.strokeStyle = "rgba(45,212,191,0.8)";
      ctx.lineWidth = lw * 0.7;
      for (let i = 0; i < 3; i++) {
        const lx = x + w - h * 0.55 + i * h * 0.18;
        ctx.beginPath();
        ctx.moveTo(lx, y + h + h * 0.06);
        ctx.lineTo(lx + h * 0.1, y + h + h * 0.06);
        ctx.stroke();
      }
      break;
    }
    case "f4": {
      // Tech Grid — garis luar putih-biru + garis dalam biru putus-putus + kotak sudut
      ctx.strokeStyle = "rgba(191,219,254,0.9)";
      ctx.lineWidth = lw * 0.7;
      ctx.strokeRect(x, y, w, h);
      ctx.save();
      ctx.setLineDash([h * 0.22, h * 0.12]);
      ctx.strokeStyle = "rgba(59,130,246,0.95)";
      ctx.lineWidth = lw * 1.2;
      ctx.strokeRect(x + h * 0.13, y + h * 0.13, w - h * 0.26, h - h * 0.26);
      ctx.restore();
      // kotak sudut terisi
      ctx.fillStyle = "#3b82f6";
      const s = h * 0.12;
      for (const [px, py] of [[x, y], [x + w - s, y], [x, y + h - s], [x + w - s, y + h - s]] as const) {
        rr(ctx, px, py, s, s, s * 0.25);
        ctx.fill();
      }
      // segitiga penunjuk atas & bawah
      ctx.fillStyle = "#93c5fd";
      const cx = x + w / 2;
      const ts = h * 0.09;
      ctx.beginPath();
      ctx.moveTo(cx, y - ts);
      ctx.lineTo(cx + ts, y - ts * 0.1);
      ctx.lineTo(cx - ts, y - ts * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, y + h + ts);
      ctx.lineTo(cx + ts, y + h + ts * 0.1);
      ctx.lineTo(cx - ts, y + h + ts * 0.1);
      ctx.closePath();
      ctx.fill();
      break;
    }

    // ===== v1.0.25 — 5 GAMBAR REFERENSI BARU DARI PENGGUNA =====
    case "t7": {
      // REF 1 — PITA GANDA TV (dibuat SAMA PERSIS mengikuti referensi):
      // pita merah (PART) di atas + pita biru besar (JUDUL) di bawah, keduanya
      // paralelogram miring searah; strip putih diagonal pada pita biru, lipatan
      // gelap, ekor lipat kanan & kilau kuning 4 titik. Tulisan judul & part
      // DIMIRINGKAN mengikuti bentuk pita (titleFrameTextSkew). Interior pita =
      // tempat tulisan (kosong — teks digambar terpisah di atasnya).
      const lw2 = Math.max(1.2, h * 0.055);
      const sk = h * 0.22; // geser sudut atas pita biru (kemiringan pita)
      ctx.lineJoin = "round";
      if (opts?.partOnly) {
        // dipakai sebagai BINGKAI TEKS PART: hanya pita merah di sekeliling kotak
        const skp = sk * 0.6;
        paraPath(ctx, x, y, w, h, skp);
        const rg = ctx.createLinearGradient(x, y, x, y + h);
        rg.addColorStop(0, "#ff7440");
        rg.addColorStop(1, "#e63012");
        ctx.fillStyle = rg;
        ctx.fill();
        ctx.save();
        paraPath(ctx, x, y, w, h, skp);
        ctx.clip();
        ctx.fillStyle = "rgba(122,18,4,0.5)";
        ctx.fillRect(x, y + h * 0.8, w + skp * 2, h * 0.2);
        ctx.restore();
        ctx.strokeStyle = "#141414";
        ctx.lineWidth = lw2;
        ctx.stroke();
        break;
      }
      const rh = h * 0.55; // tinggi pita merah (PART)
      const gap = h * 0.12;
      const skR = sk * (rh / h); // kemiringan paralel dengan pita biru
      const rx = x + w * 0.05;
      const rw = w * 0.6; // pita part lebih pendek, rata kiri (sesuai referensi)
      const ry = y - gap - rh;
      // pita merah (PART)
      paraPath(ctx, rx, ry, rw, rh, skR);
      const rg = ctx.createLinearGradient(rx, ry, rx, ry + rh);
      rg.addColorStop(0, "#ff7440");
      rg.addColorStop(1, "#e63012");
      ctx.fillStyle = rg;
      ctx.fill();
      ctx.save();
      paraPath(ctx, rx, ry, rw, rh, skR);
      ctx.clip();
      ctx.fillStyle = "rgba(122,18,4,0.5)";
      ctx.fillRect(rx, ry + rh * 0.78, rw + skR * 2, rh * 0.22);
      ctx.restore();
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = lw2;
      ctx.stroke();
      // pita biru (JUDUL) = kotak bingkai utama
      paraPath(ctx, x, y, w, h, sk);
      const bg = ctx.createLinearGradient(x, y, x, y + h);
      bg.addColorStop(0, "#9aa1f2");
      bg.addColorStop(1, "#6d6ee0");
      ctx.fillStyle = bg;
      ctx.fill();
      // strip putih diagonal di kiri + bayangan tepi bawah (khas referensi)
      ctx.save();
      paraPath(ctx, x, y, w, h, sk);
      ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath();
      ctx.moveTo(x + w * 0.08 + sk, y);
      ctx.lineTo(x + w * 0.13 + sk, y);
      ctx.lineTo(x + w * 0.13, y + h);
      ctx.lineTo(x + w * 0.08, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(28,28,92,0.55)";
      ctx.fillRect(x, y + h * 0.84, w + sk * 2, h * 0.16);
      ctx.restore();
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = lw2;
      ctx.stroke();
      // ekor lipat biru gelap di ujung kanan-bawah pita biru
      ctx.beginPath();
      ctx.moveTo(x + w - sk * 0.35, y + h);
      ctx.lineTo(x + w + h * 0.1, y + h);
      ctx.lineTo(x + w - sk * 0.35, y + h + h * 0.16);
      ctx.closePath();
      ctx.fillStyle = "#2c2c78";
      ctx.fill();
      ctx.lineWidth = lw2 * 0.75;
      ctx.stroke();
      // teks PART di pita merah — DIMIRINGKAN mengikuti pita
      if (opts?.partLine && opts.drawPart) {
        const pcx = rx + (rw + skR) / 2;
        const pcy = ry + rh / 2;
        ctx.save();
        ctx.translate(pcx, pcy);
        ctx.transform(1, 0, titleFrameTextSkew("t7"), 1, 0, 0);
        ctx.translate(-pcx, -pcy);
        opts.drawPart(ctx, pcx, pcy, rw * 0.9, rh * 0.56);
        ctx.restore();
      }
      // kilau kuning 4 titik di atas kanan pita merah
      sparklePath(ctx, x + w * 0.72 + skR, y - gap - rh * 0.78, h * 0.13);
      ctx.fillStyle = "#ffd94a";
      ctx.fill();
      break;
    }
    case "t8": {
      // REF 2 — lingkaran gelap di kiri + banner hitam mengkilap dengan aksen
      // merah mencolok di belakang banner (kiri-atas & kanan-bawah).
      const lw2 = Math.max(1.2, h * 0.05);
      const sk = h * 0.1;
      ctx.lineJoin = "round";
      // aksen merah DI BELAKANG banner
      ctx.fillStyle = "#e0231f";
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = lw2 * 0.8;
      paraPath(ctx, x + h * 0.36, y - h * 0.12, w * 0.34, h * 0.36, sk);
      ctx.fill();
      ctx.stroke();
      paraPath(ctx, x + w * 0.6, y + h * 0.7, w * 0.32, h * 0.36, sk);
      ctx.fill();
      ctx.stroke();
      // banner hitam (interior = tempat tulisan)
      const bx = x + h * 0.5;
      const bw = w - (bx - x) + h * 0.04;
      paraPath(ctx, bx, y, bw, h, sk);
      const bg = ctx.createLinearGradient(x, y, x, y + h);
      bg.addColorStop(0, "#3d3d3d");
      bg.addColorStop(0.45, "#161616");
      bg.addColorStop(1, "#050505");
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.save();
      paraPath(ctx, bx, y, bw, h, sk);
      ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,0.13)";
      ctx.fillRect(x, y, w + h, h * 0.24);
      ctx.restore();
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = lw2;
      ctx.stroke();
      // lingkaran gelap di kiri (medali/logo) menimpa awal banner
      const ccx = x + h * 0.44;
      const ccy = y + h / 2;
      const cr = h * 0.42;
      const cg = ctx.createRadialGradient(ccx - cr * 0.35, ccy - cr * 0.4, cr * 0.1, ccx, ccy, cr);
      cg.addColorStop(0, "#4d4d4d");
      cg.addColorStop(0.7, "#1d1d1d");
      cg.addColorStop(1, "#0a0a0a");
      ctx.beginPath();
      ctx.arc(ccx, ccy, cr, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = lw2 * 1.3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ccx, ccy, cr * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = lw2 * 0.55;
      ctx.stroke();
      break;
    }
    case "t9":
    case "t10": {
      // REF 3 — bola glossy + banner metalik berbingkai silver.
      // t9 = varian biru; t10 = varian merah dengan aksen kuning (kedua varian
      // tampak pada satu gambar referensi pengguna).
      const blue = id === "t9";
      const lw2 = Math.max(1.2, h * 0.045);
      const sk = h * 0.08;
      ctx.lineJoin = "round";
      const bx = x + h * 0.56;
      const bw = w - (bx - x) + h * 0.04;
      // sirip segitiga di pangkal banner (atas & bawah)
      ctx.fillStyle = blue ? "#0b3d91" : "#ffb21a";
      ctx.strokeStyle = "#141414";
      ctx.lineWidth = lw2 * 0.7;
      ctx.beginPath();
      ctx.moveTo(bx + h * 0.02, y + h * 0.06);
      ctx.lineTo(bx + h * 0.32, y + h * 0.02);
      ctx.lineTo(bx + h * 0.14, y + h * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx + h * 0.0, y + h * 0.94);
      ctx.lineTo(bx + h * 0.32, y + h * 0.99);
      ctx.lineTo(bx + h * 0.12, y + h * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // banner metalik (interior = tempat tulisan)
      paraPath(ctx, bx, y + h * 0.05, bw, h * 0.9, sk);
      const bgr = ctx.createLinearGradient(bx, y, bx, y + h);
      if (blue) {
        bgr.addColorStop(0, "#3fb3ec");
        bgr.addColorStop(0.55, "#1b7fc4");
        bgr.addColorStop(1, "#0c4f8e");
      } else {
        bgr.addColorStop(0, "#ef4650");
        bgr.addColorStop(0.55, "#c01822");
        bgr.addColorStop(1, "#7c0a12");
      }
      ctx.fillStyle = bgr;
      ctx.fill();
      ctx.save();
      paraPath(ctx, bx, y + h * 0.05, bw, h * 0.9, sk);
      ctx.clip();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(bx, y + h * 0.13, bw + sk * 2, h * 0.15);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(bx, y + h * 0.36, bw + sk * 2, h * 0.08);
      ctx.restore();
      // bingkai metalik silver + garis tepi gelap
      const sg = ctx.createLinearGradient(bx, y, bx, y + h);
      sg.addColorStop(0, "#f8fafc");
      sg.addColorStop(0.5, "#a8b3c4");
      sg.addColorStop(1, "#e2e8f0");
      ctx.strokeStyle = sg;
      ctx.lineWidth = lw2 * 1.15;
      paraPath(ctx, bx, y + h * 0.05, bw, h * 0.9, sk);
      ctx.stroke();
      ctx.strokeStyle = "rgba(20,20,30,0.85)";
      ctx.lineWidth = lw2 * 0.45;
      paraPath(ctx, bx, y + h * 0.05, bw, h * 0.9, sk);
      ctx.stroke();
      // bola glossy (medali kiri)
      const ccx = x + h * 0.44;
      const ccy = y + h / 2;
      const cr = h * 0.42;
      const cg = ctx.createRadialGradient(ccx - cr * 0.38, ccy - cr * 0.42, cr * 0.08, ccx, ccy, cr);
      if (blue) {
        cg.addColorStop(0, "#bfe9ff");
        cg.addColorStop(0.35, "#4db1ee");
        cg.addColorStop(0.8, "#1b64b8");
        cg.addColorStop(1, "#0a2f66");
      } else {
        cg.addColorStop(0, "#ffd2d2");
        cg.addColorStop(0.35, "#f05a5a");
        cg.addColorStop(0.8, "#b81414");
        cg.addColorStop(1, "#5e0508");
      }
      ctx.beginPath();
      ctx.arc(ccx, ccy, cr, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(ccx - cr * 0.38, ccy - cr * 0.42, cr * 0.26, cr * 0.15, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "rgba(10,10,20,0.75)";
      ctx.lineWidth = lw2 * 0.8;
      ctx.beginPath();
      ctx.arc(ccx, ccy, cr, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "t11": {
      // REF 4 — pita oranye melengkung 3D: band melengkung ke bawah, tepi ungu
      // tebal, ekor lipat gelap bersikut V di kiri & kanan.
      const lw2 = Math.max(1.2, h * 0.06);
      const bow = h * 0.13;
      const top = y + h * 0.12;
      const bot = y + h * 0.8;
      ctx.lineJoin = "round";
      // ekor lipat kiri & kanan (di belakang pita utama)
      ctx.fillStyle = "#b35c07";
      ctx.strokeStyle = "#3b1f5e";
      ctx.lineWidth = lw2;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.02, top + h * 0.05);
      ctx.lineTo(x - h * 0.15, top + h * 0.14);
      ctx.lineTo(x - h * 0.06, top + h * 0.34);
      ctx.lineTo(x - h * 0.15, top + h * 0.54);
      ctx.lineTo(x + w * 0.02, bot - h * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w * 0.98, top + h * 0.05);
      ctx.lineTo(x + w + h * 0.15, top + h * 0.14);
      ctx.lineTo(x + w + h * 0.06, top + h * 0.34);
      ctx.lineTo(x + w + h * 0.15, top + h * 0.54);
      ctx.lineTo(x + w * 0.98, bot - h * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // pita utama melengkung (interior = tempat tulisan)
      const band = () => {
        ctx.beginPath();
        ctx.moveTo(x + w * 0.01, top);
        ctx.quadraticCurveTo(x + w / 2, top + bow * 2, x + w * 0.99, top);
        ctx.lineTo(x + w * 0.99, bot);
        ctx.quadraticCurveTo(x + w / 2, bot + bow * 2, x + w * 0.01, bot);
        ctx.closePath();
      };
      band();
      const og = ctx.createLinearGradient(x, top, x, bot + bow * 2);
      og.addColorStop(0, "#ffb445");
      og.addColorStop(0.55, "#f58a0c");
      og.addColorStop(1, "#d96f04");
      ctx.fillStyle = og;
      ctx.fill();
      ctx.save();
      band();
      ctx.clip();
      ctx.fillStyle = "rgba(255,224,150,0.5)";
      ctx.beginPath();
      ctx.moveTo(x + w * 0.01, top);
      ctx.quadraticCurveTo(x + w / 2, top + bow * 2, x + w * 0.99, top);
      ctx.lineTo(x + w * 0.99, top + h * 0.09);
      ctx.quadraticCurveTo(x + w / 2, top + bow * 2 + h * 0.09, x + w * 0.01, top + h * 0.09);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "#3b1f5e";
      ctx.lineWidth = lw2 * 1.5;
      band();
      ctx.stroke();
      break;
    }
    case "t12": {
      // REF 5 — bingkai neon: garis biru menyala dengan gradasi pink-magenta di
      // tepi bawah + garis dalam tipis. Interior SEPENUHNYA kosong/transparan.
      const lw2 = Math.max(1.2, h * 0.05);
      ctx.lineJoin = "round";
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#41e4ff");
      g.addColorStop(0.6, "#2f7bff");
      g.addColorStop(1, "#ff44c9");
      ctx.shadowColor = "rgba(56,180,255,0.9)";
      ctx.shadowBlur = h * 0.3;
      ctx.strokeStyle = g;
      ctx.lineWidth = lw2 * 1.5;
      rr(ctx, x, y, w, h, h * 0.07);
      ctx.stroke();
      // garis bawah pink lebih intens (khas referensi)
      ctx.shadowColor = "rgba(255,68,201,0.9)";
      ctx.strokeStyle = "#ff5ad4";
      ctx.lineWidth = lw2 * 1.9;
      ctx.beginPath();
      ctx.moveTo(x + h * 0.1, y + h);
      ctx.lineTo(x + w - h * 0.1, y + h);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = lw2 * 0.6;
      ctx.strokeStyle = g;
      rr(ctx, x + h * 0.1, y + h * 0.1, w - h * 0.2, h - h * 0.2, h * 0.05);
      ctx.stroke();
      ctx.restore();
      break;
    }
  }
  ctx.restore();
}
