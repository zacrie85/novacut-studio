// NOVACUT Studio - Inti AI subtitle (dipakai worker + jalur utama)
//
// Speech-to-text lokal dengan Whisper via transformers.js (ONNX WASM).
// Tiga tingkat: ringan = whisper-tiny, sedang = whisper-base, akurat = whisper-small.
// Fokus bahasa: Indonesia resmi & gaul (language = "id").
// Model diunduh sekali (Cache API browser) — pemakaian berikutnya offline.

import type { SubLevel } from "./types";

export interface SubSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscribeProgress {
  stage: "unduh" | "muat" | "salin";
  pct?: number; // 0..1
  label?: string;
}

const LEVEL_MODEL: Record<SubLevel, string> = {
  ringan: "Xenova/whisper-tiny",
  sedang: "Xenova/whisper-base",
  akurat: "Xenova/whisper-small",
};

/** cache pipeline per model agar tidak dimuat ulang tiap video */
const pipelineCache = new Map<string, unknown>();

let transformersMod: Promise<Record<string, unknown> | null> | null = null;

/** muat modul transformers.js secara dinamis (tidak membebani bundle utama) */
export async function loadTransformers(): Promise<Record<string, unknown> | null> {
  if (!transformersMod) {
    transformersMod = (async () => {
      try {
        const mod = (await import("@huggingface/transformers")) as unknown as Record<string, unknown>;
        // WASM single-thread (aplikasi tidak berjalan dalam konteks cross-origin isolated)
        type EnvShape = {
          env?: {
            backends?: { onnx?: { wasm?: { numThreads?: number } } };
            allowLocalModels?: boolean;
          };
        };
        const env = (mod as EnvShape).env;
        if (env?.backends?.onnx?.wasm) env.backends.onnx.wasm.numThreads = 1;
        if (env) env.allowLocalModels = false;
        return mod;
      } catch (e) {
        console.error("transformers gagal dimuat:", e);
        return null;
      }
    })();
  }
  return transformersMod;
}

interface AsrChunk {
  text: string;
  timestamp: [number, number | null];
}
interface AsrOutput {
  text: string;
  chunks?: AsrChunk[];
}

type AsrPipe = (data: Float32Array, opts: Record<string, unknown>) => Promise<AsrOutput>;

/** muat pipeline ASR untuk tingkat tertentu (dengan progres unduhan model) */
export async function getPipeline(
  level: SubLevel,
  onProgress?: (p: TranscribeProgress) => void
): Promise<AsrPipe | null> {
  const mod = await loadTransformers();
  if (!mod) return null;
  const modelId = LEVEL_MODEL[level] ?? LEVEL_MODEL.ringan;
  const cached = pipelineCache.get(modelId);
  if (cached) return cached as AsrPipe;

  const pipelineFn = mod.pipeline as
    | ((task: string, model: string, opts?: Record<string, unknown>) => Promise<unknown>)
    | undefined;
  if (!pipelineFn) return null;

  onProgress?.({ stage: "unduh", label: "Mengunduh model AI (sekali saja)..." });
  const pipe = await pipelineFn("automatic-speech-recognition", modelId, {
    dtype: "q8",
    progress_callback: (p: { status?: string; progress?: number; file?: string }) => {
      if (p?.status === "progress" && typeof p.progress === "number") {
        onProgress?.({ stage: "unduh", pct: p.progress / 100, label: `Mengunduh model AI... ${Math.round(p.progress)}%` });
      }
    },
  });
  pipelineCache.set(modelId, pipe);
  return pipe as AsrPipe;
}

/** decode audio aset jadi PCM mono 16 kHz (untuk Whisper) */
export async function decodeAudio16kMono(url: string): Promise<Float32Array | null> {
  try {
    const res = await fetch(url);
    const ab = await res.arrayBuffer();
    // OfflineAudioContext 16 kHz mono: decodeAudioData otomatis resample
    const ctx = new OfflineAudioContext(1, 16000, 16000);
    const buf = await ctx.decodeAudioData(ab);
    const ch = buf.getChannelData(0);
    return ch instanceof Float32Array ? ch : new Float32Array(ch);
  } catch (e) {
    console.error("decode audio subtitle gagal:", e);
    return null;
  }
}

/** PCM 16 kHz -> segmen subtitle {start, end, text} (detik) */
export async function transcribePcm(
  pcm: Float32Array,
  level: SubLevel,
  onProgress?: (p: TranscribeProgress) => void
): Promise<SubSegment[]> {
  const pipe = await getPipeline(level, onProgress);
  if (!pipe) throw new Error("Mesin AI subtitle tidak dapat dimuat di perangkat ini");

  onProgress?.({ stage: "salin", label: "AI menyimak suara video...", pct: 0 });
  const out = await pipe(pcm, {
    language: "id",
    task: "transcribe",
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
  });

  const segs: SubSegment[] = [];
  const chunks = out?.chunks ?? [];
  for (const c of chunks) {
    const text = (c.text || "").trim();
    if (!text) continue;
    const s = c.timestamp?.[0];
    const e = c.timestamp?.[1];
    if (typeof s !== "number" || !isFinite(s)) continue;
    segs.push({ start: Math.max(0, s), end: typeof e === "number" && isFinite(e) ? e : s + 1.6, text });
  }
  // rapikan: gabung segmen sama berurutan (akumulasi stream 30s bisa terpotong)
  const merged: SubSegment[] = [];
  for (const s of segs) {
    const last = merged[merged.length - 1];
    if (last && last.text === s.text && s.start - last.end < 0.4) {
      last.end = s.end;
      continue;
    }
    merged.push({ ...s });
  }
  onProgress?.({ stage: "salin", pct: 1, label: "Subtitle siap" });
  return merged;
}

/** estimasi ukuran unduhan model (label UI) */
export function modelSizeLabel(level: SubLevel): string {
  switch (level) {
    case "sedang":
      return "±80 MB";
    case "akurat":
      return "±250 MB";
    default:
      return "±45 MB";
  }
}
