// NOVACUT Studio - Setelan export Playlist (menu khusus export langsung dari playlist)
// Disimpan di localStorage agar dipakai lagi untuk video berikutnya / saat aplikasi dibuka ulang.

import type { PlaylistExportConfig } from "./types";

const KEY = "novacut.playlistExport";
/** versi skema setelan — bila berubah, setelan lama dimigrasi otomatis */
const CFG_VERSION = 2;

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
  cfgVersion: CFG_VERSION,
};

/** Muat setelan tersimpan (gabung dengan bawaan agar selalu lengkap + migrasi versi lama) */
export function loadPlaylistExportConfig(): PlaylistExportConfig {
  if (typeof window === "undefined") return { ...PLAYLIST_EXPORT_DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...PLAYLIST_EXPORT_DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<PlaylistExportConfig> & { cfgVersion?: number };
    const merged: PlaylistExportConfig = { ...PLAYLIST_EXPORT_DEFAULTS, ...parsed, cfgVersion: CFG_VERSION };
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
