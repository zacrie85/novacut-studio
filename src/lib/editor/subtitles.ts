// NOVACUT Studio - Subtitle AI otomatis (bahasa Indonesia resmi & gaul)
//
// Speech-to-text LOKAL dengan Whisper (transformers.js) yang berjalan di
// WEB WORKER statis /sub-worker.js — UI tidak membeku selama AI menyimak.
// Audio didekode di thread utama (OfflineAudioContext tidak ada di worker)
// lalu PCM dikirim ke worker (transferable). Bila worker tidak tersedia,
// otomatis fallback ke jalur utama (UI terasa berat sementara, tapi tetap selesai).
//
// Tiga tingkat: ringan = whisper-tiny (±45 MB), sedang = whisper-base (±80 MB),
// akurat = whisper-small (±250 MB). Model diunduh sekali (butuh internet pada
// pemakaian pertama), setelah itu berjalan offline dari cache browser.

import {
  decodeAudio16kMono,
  modelSizeLabel,
  transcribePcm,
  type SubSegment,
  type TranscribeProgress,
} from "./subCore";
import type { SubLevel } from "./types";

export type { SubSegment, TranscribeProgress } from "./subCore";
export { modelSizeLabel } from "./subCore";

/** satu worker dibagikan sepanjang sesi agar model tetap termuat (tidak unduh ulang) */
let sharedWorker: Worker | null = null;
let jobChain: Promise<unknown> = Promise.resolve();

function ensureWorker(): Worker | null {
  if (typeof Worker === "undefined") return null;
  if (!sharedWorker) {
    try {
      sharedWorker = new Worker("/sub-worker.js", { type: "module" });
      sharedWorker.addEventListener("error", () => {
        // worker mati (mis. gagal muat chunk) — pakai jalur utama lain kali
        sharedWorker = null;
      });
    } catch {
      return null;
    }
  }
  return sharedWorker;
}

/** jalankan transkripsi lewat worker; diantrikan supaya model dipakai bergantian.
 * Audio DIDEKODE di thread utama dulu (OfflineAudioContext tidak ada di worker),
 * lalu PCM dikirim ke worker (transferable) — Whisper berjalan di sana. */
function transcribeViaWorker(
  url: string,
  level: SubLevel,
  onProgress?: (p: TranscribeProgress) => void
): Promise<SubSegment[]> {
  const w = ensureWorker();
  if (!w) return Promise.reject(new Error("worker tidak tersedia"));
  const run = async () => {
    onProgress?.({ stage: "muat", label: "Membaca audio video..." });
    const pcm = await decodeAudio16kMono(url);
    if (!pcm || pcm.length < 16000 * 0.25) return [] as SubSegment[];
    return new Promise<SubSegment[]>((resolve, reject) => {
      const onMsg = (ev: MessageEvent) => {
        const m = (ev.data || {}) as { type?: string; segs?: SubSegment[]; message?: string } & TranscribeProgress;
        if (m.type === "progress") {
          onProgress?.({ stage: m.stage || "salin", pct: m.pct, label: m.label });
        } else if (m.type === "done") {
          w.removeEventListener("message", onMsg);
          resolve(m.segs || []);
        } else if (m.type === "error") {
          w.removeEventListener("message", onMsg);
          reject(new Error(m.message || "subtitle gagal"));
        }
      };
      w.addEventListener("message", onMsg);
      w.addEventListener(
        "error",
        () => {
          w.removeEventListener("message", onMsg);
          reject(new Error("worker AI subtitle gagal dimuat"));
        },
        { once: true }
      );
      w.postMessage({ url, level, pcm }, [pcm.buffer]);
      // penanda untuk verifikasi otomatis (dipakai ?__test=1)
      (window as unknown as Record<string, unknown>).__subViaWorker = true;
    });
  };
  const p = jobChain.then(run, run);
  jobChain = p.catch(() => undefined);
  return p;
}

/** jalur utama (fallback): transkripsi di thread utama — UI terasa berat sementara */
async function transcribeInline(
  url: string,
  level: SubLevel,
  onProgress?: (p: TranscribeProgress) => void
): Promise<SubSegment[]> {
  onProgress?.({ stage: "muat", label: "Membaca audio video..." });
  const pcm = await decodeAudio16kMono(url);
  if (!pcm || pcm.length < 16000 * 0.25) return [];
  return transcribePcm(pcm, level, onProgress);
}

/**
 * Salin suara -> teks (subtitle) dari satu aset video/audio.
 * onProgress melaporkan unduhan model & proses salin (0..1).
 */
export async function transcribeAsset(
  assetUrl: string,
  level: SubLevel,
  onProgress?: (p: TranscribeProgress) => void
): Promise<SubSegment[]> {
  try {
    return await transcribeViaWorker(assetUrl, level, onProgress);
  } catch (e) {
    console.warn("Subtitle via worker gagal, pakai jalur utama:", e);
    return transcribeInline(assetUrl, level, onProgress);
  }
}
