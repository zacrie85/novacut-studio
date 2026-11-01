// NOVACUT Studio - Export & Split (MediaRecorder) + cover + teks Part otomatis

import { grabFrame, aiRecommendTemplates, analyzeVideoFrames, renderCoverToDataURL } from "./covers";
import { COVER_TEMPLATES, partLabel, slugify, uid } from "./constants";
import { engine } from "./engine";
import { useEditor, totalDuration } from "./store";
import type { Clip, MediaAsset, Track } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pickMime(): string {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
  }
  return "video/webm";
}

/** Rekam rentang timeline menjadi blob webm */
export async function exportRange(start: number, end: number, onProgress?: (p: number) => void): Promise<Blob> {
  const canvas = engine.canvas;
  if (!canvas) throw new Error("Canvas belum siap");
  engine.ensureAudio();
  await engine.audioCtx?.resume().catch(() => {});
  await sleep(150);

  const stream = engine.captureStream(30);
  if (!stream) throw new Error("Browser tidak mendukung perekaman canvas");
  if (engine.recDest) {
    for (const tr of engine.recDest.stream.getAudioTracks()) stream.addTrack(tr);
  }
  const rec = new MediaRecorder(stream, {
    mimeType: pickMime(),
    videoBitsPerSecond: 9_000_000,
    audioBitsPerSecond: 192_000,
  });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<Blob>((resolve) => {
    rec.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
  });

  engine.pause();
  engine.seek(start);
  await sleep(450); // beri waktu seek
  rec.start(400);
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
    ...patch,
  };
}

export interface SplitProject {
  clips: Clip[];
  tracks: Track[];
  assets: MediaAsset[];
  duration: number;
}

/** Bangun proyek sementara untuk satu bagian hasil split (dengan cover + teks part) */
export function buildSplitProject(
  st: ReturnType<typeof useEditor.getState>,
  partIndex: number,
  totalParts: number,
  rangeStart: number,
  rangeEnd: number
): SplitProject {
  const s = st.exportSettings;
  const shift = s.includeCover && st.cover.coverAssetId ? Math.max(2, Math.min(5, s.coverDuration)) : 0;
  let tracks = st.tracks.map((t) => ({ ...t }));
  let assets = [...st.assets];

  const clips: Clip[] = [];
  for (const clip of st.clips) {
    const cEnd = clip.start + clip.duration;
    const os = Math.max(clip.start, rangeStart);
    const oe = Math.min(cEnd, rangeEnd);
    if (oe - os < 0.05) continue;
    const nc = baseClip({
      ...clip,
      start: clip.start - rangeStart + shift,
      transition: clip.start >= rangeStart - 0.05 ? clip.transition : undefined,
    });
    if (clip.loopCount <= 1 && rangeStart > clip.start + 0.05 && clip.kind === "video") {
      nc.inPoint = clip.inPoint + (rangeStart - clip.start) * clip.speed;
    }
    clips.push(nc);
  }

  const label = partLabel(s.labelStyle, partIndex, totalParts, true);

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
          size: 0.085,
          color: "#ffffff",
          font: "condensed",
          anim: "slam",
          pos: "center",
          bg: "gradient",
          stroke: true,
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
        duration: 2.4,
        text: {
          content: label,
          size: 0.12,
          color: "#ffffff",
          font: "impact",
          anim: "slam",
          pos: "bottom",
          bg: "bar",
          stroke: true,
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
        duration: 3.2,
        text: {
          content: st.texts.title,
          sub: st.texts.description || undefined,
          size: 0.07,
          color: "#ffffff",
          font: "display",
          anim: "rise",
          pos: "top",
          bg: "none",
          stroke: true,
        },
      })
    );
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

async function blobResult(blob: Blob, name: string, part: number, total: number, duration: number) {
  const url = URL.createObjectURL(blob);
  useEditor.getState().addExportResult({ id: uid("exp"), name, url, size: blob.size, part, total, duration });
  triggerDownload(url, name);
}

