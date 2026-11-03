"use client";

// NOVACUT Studio - Kontrol kadro: zoom + tombol geser atas/bawah/kiri/kanan (mode 9:16)
// Ada dua varian: klip timeline (FramingControls) & video playlist (PlaylistFramingControls).

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Crosshair, Film, Maximize, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { normalizeEnhance } from "@/lib/editor/playlistExport";
import { useEditor } from "@/lib/editor/store";
import { fillZoomFor, framingLayout } from "@/lib/editor/visual";
import type { MediaAsset, PlaylistEnhance } from "@/lib/editor/types";
import { cn } from "@/lib/utils";

const PAN_STEP = 0.15;

const padBtn =
  "flex h-8 w-8 items-center justify-center rounded-md border border-blue-500/25 bg-blue-500/10 text-blue-300 transition hover:border-blue-400 hover:bg-blue-500/25 active:scale-95";

// ===== v1.0.21: PRATINJAU KADRO — gambar satu frame video + zoom & geser persis
// seperti jalur render (framingLayout), jadi apa yang terlihat = hasil export.

/** cache frame pratinjau per asset (dataURL 480px) — diambil sekali */
const previewFrameCache = new Map<string, string>();

async function grabPreviewFrame(asset: MediaAsset): Promise<string | null> {
  const hit = previewFrameCache.get(asset.id);
  if (hit) return hit;
  const src = await new Promise<string | null>((res) => {
    const el = document.createElement("video");
    el.preload = "auto";
    el.muted = true;
    let settled = false;
    const done = (v: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      el.removeAttribute("src");
      el.load();
      res(v);
    };
    const timer = setTimeout(() => done(null), 6000);
    el.onloadedmetadata = () => {
      // frame representatif: 10% durasi (minimal 0.5 dtk, maksimal 60 dtk)
      el.currentTime = Math.min(Math.max(0.5, (el.duration || 2) * 0.1), 60);
    };
    el.onseeked = () => {
      try {
        const c = document.createElement("canvas");
        const scale = 480 / Math.max(1, el.videoWidth);
        c.width = 480;
        c.height = Math.max(1, Math.round(el.videoHeight * scale));
        const ctx = c.getContext("2d");
        if (!ctx) return done(null);
        ctx.drawImage(el, 0, 0, c.width, c.height);
        done(c.toDataURL("image/jpeg", 0.82));
      } catch {
        done(null);
      }
    };
    el.onerror = () => done(null);
    el.src = asset.url;
  });
  if (src) previewFrameCache.set(asset.id, src);
  return src;
}

/** Kanvas mini 9:16 — menampilkan video dengan ZOOM & GESER yang sedang disetel.
 * Matematika gambar = engine.ts composeFrame (framingLayout + pan overX/overY). */
function FramingPreview({ asset, zoom, panX, panY }: { asset: MediaAsset | undefined; zoom: number; panX: number; panY: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState<HTMLImageElement | null>(null);

  // ambil frame video (cache per asset) → gambar
  useEffect(() => {
    let dead = false;
    setFrame(null);
    if (!asset?.url) return;
    void (async () => {
      const src = await grabPreviewFrame(asset);
      if (dead || !src) return;
      const img = new Image();
      img.onload = () => {
        if (!dead) setFrame(img);
      };
      img.src = src;
    })();
    return () => {
      dead = true;
    };
  }, [asset?.id]);

  // gambar ulang setiap zoom / geser berubah — langsung tanpa delay
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = cv.width;
    const H = cv.height;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    if (frame && frame.naturalWidth) {
      const layout = framingLayout(frame.naturalWidth, frame.naturalHeight, W, H, zoom);
      const dx = (W - layout.dw) / 2 + panX * layout.overX;
      const dy = (H - layout.dh) / 2 + panY * layout.overY;
      ctx.drawImage(frame, dx, dy, layout.dw, layout.dh);
    }
  }, [frame, zoom, panX, panY]);

  if (!asset) {
    return (
      <div className="hidden w-16 shrink-0 flex-col items-center gap-1 @min-[300px]:flex">
        <div className="flex aspect-[9/16] w-full items-center justify-center rounded-lg border border-white/10 bg-black/60 text-gray-600">
          <Film className="h-5 w-5" />
        </div>
      </div>
    );
  }

  return (
    <div className="hidden w-16 shrink-0 flex-col items-center gap-1 @min-[300px]:flex @min-[430px]:w-24">
      <canvas
        ref={ref}
        width={192}
        height={340}
        title={asset.name}
        className="h-auto w-full rounded-lg border border-blue-500/25 bg-black"
      />
      <div className="text-center text-[8px] font-semibold tracking-widest text-gray-500">PRATINJAU</div>
    </div>
  );
}

