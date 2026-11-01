"use client";

// NOVACUT Studio - Preview + transport

import { useEffect, useRef } from "react";
import { Pause, Play, SkipBack, SkipForward, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditor, totalDuration } from "@/lib/editor/store";
import { engine } from "@/lib/editor/engine";
import { fmtTime } from "@/lib/editor/constants";

export function Preview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playing = useEditor((s) => s.playing);
  const playhead = useEditor((s) => s.playhead);
  const clips = useEditor((s) => s.clips);
  const project = useEditor((s) => s.project);
  const duration = totalDuration(clips);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <canvas
          ref={canvasRef}
          width={project.width}
          height={project.height}
          className="max-h-full max-w-full rounded-lg border border-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.12)]"
          style={{ aspectRatio: `${project.width}/${project.height}` }}
        />
      </div>
      <div className="flex items-center justify-center gap-2">
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
