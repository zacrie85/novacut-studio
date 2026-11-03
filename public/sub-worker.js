// NOVACUT Studio — Worker AI subtitle (Whisper via transformers.js)
// Berkas statis (bukan hasil bundler) supaya selalu bisa dimuat sebagai
// module worker, di server dev maupun Electron. UI tidak membeku saat AI
// menyimak suara video karena semua inferensi berjalan di sini.
//
// Pesan:
//   main -> worker : { level, pcm }      (PCM mono 16 kHz, didekode di thread utama)
//   worker -> main : { type:"progress", stage, pct?, label? }
//                    { type:"done", segs:[{start,end,text}] }
//                    { type:"error", message }

let tf = null;
const pipeCache = new Map();

const MODELS = {
  ringan: "Xenova/whisper-tiny",
  sedang: "Xenova/whisper-base",
  akurat: "Xenova/whisper-small",
};

async function loadTf() {
  if (!tf) {
    // transformers.js dimuat dari CDN (internet hanya perlu pada pemakaian
    // pertama — sama seperti unduhan model); wasm & model ikut dari CDN
    tf = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2/dist/transformers.min.js");
    try {
      if (tf.env && tf.env.backends && tf.env.backends.onnx && tf.env.backends.onnx.wasm) {
        // WASM single-thread (aplikasi tidak berjalan dalam konteks cross-origin isolated)
        tf.env.backends.onnx.wasm.numThreads = 1;
      }
      if (tf.env) tf.env.allowLocalModels = false;
    } catch (e) {
      /* biarkan bawaan */
    }
  }
  return tf;
}

async function getPipe(level, onProgress) {
  const lib = await loadTf();
  const modelId = MODELS[level] || MODELS.ringan;
  if (pipeCache.has(modelId)) return pipeCache.get(modelId);
  onProgress({ stage: "unduh", label: "Mengunduh model AI (sekali saja)..." });
  const pipe = await lib.pipeline("automatic-speech-recognition", modelId, {
    dtype: "q8",
    progress_callback: (p) => {
      if (p && p.status === "progress" && typeof p.progress === "number") {
        onProgress({
          stage: "unduh",
          pct: p.progress / 100,
          label: "Mengunduh model AI... " + Math.round(p.progress) + "%",
        });
      }
    },
  });
  pipeCache.set(modelId, pipe);
  return pipe;
}

self.onmessage = async (e) => {
  const { level, pcm } = e.data || {};
  try {
    const lv = level || "ringan";
    const pipe = await getPipe(lv, (p) => self.postMessage({ type: "progress", ...p }));
    if (!pipe) throw new Error("Mesin AI tidak dapat dimuat");
    if (!pcm || pcm.length < 16000 * 0.25) {
      self.postMessage({ type: "done", segs: [] });
      return;
    }
    self.postMessage({ type: "progress", stage: "salin", label: "AI menyimak suara video...", pct: 0 });
    const out = await pipe(pcm, {
      language: "id",
      task: "transcribe",
      return_timestamps: true,
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    const segs = [];
    for (const c of (out && out.chunks) || []) {
      const text = (c.text || "").trim();
      if (!text) continue;
      const s = c.timestamp && c.timestamp[0];
      const e2 = c.timestamp && c.timestamp[1];
      if (typeof s !== "number" || !isFinite(s)) continue;
      segs.push({
        start: Math.max(0, s),
        end: typeof e2 === "number" && isFinite(e2) ? e2 : s + 1.6,
        text,
      });
    }
    // rapikan segmen sama berurutan (stream 30 dtk kadang terpotong)
    const merged = [];
    for (const s of segs) {
      const last = merged[merged.length - 1];
      if (last && last.text === s.text && s.start - last.end < 0.4) {
        last.end = s.end;
        continue;
      }
      merged.push({ start: s.start, end: s.end, text: s.text });
    }
    self.postMessage({ type: "progress", stage: "salin", pct: 1, label: "Subtitle siap" });
    self.postMessage({ type: "done", segs: merged });
  } catch (err) {
    self.postMessage({ type: "error", message: (err && err.message) || "subtitle gagal" });
  }
};
