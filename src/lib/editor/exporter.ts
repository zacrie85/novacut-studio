// NOVACUT Studio - Export & Split: dua mesin render
//  1) MODE KILAT (bawaan): WebCodecs offscreen — video TIDAK diputar, 5-10x lebih
//     cepat, bisa beberapa video sekaligus (paralel). Lihat fastExport.ts.
//  2) MODE KOMPATIBEL: rekam real-time via MediaRecorder (jalur lama).
// Fitur: cover otomatis, teks judul/deskripsi/part, subtitle AI (bahasa Indonesia).

import { grabFrame, aiRecommendTemplates, analyzeVideoFrames, loadImage, renderCoverToDataURL } from "./covers";
import { COVER_TEMPLATES, partLabel, slugify, uid } from "./constants";
import { engine } from "./engine";
import { exportRangeFast, fastSupported } from "./fastExport";
import { ensureAppFonts } from "./fonts";
import { isDesktopFS, saveBlobToDir } from "./fsBridge";
import { normalizeEnhance } from "./playlistExport";
import { dimsFor, useEditor, totalDuration } from "./store";
import { transcribeAsset, type SubSegment } from "./subtitles";
import type { Clip, MediaAsset, Track } from "./types";
import { fillZoomFor } from "./visual";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** batasi ukuran huruf relatif (0.012–0.2) dengan bawaan aman */
function clampPct(v: number | undefined, def: number): number {
  const n = typeof v === "number" && isFinite(v) ? v : def;
  return Math.max(0.012, Math.min(0.2, n));
}

/** posisi geser teks (% layar, -45..45) -> fraksi (aman untuk data lama) */
function clampOffPct(v: number | undefined): number {
  const n = typeof v === "number" && isFinite(v) ? Math.round(v) : 0;
  return Math.max(-45, Math.min(45, n)) / 100;
}

/** pool paralel sederhana: jalankan maksimal `limit` tugas bersamaan */
async function runPool<T>(items: T[], limit: number, fn: (item: T, idx: number) => Promise<void>): Promise<void> {
  let next = 0;
  const n = Math.max(1, Math.min(limit, items.length));
  const workers = Array.from({ length: n }, async () => {
    while (true) {
      const idx = next++;
      if (idx >= items.length) break;
      try {
        await fn(items[idx], idx);
      } catch (e) {
        console.error("Pekerjaan paralel gagal:", e);
      }
    }
  });
  await Promise.all(workers);
}

/**
 * Petakan segmen subtitle (waktu SUMBER video) ke waktu timeline.
 * Memakai rumus kebalikan srcTime engine: t = clip.start + ((S - inPoint) % srcSeg) / speed
 */
function mapSubsToTimeline(segs: SubSegment[], clips: Clip[]): SubSegment[] {
  const out: SubSegment[] = [];
  const videoClips = clips.filter((c) => c.kind === "video").sort((a, b) => a.start - b.start);
  for (const seg of segs) {
    const mid = (seg.start + Math.max(seg.start, seg.end - 0.05)) / 2;
    const clip = videoClips.find((c) => {
      const srcSeg = (c.duration * c.speed) / Math.max(1, c.loopCount);
      return mid >= c.inPoint && mid < c.inPoint + Math.max(0.033, srcSeg);
    });
    if (!clip) continue;
    const srcSeg = Math.max(0.033, (clip.duration * clip.speed) / Math.max(1, clip.loopCount));
    const span = Math.max(0.2, seg.end - seg.start);
    const local = (t: number) => clip.start + (((t - clip.inPoint) % srcSeg + srcSeg) % srcSeg) / Math.max(0.25, clip.speed);
    const t0 = local(Math.max(clip.inPoint, seg.start));
    const t1 = t0 + span / Math.max(0.25, clip.speed);
    if (t1 - t0 < 0.2) continue;
    out.push({ start: t0, end: Math.min(t1, clip.start + clip.duration), text: seg.text });
  }
  return out.sort((a, b) => a.start - b.start);
}

/** Sisipkan klip teks SUBTITLE (waktu timeline) ke proyek mentah — dipakai mode
 * "export saja" (tanpa split) karena proyek itu tidak lewat buildSplitProject. */
function appendSubtitleClips(
  clips: Clip[],
  tracks: Track[],
  subs: SubSegment[]
): { clips: Clip[]; tracks: Track[] } {
  if (!subs.length) return { clips, tracks };
  const tt = ensureTextTrack(tracks);
  const fontAuto = useEditor.getState().texts.fontAuto || "condensed";
  const subSize = 0.028;
  const extra: Clip[] = subs
    .filter((s) => s.end - s.start >= 0.25)
    .map((seg) =>
      baseClip({
        trackId: tt.textTrack.id,
        kind: "text",
        start: seg.start,
        duration: seg.end - seg.start,
        text: {
          content: seg.text,
          size: subSize,
          color: "#ffffff",
          font: fontAuto,
          anim: "fade",
          pos: "bottom",
          bg: "bar",
          stroke: true,
          offY: -0.06,
        },
      })
    );
  return { clips: [...clips, ...extra], tracks: tt.tracks };
}

// MP4 diprioritaskan (H.264 + AAC untuk kompatibilitas terbaik,
// lalu H.264 + Opus, lalu default bawaan browser)
const MP4_CANDIDATES = [
  "video/mp4;codecs=avc1.640028,mp4a.40.2",
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4;codecs=avc1,mp4a.40.2",
  "video/mp4;codecs=avc1,opus",
  "video/mp4",
];
const WEBM_CANDIDATES = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];

