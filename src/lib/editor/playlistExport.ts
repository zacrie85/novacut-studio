// NOVACUT Studio - Setelan export Playlist (menu khusus export langsung dari playlist)
// Disimpan di localStorage agar dipakai lagi untuk video berikutnya / saat aplikasi dibuka ulang.

import type { PlaylistEnhance, PlaylistExportConfig } from "./types";

const KEY = "novacut.playlistExport";
/** versi skema setelan — bila berubah, setelan lama dimigrasi otomatis */
const CFG_VERSION = 3;

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
      cfgVersion: CFG_VERSION,
    };
    if (parsed.cfgVersion !== CFG_VERSION) {
      // Setelan versi lama (sebelum v1.0.7): aktifkan "teks tampil selama video"
      // agar judul, deskripsi & part langsung terlihat di dalam video hasil export.
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
