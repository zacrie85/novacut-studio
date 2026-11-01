// NOVACUT Studio - Jembatan filesystem desktop (Electron preload)
// Di aplikasi desktop (NOVACUT Studio.exe) window.novacutFS tersedia:
//   - pilih folder hasil render lewat dialog native Windows
//   - tulis file hasil render langsung ke folder tersebut
// Di browser biasa API ini tidak ada -> fallback ke unduhan bawaan.

const LS_KEY = "novacut.exportDir";

interface DirPickResult {
  canceled: boolean;
  path?: string;
}

interface SaveResult {
  ok: boolean;
  path?: string;
  error?: string;
}

interface NovacutFS {
  isDesktop: boolean;
  chooseDirectory: (current?: string) => Promise<DirPickResult>;
  saveFile: (dir: string, name: string, data: ArrayBuffer) => Promise<SaveResult>;
  openFolder: (dir: string) => Promise<SaveResult>;
}

declare global {
  interface Window {
    novacutFS?: NovacutFS;
  }
}

/** true bila berjalan di dalam aplikasi desktop NOVACUT Studio (Electron) */
export function isDesktopFS(): boolean {
  return typeof window !== "undefined" && !!window.novacutFS?.isDesktop;
}

/** Buka dialog native pilih folder (desktop). Di browser selalu dibatalkan. */
export async function pickExportDir(current?: string): Promise<DirPickResult> {
  if (!window.novacutFS) return { canceled: true };
  return window.novacutFS.chooseDirectory(current);
}

/** Tulis blob hasil render langsung ke folder terpilih. Mengembalikan path file. */
export async function saveBlobToDir(dir: string, name: string, blob: Blob): Promise<string> {
  if (!window.novacutFS) throw new Error("Hanya tersedia di aplikasi desktop");
  const data = await blob.arrayBuffer();
  const res = await window.novacutFS.saveFile(dir, name, data);
  if (!res.ok || !res.path) throw new Error(res.error || "Gagal menyimpan file");
  return res.path;
}

/** Buka folder hasil render di Windows Explorer. */
export async function openInFolder(dir: string): Promise<boolean> {
  if (!window.novacutFS) return false;
  const res = await window.novacutFS.openFolder(dir);
  return !!res.ok;
}

/** Lokasi folder terakhir yang dipilih (diingat antar sesi aplikasi). */
export function loadSavedExportDir(): string {
  try {
    return localStorage.getItem(LS_KEY) || "";
  } catch {
    return "";
  }
}

export function rememberExportDir(path: string): void {
  try {
    localStorage.setItem(LS_KEY, path);
  } catch {
    /* abaikan */
  }
}

export function forgetExportDir(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* abaikan */
  }
}