export function triggerDownload(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Export utama sesuai pengaturan (export saja / export & split) */
export async function runExport() {
  const st0 = useEditor.getState();
  if (st0.exportState.running) return;
  const D = totalDuration(st0.clips);
  if (D < 0.3) {
    useEditor.getState().patchExportState({ label: "Timeline masih kosong" });
    return;
  }
  const s = st0.exportSettings;
  useEditor.getState().patchExportState({ running: true, progress: 0, results: [], label: "Menyiapkan render..." });
  const snapshot = { clips: st0.clips, tracks: st0.tracks, assets: st0.assets };
  const baseName = slugify(st0.texts.title || st0.project.name);

  try {
    // cover otomatis oleh AI bila belum ada
    if (s.includeCover && !st0.cover.coverAssetId) {
      useEditor.getState().patchExportState({ label: "AI membuat cover otomatis..." });
      const firstVideo = st0.clips.map((c) => snapshot.assets.find((a) => a.id === c.assetId)).find((a) => a?.type === "video");
      await ensureCoverAsset(firstVideo);
    }
    if (s.mode === "single") {
      useEditor.getState().patchExportState({ label: "Merender video penuh..." });
      const blob = await exportRange(0, D, (p) => useEditor.getState().patchExportState({ progress: p }));
      await blobResult(blob, `${baseName}.webm`, 1, 1, D);
    } else {
      const ranges = splitRanges(D, s.splitBy, s.parts, s.partSeconds);
      const total = ranges.length;
      for (let i = 0; i < total; i++) {
        const r = ranges[i];
        useEditor.getState().patchExportState({ label: `Merender ${partLabel(s.labelStyle, i + 1, total, true)}...`, batchIndex: i, batchTotal: total });
        const proj = buildSplitProject(useEditor.getState(), i + 1, total, r.start, r.end);
        useEditor.setState({ clips: proj.clips, tracks: proj.tracks, assets: proj.assets });
        engine.pause();
        engine.seek(0);
        await sleep(120);
        const blob = await exportRange(0, proj.duration, (p) => {
          const overall = (i + p) / total;
          useEditor.getState().patchExportState({ progress: overall });
        });
        const label = partLabel(s.labelStyle, i + 1, total, true);
        await blobResult(blob, `${baseName}-${slugify(label)}.webm`, i + 1, total, proj.duration);
      }
    }
  } catch (e) {
    useEditor.getState().patchExportState({ label: `Gagal: ${e instanceof Error ? e.message : "error"}` });
  } finally {
    useEditor.setState({ clips: snapshot.clips, tracks: snapshot.tracks, assets: snapshot.assets });
    engine.pause();
    engine.seek(0);
    useEditor.getState().patchExportState({ running: false, label: "Selesai", progress: 1 });
  }
}

/** Pastikan cover asset tersedia; buat otomatis dengan AI bila perlu */
async function ensureCoverAsset(sourceAsset: MediaAsset | undefined): Promise<string | undefined> {
  const st = useEditor.getState();
  if (st.cover.coverAssetId && st.assets.some((a) => a.id === st.cover.coverAssetId)) return st.cover.coverAssetId;
  if (!sourceAsset || sourceAsset.type !== "video") return undefined;
  const title = st.texts.title || sourceAsset.name.replace(/\.[^.]+$/, "");
  let frameUrl: string | null = null;
  let brightness = 128;
  try {
    const analysis = await analyzeVideoFrames(sourceAsset.url, sourceAsset.duration, 6);
    if (analysis.best) {
      brightness = analysis.best.brightness;
      frameUrl = await grabFrame(sourceAsset.url, analysis.best.time, 1280);
    }
  } catch {
    /* fallback di bawah */
  }
  if (!frameUrl) frameUrl = await grabFrame(sourceAsset.url, Math.min(sourceAsset.duration - 0.2, sourceAsset.duration * 0.3), 1280);
  if (!frameUrl) return undefined;
  const tpl = aiRecommendTemplates(title, brightness, 1)[0] ?? COVER_TEMPLATES[0];
  const img = new Image();
  img.src = frameUrl;
  await img.decode().catch(() => {});
  const dataUrl = renderCoverToDataURL({ img, title, template: tpl });
  const asset: MediaAsset = { id: uid("as"), name: `Cover - ${title}`, type: "image", url: dataUrl, duration: 0, width: 1280, height: 720 };
  useEditor.getState().addAsset(asset);
  useEditor.getState().setCover({ coverAssetId: asset.id, previewUrl: dataUrl, frameTime: 0 });
  return asset.id;
}

/** Export & split batch untuk semua video di playlist */
export async function runBatchExport(assetIds: string[]) {
  const st0 = useEditor.getState();
  if (st0.exportState.running || !assetIds.length) return;
  useEditor.getState().patchExportState({ running: true, progress: 0, results: [], label: "Menyiapkan batch...", batchTotal: assetIds.length, batchIndex: 0 });
  const snapshot = { clips: st0.clips, tracks: st0.tracks, assets: st0.assets };
  const s = st0.exportSettings;

  try {
    for (let vi = 0; vi < assetIds.length; vi++) {
      const asset = snapshot.assets.find((a) => a.id === assetIds[vi]);
      if (!asset || asset.type !== "video") continue;
      const title = asset.name.replace(/\.[^.]+$/, "");
      useEditor.getState().setTexts({ title: useEditor.getState().texts.title || title });
      useEditor.getState().patchExportState({ label: `Playlist ${vi + 1}/${assetIds.length}: ${title}` });

      // proyek sementara: satu klip video penuh
      const vt = ensureVideoTrack([{ ...snapshot.tracks[0], id: "batch-video", kind: "video", name: "V", muted: false, hidden: false }]);
      const clip = baseClip({ trackId: "batch-video", kind: "video", assetId: asset.id, start: 0, duration: asset.duration });
      const tempAssets = [...snapshot.assets];

      // cover otomatis per video (jika diaktifkan & belum ada cover global)
      let coverAssetId = st0.cover.coverAssetId;
      if (s.includeCover) {
        if (!coverAssetId || !tempAssets.some((a) => a.id === coverAssetId)) {
          coverAssetId = await ensureCoverAsset(asset);
        }
      }
      const textTrack: Track = { id: "batch-text", kind: "text", name: "T", muted: false, hidden: false };
      const tempTracks = [...vt.tracks, textTrack];
      const tempState = {
        ...useEditor.getState(),
        clips: coverAssetId ? [clip, baseClip({ trackId: "batch-video", kind: "image", assetId: coverAssetId, start: 0, duration: 0, label: "cover-holder" })] : [clip],
        tracks: tempTracks,
        assets: tempAssets,
        cover: { ...st0.cover, coverAssetId },
        texts: { ...useEditor.getState().texts, title: useEditor.getState().texts.title || title },
      };

      const D = asset.duration;
      const ranges = splitRanges(D, s.splitBy, s.parts, s.partSeconds);
      for (let i = 0; i < ranges.length; i++) {
        useEditor.getState().patchExportState({
          label: `${title} — ${partLabel(s.labelStyle, i + 1, ranges.length, true)} (${vi + 1}/${assetIds.length})`,
          batchIndex: vi,
          batchTotal: assetIds.length,
        });
        const proj = buildSplitProject(tempState, i + 1, ranges.length, ranges[i].start, ranges[i].end);
        useEditor.setState({ clips: proj.clips, tracks: proj.tracks, assets: proj.assets });
        engine.pause();
        engine.seek(0);
        await sleep(120);
        const blob = await exportRange(0, proj.duration, (p) => {
          const overall = (vi + (i + p) / ranges.length) / assetIds.length;
          useEditor.getState().patchExportState({ progress: overall });
        });
        const label = partLabel(s.labelStyle, i + 1, ranges.length, true);
        await blobResult(blob, `${slugify(title)}-${slugify(label)}.webm`, i + 1, ranges.length, proj.duration);
      }
    }
  } catch (e) {
    useEditor.getState().patchExportState({ label: `Gagal: ${e instanceof Error ? e.message : "error"}` });
  } finally {
    useEditor.setState({ clips: snapshot.clips, tracks: snapshot.tracks, assets: snapshot.assets });
    engine.pause();
    engine.seek(0);
    useEditor.getState().patchExportState({ running: false, label: "Batch selesai", progress: 1 });
  }
}