export interface ExportFormat {
  mime: string;
  ext: ".mp4" | ".webm";
  label: string;
}

let cachedFormat: ExportFormat | null = null;

/** Pilih format rekaman terbaik: MP4 dulu, WebM sebagai fallback */
export function pickExportFormat(): ExportFormat {
  if (cachedFormat) return cachedFormat;
  if (typeof MediaRecorder !== "undefined") {
    for (const mime of MP4_CANDIDATES) {
      if (MediaRecorder.isTypeSupported(mime)) {
        cachedFormat = { mime, ext: ".mp4", label: "MP4 (H.264)" };
        return cachedFormat;
      }
    }
    for (const mime of WEBM_CANDIDATES) {
      if (MediaRecorder.isTypeSupported(mime)) {
        cachedFormat = { mime, ext: ".webm", label: "WebM (VP9/VP8)" };
        return cachedFormat;
      }
    }
  }
  cachedFormat = { mime: "video/webm", ext: ".webm", label: "WebM" };
  return cachedFormat;
}

/** Rekam rentang timeline menjadi blob video (MP4/WebM) */
export async function exportRange(start: number, end: number, onProgress?: (p: number) => void): Promise<Blob> {
  const canvas = engine.canvas;
  if (!canvas) throw new Error("Canvas belum siap");
  await ensureAppFonts(); // pastikan font sinematik bundel siap sebelum merekam
  engine.ensureAudio();
  // Tunggu AudioContext siap MAKSIMAL 0.9 detik — di perangkat tanpa output audio
  // resume() bisa menggantung selamanya sehingga export macet di awal.
  await Promise.race([engine.audioCtx?.resume().catch(() => {}), sleep(900)]);
  await sleep(150);

  const fmt = pickExportFormat();
  const stream = engine.captureStream(30);
  if (!stream) throw new Error("Browser tidak mendukung perekaman canvas");
  // Sumber audio senyap: WAJIB agar track audio mengalir sejak detik pertama rekaman.
  // Tanpa ini muxer MP4 baru "mengunci" timeline saat sampel audio pertama benar-benar
  // masuk (mis. video tanpa musik: suara baru ada setelah layar cover) sehingga
  // beberapa detik pertama hasil render bisa hilang.
  let silent: OscillatorNode | null = null;
  if (engine.recDest && engine.audioCtx) {
    try {
      silent = engine.audioCtx.createOscillator();
      const sg = engine.audioCtx.createGain();
      sg.gain.value = 0;
      silent.connect(sg);
      sg.connect(engine.recDest);
      silent.start();
    } catch {
      silent = null;
    }
  }
  if (engine.recDest) {
    for (const tr of engine.recDest.stream.getAudioTracks()) stream.addTrack(tr);
  }
  const rec = new MediaRecorder(stream, {
    mimeType: fmt.mime,
    videoBitsPerSecond: 9_000_000,
    audioBitsPerSecond: 192_000,
  });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<Blob>((resolve) => {
    rec.onstop = () => {
      try {
        silent?.stop();
        silent?.disconnect();
      } catch {
        /* ignore */
      }
      resolve(new Blob(chunks, { type: fmt.mime }));
    };
  });

  engine.pause();
  engine.seek(start);
  await sleep(450); // beri waktu seek
  // SIAPKAN frame video sejak SEKARANG (saat cover masih tampil): elemen video
  // sudah di-seek ke posisi sumber yang benar, jadi begitu cover selesai konten
  // langsung tampil tanpa layar hitam — detik cover TIDAK memakan detik video.
  await engine.prepareUpcoming(12);
  rec.start(400);
  await sleep(300); // pre-roll singkat: bingkai pertama & aliran audio terkunci dulu sebelum playback
  const dur = Math.max(0.1, end - start);
  engine.play({
    stopAt: end,
    onDone: () => {
      setTimeout(() => {
        if (rec.state !== "inactive") rec.stop();
      }, 200);
    },
  });
  // pantau progres
  await new Promise<void>((resolve) => {
    const iv = setInterval(() => {
      const t = useEditor.getState().playhead;
      onProgress?.(Math.min(1, (t - start) / dur));
      if (!engine.playing) {
        clearInterval(iv);
        resolve();
      }
    }, 200);
  });
  const blob = await stopped;
  return blob;
}

function ensureTextTrack(tracks: Track[]): { tracks: Track[]; textTrack: Track } {
  let textTrack = tracks.find((t) => t.kind === "text");
  let out = tracks;
  if (!textTrack) {
    textTrack = { id: uid("tr"), kind: "text", name: "Teks Export", muted: false, hidden: false };
    out = [...tracks, textTrack];
  }
  return { tracks: out, textTrack };
}

function ensureVideoTrack(tracks: Track[]): { tracks: Track[]; videoTrack: Track } {
  let videoTrack = tracks.find((t) => t.kind === "video");
  let out = tracks;
  if (!videoTrack) {
    videoTrack = { id: uid("tr"), kind: "video", name: "Video Export", muted: false, hidden: false };
    out = [videoTrack, ...tracks];
  }
  return { tracks: out, videoTrack };
}

function baseClip(patch: Partial<Clip>): Clip {
  return {
    id: uid("cl"),
    trackId: "",
    kind: "video",
    start: 0,
    duration: 1,
    inPoint: 0,
    speed: 1,
    loopCount: 1,
    volume: 1,
    fadeIn: 0,
    fadeOut: 0,
    effects: [],
    zoom: 1,
    panX: 0,
    panY: 0,
    ...patch,
  };
}

