// NOVACUT Studio - Gaya tulisan otomatis (ukuran huruf & font) untuk
// judul/deskripsi/part — dipakai menu Teks, export playlist & tombol tambah teks.
// Disimpan di localStorage agar pengaturan bertahan setelah aplikasi ditutup.

import type { TextsConfig } from "./types";

const KEY = "novacut.textsStyle";
/** versi skema — bila berubah, setelan lama dimigrasi otomatis */
export const TEXT_STYLE_VERSION = 1;

export const TEXT_STYLE_DEFAULTS = {
  /** ukuran huruf judul: 4.2% tinggi layar (sebelumnya 7% — terlalu besar) */
  titleSize: 0.042,
  /** ukuran huruf deskripsi: 2.6% tinggi layar */
  descSize: 0.026,
  /** ukuran huruf part/episode: 5.2% tinggi layar (sebelumnya 7.5–12% — terlalu besar) */
  partSize: 0.052,
  /** font tulisan otomatis */
  fontAuto: "condensed",
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
