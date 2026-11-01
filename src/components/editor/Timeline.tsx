"use client";

// NOVACUT Studio - Timeline multi-layer interaktif

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Copy, Eye, EyeOff, Layers, Magnet, Scissors, Trash2, Volume2, VolumeX, ZoomIn, ZoomOut, Type, Image as ImageIcon, Film, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditor, totalDuration, selectedClip } from "@/lib/editor/store";
import { engine } from "@/lib/editor/engine";
import { TRACK_STYLE, fmtTime } from "@/lib/editor/constants";
import type { Clip, Track, TrackKind } from "@/lib/editor/types";

const HEADER_W = 148;
const TRACK_H: Record<TrackKind, number> = { video: 58, image: 46, text: 40, audio: 46 };

function compatible(trackKind: TrackKind, clipKind: Clip["kind"]): boolean {
  if (trackKind === "video") return clipKind === "video" || clipKind === "image";
  if (trackKind === "image") return clipKind === "image";
  if (trackKind === "text") return clipKind === "text";
  if (trackKind === "audio") return clipKind === "audio";
  return false;
}

function kindIcon(kind: TrackKind) {
  if (kind === "video") return <Film className="h-3.5 w-3.5" />;
  if (kind === "image") return <ImageIcon className="h-3.5 w-3.5" />;
  if (kind === "text") return <Type className="h-3.5 w-3.5" />;
  return <Music className="h-3.5 w-3.5" />;
}