export interface SplitProject {
  clips: Clip[];
  tracks: Track[];
  assets: MediaAsset[];
  duration: number;
}

export interface SplitProjectOptions {
  /** teks judul/deskripsi/part tampil selama SELURUH video berjalan (bukan hanya beberapa detik di awal) */
  persistText?: boolean;
  /** subtitle AI (waktu TIMELINE, sudah termasuk geser cover) — di-burn-in ke hasil */
  subs?: SubSegment[];
}

/** Bangun proyek sementara untuk satu bagian hasil split (dengan cover + teks part) */
export function buildSplitProject(
  st: ReturnType<typeof useEditor.getState>,
  partIndex: number,
  totalParts: number,
  rangeStart: number,
  rangeEnd: number,
  opts?: SplitProjectOptions
): SplitProject {
  const s = st.exportSettings;
  const shift = s.includeCover && st.cover.coverAssetId ? Math.max(2, Math.min(5, s.coverDuration)) : 0;
  const persist = !!opts?.persistText;
  // durasi isi video bagian ini (tanpa cover)
  const contentLen = Math.max(0.1, rangeEnd - rangeStart);
  // gaya tulisan otomatis dari menu Teks (ukuran huruf & font, bisa diatur pengguna)
  const titleSize = clampPct(st.texts.titleSize, 0.042);
  const descSize = clampPct(st.texts.descSize, 0.026);
  const partSize = clampPct(st.texts.partSize, 0.052);
  const fontAuto = st.texts.fontAuto || "condensed";
  let tracks = st.tracks.map((t) => ({ ...t }));
  let assets = [...st.assets];

  const clips: Clip[] = [];
  for (const clip of st.clips) {
    const cEnd = clip.start + clip.duration;
    // potong klip HANYA sepanjang rentang bagian ini (interseksi) —
    // sebelumnya klip tidak dipotong + inPoint diberi offset rentang sehingga
    // posisi sumber terhitung DOBEL: bagian ke-2 dst. melompati/mengulang isi
    // video (bagian tidak nyambung) dan bagian akhir layar hitam.
    const os = Math.max(clip.start, rangeStart);
    const oe = Math.min(cEnd, rangeEnd);
    if (oe - os < 0.05) continue;
    const nc = baseClip({
      ...clip,
      start: os - rangeStart + shift,
      duration: oe - os,
      transition: os <= clip.start + 0.05 ? clip.transition : undefined,
    });
    if ((clip.kind === "video" || clip.kind === "audio") && os > clip.start + 0.001) {
      // posisi sumber saat konten bagian ini dimulai; modulo menangani klip loop (>1)
      const srcSeg = (clip.duration * clip.speed) / Math.max(1, clip.loopCount);
      nc.inPoint = clip.inPoint + (((os - clip.start) * clip.speed) % Math.max(0.04, srcSeg));
    }
    clips.push(nc);
  }

  // gaya teks part mengikuti pilihan pengguna (Episode/Bagian/Eps/EP/Part);
  // sebelumnya selalu "Part" karena membaca field yang salah
  const label = partLabel(st.texts?.labelStyle || "Part", partIndex, totalParts, true);

  if (shift > 0 && st.cover.coverAssetId) {
    const vt = ensureVideoTrack(tracks);
    tracks = vt.tracks;
    clips.push(
      baseClip({
        trackId: vt.videoTrack.id,
        kind: "image",
        assetId: st.cover.coverAssetId,
        start: 0,
        duration: shift,
        effects: ["fx-kenburns"],
        label: "Cover",
        fadeOut: 0.3,
      })
    );
    const tt = ensureTextTrack(tracks);
    tracks = tt.tracks;
    clips.push(
      baseClip({
        trackId: tt.textTrack.id,
        kind: "text",
        start: 0.15,
        duration: Math.max(1.2, shift - 0.25),
        text: {
          content: st.texts.title || st.project.name,
          sub: `${st.texts.description ? st.texts.description + "  ·  " : ""}${label}`,
          size: clampPct(titleSize * 1.5, 0.063),
          subSize: clampPct(descSize * 1.15, 0.03),
          color: "#ffffff",
          font: fontAuto,
          subFont: fontAuto,
          anim: "slam",
          pos: "center",
          bg: "gradient",
          stroke: true,
          // posisi dari kolom geser di menu Teks
          offX: clampOffPct(st.texts.titleX),
          offY: clampOffPct(st.texts.titleY),
          subOffX: clampOffPct(st.texts.descX),
          subOffY: clampOffPct(st.texts.descY),
        },
      })
    );
  }

  const contentStart = shift;
  if (s.autoPartText) {
    const tt = ensureTextTrack(tracks);
    tracks = tt.tracks;
    clips.push(
      baseClip({
        trackId: tt.textTrack.id,
        kind: "text",
        start: contentStart + 0.4,
        // mode persisten: teks part tampil terus sampai video selesai
        duration: persist ? Math.max(0.8, contentLen - 0.4) : 2.4,
        text: {
          content: label,
          // ukuran part mengikuti kolom "Ukuran Part" di menu Teks (default 5.2% layar)
          size: partSize,
          color: "#ffffff",
          font: fontAuto,
          anim: "slam",
          pos: "bottom",
          bg: "bar",
          stroke: true,
          // posisi dari kolom geser Part di menu Teks
          offX: clampOffPct(st.texts.partX),
          offY: clampOffPct(st.texts.partY),
        },
      })
    );
  }
  if (s.showTitleText && st.texts.title) {
    const tt = ensureTextTrack(tracks);
    tracks = tt.tracks;
    clips.push(
      baseClip({
        trackId: tt.textTrack.id,
        kind: "text",
        start: contentStart + 0.3,
        // mode persisten: judul + deskripsi tampil terus sampai video selesai
        duration: persist ? Math.max(0.8, contentLen - 0.3) : 3.2,
        text: {
          content: st.texts.title,
          sub: st.texts.description || undefined,
          // ukuran judul & deskripsi mengikuti kolom di menu Teks (default 4.2% / 2.6%)
          size: titleSize,
          subSize: descSize,
          color: "#ffffff",
          font: fontAuto,
          subFont: fontAuto,
          anim: "rise",
          pos: "top",
          bg: "none",
          stroke: true,
          // posisi dari kolom geser Judul & Deskripsi di menu Teks
          offX: clampOffPct(st.texts.titleX),
          offY: clampOffPct(st.texts.titleY),
          subOffX: clampOffPct(st.texts.descX),
          subOffY: clampOffPct(st.texts.descY),
        },
      })
    );
  }

  // SUBTITLE AI otomatis — burn-in di bagian bawah layar (di atas teks part)
  if (opts?.subs?.length) {
    const tt = ensureTextTrack(tracks);
    tracks = tt.tracks;
    const subSize = clampPct(0.028, 0.028);
    for (const seg of opts.subs) {
      const s0 = Math.max(seg.start, rangeStart);
      const s1 = Math.min(seg.end, rangeEnd);
      if (s1 - s0 < 0.25) continue;
      clips.push(
        baseClip({
          trackId: tt.textTrack.id,
          kind: "text",
          start: s0 - rangeStart + shift,
          duration: s1 - s0,
          text: {
            content: seg.text,
            size: subSize,
            color: "#ffffff",
            font: fontAuto,
            anim: "fade",
            pos: "bottom",
            bg: "bar",
            stroke: true,
            offY: -0.06,
          },
        })
      );
    }
  }

  return { clips, tracks, assets, duration: shift + (rangeEnd - rangeStart) };
}

