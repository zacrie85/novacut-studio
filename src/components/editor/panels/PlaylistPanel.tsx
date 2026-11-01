"use client";

// NOVACUT Studio - Panel Playlist (daftar video masuk + batch export)

import { ListVideo, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/lib/editor/store";
import { fmtTime } from "@/lib/editor/constants";
import { runBatchExport } from "@/lib/editor/exporter";
import { engine } from "@/lib/editor/engine";
import { useToast } from "@/hooks/use-toast";

export function PlaylistPanel() {
  const assets = useEditor((s) => s.assets);
  const videos = assets.filter((a) => a.type === "video");
  const running = useEditor((s) => s.exportState.running);
  const { toast } = useToast();

  const makeCover = async (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;
    toast({ title: "Menganalisis video...", description: "AI mencari frame terbaik" });
    // delege ke panel cover via state: set sumber lalu user membuka tab Cover.
    useEditor.getState().setCover({ frameAssetId: assetId, frameTime: Math.min(asset.duration * 0.3, asset.duration - 0.2), useAI: true, coverAssetId: undefined, previewUrl: undefined });
    toast({ title: "Sumber cover diatur", description: `Buka tab Cover → tekan "Cover AI Otomatis".` });
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-gray-400">
          <ListVideo className="h-4 w-4 text-fuchsia-300" /> PLAYLIST
        </div>
        <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-bold text-fuchsia-300">{videos.length} video</span>
      </div>

      <Button
        disabled={running || videos.length === 0}
        className="h-9 gap-2 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-xs font-bold text-white hover:from-fuchsia-500 hover:to-cyan-400"
        onClick={() => void runBatchExport(videos.map((v) => v.id))}
      >
        <Sparkles className="h-4 w-4" />
        Export &amp; Split Semua ({videos.length})
      </Button>
      <p className="-mt-1 text-[10px] leading-relaxed text-gray-500">
        Setiap video diproses berurutan: cover otomatis + teks part + dipecah sesuai pengaturan di tab Export.
      </p>

      <div className="nova-scroll -mr-1 flex-1 space-y-2 overflow-y-auto pr-1">
        {videos.length === 0 && (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-gray-500">
            Playlist kosong. Impor video di tab Media — semua video otomatis masuk daftar ini.
          </div>
        )}
        {videos.map((v, i) => (
          <div key={v.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2">
            <span className="w-5 text-center font-mono text-[10px] text-fuchsia-300">{String(i + 1).padStart(2, "0")}</span>
            {v.thumb ? (
              <img src={v.thumb} alt={v.name} className="h-10 w-16 rounded object-cover" />
            ) : (
              <div className="h-10 w-16 rounded bg-white/5" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs text-gray-200">{v.name}</div>
              <div className="text-[10px] text-gray-500">{fmtTime(v.duration)}</div>
            </div>
            <Button
              size="sm"
              className="h-7 w-7 rounded-full bg-cyan-500/20 p-0 text-cyan-300 hover:bg-cyan-500/30"
              onClick={() => {
                useEditor.getState().addClipFromAsset(v.id);
                toast({ title: "Masuk timeline", description: v.name });
              }}
              aria-label="Tambah ke timeline"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-7 w-7 rounded-full border-violet-400/30 bg-violet-400/10 p-0 text-violet-300 hover:bg-violet-400/20" onClick={() => void makeCover(v.id)} aria-label="Jadikan sumber cover">
              <Wand2 className="h-3.5 w-3.5" />
            </Button>
            <button className="rounded p-1 text-gray-600 hover:text-red-300" onClick={() => useEditor.getState().removeAsset(v.id)} aria-label="Hapus dari playlist">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="h-7 shrink-0 border-white/10 bg-white/5 text-[10px] text-gray-400" onClick={() => engine.stopPreview()}>
        Hentikan semua suara
      </Button>
    </div>
  );
}
