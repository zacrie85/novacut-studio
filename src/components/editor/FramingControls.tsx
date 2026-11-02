"use client";

// NOVACUT Studio - Kontrol kadro: zoom + tombol geser atas/bawah/kiri/kanan (mode 9:16)

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Crosshair, Maximize, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useEditor } from "@/lib/editor/store";
import { fillZoomFor } from "@/lib/editor/visual";
import { cn } from "@/lib/utils";

const PAN_STEP = 0.15;

const padBtn =
  "flex h-8 w-8 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/25 active:scale-95";

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
      <div className={cn("rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-[10px] text-gray-500", className)}>
        <span className="font-semibold tracking-wider text-cyan-400">ZOOM &amp; GESER {ratio}</span>
        <div className="mt-0.5">{target === "selected" ? "Pilih klip video/gambar di timeline untuk mengatur zoom & geser." : "Putar playhead di atas klip video/gambar."}</div>
      </div>
    );
  }

  const zoom = clip.zoom ?? 1;
  const panX = clip.panX ?? 0;
  const panY = clip.panY ?? 0;

  return (
    <div className={cn("space-y-2 rounded-lg border border-cyan-400/20 bg-black/40 px-3 py-2.5 shadow-[0_0_18px_rgba(34,211,238,0.08)]", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest text-cyan-300">ZOOM &amp; GESER {ratio}</span>
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1 rounded border border-fuchsia-400/30 bg-fuchsia-400/10 px-1.5 py-0.5 text-[9px] text-fuchsia-200 transition hover:border-fuchsia-300 hover:bg-fuchsia-400/25 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => fillZoom && st.setClipZoom(clip.id, fillZoom)}
            disabled={!fillZoom}
            title="Perbesar tepat sampai video mengisi penuh frame"
          >
            <Maximize className="h-3 w-3" /> ISI FRAME
          </button>
          <button
            className="flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-gray-400 transition hover:border-cyan-400/40 hover:text-cyan-200"
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
            <span className="w-11 text-right font-mono text-[11px] text-cyan-300">{zoom.toFixed(2)}x</span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-gray-500">
            <span>
              Posisi X <span className="font-mono text-gray-400">{panX >= 0 ? "+" : ""}{panX.toFixed(2)}</span> · Posisi Y{" "}
              <span className="font-mono text-gray-400">{panY >= 0 ? "+" : ""}{panY.toFixed(2)}</span>
            </span>
            {asset?.width ? <span className="hidden font-mono sm:inline">{asset.width}×{asset.height}</span> : null}
          </div>
          <div className={zoom <= 1.001 ? "text-[9px] text-cyan-300/90" : "text-[9px] text-gray-400"}>
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
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-300 transition hover:border-cyan-300 hover:text-cyan-200 active:scale-95"
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

      <div className="flex items-center gap-1.5 text-[9px] leading-relaxed text-gray-500">
        <Maximize className="h-3 w-3 shrink-0 text-cyan-500/70" />
        1.00x = ukuran asli (video utuh, ada bar hitam bila rasio beda). Zoom manual untuk memperbesar, seret video di preview untuk geser bebas. Tombol ⤢ tengah = pusatkan.
      </div>
    </div>
  );
}