export function splitRanges(duration: number, mode: "count" | "duration", parts: number, partSeconds: number): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  if (duration <= 0.05) return ranges;
  if (mode === "count") {
    const n = Math.max(1, Math.min(50, Math.round(parts)));
    const len = duration / n;
    for (let i = 0; i < n; i++) ranges.push({ start: i * len, end: Math.min(duration, (i + 1) * len) });
  } else {
    const len = Math.max(1, partSeconds);
    for (let s = 0; s < duration; s += len) ranges.push({ start: s, end: Math.min(duration, s + len) });
  }
  return ranges;
}

/** Simpan/unduh satu hasil render.
 * Mode desktop + folder terpilih -> file langsung ditulis ke folder itu (tanpa dialog unduh).
 * Selain itu -> unduh otomatis ke folder unduhan bawaan. */
async function blobResult(blob: Blob, name: string, part: number, total: number, duration: number) {
  const url = URL.createObjectURL(blob);
  let savedPath: string | undefined;
  const dir = useEditor.getState().exportSettings.exportDir;
  if (dir && isDesktopFS()) {
    try {
      useEditor.getState().patchExportState({ label: `Menyimpan ${name} ke folder...` });
      savedPath = await saveBlobToDir(dir, name, blob);
    } catch {
      savedPath = undefined; // gagal simpan -> fallback unduh
    }
  }
  useEditor.getState().addExportResult({ id: uid("exp"), name, url, size: blob.size, part, total, duration, savedPath });
  if (!savedPath) triggerDownload(url, name);
}

/** true bila hasil render otomatis tersimpan ke folder pilihan pengguna */
export function isAutoSaveActive(): boolean {
  return !!useEditor.getState().exportSettings.exportDir && isDesktopFS();
}