export function Timeline() {
  const tracks = useEditor((s) => s.tracks);
  const clips = useEditor((s) => s.clips);
  const zoom = useEditor((s) => s.zoom);
  const snap = useEditor((s) => s.snap);
  const selectedId = useEditor((s) => s.selectedClipId);
  const playhead = useEditor((s) => s.playhead);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);

  const duration = useMemo(() => totalDuration(clips), [clips]);
  const contentW = Math.max(900, (duration + 12) * zoom);

  const snapTargets = useMemo(() => {
    const t: { id: string; time: number }[] = [];
    for (const c of clips) {
      t.push({ id: c.id, time: c.start }, { id: c.id, time: c.start + c.duration });
    }
    return t;
  }, [clips]);

  const snapTime = useCallback(
    (t: number, excludeId?: string) => {
      if (!snap) return t;
      const tol = 8 / zoom;
      // batas klip yang sedang digeser dikecualikan agar klip tidak "menempel"
      // pada posisi asalnya saat mulai ditarik
      const targets = [0, useEditor.getState().playhead, ...snapTargets.filter((s) => s.id !== excludeId).map((s) => s.time)];
      let best = t;
      let bd = tol;
      for (const tg of targets) {
        const d = Math.abs(tg - t);
        if (d < bd) {
          bd = d;
          best = tg;
        }
      }
      return best;
    },
    [snap, snapTargets, zoom]
  );

  // autoscroll mengikuti playhead
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const x = HEADER_W + playhead * zoom;
    if (x < el.scrollLeft + HEADER_W || x > el.scrollLeft + el.clientWidth - 60) {
      el.scrollLeft = Math.max(0, x - el.clientWidth * 0.5);
    }
  }, [playhead, zoom]);

  const seekFromEvent = useCallback(
    (clientX: number) => {
      const lane = lanesRef.current?.querySelector("[data-trackid]");
      if (!lane) return;
      const rect = lane.getBoundingClientRect();
      const t = Math.max(0, (clientX - rect.left) / zoom);
      engine.seek(t);
    },
    [zoom]
  );

  const startScrub = (e: React.PointerEvent) => {
    e.preventDefault();
    seekFromEvent(e.clientX);
    const move = (ev: PointerEvent) => seekFromEvent(ev.clientX);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // auto-scroll area timeline saat pointer menekan tepi kiri/kanan
  // (agar klip bisa ditarik/dipotong sampai ujung video walau timeline lebih panjang dari layar)
  const startEdgeScroll = (getX: () => number, onScroll: () => void) => {
    let raf = 0;
    const step = () => {
      const el = scrollRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const edge = 64;
        const minEdge = rect.left + HEADER_W + edge;
        const x = getX();
        let d = 0;
        if (x > rect.right - edge) d = Math.min(34, 6 + (x - (rect.right - edge)) / 3);
        else if (x < minEdge) d = -Math.min(34, 6 + (minEdge - x) / 3);
        if (d !== 0) {
          el.scrollLeft += d;
          onScroll();
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  };

  const clipDrag = (e: React.PointerEvent, clip: Clip) => {
    e.stopPropagation();
    useEditor.getState().select(clip.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const orig = { ...clip };
    let moved = false;
    let lastX = e.clientX;
    let lastY = e.clientY;
    // posisi kiri lane saat mulai drag; dipakai sebagai acuan agar posisi klip
    // mengikuti koordinat TIMELINE (bukan layar) sehingga tetap jalan saat auto-scroll
    const laneNow = () => lanesRef.current?.querySelector<HTMLElement>("[data-trackid]")?.getBoundingClientRect().left ?? 0;
    const laneLeft0 = laneNow();

    const apply = (clientX: number, clientY: number) => {
      const dx = (clientX - laneNow()) / zoom - (startX - laneLeft0) / zoom;
      let newStart = Math.max(0, orig.start + dx);
      const snapped = snapTime(newStart, clip.id);
      const snappedEnd = snapTime(newStart + orig.duration, clip.id) - orig.duration;
      newStart = Math.abs(snapped - newStart) <= Math.abs(snappedEnd - newStart) ? snapped : Math.max(0, snappedEnd);
      // ganti track vertikal
      const lanes = lanesRef.current;
      let trackId = orig.trackId;
      if (lanes) {
        const rows = Array.from(lanes.querySelectorAll<HTMLElement>("[data-trackid]"));
        for (const r of rows) {
          const rect = r.getBoundingClientRect();
          if (clientY >= rect.top && clientY <= rect.bottom) {
            const tid = r.dataset.trackid;
            const t = tracks.find((x) => x.id === tid);
            if (t && compatible(t.kind, orig.kind)) trackId = t.id;
          }
        }
      }
      useEditor.getState().moveClip(clip.id, newStart, trackId);
    };

    const move = (ev: PointerEvent) => {
      lastX = ev.clientX;
      lastY = ev.clientY;
      if (!moved && Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) < 4) return;
      moved = true;
      apply(ev.clientX, ev.clientY);
    };
    const stopScroll = startEdgeScroll(
      () => lastX,
      () => moved && apply(lastX, lastY)
    );
    const up = () => {
      stopScroll();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const clipTrim = (e: React.PointerEvent, clip: Clip, edge: "l" | "r") => {
    e.stopPropagation();
    const startX = e.clientX;
    const orig = { ...clip };
    let lastX = e.clientX;
    const asset = useEditor.getState().getAsset(clip.assetId);
    const maxSrc = asset && asset.duration > 0 ? asset.duration : 600;
    const laneNow = () => lanesRef.current?.querySelector<HTMLElement>("[data-trackid]")?.getBoundingClientRect().left ?? 0;
    const laneLeft0 = laneNow();

    const apply = (clientX: number) => {
      const dt = (clientX - laneNow()) / zoom - (startX - laneLeft0) / zoom;
      if (edge === "l") {
        const minDt = clip.loopCount > 1 ? -orig.start : Math.max(-orig.start, -orig.inPoint / orig.speed - 0.001);
        const maxDt = orig.duration - 0.2;
        const dt2 = Math.max(minDt, Math.min(maxDt, dt));
        const ns = snapTime(Math.max(0, orig.start + dt2), clip.id);
        const dd = ns - orig.start;
        useEditor.getState().updateClip(clip.id, {
          start: ns,
          duration: Math.max(0.2, orig.duration - dd),
          inPoint: clip.loopCount > 1 ? orig.inPoint : Math.max(0, orig.inPoint + dd * orig.speed),
        });
      } else {
        const maxDur = clip.loopCount > 1 ? 600 : (maxSrc - orig.inPoint) / orig.speed + 0.25;
        let nd = Math.max(0.2, Math.min(600, orig.duration + dt));
        const snappedEnd = snapTime(orig.start + nd, clip.id);
        nd = Math.max(0.2, snappedEnd - orig.start);
        nd = Math.min(nd, maxDur);
        useEditor.getState().updateClip(clip.id, { duration: nd });
      }
    };

    const move = (ev: PointerEvent) => {
      lastX = ev.clientX;
      apply(ev.clientX);
    };
    const stopScroll = startEdgeScroll(
      () => lastX,
      () => apply(lastX)
    );
    const up = () => {
      stopScroll();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const ticks = useMemo(() => {
    const steps = [0.5, 1, 2, 5, 10, 30, 60];
    const step = steps.find((s) => s * zoom > 64) ?? 120;
    const arr: number[] = [];
    for (let t = 0; t <= duration + 12; t += step) arr.push(t);
    return { arr, step };
  }, [zoom, duration]);

  const sel = selectedClip(useEditor.getState());

  return (
    <div className="flex h-full flex-col bg-[#070812]">
      {/* Toolbar timeline */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 px-2 py-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 gap-1 border-cyan-400/40 bg-cyan-400/10 text-xs text-cyan-300 hover:bg-cyan-400/20">
              <Layers className="h-3.5 w-3.5" /> Tambah Layer
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/10 bg-[#0b0d1d] text-gray-200">
            {(["video", "image", "text", "audio"] as TrackKind[]).map((k) => (
              <DropdownMenuItem key={k} onClick={() => useEditor.getState().addTrack(k)} className="gap-2 text-xs">
                {kindIcon(k)} Layer {TRACK_STYLE[k].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-white/10 bg-white/5 text-xs"
                disabled={!sel}
                onClick={() => sel && useEditor.getState().splitClip(sel.id, useEditor.getState().playhead)}
              >
                <Scissors className="h-3.5 w-3.5 text-amber-300" /> Potong
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Potong klip terpilih di posisi playhead (S)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button size="sm" variant="outline" className="h-7 border-white/10 bg-white/5 text-xs" disabled={!sel} onClick={() => sel && useEditor.getState().duplicateClip(sel.id)}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" className="h-7 border-white/10 bg-white/5 text-xs hover:border-red-400/40 hover:text-red-300" disabled={!sel} onClick={() => sel && useEditor.getState().deleteClip(sel.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <Button size="sm" variant={snap ? "default" : "outline"} className={`h-7 text-xs ${snap ? "bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30" : "border-white/10 bg-white/5"}`} onClick={() => useEditor.getState().toggleSnap()}>
          <Magnet className="h-3.5 w-3.5" /> Snap
        </Button>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <Button size="sm" variant="outline" className="h-7 border-white/10 bg-white/5" onClick={() => useEditor.getState().setZoom(zoom / 1.4)}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <input
          type="range"
          min={10}
          max={240}
          value={zoom}
          onChange={(e) => useEditor.getState().setZoom(Number(e.target.value))}
          className="h-1 w-24 accent-cyan-400"
          aria-label="Zoom timeline"
        />
        <Button size="sm" variant="outline" className="h-7 border-white/10 bg-white/5" onClick={() => useEditor.getState().setZoom(zoom * 1.4)}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <div className="ml-auto pr-1 font-mono text-[11px] text-cyan-300/80">
          Total: {fmtTime(duration, true)}
        </div>
      </div>

      {/* Isi timeline */}
      <div ref={scrollRef} className="relative flex-1 overflow-auto nova-scroll">
        <div style={{ width: HEADER_W + contentW }}>
          {/* Ruler */}
          <div className="sticky top-0 z-20 flex h-8 bg-[#0a0c1a]/95 backdrop-blur">
            <div className="sticky left-0 z-30 flex shrink-0 items-center border-r border-white/10 bg-[#0a0c1a] px-2 text-[10px] font-semibold tracking-widest text-cyan-500/80" style={{ width: HEADER_W }}>
              TIMELINE
            </div>
            <div className="relative h-8" style={{ width: contentW }} onPointerDown={startScrub}>
              {ticks.arr.map((t) => (
                <div key={t} className="absolute top-0 h-full border-l border-white/15" style={{ left: t * zoom }}>
                  <span className="ml-1 font-mono text-[9px] text-gray-500">{fmtTime(t)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lanes */}
          <div ref={lanesRef} className="relative">
            {tracks.map((track: Track) => {
              const st = TRACK_STYLE[track.kind];
              return (
                <div key={track.id} className="flex border-b border-white/5" style={{ height: TRACK_H[track.kind] }}>
                  <div className="sticky left-0 z-10 flex shrink-0 items-center gap-1 border-r border-white/10 bg-[#0a0c1a] px-2" style={{ width: HEADER_W }}>
                    <span style={{ color: st.color }}>{kindIcon(track.kind)}</span>
                    <span className="flex-1 truncate text-[11px] text-gray-300">{track.name}</span>
                    {track.kind !== "text" && (
                      <button
                        className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-gray-200"
                        onClick={() => useEditor.getState().toggleMute(track.id)}
                        aria-label={track.muted ? "Bunyikan track" : "Bisukan track"}
                      >
                        {track.muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      </button>
                    )}
                    {track.kind !== "audio" && (
                      <button
                        className="rounded p-1 text-gray-500 hover:bg-white/10 hover:text-gray-200"
                        onClick={() => useEditor.getState().toggleHidden(track.id)}
                        aria-label={track.hidden ? "Tampilkan track" : "Sembunyikan track"}
                      >
                        {track.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    )}
                    <button className="rounded p-1 text-gray-600 hover:bg-red-500/20 hover:text-red-300" onClick={() => useEditor.getState().removeTrack(track.id)} aria-label="Hapus layer">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div
                    data-trackid={track.id}
                    className="relative flex-1"
                    style={{
                      width: contentW,
                      backgroundImage: `repeating-linear-gradient(to right, rgba(255,255,255,0.045) 0 1px, transparent 1px ${Math.max(24, zoom)}px)`,
                    }}
                    onPointerDown={(e) => {
                      if (e.target === e.currentTarget) {
                        useEditor.getState().select(null);
                        startScrub(e);
                      }
                    }}
                  >
                    {clips
                      .filter((c) => c.trackId === track.id)
                      .map((clip) => {
                        const isSel = clip.id === selectedId;
                        const c = clip.kind === "text" ? "#e879f9" : clip.kind === "audio" ? "#4ade80" : clip.kind === "image" ? "#a78bfa" : "#22d3ee";
                        const asset = useEditor.getState().getAsset(clip.assetId);
                        const name = clip.kind === "text" ? clip.text?.content : asset?.name ?? clip.label ?? "Klip";
                        return (
                          <div
                            key={clip.id}
                            className={`group absolute top-1 flex overflow-hidden rounded-md border text-[10px] ${isSel ? "border-white shadow-[0_0_12px_rgba(34,211,238,0.5)]" : "border-white/20"}`}
                            style={{
                              left: clip.start * zoom,
                              width: Math.max(14, clip.duration * zoom),
                              height: TRACK_H[track.kind] - 10,
                              background: `linear-gradient(135deg, ${c}33, ${c}18)`,
                              cursor: "grab",
                              touchAction: "none",
                            }}
                            onPointerDown={(e) => clipDrag(e, clip)}
                          >
                            <div className="absolute inset-y-0 left-0 w-1.5 cursor-w-resize bg-white/10 hover:bg-cyan-300/60" onPointerDown={(e) => clipTrim(e, clip, "l")} />
                            <div className="pointer-events-none flex min-w-0 flex-1 flex-col justify-center px-2">
                              <div className="truncate font-medium" style={{ color: c }}>
                                {name || "Teks"}
                              </div>
                              <div className="flex gap-1 text-[9px] text-gray-400">
                                <span>{clip.duration.toFixed(1)}s</span>
                                {clip.speed !== 1 && <span className="text-amber-300">{clip.speed}x</span>}
                                {clip.loopCount > 1 && <span className="text-fuchsia-300">⟳{clip.loopCount}</span>}
                                {clip.effects.length > 0 && <span className="text-emerald-300">fx{clip.effects.length}</span>}
                                {(clip.kind === "audio" || clip.kind === "video") && clip.volume !== 1 && <span className="text-emerald-300">♪{Math.round(clip.volume * 100)}%</span>}
                              </div>
                            </div>
                            {clip.transition && <div className="absolute right-0 top-0 bg-fuchsia-500/70 px-1 text-[8px] text-white">⇄</div>}
                            <div className="absolute inset-y-0 right-0 w-1.5 cursor-e-resize bg-white/10 hover:bg-cyan-300/60" onPointerDown={(e) => clipTrim(e, clip, "r")} />
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
            {/* Playhead */}
            <PlayheadLine zoom={zoom} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayheadLine({ zoom }: { zoom: number }) {
  const playhead = useEditor((s) => s.playhead);
  return (
    <div className="pointer-events-none absolute inset-y-0 z-30 w-0" style={{ left: HEADER_W + playhead * zoom }}>
      <div className="absolute inset-y-0 w-px bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
      <div className="absolute -left-1.5 top-0 h-2.5 w-3.5 rounded-b-sm bg-cyan-300" />
    </div>
  );
}
