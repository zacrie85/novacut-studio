// NOVACUT Studio - Setelan export Playlist (menu khusus export langsung dari playlist)
// Disimpan di localStorage agar dipakai lagi untuk video berikutnya / saat aplikasi dibuka ulang.

import type { PlaylistExportConfig } from "./types";

const KEY = "novacut.playlistExport";

export const PLAYLIST_EXPORT_DEFAULTS: PlaylistExportConfig = {
  autoTitle: true,
  titleCustom: "",
  description: "",
  labelStyle: "Part",
  showTitleScreen: true,
  showPartText: true,
  titleDuringVideo: false,
};

/** Muat setelan tersimpan (gabung dengan bawaan agar selalu lengkap) */
export function loadPlaylistExportConfig(): PlaylistExportConfig {
  if (typeof window === "undefined") return { ...PLAYLIST_EXPORT_DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...PLAYLIST_EXPORT_DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<PlaylistExportConfig>;
    return { ...PLAYLIST_EXPORT_DEFAULTS, ...parsed };
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
