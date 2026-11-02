"use client";

// NOVACUT Studio - Panel Playlist (daftar video masuk + menu export khusus + batch export)

import { useEffect, useState } from "react";
import { ChevronDown, ListVideo, Plus, Rocket, Save, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditor } from "@/lib/editor/store";
import { fmtTime, partLabel, LABEL_STYLES } from "@/lib/editor/constants";
import { runBatchExport } from "@/lib/editor/exporter";
import { loadPlaylistExportConfig, savePlaylistExportConfig } from "@/lib/editor/playlistExport";
import { engine } from "@/lib/editor/engine";
import { useToast } from "@/hooks/use-toast";
import type { PlaylistExportConfig } from "@/lib/editor/types";

export function PlaylistPanel() {
  const assets = useEditor((s) => s.assets);
  const videos = assets.filter((a) => a.type === "video");
  const running = useEditor((s) => s.exportState.running);
  const exportState = useEditor((s) => s.exportState);
  const pl = useEditor((s) => s.playlistExport);
  const [menuOpen, setMenuOpen] = useState(true);
  const { toast } = useToast();

  // pulihkan setelan tersimpan saat panel dibuka
  useEffect(() => {
    useEditor.getState().setPlaylistExport(loadPlaylistExportConfig());
  }, []);

  const setPl = (p: Partial<PlaylistExportConfig>) => useEditor.getState().setPlaylistExport(p);

  const applyAndSave = () => {
    savePlaylistExportConfig(useEditor.getState().playlistExport);
    toast({
      title: "Setelan disimpan ✔",
      description: "Dipakai untuk semua export & split dari playlist berikutnya — termasuk saat aplikasi dibuka lagi.",
    });
  };

  const makeCover = async (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;
    toast({ title: "Menganalisis video...", description: "AI mencari frame terbaik" });
    // delege ke panel cover via state: set sumber lalu user membuka tab Cover.
    useEditor.getState().setCover({ frameAssetId: assetId, frameTime: Math.min(asset.duration * 0.3, asset.duration - 0.2), useAI: true, coverAssetId: undefined, previewUrl: undefined });
    toast({ title: "Sumber cover diatur", description: `Buka tab Cover → tekan "Cover AI Otomatis".` });
  };

  const contohJudul = videos[0]?.name.replace(/\.[^.]+$/, "") || "Nama Video";

  return (
    <div className="nova-scroll flex h-full flex-col gap-3 overflow-y-auto p-3">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-gray-400">
          <ListVideo className="h-4 w-4 text-fuchsia-300" /> PLAYLIST
        </div>
        <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-bold text-fuchsia-300">{videos.length} video</span>
      </div>

      {/* ===== MENU KHUSUS EXPORT PLAYLIST ===== */}
      <div className="shrink-0 space-y-2 rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/[0.05] p-2.5">
        <button className="flex w-full items-center justify-between" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
          <span className="text-[10px] font-semibold tracking-wider text-fuchsia-300">MENU EXPORT PLAYLIST</span>
          <ChevronDown className={`h-3.5 w-3.5 text-fuchsia-300 transition-transform ${menuOpen ? "" : "-rotate-90"}`} />
        </button>
        {menuOpen && (
          <>
          <p className="text-[9px] leading-relaxed text-gray-500">
            Atur tulisan yang muncul di setiap hasil export &amp; split video dari playlist ini.
          </p>

        {/* judul otomatis dari nama video */}
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[10px] leading-snug text-gray-300">Judul otomatis dari nama video</Label>
          <Switch checked={pl.autoTitle} onCheckedChange={(v) => setPl({ autoTitle: v })} className="data-[state=checked]:bg-fuchsia-500" />
        </div>
        {pl.autoTitle ? (
          <div className="truncate rounded border border-white/10 bg-black/30 px-2 py-1 text-[9px] text-gray-400" title={contohJudul}>
            Contoh judul: <span className="text-gray-200">{contohJudul}</span>
          </div>
        ) : (
          <Input
            value={pl.titleCustom}
            onChange={(e) => setPl({ titleCustom: e.target.value })}
            placeholder="Tulis judul sendiri untuk semua video"
            className="h-7 border-white/10 bg-black/30 text-xs"
          />
        )}

        {/* deskripsi */}
        <div className="space-y-1">
          <Label className="text-[10px] text-gray-300" htmlFor="pl-desc">
            Deskripsi (muncul di bawah judul)
          </Label>
          <Textarea
            id="pl-desc"
            value={pl.description}
            onChange={(e) => setPl({ description: e.target.value })}
            placeholder="Contoh: DC MUSIK - DC. PRODUCTION"
            rows={2}
            className="min-h-[52px] border-white/10 bg-black/30 text-xs"
          />
        </div>

        {/* teks part otomatis */}
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[10px] text-gray-300">Teks part otomatis tiap bagian</Label>
          <Switch checked={pl.showPartText} onCheckedChange={(v) => setPl({ showPartText: v })} className="data-[state=checked]:bg-fuchsia-500" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={pl.labelStyle} onValueChange={(v) => setPl({ labelStyle: v as PlaylistExportConfig["labelStyle"] })}>
            <SelectTrigger className="h-7 flex-1 border-white/10 bg-black/30 text-[11px]" aria-label="Gaya teks part">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#0b0d1d] text-xs">
              {LABEL_STYLES.map((ls) => (
                <SelectItem key={ls} value={ls}>
                  {ls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="whitespace-nowrap rounded border border-fuchsia-400/25 bg-fuchsia-400/10 px-1.5 py-0.5 font-mono text-[9px] text-fuchsia-300">
            {partLabel(pl.labelStyle, 2, 5, true)}
          </span>
        </div>

        {/* layar judul di awal */}
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[10px] leading-snug text-gray-300">Layar judul di awal tiap hasil</Label>
          <Switch checked={pl.showTitleScreen} onCheckedChange={(v) => setPl({ showTitleScreen: v })} className="data-[state=checked]:bg-fuchsia-500" />
        </div>

        {/* judul selama video */}
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[10px] leading-snug text-gray-300">Judul tampil selama video</Label>
          <Switch checked={pl.titleDuringVideo} onCheckedChange={(v) => setPl({ titleDuringVideo: v })} className="data-[state=checked]:bg-fuchsia-500" />
        </div>

        {/* rasio video hasil */}
        <div className="space-y-1">
          <Label className="text-[10px] text-gray-300" htmlFor="pl-ratio">Rasio video hasil</Label>
          <Select value={pl.ratio} onValueChange={(v) => setPl({ ratio: v as PlaylistExportConfig["ratio"] })}>
            <SelectTrigger id="pl-ratio" className="h-7 border-white/10 bg-black/30 text-[11px]" aria-label="Rasio video hasil">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#0b0d1d] text-xs">
              <SelectItem value="16:9">16:9 — Lanskap (seperti video asli)</SelectItem>
              <SelectItem value="9:16">9:16 — Vertikal (Shorts/TikTok/Reels)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* cara pas video ke frame vertikal */}
        {pl.ratio === "9:16" && (
          <div className="space-y-1">
            <Label className="text-[10px] text-gray-300" htmlFor="pl-fit">Cara pas video ke layar vertikal</Label>
            <Select value={pl.fitMode} onValueChange={(v) => setPl({ fitMode: v as PlaylistExportConfig["fitMode"] })}>
              <SelectTrigger id="pl-fit" className="h-7 border-white/10 bg-black/30 text-[11px]" aria-label="Cara pas video ke layar vertikal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#0b0d1d] text-xs">
                <SelectItem value="fill">Isi penuh — sisi kiri &amp; kanan dipotong otomatis</SelectItem>
                <SelectItem value="fit">Video utuh — tanpa potong (ada bar hitam)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* tombol terapkan setelan */}
        <Button
          className="h-8 w-full gap-1.5 bg-emerald-600 text-[11px] font-bold text-white hover:bg-emerald-500"
          onClick={applyAndSave}
        >
          <Save className="h-3.5 w-3.5" />
          Terapkan &amp; Simpan Setelan
        </Button>
        <p className="text-[9px] leading-relaxed text-gray-600">
          Setelan tersimpan otomatis dipakai lagi untuk video berikutnya — termasuk setelah aplikasi ditutup.
        </p>
          </>
        )}
      </div>

      <Button
        disabled={running || videos.length === 0}
        className="h-9 shrink-0 gap-2 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-xs font-bold text-white hover:from-fuchsia-500 hover:to-cyan-400"
        onClick={() => void runBatchExport(videos.map((v) => v.id))}
      >
        <Sparkles className="h-4 w-4" />
        Export &amp; Split Semua ({videos.length})
      </Button>
      <p className="-mt-1 shrink-0 text-[10px] leading-relaxed text-gray-500">
        <b className="text-gray-400">Tanpa perlu masuk timeline!</b> Setiap video langsung dirender berurutan: layar judul (judul + deskripsi + part) + teks part + dipecah sesuai pengaturan di tab Export, dengan rasio sesuai pilihan di menu atas (16:9 / 9:16).
      </p>

      {running && (
        <div className="space-y-1 rounded-lg border border-cyan-400/25 bg-cyan-400/5 p-2">
          <div className="flex items-center justify-between gap-2 text-[10px] text-cyan-200">
            <span className="truncate">{exportState.label || "Memproses..."}</span>
            <span className="shrink-0 font-mono">{Math.round(exportState.progress * 100)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded bg-white/10">
            <div className="h-full rounded bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all" style={{ width: `${Math.max(2, Math.round(exportState.progress * 100))}%` }} />
          </div>
        </div>
      )}

      <div className="shrink-0 space-y-2">
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
            <Button
              size="sm"
              className="h-7 w-7 rounded-full bg-emerald-500/20 p-0 text-emerald-300 hover:bg-emerald-500/30"
              disabled={running}
              onClick={() => void runBatchExport([v.id])}
              aria-label="Export video ini langsung (tanpa timeline)"
              title="Export video ini langsung — tanpa perlu masuk timeline"
            >
              <Rocket className="h-3.5 w-3.5" />
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
