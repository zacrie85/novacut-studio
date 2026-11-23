// NOVACUT Studio - Setelan export Playlist (menu khusus export langsung dari playlist)
// Disimpan di localStorage agar dipakai lagi untuk video berikutnya / saat aplikasi dibuka ulang.

import type { PlaylistEnhance, PlaylistExportConfig } from "./types";

const KEY = "novacut.playlistExport";
/** versi skema setelan — bila berubah, setelan lama dimigrasi otomatis */
const CFG_VERSION = 5;

/** bawaan efek & klip untuk export playlist (netral: tanpa perubahan) */
export const PLAYLIST_ENHANCE_DEFAULTS: PlaylistEnhance = {
  enabled: true,
  speed: 1,
  loopCount: 1,
  volume: 1,
  fadeIn: 0,
  fadeOut: 0,
  effects: [],
  transitionType: null,
  transitionDuration: 0.6,
  zoom: 1,
  panX: 0,
  panY: 0,
};

/** gabung setelan enhance parsial dengan bawaan (aman untuk data lama) */
export function normalizeEnhance(e?: Partial<PlaylistEnhance> | null): PlaylistEnhance {
  return {
    ...PLAYLIST_ENHANCE_DEFAULTS,
    ...(e ?? {}),
    effects: Array.isArray(e?.effects) ? e!.effects.filter((x): x is string => typeof x === "string") : [],
    speed: Math.max(0.25, Math.min(4, Number(e?.speed) || 1)),
    loopCount: Math.max(1, Math.min(10, Math.round(Number(e?.loopCount) || 1))),
    volume: Math.max(0, Math.min(2, Number(e?.volume ?? 1))),
    zoom: Math.max(1, Math.min(5, Number(e?.zoom) || 1)),
    // v1.0.20: zoom & geser berdiri sendiri (tidak bergantung toggle efek) — dinormalisasi agar aman dari data lama
    panX: Math.max(-1, Math.min(1, Number(e?.panX) || 0)),
    panY: Math.max(-1, Math.min(1, Number(e?.panY) || 0)),
  };
}

export const PLAYLIST_EXPORT_DEFAULTS: PlaylistExportConfig = {
  autoTitle: true,
  titleCustom: "",
  description: "",
  labelStyle: "Part",
  showTitleScreen: true,
  showPartText: true,
  titleDuringVideo: true,
  ratio: "16:9",
  fitMode: "fill",
  enhance: { ...PLAYLIST_ENHANCE_DEFAULTS },
  autoSub: false,
  subLevel: "ringan",
  parallel: 3,
  quality: "tajam",
  smartSplit: false,
  skipExisting: true,
  soundDone: true,
  autoShutdown: false,
  // v1.0.25: watermark (tanda air gambar PNG/JPEG) — mati = tanpa watermark
  wmOn: false,
  wmSrc: "",
  wmX: 85,
  wmY: 88,
  wmW: 22,
  wmH: 22,
  wmOpacity: 65,
  wmTint: "#ffffff",
  wmTintAmt: 0,
  cfgVersion: CFG_VERSION,
};

