"use client";

// NOVACUT Studio - Preview + transport + kadro 9:16 (zoom & geser)

import { useEffect, useRef } from "react";
import { Pause, Play, SkipBack, SkipForward, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { activeVisualClipAt, useEditor, totalDuration } from "@/lib/editor/store";
import { engine } from "@/lib/editor/engine";
import { fmtTime } from "@/lib/editor/constants";
import { framingLayout } from "@/lib/editor/visual";
import { FramingControls } from "./FramingControls";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function Preview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ id: string; x: number; y: number; panX: number; panY: number; overX: number; overY: number; scale: number } | null>(null);
  const playing = useEditor((s) => s.playing);
  const playhead = useEditor((s) => s.playhead);
  const clips = useEditor((s) => s.clips);
  const project = useEditor((s) => s.project);
  const duration = totalDuration(clips);
  const vertical = project.ratio === "9:16";

  useEffect(() => {
    if (canvasRef.current) engine.attach(canvasRef.current);
    return () => engine.pause();
  }, []);

  useEffect(() => {
    engine.syncSize();
  }, [project.width, project.height]);

  useEffect(() => {
    if (!engine.playing) engine.requestRender();
  }, [clips]);

  const jump = (dir: 1 | -1) => {
    const st = useEditor.getState();
    const edges = [...new Set(st.clips.flatMap((c) => [c.start, c.start + c.duration]))].sort((a, b) => a - b);
    const t = dir === 1 ? edges.find((e) => e > st.playhead + 0.01) : [...edges].reverse().find((e) => e < st.playhead - 0.01);
    engine.seek(t ?? (dir === 1 ? duration : 0));
  };

  // ==== drag-to-pan: seret video di preview untuk menggeser kadro ====
  const panTarget = () => {
    const st = useEditor.getState();
    const clip = activeVisualClipAt(st, st.playhead);
    if (!clip || (clip.kind !== "video" && clip.kind !== "image")) return null;
    const asset = st.getAsset(clip.assetId);
    if (!asset?.width || !asset.height) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const layout = framingLayout(asset.width, asset.height, canvas.width, canvas.height, clip.zoom ?? 1);
    if (layout.overX <= 0 && layout.overY <= 0) return null;
    return { clip, layout, canvas };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const target = panTarget();
    if (!target) return;
    const rect = target.canvas.getBoundingClientRect();
    dragRef.current = {
      id: target.clip.id,
      x: e.clientX,
      y: e.clientY,
      panX: target.clip.panX ?? 0,
      panY: target.clip.panY ?? 0,
      overX: target.layout.overX,
      overY: target.layout.overY,
      scale: target.canvas.width / Math.max(1, rect.width),
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.x) * d.scale;
    const dy = (e.clientY - d.y) * d.scale;
    useEditor.getState().updateClip(d.id, {
      panX: clamp(d.panX + (d.overX > 0 ? dx / d.overX : 0), -1, 1),
      panY: clamp(d.panY + (d.overY > 0 ? dy / d.overY : 0), -1, 1),
    });
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          <canvas
            ref={canvasRef}
            width={project.width}
            height={project.height}
            className={`max-h-full max-w-full rounded-lg border border-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.12)] ${vertical ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
            style={{ aspectRatio: `${project.width}/${project.height}` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            aria-label="Preview video"
          />
        </div>

        {vertical && (
          <div className="flex w-60 shrink-0 flex-col justify-center lg:w-72">
            <FramingControls target="active" />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-2">
        <Button size="sm" variant="outline" className="h-8 border-white/10 bg-white/5" onClick={() => engine.seek(0)} aria-label="Ke awal">
          <Square className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 border-white/10 bg-white/5" onClick={() => jump(-1)} aria-label="Klip sebelumnya">
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          className="h-9 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-[0_0_18px_rgba(34,211,238,0.45)] hover:from-cyan-400 hover:to-fuchsia-400"
          onClick={() => engine.toggle()}
          aria-label={playing ? "Jeda" : "Putar"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="outline" className="h-8 border-white/10 bg-white/5" onClick={() => jump(1)} aria-label="Klip berikutnya">
          <SkipForward className="h-4 w-4" />
        </Button>
        <div className="ml-2 rounded-md border border-white/10 bg-black/40 px-3 py-1 font-mono text-xs text-cyan-300">
          {fmtTime(playhead, true)} <span className="text-gray-500">/ {fmtTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
