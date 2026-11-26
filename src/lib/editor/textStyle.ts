// NOVACUT Studio - Gaya tulisan otomatis (ukuran huruf & font) untuk
// judul/deskripsi/part — dipakai menu Teks, export playlist & tombol tambah teks.
// Disimpan di localStorage agar pengaturan bertahan setelah aplikasi ditutup.

import type { TextsConfig } from "./types";
import { saneFrameScale, saneTitleFrame } from "./titleFrames";

const KEY = "novacut.textsStyle";
/** versi skema — bila berubah, setelan lama dimigrasi otomatis */
export const TEXT_STYLE_VERSION = 4;

export const TEXT_STYLE_DEFAULTS = {
  /** ukuran huruf judul: 4.2% tinggi layar (sebelumnya 7% — terlalu besar) */
  titleSize: 0.042,
  /** ukuran huruf deskripsi: 2.6% tinggi layar */
  descSize: 0.026,
  /** ukuran huruf part/episode: 6.8% tinggi layar (v1.0.59: 5.2% → 6.8% — huruf
   * part DIPERBESAR permintaan pengguna; era awal 7.5–12% terlalu besar) */
  partSize: 0.068,
  /** font tulisan otomatis */
  fontAuto: "condensed",
  /** posisi judul: geser horizontal/vertikal % lebar/tinggi layar (0 = posisi bawaan) */
  titleX: 0,
  titleY: 0,
  /** posisi deskripsi */
  descX: 0,
  descY: 0,
  /** posisi teks part/episode */
  partX: 0,
  partY: 0,
  /** v1.0.22: posisi vertikal judul+deskripsi saat video berjalan —
   * 0 = paling atas, 100 = paling bawah (DEFAULT: 100 = PALING BAWAH) */
  titleV: 100,
  /** v1.0.22: posisi vertikal part/episode — 0 = paling atas, 100 = paling
   * bawah (DEFAULT: 0 = PALING ATAS) */
  partV: 0,
  /** v1.0.53: part/episode OTOMATIS berlawanan judul — judul di bawah → part
   * muncul di atas, judul di atas → part muncul di bawah (permintaan pengguna);
   * false = pakai slider posisi part manual */
  partFlip: true,
  /** v1.0.22: bingkai judul ("" = tanpa bingkai; lihat TITLE_FRAMES) */
  titleFrame: "",
  /** v1.0.22: skala lebar bingkai (1 = otomatis ikut lebar tulisan) */
  titleFrameW: 1,
  /** v1.0.22: skala tinggi bingkai (1 = otomatis ikut tinggi tulisan) */
  titleFrameH: 1,
  /** v1.0.25: bingkai teks PART/EPISODE ("" = tanpa bingkai; lihat TITLE_FRAMES).
   * Catatan: bila bingkai judul gaya PITA GANDA komposit (t7 & g1-g10),
   * teks part otomatis masuk ke pita atas judul — setelan ini dipakai bila
   * judul tanpa gaya komposit. */
  partFrame: "",
  /** v1.0.25: skala lebar bingkai part (1 = otomatis ikut lebar tulisan) */
  partFrameW: 1,
  /** v1.0.25: skala tinggi bingkai part (1 = otomatis ikut tinggi tulisan) */
  partFrameH: 1,
};

export type TextStyle = typeof TEXT_STYLE_DEFAULTS;

/** v1.0.53: posisi vertikal part/episode EFEKTIF — saat partFlip aktif dan judul
 * ikut ditampilkan, part otomatis diletakkan BERLAWANAN dengan judul (judul di
 * bawah → part di atas; judul di atas → part di bawah) sehingga keduanya tidak
 * pernah bertumpuk di layar. Bila flip mati / judul tak tampil → slider manual. */