export function FramingControls({ target, className }: { target: "active" | "selected"; className?: string }) {
  const clipId = useEditor((s) => {
    if (target === "selected") return s.selectedClipId;
    // klip visual paling atas yang tampil di playhead
    let found: string | null = null;
    for (const track of s.tracks) {
      if (track.kind === "audio" || track.kind === "text" || track.hidden) continue;
      const active = s.clips
        .filter((c) => c.trackId === track.id && c.start <= s.playhead && s.playhead < c.start + c.duration)
        .sort((a, b) => a.start - b.start)
        .pop();
      if (active) found = active.id;
    }
    return found;
  });
  const clip = useEditor((s) => s.clips.find((c) => c.id === clipId));
  const asset = useEditor((s) => s.assets.find((a) => a.id === clip?.assetId));
  const project = useEditor((s) => s.project);
  const st = useEditor.getState();
  const ratio = project.ratio;
  // zoom minimum agar video mengisi penuh frame (mis. 16:9 -> 9:16 = 3.16x)
  const fillZoom = asset?.width && asset?.height ? fillZoomFor(asset.width, asset.height, project.width, project.height) : null;

  if (!clip || (clip.kind !== "video" && clip.kind !== "image")) {
    return (
      <div className={cn("rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-gray-500", className)}>
        <span className="font-semibold tracking-wider text-blue-400">ZOOM &amp; GESER {ratio}</span>
        <div className="mt-0.5">{target === "selected" ? "Pilih klip video/gambar di timeline untuk mengatur zoom & geser." : "Putar playhead di atas klip video/gambar."}</div>
      </div>
    );
  }

  const zoom = clip.zoom ?? 1;
  const panX = clip.panX ?? 0;
  const panY = clip.panY ?? 0;

  return (
    <div className={cn("space-y-2 rounded-lg border border-blue-500/20 bg-black/40 px-3 py-2.5 ", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-widest text-blue-400">ZOOM &amp; GESER {ratio}</span>
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[11px] text-blue-200 transition hover:border-blue-400 hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => fillZoom && st.setClipZoom(clip.id, fillZoom)}
            disabled={!fillZoom}
            title="Perbesar tepat sampai video mengisi penuh frame"
          >
            <Maximize className="h-3 w-3" /> ISI FRAME
          </button>
          <button
            className="flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-[11px] text-gray-400 transition hover:border-blue-500/40 hover:text-blue-300"
            onClick={() => st.resetClipFraming(clip.id)}
            title="Kembali ke ukuran asli (1.00x) & posisi tengah"
          >
            <RotateCcw className="h-3 w-3" /> RESET
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* zoom */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className={padBtn} onClick={() => st.setClipZoom(clip.id, zoom - 0.1)} aria-label="Perkecil" disabled={zoom <= 1}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Slider value={[zoom]} min={1} max={5} step={0.05} onValueChange={([v]) => st.setClipZoom(clip.id, v)} className="flex-1" aria-label="Zoom" />
            <Button size="sm" variant="outline" className={padBtn} onClick={() => st.setClipZoom(clip.id, zoom + 0.1)} aria-label="Perbesar" disabled={zoom >= 5}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <span className="w-11 text-right font-mono text-[11px] text-blue-400">{zoom.toFixed(2)}x</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>
              Posisi X <span className="font-mono text-gray-400">{panX >= 0 ? "+" : ""}{panX.toFixed(2)}</span> · Posisi Y{" "}
              <span className="font-mono text-gray-400">{panY >= 0 ? "+" : ""}{panY.toFixed(2)}</span>
            </span>
            {asset?.width ? <span className="hidden font-mono sm:inline">{asset.width}×{asset.height}</span> : null}
          </div>
          <div className={zoom <= 1.001 ? "text-[11px] text-blue-400/90" : "text-[11px] text-gray-400"}>
            {zoom <= 1.001
              ? "Ukuran asli 1.00x — video utuh terlihat, tanpa zoom otomatis."
              : fillZoom && zoom + 0.005 >= fillZoom
                ? `Zoom ${zoom.toFixed(2)}x — mengisi penuh frame, geser bebas.`
                : `Zoom ${zoom.toFixed(2)}x — geser di arah yang masih tersedia.`}
          </div>
        </div>

        {/* d-pad geser */}
        <div className="grid shrink-0 grid-cols-3 gap-1">
          <span />
          <Button size="sm" variant="outline" className={padBtn} onClick={() => st.nudgeClipPan(clip.id, 0, -PAN_STEP)} aria-label="Geser ke atas" title="Geser ke atas">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span />
          <Button size="sm" variant="outline" className={padBtn} onClick={() => st.nudgeClipPan(clip.id, -PAN_STEP, 0)} aria-label="Geser ke kiri" title="Geser ke kiri">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-300 transition hover:border-blue-400 hover:text-blue-300 active:scale-95"
            onClick={() => st.setClipPan(clip.id, 0, 0)}
            aria-label="Tengah"
            title="Pusatkan"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className={padBtn} onClick={() => st.nudgeClipPan(clip.id, PAN_STEP, 0)} aria-label="Geser ke kanan" title="Geser ke kanan">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <span />
          <Button size="sm" variant="outline" className={padBtn} onClick={() => st.nudgeClipPan(clip.id, 0, PAN_STEP)} aria-label="Geser ke bawah" title="Geser ke bawah">
            <ArrowDown className="h-4 w-4" />
          </Button>
          <span />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] leading-relaxed text-gray-500">
        <Maximize className="h-3 w-3 shrink-0 text-blue-500/70" />
        1.00x = ukuran asli (video utuh, ada bar hitam bila rasio beda). Zoom manual untuk memperbesar, seret video di preview untuk geser bebas. Tombol ⤢ tengah = pusatkan.
      </div>
    </div>
  );
}

