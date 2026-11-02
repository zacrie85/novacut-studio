"use client";

// NOVACUT Studio - Panel Musik: pustaka 20 backsound bebas hak cipta

import { useState } from "react";
import { Music, Pause, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MUSIC_LIBRARY } from "@/lib/editor/constants";
import { engine } from "@/lib/editor/engine";
import { useEditor } from "@/lib/editor/store";
import { useToast } from "@/hooks/use-toast";
import type { MediaAsset } from "@/lib/editor/types";

export function MusicPanel() {
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const togglePreview = async (id: string) => {
    if (previewing === id) {
      engine.stopPreview();
      setPreviewing(null);
      return;
    }
    setLoading(id);
    engine.ensureAudio();
    await engine.previewMusic(id);
    setLoading(null);
    setPreviewing(id);
    setTimeout(() => setPreviewing((p) => (p === id ? null : p)), 65000);
  };

  const addToTimeline = async (id: string) => {
    const def = MUSIC_LIBRARY.find((m) => m.id === id);
    if (!def) return;
    setLoading(id);
    // prarender agar durasi akurat & buffer siap diputar
    engine.ensureAudio();
    const duration = (def.bars * 4 * 60) / def.bpm;
    const asset: MediaAsset = {
      id: `mus-${id}-${Date.now().toString(36)}`,
      name: def.name,
      type: "audio",
      url: "",
      duration,
      width: 0,
      height: 0,
      musicId: id,
    };
    useEditor.getState().addAsset(asset);
    useEditor.getState().addClipFromAsset(asset.id);
    setLoading(null);
    toast({ title: "Backsound ditambahkan ✔", description: `${def.name} — atur Volume & Fade di panel "Klip" kanan.` });
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-gray-400">
          <Music className="h-4 w-4 text-emerald-300" /> PUSTAKA BACKSOUND
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">{MUSIC_LIBRARY.length} trek</span>
      </div>
      <p className="text-[10px] leading-relaxed text-gray-500">
        20 backsound <b className="text-gray-400">bebas hak cipta</b> gaya trailer, iklan &amp; vlog — disintesis langsung di browser, aman untuk monetisasi.
        <br />
        <span className="text-emerald-300/80">Tips: setelah masuk timeline, klik klip musik lalu atur <b>Volume</b> (0–200%) &amp; fade di panel kanan.</span>
      </p>

      <div className="nova-scroll -mr-1 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {MUSIC_LIBRARY.map((m) => (
          <div key={m.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
            <button
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
              onClick={() => void togglePreview(m.id)}
              aria-label={previewing === m.id ? "Hentikan pratinjau" : "Pratinjau musik"}
            >
              {loading === m.id ? <span className="h-3 w-3 animate-spin rounded-full border border-cyan-300 border-t-transparent" /> : previewing === m.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs text-gray-200">{m.name}</div>
              <div className="flex items-center gap-1.5 text-[9px]">
                <span className="rounded px-1 py-px font-semibold" style={{ background: `${m.color}22`, color: m.color }}>
                  {m.genre}
                </span>
                <span className="text-gray-500">{m.bpm} BPM · {(m.bars * 4 * 60) / m.bpm >= 60 ? `${Math.round((m.bars * 4 * 60) / m.bpm / 60)} mnt` : `${Math.round((m.bars * 4 * 60) / m.bpm)} dtk`}</span>
              </div>
            </div>
            <Button size="sm" className="h-7 w-7 rounded-full bg-emerald-500/20 p-0 text-emerald-300 hover:bg-emerald-500/30" onClick={() => void addToTimeline(m.id)} aria-label="Tambah ke timeline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
