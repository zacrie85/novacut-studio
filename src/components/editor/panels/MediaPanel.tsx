"use client";

// NOVACUT Studio - Panel Media (impor video/audio/gambar ke pustaka)

import { useRef, useState } from "react";
import { ArrowRight, Clapperboard, FileVideo, Film, ImageIcon, ListVideo, Music, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditor } from "@/lib/editor/store";
import { fmtTime } from "@/lib/editor/constants";
import { importFiles } from "@/lib/editor/mediaImport";
import { useToast } from "@/hooks/use-toast";
import type { MediaAsset } from "@/lib/editor/types";

function iconFor(t: MediaAsset["type"]) {
  if (t === "video") return <Film className="h-3.5 w-3.5 text-blue-400" />;
  if (t === "audio") return <Music className="h-3.5 w-3.5 text-emerald-400" />;
  return <ImageIcon className="h-3.5 w-3.5 text-violet-400" />;
}

export function MediaPanel() {
  const assets = useEditor((s) => s.assets);
  const editorList = useEditor((s) => s.editorList);
  const exportList = useEditor((s) => s.exportList);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const created = await importFiles(files);
    // video otomatis masuk Playlist Editor (bisa dipindah ke Export Langsung)
    const vids = created.filter((a) => a.type === "video").map((a) => a.id);
    if (vids.length) useEditor.getState().addToAssetList("editor", vids);
    setBusy(false);
    if (created.length) {
      toast({
        title: `${created.length} media ditambahkan`,
        description: vids.length ? "Video masuk Playlist Editor — tombol panah untuk kirim ke Export Langsung." : "Klik + untuk memasukkan ke timeline.",
      });
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center transition hover:border-blue-500/60 hover:bg-blue-500/[0.03]"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Impor media"
      >
        <Upload className="h-7 w-7 text-blue-400" />
        <div className="text-sm font-bold text-gray-200">Impor Media</div>
        <div className="text-[11px] text-gray-500">Klik atau tarik file video, audio, gambar</div>
        <input ref={inputRef} type="file" multiple accept="video/*,audio/*,image/*" className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
      </div>

      {busy && <div className="text-center text-xs text-blue-400">Menganalisis media...</div>}

      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
        <Clapperboard className="h-3.5 w-3.5" /> Pustaka ({assets.length})
      </div>

      <div className="nova-scroll -mr-1 flex-1 space-y-2 overflow-y-auto pr-1">
        {assets.length === 0 && <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-xs text-gray-500">Belum ada media. Impor file untuk mulai.</div>}
        {assets.map((a) => {
          const inEditor = editorList.includes(a.id);
          const inExport = exportList.includes(a.id);
          return (
            <div key={a.id} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-card p-2.5">
              {a.thumb ? (
                <img src={a.thumb} alt={a.name} className="h-10 w-16 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-white/5">{iconFor(a.type)}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-gray-200">{a.name}</div>
                <div className="text-[11px] text-gray-500">
                  {a.type === "image" ? "Gambar" : fmtTime(a.duration)} {a.type === "video" && a.width ? `· ${a.width}×${a.height}` : ""}
                </div>
              </div>
              {a.type === "video" ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`nv-icon-btn h-7 w-7 ${inEditor ? "border-blue-500/50 bg-blue-500/10 text-blue-400" : ""}`}
                        onClick={() => {
                          if (!inEditor) {
                            useEditor.getState().addToAssetList("editor", [a.id]);
                            toast({ title: "Masuk Playlist Editor", description: a.name });
                          } else {
                            useEditor.getState().addClipFromAsset(a.id);
                            toast({ title: "Masuk timeline", description: a.name });
                          }
                        }}
                        aria-label={inEditor ? "Sudah di Playlist Editor — klik untuk masuk timeline" : "Tambah ke Playlist Editor"}
                      >
                        {inEditor ? <Plus className="h-4 w-4" /> : <ListVideo className="h-4 w-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">{inEditor ? "Klik untuk masuk timeline" : "Tambah ke Playlist Editor"}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`nv-icon-btn h-7 w-7 ${inExport ? "border-blue-500/50 bg-blue-500/10 text-blue-400" : ""}`}
                        onClick={() => {
                          useEditor.getState().addToAssetList("export", [a.id]);
                          toast({ title: "Masuk Playlist Export Langsung", description: `${a.name} — siap di-export tanpa edit.` });
                        }}
                        aria-label="Kirim ke Playlist Export Langsung"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Kirim ke Playlist Export Langsung (tanpa edit)</TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <Button
                  size="sm"
                  className="h-7 w-7 rounded-lg bg-blue-500/15 p-0 text-blue-400 hover:bg-blue-500/25"
                  onClick={() => {
                    const id = useEditor.getState().addClipFromAsset(a.id);
                    if (id) toast({ title: "Masuk timeline", description: a.name });
                  }}
                  aria-label="Tambah ke timeline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="rounded-lg p-1.5 text-gray-600 transition hover:bg-red-500/10 hover:text-red-400" onClick={() => useEditor.getState().removeAsset(a.id)} aria-label="Hapus media">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Hapus dari pustaka</TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-white/[0.07] bg-card p-2.5 text-[11px] leading-relaxed text-gray-500">
        <FileVideo className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
        Video yang diimpor otomatis masuk <b className="text-gray-400">Playlist Editor</b> (tab Playlist) untuk diedit — atau kirim ke <b className="text-gray-400">Export Langsung</b> (tab Langsung) untuk dipecah tanpa edit.
      </div>
    </div>
  );
}