export function posisiPartEfektif(
  texts: { partFlip?: boolean; partV?: number; titleV?: number },
  judulTampil: boolean
): number {
  if (judulTampil && texts.partFlip !== false) {
    const tv = typeof texts.titleV === "number" && isFinite(texts.titleV) ? texts.titleV : 100;
    // v1.0.58/59: posisi bawah 100 → 92 → 84 (pengguna minta naik "sedikit lagi");
    // posisi atas tetap 0
    return tv >= 50 ? 0 : 84;
  }
  return typeof texts.partV === "number" && isFinite(texts.partV) ? Math.max(0, Math.min(100, texts.partV)) : 0;
}

interface Stored extends TextStyle {
  cfgVersion?: number;
}

export function loadTextStyle(): TextStyle {
  if (typeof window === "undefined") return { ...TEXT_STYLE_DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...TEXT_STYLE_DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Stored>;
    const merged: TextStyle = {
      titleSize: clampSize(parsed.titleSize, TEXT_STYLE_DEFAULTS.titleSize),
      descSize: clampSize(parsed.descSize, TEXT_STYLE_DEFAULTS.descSize),
      // v1.0.59: setelan lama yang masih memakai default lama 0.052 otomatis naik
      // ke default baru 0.068 (huruf part diperbesar) — slider tetap dihormati
      partSize: clampSize(parsed.partSize === 0.052 ? undefined : parsed.partSize, TEXT_STYLE_DEFAULTS.partSize),
      fontAuto: typeof parsed.fontAuto === "string" && parsed.fontAuto ? parsed.fontAuto : TEXT_STYLE_DEFAULTS.fontAuto,
      titleX: clampOffset(parsed.titleX),
      titleY: clampOffset(parsed.titleY),
      descX: clampOffset(parsed.descX),
      descY: clampOffset(parsed.descY),
      partX: clampOffset(parsed.partX),
      partY: clampOffset(parsed.partY),
      // v1.0.22: setelan lama tanpa titleV/partV otomatis memakai default baru
      // (judul+deskripsi DI BAWAH, part DI ATAS) sesuai permintaan pengguna
      titleV: clampPercent(parsed.titleV, TEXT_STYLE_DEFAULTS.titleV),
      partV: clampPercent(parsed.partV, TEXT_STYLE_DEFAULTS.partV),
      // v1.0.53: part otomatis berlawanan judul — default AKTIF utk setelan lama
      partFlip: parsed.partFlip !== false,
      titleFrame: saneTitleFrame(parsed.titleFrame),
      titleFrameW: saneFrameScale(parsed.titleFrameW),
      titleFrameH: saneFrameScale(parsed.titleFrameH),
      // v1.0.25: bingkai teks part/episode — setelan lama tanpa field ini
      // otomatis memakai default baru ("" = tanpa bingkai)
      partFrame: saneTitleFrame(parsed.partFrame),
      partFrameW: saneFrameScale(parsed.partFrameW),
      partFrameH: saneFrameScale(parsed.partFrameH),
    };
    return merged;
  } catch {
    return { ...TEXT_STYLE_DEFAULTS };
  }
}

export function saveTextStyle(style: TextStyle) {
  if (typeof window === "undefined") return;
  try {
    const payload: Stored = { ...style, cfgVersion: TEXT_STYLE_VERSION };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* penyimpanan penuh / diblokir — abaikan */
  }
}

/** Terapkan gaya tersimpan ke store (dipanggil sekali saat aplikasi dibuka) */
export function applyTextStyleToStore(setTexts: (p: Partial<TextsConfig>) => void) {
  setTexts(loadTextStyle());
}

function clampSize(v: unknown, def: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n) || n <= 0) return def;
  return Math.max(0.012, Math.min(0.2, n));
}

/** posisi geser: bilangan bulat -45..45 (% layar), 0 bila tidak valid */
function clampOffset(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n)) return 0;
  return Math.round(Math.max(-45, Math.min(45, n)));
}

/** v1.0.22: posisi vertikal 0–100 (% layar); bila tidak valid pakai default */
function clampPercent(v: unknown, def: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n)) return def;
  return Math.round(Math.max(0, Math.min(100, n)));
}