/** Muat setelan tersimpan (gabung dengan bawaan agar selalu lengkap + migrasi versi lama) */
export function loadPlaylistExportConfig(): PlaylistExportConfig {
  if (typeof window === "undefined") return { ...PLAYLIST_EXPORT_DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...PLAYLIST_EXPORT_DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<PlaylistExportConfig> & { cfgVersion?: number };
    const merged: PlaylistExportConfig = {
      ...PLAYLIST_EXPORT_DEFAULTS,
      ...parsed,
      enhance: normalizeEnhance(parsed.enhance),
      // v1.0.25: normalisasi angka watermark agar aman dari data lama/rusak
      wmOn: parsed.wmOn === true,
      wmSrc: typeof parsed.wmSrc === "string" ? parsed.wmSrc : "",
      wmX: clampNum(parsed.wmX, 0, 100, 85),
      wmY: clampNum(parsed.wmY, 0, 100, 88),
      wmW: clampNum(parsed.wmW, 3, 100, 22),
      wmH: clampNum(parsed.wmH, 3, 100, 22),
      wmOpacity: clampNum(parsed.wmOpacity, 2, 100, 65),
      wmTint: typeof parsed.wmTint === "string" && /^#[0-9a-fA-F]{3,8}$/.test(parsed.wmTint) ? parsed.wmTint : "#ffffff",
      wmTintAmt: clampNum(parsed.wmTintAmt, 0, 100, 0),
      cfgVersion: CFG_VERSION,
    };
    if ((parsed.cfgVersion ?? 0) < 4) {
      // Setelan versi lama (sebelum v1.0.7): aktifkan "teks tampil selama video"
      // agar judul, deskripsi & part langsung terlihat di dalam video hasil export.
      // v1.0.25: syarat diperketat ke versi < 4 supaya setelan v4/v5 yang sudah
      // dimatikan penggunanya tidak dipaksa menyala lagi.
      merged.titleDuringVideo = true;
    }
    return merged;
  } catch {
    return { ...PLAYLIST_EXPORT_DEFAULTS };
  }
}

/** Simpan setelan — tombol "Terapkan & Simpan Setelan" */
export function savePlaylistExportConfig(cfg: PlaylistExportConfig) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cfg));
  } catch {
    /* penyimpanan penuh / diblokir — abaikan */
  }
}

// ===== v1.0.16: PRESET SATU-KLIK =====
// Simpan seluruh setelan playlist (teks, rasio, efek, subtitle, kualitas, split)
// di bawah satu nama — terapkan kapan saja dengan satu klik.

const PRESET_KEY = "novacut.playlistPresets";

/** v1.0.25: jepit angka ke rentang aman (fallback default bila tidak valid) */
function clampNum(v: unknown, min: number, max: number, def: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

/** potongan setelan split yang ikut tersimpan dalam preset */
export interface PresetSplit {
  mode: "single" | "split";
  splitBy: "count" | "duration";
  parts: number;
  partSeconds: number;
  /** v1.0.25: potong mulai & akhir (rentang detik) ikut tersimpan juga */
  trimOn?: boolean;
  trimStart?: number;
  trimEnd?: number;
}

export interface PlaylistPreset {
  name: string;
  cfg: PlaylistExportConfig;
  split: PresetSplit;
}

export function loadPlaylistPresets(): PlaylistPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PRESET_KEY);
    const arr = raw ? (JSON.parse(raw) as PlaylistPreset[]) : [];
    return Array.isArray(arr) ? arr.filter((p) => p && typeof p.name === "string" && !!p.cfg && !!p.split) : [];
  } catch {
    return [];
  }
}

function writePresets(list: PlaylistPreset[]) {
  try {
    window.localStorage.setItem(PRESET_KEY, JSON.stringify(list.slice(0, 24)));
  } catch {
    /* penyimpanan penuh — abaikan */
  }
}

/** Simpan setelan SAAT INI sebagai preset bernama (menimpa nama yang sama).
 * v1.0.30: cue subtitle file TIDAK ikut preset (berat & spesifik sesi) —
 * pengguna memilih ulang file .srt/.vtt setelah preset dipakai. */
export function savePlaylistPreset(name: string, cfg: PlaylistExportConfig, split: PresetSplit) {
  const nm = name.trim().slice(0, 40) || "Preset";
  const list = loadPlaylistPresets().filter((p) => p.name !== nm);
  list.unshift({ name: nm, cfg: { ...cfg, subFileOn: false, subFileName: undefined, subCues: undefined }, split: { ...split } });
  writePresets(list);
}

export function deletePlaylistPreset(name: string) {
  writePresets(loadPlaylistPresets().filter((p) => p.name !== name));
}
