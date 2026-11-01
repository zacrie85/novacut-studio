"use client";

// NOVACUT Studio - Panel Media (impor video/audio/gambar)

import { useRef, useState } from "react";
import { Clapperboard, FileVideo, Film, ImageIcon, Music, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/lib/editor/store";
import { fmtTime } from "@/lib/editor/constants";
import { useToast } from "@/hooks/use-toast";
import type { MediaAsset, MediaType } from "@/lib/editor/types";

async function probeMedia(url: string, type: MediaType): Promise<{ duration: number; width: number; height: number; thumb?: string }> {
  if (type === "image") {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => res({ duration: 0, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => res({ duration: 0, width: 0, height: 0 });
      img.src = url;
    });
  }
  return new Promise((res) => {
    const el = document.createElement(type === "video" ? "video" : "audio");
    el.preload = "metadata";
    el.src = url;
    el.onloadedmetadata = () => {
      const v = el as HTMLVideoElement;
      const meta = { duration: isFinite(el.duration) ? el.duration : 0, width: v.videoWidth || 0, height: v.videoHeight || 0, thumb: undefined as string | undefined };
      if (type === "video" && v.videoWidth) {
        v.currentTime = Math.min(0.6, (el.duration || 1) * 0.1);
        v.onseeked = () => {
          try {
            const c = document.createElement("canvas");
            const scale = 160 / v.videoWidth;
            c.width = 160;
            c.height = Math.round(v.videoHeight * scale);
            const ctx = c.getContext("2d");
            if (ctx) {
              ctx.drawImage(v, 0, 0, c.width, c.height);
              meta.thumb = c.toDataURL("image/jpeg", 0.6);
            }
          } catch {
            /* ignore */
          }
          res(meta);
        };
        setTimeout(() => res(meta), 2500);
      } else res(meta);
    };
    el.onerror = () => res({ duration: 0, width: 0, height: 0 });
    setTimeout(() => res({ duration: 0, width: 0, height: 0 }), 5000);
  });
}

function iconFor(t: MediaType) {
  if (t === "video") return <Film className="h-3.5 w-3.5 text-cyan-300" />;
  if (t === "audio") return <Music className="h-3.5 w-3.5 text-emerald-300" />;
  return <ImageIcon className="h-3.5 w-3.5 text-violet-300" />;
}

export function MediaPanel() {
  const assets = useEditor((s) => s.assets);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      const type: MediaType | null = file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : file.type.startsWith("image/") ? "image" : null;
      if (!type) continue;
      const url = URL.createObjectURL(file);
      const meta = await probeMedia(url, type);
      const asset: MediaAsset = {
        id: `as-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-3)}`,
        name: file.name,
        type,
        url,
        duration: meta.duration,
        width: meta.width,
        height: meta.height,
        thumb: meta.thumb,
      };
      useEditor.getState().addAsset(asset);
      ok++;
    }
    setBusy(false);
    if (ok) toast({ title: `${ok} media ditambahkan`, description: "Klik + untuk memasukkan ke timeline." });
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-cyan-400/30 bg-cyan-400/5 px-4 py-6 text-center transition hover:border-cyan-400/60 hover:bg-cyan-400/10"
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
        <Upload className="h-7 w-7 text-cyan-300" />
        <div className="text-sm font-semibold text-cyan-200">Impor Media</div>
        <div className="text-[11px] text-gray-400">Klik atau tarik file video, audio, gambar</div>
        <input ref={inputRef} type="file" multiple accept="video/*,audio/*,image/*" className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
      </div>

      {busy && <div className="text-center text-xs text-cyan-300">Menganalisis media...</div>}

      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-gray-400">
        <Clapperboard className="h-3.5 w-3.5" /> PUSTAKA ({assets.length})
      </div>

      <div className="nova-scroll -mr-1 flex-1 space-y-2 overflow-y-auto pr-1">
        {assets.length === 0 && <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-gray-500">Belum ada media. Impor file untuk mulai.</div>}
        {assets.map((a) => (
          <div key={a.id} className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2">
            {a.thumb ? (
              <img src={a.thumb} alt={a.name} className="h-10 w-16 rounded object-cover" />
            ) : (
              <div className="flex h-10 w-16 items-center justify-center rounded bg-white/5">{iconFor(a.type)}</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs text-gray-200">{a.name}</div>
              <div className="text-[10px] text-gray-500">
                {a.type === "image" ? "Gambar" : fmtTime(a.duration)} {a.type === "video" && a.width ? `· ${a.width}×${a.height}` : ""}
              </div>
            </div>
            <Button
              size="sm"
              className="h-7 w-7 rounded-full bg-cyan-500/20 p-0 text-cyan-300 hover:bg-cyan-500/30"
              onClick={() => {
                const id = useEditor.getState().addClipFromAsset(a.id);
                if (id) toast({ title: "Masuk timeline", description: a.name });
              }}
              aria-label="Tambah ke timeline"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <button className="rounded p-1 text-gray-600 hover:text-red-300" onClick={() => useEditor.getState().removeAsset(a.id)} aria-label="Hapus media">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-2 text-[10px] leading-relaxed text-gray-500">
        <FileVideo className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Video yang diimpor otomatis masuk ke Playlist — bisa langsung di-Export / Export &amp; Split dari tab <b className="text-gray-400">Playlist</b> tanpa perlu dimasukkan ke timeline.
      </div>
    </div>
  );
}
