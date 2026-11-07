// NOVACUT Studio - Gaya tulisan otomatis (ukuran huruf & font) untuk
// judul/deskripsi/part — dipakai menu Teks, export playlist & tombol tambah teks.
// Disimpan di localStorage agar pengaturan bertahan setelah aplikasi ditutup.

import type { TextsConfig } from "./types";
import { saneFrameScale, saneTitleFrame } from "./titleFrames";

const KEY = "novacut.textsStyle";
/** versi skema — bila berubah, setelan lama dimigrasi otomatis */
export const TEXT_STYLE_VERSION = 3;

export const TEXT_STYLE_DEFAULTS = {
  /** ukuran huruf judul: 4.2% tinggi layar (sebelumnya 7% — terlalu besar) */
  titleSize: 0.042,
  /** ukuran huruf deskripsi: 2.6% tinggi layar */
  descSize: 0.026,
  /** ukuran huruf part/episode: 5.2% tinggi layar (sebelumnya 7.5–12% — terlalu besar) */
  partSize: 0.052,
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
  /** v1.0.22: bingkai judul ("" = tanpa bingkai; lihat TITLE_FRAMES) */
  titleFrame: "",
  /** v1.0.22: skala lebar bingkai (1 = otomatis ikut lebar tulisan) */
  titleFrameW: 1,
  /** v1.0.22: skala tinggi bingkai (1 = otomatis ikut tinggi tulisan) */
  titleFrameH: 1,
};

export type TextStyle = typeof TEXT_STYLE_DEFAULTS;

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
      partSize: clampSize(parsed.partSize, TEXT_STYLE_DEFAULTS.partSize),
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
      titleFrame: saneTitleFrame(parsed.titleFrame),
      titleFrameW: saneFrameScale(parsed.titleFrameW),
      titleFrameH: saneFrameScale(parsed.titleFrameH),
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
