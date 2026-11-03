"use client";

// NOVACUT Studio - Playlist EDITOR: antrean video yang akan dikelola di timeline.
// Terpisah dari Playlist Export Langsung (yang tanpa editing).

import { useState } from "react";
import { ArrowRight, GripVertical, ListVideo, Plus, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditor } from "@/lib/editor/store";
import { fmtTime } from "@/lib/editor/constants";
import { useToast } from "@/hooks/use-toast";

export function PlaylistEditorPanel() {
  const assets = useEditor((s) => s.assets);
  const list = useEditor((s) => s.editorList);
  const running = useEditor((s) => s.exportState.running);
  const { toast } = useToast();
  // drag urutan
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const videos = list.map((id) => assets.find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a && a.type === "video");

  const drop = (to: number) => {
    if (dragIdx !== null && dragIdx !== to) useEditor.getState().moveInAssetList("editor", dragIdx, to);
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="nova-scroll flex h-full flex-col gap-3 overflow-y-auto p-3">
      {/* header */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <ListVideo className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Playlist Editor</span>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-bold text-gray-300">{videos.length} video</span>
      </div>
      <p className="-mt-1 text-[11px] leading-relaxed text-gray-500">
        Daftar video yang akan <b className="text-gray-400">dikelola di timeline</b> — potong, efek, teks, musik. Untuk video yang langsung dipecah tanpa edit, pakai menu <b className="text-gray-400">Langsung</b>.
      </p>

      {/* aksi cepat */}
      <div className="flex shrink-0 gap-2">
        <Button
          size="sm"
          className="h-9 flex-1 gap-1.5 bg-blue-600 text-xs font-bold text-white hover:bg-blue-500"
          disabled={videos.length === 0 || running}
          onClick={() => {
            const st = useEditor.getState();
            let n = 0;
            for (const v of videos) if (st.addClipFromAsset(v.id)) n++;
            toast({ title: `${n} video masuk timeline`, description: "Urutan mengikuti daftar playlist." });
          }}
        >
          <Plus className="h-4 w-4" /> Tambah Semua ke Timeline
        </Button>
        {videos.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" className="h-9 border-white/10 bg-white/[0.04] text-xs text-gray-400" onClick={() => useEditor.getState().clearAssetList("editor")}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Kosongkan daftar (video tetap ada di pustaka)</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* daftar */}
      <div className="space-y-2">
        {videos.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-xs leading-relaxed text-gray-500">
            Playlist Editor masih kosong.
            <br />
            Impor video di tab <b className="text-gray-400">Media</b> — semua video otomatis masuk ke daftar ini.
          </div>
        )}
        {videos.map((v, i) => {
          const isOver = overIdx === i && dragIdx !== null && dragIdx !== i;
          return (
            <div
              key={v.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragEnd={() => {
                setDragIdx(null);
                setOverIdx(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIdx(i);
              }}
              onDrop={() => drop(i)}
              className={`flex items-center gap-2.5 rounded-xl border bg-card p-2.5 transition ${dragIdx === i ? "border-blue-500/50 opacity-50" : isOver ? "border-blue-500/70" : "border-white/[0.07]"} ${isOver ? "border-t-2" : ""}`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-grab touch-none text-gray-600 hover:text-gray-300" aria-label="Tarik untuk mengubah urutan">
                    <GripVertical className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Tarik untuk mengubah urutan</TooltipContent>
              </Tooltip>
              <span className="w-5 text-center font-mono text-[11px] text-blue-400">{String(i + 1).padStart(2, "0")}</span>
              {v.thumb ? (
                <img src={v.thumb} alt={v.name} className="h-10 w-16 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-white/5 text-gray-600">
                  <Video className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-gray-200">{v.name}</div>
                <div className="text-[11px] text-gray-500">{fmtTime(v.duration)}</div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="nv-icon-btn h-7 w-7"
                    onClick={() => {
                      useEditor.getState().addClipFromAsset(v.id);
                      toast({ title: "Masuk timeline", description: v.name });
                    }}
                    aria-label="Tambah ke timeline"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Tambah ke timeline</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="nv-icon-btn h-7 w-7"
                    onClick={() => {
                      useEditor.getState().transferAsset("editor", v.id);
                      toast({ title: "Pindah ke Playlist Langsung", description: `${v.name} — siap di-export tanpa edit.` });
                    }}
                    aria-label="Kirim ke Playlist Export Langsung"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Kirim ke Playlist Export Langsung</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="rounded-lg p-1.5 text-gray-600 transition hover:bg-red-500/10 hover:text-red-400" onClick={() => useEditor.getState().removeFromAssetList("editor", v.id)} aria-label="Keluarkan dari daftar">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Keluarkan dari daftar (video tetap di pustaka)</TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