/** Varian kadro untuk target "Video Playlist" — mengatur zoom & geser yang
 * diterapkan ke semua video hasil Export & Split langsung dari Playlist.
 * v1.0.20: judul & teks info bisa ditimpa lewat props agar pas konteks
 * (mis. dipasang tepat di bawah pilihan "Video utuh" di Rasio & Layar). */
export function PlaylistFramingControls({ className, title, hint }: { className?: string; title?: string; hint?: string }) {
  const plState = useEditor((s) => s.playlistExport);
  const project = useEditor((s) => s.project);
  const firstVideo = useEditor((s) => s.assets.find((a) => a.type === "video"));
  const en = normalizeEnhance(plState.enhance);

  const patch = (p: Partial<PlaylistEnhance>) => useEditor.getState().setPlaylistExport({ enhance: { ...en, ...p } });
  const nudge = (dx: number, dy: number) => {
    const px = Math.max(-1, Math.min(1, en.panX + dx));
    const py = Math.max(-1, Math.min(1, en.panY + dy));
    patch({ panX: Math.abs(px) < 0.02 ? 0 : px, panY: Math.abs(py) < 0.02 ? 0 : py });
  };

  const zoom = en.zoom;
  const panX = en.panX;
  const panY = en.panY;
  const fillZoom = firstVideo?.width && firstVideo?.height ? fillZoomFor(firstVideo.width, firstVideo.height, project.width, project.height) : null;

  return (
    <div className={cn("space-y-2 rounded-lg border border-blue-500/20 bg-black/40 px-3 py-2.5 @container", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-widest text-blue-400">{title ?? `ZOOM & GESER ${project.ratio}`}</span>
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[11px] text-blue-200 transition hover:border-blue-400 hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => fillZoom && patch({ zoom: fillZoom })}
            disabled={!fillZoom}
            title="Perbesar tepat sampai video mengisi penuh frame"
          >
            <Maximize className="h-3 w-3" /> ISI FRAME
          </button>
          <button
            className="flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-[11px] text-gray-400 transition hover:border-blue-500/40 hover:text-blue-300"
            onClick={() => patch({ zoom: 1, panX: 0, panY: 0 })}
            title="Kembali ke ukuran asli (1.00x) & posisi tengah"
          >
            <RotateCcw className="h-3 w-3" /> RESET
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* v1.0.21: pratinjau live di kiri — frame video + zoom & geser yang sedang disetel */}
        <FramingPreview asset={firstVideo} zoom={zoom} panX={panX} panY={panY} />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className={padBtn} onClick={() => patch({ zoom: Math.max(1, zoom - 0.1) })} aria-label="Perkecil" disabled={zoom <= 1}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Slider value={[zoom]} min={1} max={5} step={0.05} onValueChange={([v]) => patch({ zoom: v })} className="flex-1" aria-label="Zoom" />
            <Button size="sm" variant="outline" className={padBtn} onClick={() => patch({ zoom: Math.min(5, zoom + 0.1) })} aria-label="Perbesar" disabled={zoom >= 5}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <span className="hidden w-11 text-right font-mono text-[11px] text-blue-400 @min-[380px]:inline">{zoom.toFixed(2)}x</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>
              Posisi X <span className="font-mono text-gray-400">{panX >= 0 ? "+" : ""}{panX.toFixed(2)}</span> · Posisi Y{" "}
              <span className="font-mono text-gray-400">{panY >= 0 ? "+" : ""}{panY.toFixed(2)}</span>
            </span>
            {firstVideo?.width ? <span className="hidden font-mono sm:inline">{firstVideo.width}×{firstVideo.height}</span> : null}
          </div>
          <div className={zoom <= 1.001 ? "text-[11px] text-blue-400/90" : "text-[11px] text-gray-400"}>
            {zoom <= 1.001
              ? "Ukuran asli 1.00x — dipakai sebagai dasar untuk semua video playlist."
              : `Zoom ${zoom.toFixed(2)}x — diterapkan ke semua video playlist.`}
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-1">
          <span />
          <Button size="sm" variant="outline" className={padBtn} onClick={() => nudge(0, -PAN_STEP)} aria-label="Geser ke atas" title="Geser ke atas">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span />
          <Button size="sm" variant="outline" className={padBtn} onClick={() => nudge(-PAN_STEP, 0)} aria-label="Geser ke kiri" title="Geser ke kiri">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-300 transition hover:border-blue-400 hover:text-blue-300 active:scale-95"
            onClick={() => patch({ panX: 0, panY: 0 })}
            aria-label="Tengah"
            title="Pusatkan"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className={padBtn} onClick={() => nudge(PAN_STEP, 0)} aria-label="Geser ke kanan" title="Geser ke kanan">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <span />
          <Button size="sm" variant="outline" className={padBtn} onClick={() => nudge(0, PAN_STEP)} aria-label="Geser ke bawah" title="Geser ke bawah">
            <ArrowDown className="h-4 w-4" />
          </Button>
          <span />
        </div>
      </div>

      <div className="flex items-start gap-1.5 text-[11px] leading-relaxed text-gray-500">
        <Maximize className="mt-0.5 h-3 w-3 shrink-0 text-blue-500/70" />
        <span>{hint ?? <>Berlaku ke semua video hasil Export &amp; Split dari Playlist. Mode rasio 9:16 &quot;Isi penuh&quot; tetap otomatis, zoom ini menambahkannya.</>}</span>
      </div>
    </div>
  );
}
