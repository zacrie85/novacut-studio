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
  id?: string;
  error?: string;
}

interface NovacutFS {
  isDesktop: boolean;
  chooseDirectory: (current?: string) => Promise<DirPickResult>;
  saveFile: (dir: string, name: string, data: ArrayBuffer) => Promise<SaveResult>;
  /** v1.0.14: tulis file streaming per potongan (hemat memori utk export batch besar) */
  saveFileBegin?: (dir: string, name: string) => Promise<SaveResult>;
  saveFileChunk?: (id: string, data: ArrayBuffer, position?: number) => Promise<SaveResult>;
  saveFileEnd?: (id: string) => Promise<SaveResult>;
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
  // v1.0.14: bila dukungan streaming ada, tulis per potongan 4 MB supaya
  // blob besar tidak disalin utuh ke ArrayBuffer dulu (hemat memori 2x).
  if (window.novacutFS.saveFileBegin) {
    const w = await DiskFileWriter.begin(dir, name);
    if (w) {
      try {
        const CH = 4 * 1024 * 1024;
        for (let off = 0; off < blob.size; off += CH) {
          const slice = blob.slice(off, Math.min(blob.size, off + CH));
          await w.write(await slice.arrayBuffer());
        }
        return await w.finish();
      } catch {
        await w.abort();
        // jatuh ke jalur lama di bawah
      }
    }
  }
  const data = await blob.arrayBuffer();
  const res = await window.novacutFS.saveFile(dir, name, data);
  if (!res.ok || !res.path) throw new Error(res.error || "Gagal menyimpan file");
  return res.path;
}

/**
 * v1.0.14 — Penulis file STREAMING langsung ke disk (desktop saja).
 * Video hasil render ditulis per potongan seiring di-encode, sehingga file
 * ratusan MB TIDAK pernah ditahan utuh di memori — memecahkan hang & layar
 * hitam saat export batch banyak video. Bila API tak tersedia / gagal,
 * begin() mengembalikan null dan pemanggil memakai jalur lama (blob).
 */
export class DiskFileWriter {
  private constructor(private id: string) {}

  /** Mulai sesi tulis; null = tidak tersedia (fallback jalur lama) */
  static async begin(dir: string, name: string): Promise<DiskFileWriter | null> {
    if (!window.novacutFS?.saveFileBegin || !window.novacutFS.saveFileChunk || !window.novacutFS.saveFileEnd) return null;
    try {
      const res = await window.novacutFS.saveFileBegin(dir, name);
      if (res.ok && res.id) return new DiskFileWriter(res.id);
      return null;
    } catch {
      return null;
    }
  }

  /** Tulis satu potongan (mendukung posisi acak utk muxer MP4/WebM) */
  async write(data: BufferSource, position?: number): Promise<void> {
    const buf = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    const res = await window.novacutFS!.saveFileChunk!(this.id, buf, position);
    if (!res.ok) throw new Error(res.error || "Gagal menulis potongan file");
  }

  /** Tutup file; kembalikan path final di disk */
  async finish(): Promise<string> {
    const res = await window.novacutFS!.saveFileEnd!(this.id);
    if (!res.ok || !res.path) throw new Error(res.error || "Gagal menutup file");
    return res.path;
  }

  /** Tutup tanpa melempar error (pembenahan) */
  async abort(): Promise<void> {
    try {
      await window.novacutFS?.saveFileEnd?.(this.id);
    } catch {
      /* abaikan */
    }
  }
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
