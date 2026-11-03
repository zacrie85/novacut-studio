// NOVACUT Studio - preferensi tampilan aplikasi (mode sederhana / pro, layar sambutan)
// Disimpan di localStorage agar pilihan diingat saat aplikasi dibuka lagi.

import type { UiMode } from "./types";

const MODE_KEY = "novacut.uiMode";
const WELCOME_KEY = "novacut.welcomeSkip";

/** mode terakhir yang dipakai; null = belum pernah memilih (tampilkan layar sambutan) */
export function loadLastUiMode(): Exclude<UiMode, "welcome"> | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(MODE_KEY);
    return v === "simple" || v === "pro" ? v : null;
  } catch {
    return null;
  }
}

export function saveUiMode(m: Exclude<UiMode, "welcome">) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MODE_KEY, m);
  } catch {
    /* abaikan */
  }
}

/** true bila pengguna mencentang "jangan tampilkan lagi" di layar sambutan */
export function welcomeSkipped(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(WELCOME_KEY) === "1";
  } catch {
    return false;
  }
}

export function setWelcomeSkipped(v: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (v) window.localStorage.setItem(WELCOME_KEY, "1");
    else window.localStorage.removeItem(WELCOME_KEY);
  } catch {
    /* abaikan */
  }
}