export function triggerDownload(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Export utama sesuai pengaturan (export saja / export & split).
 * Mode kilat: offscreen tanpa memutar video. Mode kompatibel: rekam real-time. */
export async function runExport() {
  const st0 = useEditor.getState();
  if (st0.exportState.running) return;
  const D = totalDuration(st0.clips);
  if (D < 0.3) {
    useEditor.getState().patchExportState({ label: "Timeline masih kosong" });
    return;
  }
  const s = st0.exportSettings;
  // gaya label (Part/Episode/Bagian/Eps/EP) pilihan pengguna ada di setelan TEKS
  const labelStyle = st0.texts?.labelStyle || "Part";
  useEditor.getState().patchExportState({ running: true, progress: 0, results: [], label: "Menyiapkan render..." });
  const snapshot = { clips: st0.clips, tracks: st0.tracks, assets: st0.assets };
  const baseName = slugify(st0.texts.title || st0.project.name);

  // mesin render: kilat (WebCodecs offscreen) bila tersedia
  const fast = s.engineMode === "fast" ? await fastSupported() : null;

  try {
    const firstVideo = st0.clips.map((c) => snapshot.assets.find((a) => a.id === c.assetId)).find((a) => a?.type === "video");
    // mode "tiap bagian beda": AI analisis sekali, tiap bagian hasil split pakai adegan berbeda
    let frameTimes: number[] | null = null;
    if (s.includeCover) {
      frameTimes = await pickFrameTimes(firstVideo);
      if (frameTimes) useEditor.getState().patchExportState({ label: "AI memilih adegan berbeda untuk tiap bagian..." });
    }
    const coverAssetReady = !!st0.cover.coverAssetId && st0.assets.some((a) => a.id === st0.cover.coverAssetId);
    if (s.includeCover && !coverAssetReady && !frameTimes) {
      useEditor.getState().patchExportState({ label: "AI membuat cover otomatis..." });
      await ensureCoverAsset(firstVideo);
    }

    // SUBTITLE AI: salin suara tiap klip video -> segmen waktu timeline
    const tlSubs: SubSegment[] = [];
    if (s.autoSub) {
      for (const c of st0.clips.filter((x) => x.kind === "video")) {
        const asset = st0.assets.find((a) => a.id === c.assetId);
        if (!asset || asset.musicId) continue;
        useEditor.getState().patchExportState({ label: "AI menyimak suara video (subtitle)..." });
        try {
          const segs = await transcribeAsset(asset.url, s.subLevel || "ringan", (p) => {
            useEditor.getState().patchExportState({ label: p.label || "Subtitle AI..." });
          });
          tlSubs.push(...mapSubsToTimeline(segs, st0.clips));
        } catch (e) {
          console.warn("Subtitle AI dilewati:", e);
          useEditor.getState().patchExportState({ label: "Subtitle AI dilewati (model gagal dimuat)" });
        }
      }
    }

    if (s.mode === "single") {
      useEditor.getState().patchExportState({ label: fast ? "Merender video penuh (mode kilat)..." : "Merender video penuh..." });
      // subtitle AI ditempel langsung ke proyek mentah (mode tanpa split)
      const withSubs = appendSubtitleClips(snapshot.clips, snapshot.tracks, tlSubs);
      if (fast) {
        const stNow = useEditor.getState();
        const rs = { clips: withSubs.clips, tracks: withSubs.tracks, assets: stNow.assets, project: { width: st0.project.width, height: st0.project.height } };
        const res = await exportRangeFast({ start: 0, end: D, rs, onProgress: (p) => useEditor.getState().patchExportState({ progress: p }) });
        await blobResult(res.blob, `${baseName}${res.ext}`, 1, 1, D);
      } else {
        useEditor.setState({ clips: withSubs.clips, tracks: withSubs.tracks });
        const fmt = pickExportFormat();
        const blob = await exportRange(0, D, (p) => useEditor.getState().patchExportState({ progress: p }));
        await blobResult(blob, `${baseName}${fmt.ext}`, 1, 1, D);
      }
    } else {
      const ranges = splitRanges(D, s.splitBy, s.parts, s.partSeconds);
      const total = ranges.length;
      for (let i = 0; i < total; i++) {
        const r = ranges[i];
        useEditor.getState().patchExportState({ label: `Merender ${partLabel(labelStyle, i + 1, total, true)}...`, batchIndex: i, batchTotal: total });
        const stNow = useEditor.getState();
        let assets = stNow.assets;
        let coverForPart = stNow.cover.coverAssetId;
        // latar "tiap bagian beda" -> cover baru dari adegan berbeda untuk bagian ini
        if (frameTimes && firstVideo) {
          if (fast) {
            const cov = await makeCoverAsset(firstVideo, frameTimes[i % frameTimes.length]);
            if (cov) {
              coverForPart = cov.id;
              assets = [...assets, cov];
            }
          } else {
            await ensureCoverAsset(firstVideo, true, frameTimes[i % frameTimes.length]);
            coverForPart = useEditor.getState().cover.coverAssetId;
            assets = useEditor.getState().assets;
          }
        }
        // proyek bagian ini selalu dibangun dari timeline ASLI (snapshot)
        const srcState = { ...stNow, clips: snapshot.clips, tracks: snapshot.tracks, assets, cover: { ...stNow.cover, coverAssetId: coverForPart } };
        const proj = buildSplitProject(srcState, i + 1, total, r.start, r.end, { subs: tlSubs });
        const label = partLabel(labelStyle, i + 1, total, true);
        if (fast) {
          const rs = { clips: proj.clips, tracks: proj.tracks, assets: proj.assets, project: { width: stNow.project.width, height: stNow.project.height } };
          const res = await exportRangeFast({ start: 0, end: proj.duration, rs, onProgress: (p) => useEditor.getState().patchExportState({ progress: (i + p) / total }) });
          await blobResult(res.blob, `${baseName}-${slugify(label)}${res.ext}`, i + 1, total, proj.duration);
        } else {
          useEditor.setState({ clips: proj.clips, tracks: proj.tracks, assets: proj.assets });
          engine.pause();
          engine.seek(0);
          await sleep(120);
          const fmt = pickExportFormat();
          const blob = await exportRange(0, proj.duration, (p) => {
            useEditor.getState().patchExportState({ progress: (i + p) / total });
          });
          await blobResult(blob, `${baseName}-${slugify(label)}${fmt.ext}`, i + 1, total, proj.duration);
        }
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    console.error("Export gagal:", e);
    useEditor.getState().patchExportState({ label: `Gagal: ${msg}` });
  } finally {
    useEditor.setState({ clips: snapshot.clips, tracks: snapshot.tracks, assets: snapshot.assets });
    engine.pruneElements();
    engine.pause();
    engine.seek(0);
    const auto = isAutoSaveActive();
    const stEnd = useEditor.getState();
    if (!stEnd.exportState.label.startsWith("Gagal")) {
      stEnd.patchExportState({ running: false, label: auto ? "Selesai — semua file tersimpan di folder pilihanmu ✓" : "Selesai", progress: 1 });
    } else {
      stEnd.patchExportState({ running: false, progress: 1 });
    }
  }
}

/** Pastikan cover asset tersedia; buat otomatis bila perlu (force = buat ulang walau sudah ada).
 * frameTime opsional: pakai frame spesifik — untuk mode latar "tiap bagian beda".
 * Latar "hitam" tidak butuh frame video sama sekali. */
/** Buat asset cover TANPA menyentuh store global (aman dipanggil paralel).
 * Pemanggil memutuskan: dimasukkan ke store (jalur lama) atau dipakai lokal (mode kilat). */
async function makeCoverAsset(sourceAsset: MediaAsset | undefined, frameTime?: number): Promise<MediaAsset | undefined> {
  const st = useEditor.getState();
  if (st.cover.bgStyle !== "hitam" && (!sourceAsset || sourceAsset.type !== "video")) return undefined;
  const title = st.texts.title || sourceAsset?.name.replace(/\.[^.]+$/, "") || "Video";
  const { width, height } = st.project;

  // Latar hitam polos — pilihan pengguna, tanpa adegan video
  if (st.cover.bgStyle === "hitam") {
    const tpl = aiRecommendTemplates(title, 40, 1)[0] ?? COVER_TEMPLATES[0];
    const dataUrl = renderCoverToDataURL({ img: null, title: "", template: tpl, bgStyle: "hitam" }, width, height);
    if (!dataUrl) return undefined;
    return { id: uid("as"), name: `Cover - ${title}`, type: "image", url: dataUrl, duration: 0, width, height };
  }

  let frameUrl: string | null = null;
  let brightness = 128;
  try {
    if (typeof frameTime === "number") {
      // adegan spesifik untuk bagian ini (mode "tiap bagian beda")
      frameUrl = await grabFrame(sourceAsset!.url, Math.max(0, Math.min(frameTime, sourceAsset!.duration - 0.2)), 1280);
    } else {
      const analysis = await analyzeVideoFrames(sourceAsset!.url, sourceAsset!.duration, 6);
      if (analysis.best) {
        brightness = analysis.best.brightness;
        frameUrl = await grabFrame(sourceAsset!.url, analysis.best.time, 1280);
      }
    }
  } catch {
    /* fallback di bawah */
  }
  if (!frameUrl) frameUrl = await grabFrame(sourceAsset!.url, Math.min(sourceAsset!.duration - 0.2, sourceAsset!.duration * 0.3), 1280);
  if (!frameUrl) return undefined;
  const tpl = aiRecommendTemplates(title, brightness, 1)[0] ?? COVER_TEMPLATES[0];
  const img = await loadImage(frameUrl).catch(() => null);
  if (!img) return undefined;
  // cover dibuat TANPA tulisan (latar saja) — judul/deskripsi/part ditulis oleh
  // clip teks di buildSplitProject agar judul panjang otomatis wrap & tak terpotong
  const dataUrl = renderCoverToDataURL({ img, title: "", template: tpl }, width, height);
  return { id: uid("as"), name: `Cover - ${title}`, type: "image", url: dataUrl, duration: 0, width, height };
}

async function ensureCoverAsset(sourceAsset: MediaAsset | undefined, force = false, frameTime?: number): Promise<string | undefined> {
  const st = useEditor.getState();
  if (!force && st.cover.coverAssetId && st.assets.some((a) => a.id === st.cover.coverAssetId)) return st.cover.coverAssetId;
  const asset = await makeCoverAsset(sourceAsset, frameTime);
  if (!asset) return undefined;
  useEditor.getState().addAsset(asset);
  useEditor.getState().setCover({ coverAssetId: asset.id, previewUrl: asset.url, frameTime: 0 });
  return asset.id;
}

/** AI pilih beberapa adegan berbeda (waktu frame, diurut dari skor terbaik)
 * untuk mode latar "tiap bagian beda". Null bila tidak relevan. */
async function pickFrameTimes(sourceAsset: MediaAsset | undefined): Promise<number[] | null> {
  const st = useEditor.getState();
  if (!sourceAsset || sourceAsset.type !== "video") return null;
  if (st.cover.mode !== "auto" || st.cover.bgStyle !== "adegan" || st.cover.bgScope !== "beda") return null;
  try {
    const analysis = await analyzeVideoFrames(sourceAsset.url, sourceAsset.duration, 8);
    const times = analysis.scores.map((sc) => sc.time);
    return times.length ? times : null;
  } catch {
    return null;
  }
}

/** Export & split batch untuk semua video di playlist.
 * FASE 1 (berurutan): judul, cover, subtitle AI per video.
 * FASE 2 (mode kilat): beberapa video dirender BERSAMAAN (paralel 1-5);
 * mode kompatibel: berurutan seperti versi lama (rekam real-time). */
export async function runBatchExport(assetIds: string[]) {
  const st0 = useEditor.getState();
  if (st0.exportState.running || !assetIds.length) return;
  useEditor.getState().patchExportState({ running: true, progress: 0, results: [], label: "Menyiapkan batch...", batchTotal: assetIds.length, batchIndex: 0 });
  const snapshot = { clips: st0.clips, tracks: st0.tracks, assets: st0.assets, project: st0.project };
  const s = st0.exportSettings;
  // setelan teks khusus Playlist Export (judul otomatis, deskripsi, teks part)
  const pl = st0.playlistExport;

  try {
    // rasio video hasil (pilihan di Menu Export Playlist): ganti ukuran proyek sementara
    // 16:9 = seperti aslinya; 9:16 = vertikal untuk Shorts/TikTok/Reels
    const targetDims = dimsFor(pl.ratio, st0.project.quality);
    useEditor.getState().setProject({ ratio: pl.ratio, ...targetDims });
    engine.syncSize();
    const fast = s.engineMode === "fast" ? await fastSupported() : null;
    const parallel = Math.max(1, Math.min(5, Math.round(pl.parallel ?? 3)));

    // ========== FASE 1 — PERSIAPAN (berurutan, aman utk store) ==========
    type BatchJob = {
      asset: MediaAsset;
      title: string;
      coverAssetId?: string;
      frameTimes: number[] | null;
      subs: SubSegment[]; // waktu SUMBER video
    };
    const jobs: BatchJob[] = [];
    for (let vi = 0; vi < assetIds.length; vi++) {
      const asset = snapshot.assets.find((a) => a.id === assetIds[vi]);
      if (!asset || asset.type !== "video") continue;
      const autoName = asset.name.replace(/\.[^.]+$/, "");
      const title = pl.autoTitle ? autoName : pl.titleCustom.trim() || autoName;
      useEditor.getState().setTexts({ title, description: pl.description, labelStyle: pl.labelStyle });
      useEditor.getState().setExportSettings({ includeCover: pl.showTitleScreen, autoPartText: pl.showPartText, showTitleText: pl.titleDuringVideo });
      useEditor.getState().patchExportState({ label: `Menyiapkan ${vi + 1}/${assetIds.length}: ${title}` });

      // latar "tiap bagian beda": AI pilih beberapa adegan berbeda dari video ini
      let frameTimes: number[] | null = null;
      if (pl.showTitleScreen) {
        frameTimes = await pickFrameTimes(asset);
      }
      // cover per video (mode manual = cover pengguna dipakai bersama; otomatis = AI)
      let coverAssetId = st0.cover.coverAssetId;
      if (pl.showTitleScreen) {
        if (useEditor.getState().cover.mode === "manual") {
          if (!coverAssetId || !useEditor.getState().assets.some((a) => a.id === coverAssetId)) {
            coverAssetId = await ensureCoverAsset(asset);
          }
        } else if (!frameTimes) {
          useEditor.getState().setCover({ coverAssetId: undefined, previewUrl: undefined });
          coverAssetId = await ensureCoverAsset(asset, true);
        }
      }
      // SUBTITLE AI (unduh model sekali — butuh internet pada pemakaian pertama)
      let subs: SubSegment[] = [];
      if (pl.autoSub) {
        try {
          subs = await transcribeAsset(asset.url, pl.subLevel || "ringan", (p) => {
            useEditor.getState().patchExportState({ label: `${title}: ${p.label || "subtitle AI..."}` });
          });
        } catch (e) {
          console.warn("Subtitle AI dilewati:", e);
          useEditor.getState().patchExportState({ label: `Subtitle AI dilewati: ${title}` });
        }
      }
      // bila video yang SAMA muncul lagi dalam batch paralel, kloning identitas
      // assetnya (URL tetap sama) supaya tiap pekerjaan punya elemen decode sendiri
      let jobAsset = asset;
      if (jobs.some((j) => j.asset.id === asset.id)) {
        jobAsset = { ...asset, id: `${asset.id}-p${vi}` };
      }
      jobs.push({ asset: jobAsset, title, coverAssetId, frameTimes, subs });
    }

    // ========== FASE 2 — RENDER ==========
    const jobProgress = new Array(jobs.length).fill(0) as number[];
    let doneCount = 0;
    const report = () => {
      const sum = jobProgress.reduce((a, b) => a + b, 0);
      useEditor.getState().patchExportState({ progress: Math.min(0.99, sum / Math.max(1, jobs.length)) });
    };

    /** klip video batch + track utk satu pekerjaan (memakai setelan Efek & Klip "Video Playlist") */
    const buildBatchClip = (job: BatchJob) => {
      const vt = ensureVideoTrack([{ id: "batch-video", kind: "video", name: "V", muted: false, hidden: false }]);
      const fillZoom = pl.ratio === "9:16" && pl.fitMode === "fill" ? fillZoomFor(job.asset.width, job.asset.height, targetDims.width, targetDims.height) ?? 1 : 1;
      const en = normalizeEnhance(pl.enhance);
      const enOn = !!en.enabled;
      const speed = enOn ? en.speed : 1;
      const loop = enOn ? en.loopCount : 1;
      const clip = baseClip({
        trackId: "batch-video",
        kind: "video",
        assetId: job.asset.id,
        start: 0,
        duration: (job.asset.duration / speed) * loop,
        speed,
        loopCount: loop,
        volume: enOn ? en.volume : 1,
        fadeIn: enOn ? en.fadeIn : 0,
        fadeOut: enOn ? en.fadeOut : 0,
        effects: enOn ? [...en.effects] : [],
        zoom: Math.min(8, (enOn ? en.zoom : 1) * fillZoom),
        panX: enOn ? en.panX : 0,
        panY: enOn ? en.panY : 0,
      });
      if (enOn && en.transitionType) clip.transition = { type: en.transitionType, duration: en.transitionDuration };
      const textTrack: Track = { id: "batch-text", kind: "text", name: "T", muted: false, hidden: false };
      return { clip, tracks: [...vt.tracks, textTrack] };
    };

    const rangesFor = (clip: Clip) => {
      const D = clip.duration;
      return s.mode === "single" ? [{ start: 0, end: D }] : splitRanges(D, s.splitBy, s.parts, s.partSeconds);
    };

    /** MODE KILAT: render 1 video penuh — TIDAK menyentuh store timeline (aman paralel) */
    const renderJobFast = async (job: BatchJob, vi: number) => {
      const { clip, tracks } = buildBatchClip(job);
      const ranges = rangesFor(clip);
      // subtitle: waktu sumber -> waktu timeline (satu klip video, start 0)
      const tlSubs = mapSubsToTimeline(job.subs, [clip]);
      for (let i = 0; i < ranges.length; i++) {
        const r = ranges[i];
        useEditor.getState().patchExportState({
          label: `${job.title} — ${partLabel(pl.labelStyle, i + 1, ranges.length, true)} (${doneCount + 1}/${jobs.length} berjalan)`,
          batchIndex: vi,
          batchTotal: jobs.length,
        });
        // cover bagian ini — asset LOKAL (tanpa race store antar pekerja paralel)
        let coverAssetId = job.coverAssetId;
        let assets = useEditor.getState().assets;
        if (job.frameTimes) {
          const cov = await makeCoverAsset(job.asset, job.frameTimes[i % job.frameTimes.length]);
          if (cov) {
            coverAssetId = cov.id;
            assets = [...assets, cov];
          }
        }
        const cur = useEditor.getState();
        const srcState = {
          ...cur,
          clips: [clip] as Clip[],
          tracks,
          assets,
          cover: { ...cur.cover, coverAssetId },
          texts: { ...cur.texts, title: job.title, description: pl.description, labelStyle: pl.labelStyle },
        };
        const proj = buildSplitProject(srcState, i + 1, ranges.length, r.start, r.end, {
          persistText: pl.titleDuringVideo,
          subs: tlSubs,
        });
        const rs = { clips: proj.clips, tracks: proj.tracks, assets: proj.assets, project: { width: targetDims.width, height: targetDims.height } };
        const res = await exportRangeFast({
          start: 0,
          end: proj.duration,
          rs,
          onProgress: (p) => {
            jobProgress[vi] = (i + p) / ranges.length;
            report();
          },
        });
        const label = partLabel(pl.labelStyle, i + 1, ranges.length, true);
        await blobResult(res.blob, `${slugify(job.title)}-${slugify(label)}${res.ext}`, i + 1, ranges.length, proj.duration);
      }
      jobProgress[vi] = 1;
      doneCount++;
      report();
    };

    /** MODE KOMPATIBEL: jalur lama berurutan (rekam real-time via MediaRecorder) */
    const renderJobLegacy = async (job: BatchJob, vi: number) => {
      const { clip, tracks } = buildBatchClip(job);
      const ranges = rangesFor(clip);
      const tlSubs = mapSubsToTimeline(job.subs, [clip]);
      const fmt = pickExportFormat();
      for (let i = 0; i < ranges.length; i++) {
        const r = ranges[i];
        useEditor.getState().patchExportState({
          label: `${job.title} — ${partLabel(pl.labelStyle, i + 1, ranges.length, true)} (${vi + 1}/${jobs.length})`,
          batchIndex: vi,
          batchTotal: jobs.length,
        });
        let coverAssetId = job.coverAssetId;
        if (job.frameTimes) {
          await ensureCoverAsset(job.asset, true, job.frameTimes[i % job.frameTimes.length]);
          coverAssetId = useEditor.getState().cover.coverAssetId;
        }
        const tempState = {
          ...useEditor.getState(),
          clips: coverAssetId ? [clip, baseClip({ trackId: "batch-video", kind: "image", assetId: coverAssetId, start: 0, duration: 0, label: "cover-holder" })] : ([clip] as Clip[]),
          tracks,
          assets: useEditor.getState().assets,
          cover: { ...useEditor.getState().cover, coverAssetId },
          texts: { ...useEditor.getState().texts, title: job.title, description: pl.description, labelStyle: pl.labelStyle },
        };
        const proj = buildSplitProject(tempState, i + 1, ranges.length, r.start, r.end, {
          persistText: pl.titleDuringVideo,
          subs: tlSubs,
        });
        useEditor.setState({ clips: proj.clips, tracks: proj.tracks, assets: proj.assets });
        engine.pause();
        engine.seek(0);
        await sleep(120);
        const blob = await exportRange(0, proj.duration, (p) => {
          jobProgress[vi] = (i + p) / ranges.length;
          report();
        });
        const label = partLabel(pl.labelStyle, i + 1, ranges.length, true);
        await blobResult(blob, `${slugify(job.title)}-${slugify(label)}${fmt.ext}`, i + 1, ranges.length, proj.duration);
      }
      jobProgress[vi] = 1;
      doneCount++;
      // bersihkan elemen antar video pada mode berurutan
      engine.pruneElements();
    };

    if (fast) {
      await runPool(jobs, parallel, renderJobFast);
    } else {
      for (let vi = 0; vi < jobs.length; vi++) {
        await renderJobLegacy(jobs[vi], vi);
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    console.error("Batch export gagal:", e);
    useEditor.getState().patchExportState({ label: `Gagal: ${msg}` });
  } finally {
    useEditor.setState({ clips: snapshot.clips, tracks: snapshot.tracks, assets: snapshot.assets, project: snapshot.project });
    // lepaskan elemen media sisa batch (hemat memori/dekoder)
    engine.pruneElements();
    engine.syncSize();
    engine.pause();
    engine.seek(0);
    const auto = isAutoSaveActive();
    const stEnd = useEditor.getState();
    if (!stEnd.exportState.label.startsWith("Gagal")) {
      stEnd.patchExportState({ running: false, label: auto ? "Batch selesai — semua file tersimpan di folder pilihanmu ✓" : "Batch selesai", progress: 1 });
    } else {
      stEnd.patchExportState({ running: false, progress: 1 });
    }
  }
}
