"use client";

// NOVACUT Studio - Form setelan Export Langsung (dipakai di Playlist Export Panel
// dan di Mode Sederhana langkah 2). Seksi berjudul yang bisa dilipat agar rapi.

import { useState } from "react";
import { Bookmark, BookmarkPlus, Bot, Captions, ChevronDown, Cpu, Monitor, Save, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditor } from "@/lib/editor/store";
import { partLabel, LABEL_STYLES } from "@/lib/editor/constants";
import { deletePlaylistPreset, loadPlaylistPresets, savePlaylistExportConfig, savePlaylistPreset, type PlaylistPreset } from "@/lib/editor/playlistExport";
import { isDesktopFS } from "@/lib/editor/fsBridge";
import { modelSizeLabel } from "@/lib/editor/subtitles";
import { PlaylistFramingControls } from "../FramingControls";
import { useToast } from "@/hooks/use-toast";
import type { PlaylistExportConfig } from "@/lib/editor/types";

function Section({ icon, title, hint, children, defaultOpen = false }: { icon: React.ReactNode; title: string; hint?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-card">
      <button className="flex w-full items-center gap-2 px-3 py-2.5 text-left" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="text-blue-400">{icon}</span>
        <span className="flex-1 text-xs font-bold uppercase tracking-wider text-gray-300">{title}</span>
        {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="space-y-3 border-t border-white/[0.06] px-3 py-3">{children}</div>}
    </div>
  );
}

export function PlaylistSettingsForm({ showSave = true, hideTitleScreen = false }: { showSave?: boolean; hideTitleScreen?: boolean }) {
  const pl = useEditor((s) => s.playlistExport);
  const { toast } = useToast();
  const desktop = isDesktopFS();
  const setPl = (p: Partial<PlaylistExportConfig>) => useEditor.getState().setPlaylistExport(p);
  const contohJudul = useEditor((s) => s.assets.filter((a) => a.type === "video")[0]?.name.replace(/\.[^.]+$/, "")) || "Nama Video";

  // ===== v1.0.16: PRESET SATU-KLIK =====
  const [presets, setPresets] = useState<PlaylistPreset[]>(() => loadPlaylistPresets());
  const [presetName, setPresetName] = useState("");
  const savePreset = () => {
    const st = useEditor.getState();
    if (!presetName.trim()) {
      toast({ title: "Tulis nama preset dulu", description: "Contoh: Novel 8 Bagian" });
      return;
    }
    savePlaylistPreset(presetName, st.playlistExport, { mode: st.exportSettings.mode, splitBy: st.exportSettings.splitBy, parts: st.exportSettings.parts, partSeconds: st.exportSettings.partSeconds });
    setPresets(loadPlaylistPresets());
    toast({ title: `Preset "${presetName.trim()}" disimpan ✓`, description: "Klik chip presetnya kapan saja untuk menerapkan satu klik." });
    setPresetName("");
  };
  const applyPreset = (p: PlaylistPreset) => {
    useEditor.getState().setPlaylistExport({ ...p.cfg });
    useEditor.getState().setExportSettings({ mode: p.split.mode, splitBy: p.split.splitBy, parts: p.split.parts, partSeconds: p.split.partSeconds });
    savePlaylistExportConfig(p.cfg);
    toast({ title: `Preset "${p.name}" diterapkan ✓`, description: "Semua setelan teks, rasio, kualitas & split diganti sesuai preset." });
  };
  const removePreset = (name: string) => {
    deletePlaylistPreset(name);
    setPresets(loadPlaylistPresets());
  };

  const applyAndSave = () => {
    savePlaylistExportConfig(useEditor.getState().playlistExport);
    toast({
      title: "Setelan disimpan ✔",
      description: "Dipakai untuk semua export & split dari playlist berikutnya — termasuk saat aplikasi dibuka lagi.",
    });
  };

  return (
    <div className="space-y-2.5">
      {/* ===== PRESET SATU-KLIK (v1.0.16) ===== */}
      <Section icon={<Bookmark className="h-4 w-4" />} title="Preset" hint={presets.length ? `${presets.length} tersimpan` : "satu klik"} defaultOpen>
        <p className="text-[11px] leading-relaxed text-gray-500">Simpan SEMUA setelan (teks, rasio, kualitas, split, subtitle) di bawah satu nama — terapkan kapan saja dengan satu klik.</p>
        {presets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <span key={p.name} className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 py-1 pl-2 pr-1 text-[11px] font-semibold text-blue-300">
                <button className="max-w-[170px] truncate" onClick={() => applyPreset(p)} title={`Terapkan preset "${p.name}"`}>
                  {p.name}
                </button>
                <button className="rounded p-0.5 text-blue-400/60 transition hover:bg-red-500/20 hover:text-red-400" onClick={() => removePreset(p.name)} aria-label={`Hapus preset ${p.name}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Nama preset (mis. Novel 8 Bagian)" className="h-8 flex-1 border-white/10 bg-white/[0.03] text-xs" />
          <Button size="sm" className="h-8 shrink-0 gap-1 bg-blue-600 px-2.5 text-[11px] font-bold text-white hover:bg-blue-500" onClick={savePreset}>
            <BookmarkPlus className="h-3.5 w-3.5" /> Simpan
          </Button>
        </div>
      </Section>

      {/* ===== TEKS DI VIDEO ===== */}
      <Section icon={<Type className="h-4 w-4" />} title="Teks di Video" hint="judul · deskripsi · part" defaultOpen>
        <p className="text-[11px] leading-relaxed text-gray-500">Atur tulisan yang muncul di setiap hasil export &amp; split video.</p>

        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs leading-snug text-gray-300">Judul otomatis dari nama video</Label>
          <Switch checked={pl.autoTitle} onCheckedChange={(v) => setPl({ autoTitle: v })} className="data-[state=checked]:bg-blue-500" />
        </div>
        {pl.autoTitle ? (
          <div className="truncate rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-gray-400" title={contohJudul}>
            Contoh judul: <span className="text-gray-200">{contohJudul}</span>
          </div>
        ) : (
          <Input value={pl.titleCustom} onChange={(e) => setPl({ titleCustom: e.target.value })} placeholder="Tulis judul sendiri untuk semua video" className="h-8 border-white/10 bg-white/[0.03] text-xs" />
        )}

        <div className="space-y-1">
          <Label className="text-xs text-gray-300" htmlFor="pl-desc">
            Deskripsi (muncul di bawah judul)
          </Label>
          <Textarea id="pl-desc" value={pl.description} onChange={(e) => setPl({ description: e.target.value })} placeholder="Contoh: DC MUSIK - DC. PRODUCTION" rows={2} className="min-h-[56px] border-white/10 bg-white/[0.03] text-xs" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs leading-snug text-gray-300">Teks part otomatis tiap bagian</Label>
          <Switch checked={pl.showPartText} onCheckedChange={(v) => setPl({ showPartText: v })} className="data-[state=checked]:bg-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={pl.labelStyle} onValueChange={(v) => setPl({ labelStyle: v as PlaylistExportConfig["labelStyle"] })}>
            <SelectTrigger className="h-8 flex-1 border-white/10 bg-white/[0.03] text-xs" aria-label="Gaya teks part">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-popover text-xs">
              {LABEL_STYLES.map((ls) => (
                <SelectItem key={ls} value={ls}>
                  {ls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="whitespace-nowrap rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 font-mono text-[11px] text-blue-300">{partLabel(pl.labelStyle, 2, 5, true)}</span>
        </div>

        {/* di Mode Sederhana toggle cover dipindah ke langkah Export & Split (hideTitleScreen) */}
        {!hideTitleScreen && (
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs leading-snug text-gray-300">Layar judul di awal tiap hasil</Label>
            <Switch checked={pl.showTitleScreen} onCheckedChange={(v) => setPl({ showTitleScreen: v })} className="data-[state=checked]:bg-blue-500" />
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs leading-snug text-gray-300">Teks tampil selama video (judul, deskripsi &amp; part)</Label>
          <Switch checked={pl.titleDuringVideo} onCheckedChange={(v) => setPl({ titleDuringVideo: v })} className="data-[state=checked]:bg-blue-500" />
        </div>
        {pl.titleDuringVideo && (
          <p className="text-[11px] leading-relaxed text-emerald-400/90">✓ Judul &amp; deskripsi tampil terus di bagian atas, teks part di bagian bawah — sampai video selesai.</p>
        )}
      </Section>

      {/* ===== RASIO & LAYAR ===== */}
      <Section icon={<Monitor className="h-4 w-4" />} title="Rasio & Layar" hint={`${pl.ratio} · ${pl.quality ?? "tajam"}`}>
        <div className="space-y-1">
          <Label className="text-xs text-gray-300" htmlFor="pl-ratio">
            Rasio video hasil
          </Label>
          <Select value={pl.ratio} onValueChange={(v) => setPl({ ratio: v as PlaylistExportConfig["ratio"] })}>
            <SelectTrigger id="pl-ratio" className="h-8 border-white/10 bg-white/[0.03] text-xs" aria-label="Rasio video hasil">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-popover text-xs">
              <SelectItem value="16:9">16:9 — Lanskap (seperti video asli)</SelectItem>
              <SelectItem value="9:16">9:16 — Vertikal (Shorts/TikTok/Reels)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* v1.0.16: preset kualitas — resolusi & kepadatan bitrate */}
        <div className="space-y-1">
          <Label className="text-xs text-gray-300">Kualitas hasil</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {([
              ["ringan", "Ringan", "720p · file kecil"],
              ["tajam", "Tajam", "1080p · disarankan"],
              ["maksimal", "Maksimal", "1080p · terbaik"],
            ] as const).map(([val, lab, sub]) => (
              <button
                key={val}
                onClick={() => setPl({ quality: val })}
                className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${(pl.quality ?? "tajam") === val ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25"}`}
              >
                {lab}
                <span className="block text-[10px] font-normal text-gray-500">{sub}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-gray-500">Ringan = render paling cepat &amp; file paling kecil (cocok untuk upload harian). Maksimal = bitrate tertinggi, file terbesar.</p>
        </div>
        {pl.ratio === "9:16" && (
          <div className="space-y-1">
            <Label className="text-xs text-gray-300" htmlFor="pl-fit">
              Cara pas video ke layar vertikal
            </Label>
            <Select value={pl.fitMode} onValueChange={(v) => setPl({ fitMode: v as PlaylistExportConfig["fitMode"] })}>
              <SelectTrigger id="pl-fit" className="h-8 border-white/10 bg-white/[0.03] text-xs" aria-label="Cara pas video ke layar vertikal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-popover text-xs">
                <SelectItem value="fill">Isi penuh — sisi kiri &amp; kanan dipotong otomatis</SelectItem>
                <SelectItem value="fit">Video utuh — tanpa potong (ada bar hitam)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {/* v1.0.20: pilih "Video utuh" → menu ZOOM & POSISI muncul (besar-kecil + geser kiri/kanan/atas/bawah) */}
        {pl.ratio === "9:16" && pl.fitMode === "fit" && (
          <PlaylistFramingControls
            title="ZOOM & POSISI VIDEO UTUH"
            hint="Khusus Video utuh: 1.00x = video utuh seperti biasa (ada bar hitam). Perbesar zoom untuk membuat video tampil lebih BESAR, lalu geser KIRI/KANAN/ATAS/BAWAH untuk memilih bagian video mana yang terlihat. Tombol ISI FRAME = perbesar otomatis sampai bar hitam hilang."
          />
        )}
      </Section>

      {/* ===== RENDER PARALEL ===== */}
      <Section icon={<Cpu className="h-4 w-4" />} title="Render Paralel" hint={`${pl.parallel ?? 3} video`}>
        <div className="space-y-1">
          <Label className="text-xs text-gray-300" htmlFor="pl-parallel">
            Render paralel (video bersamaan)
          </Label>
          <Select value={String(pl.parallel ?? 3)} onValueChange={(v) => setPl({ parallel: Math.max(1, Math.min(5, Number(v) || 3)) })}>
            <SelectTrigger id="pl-parallel" className="h-8 border-white/10 bg-white/[0.03] text-xs" aria-label="Render paralel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-popover text-xs">
              <SelectItem value="1">1 video — hemat daya</SelectItem>
              <SelectItem value="2">2 video bersamaan</SelectItem>
              <SelectItem value="3">3 video bersamaan (disarankan)</SelectItem>
              <SelectItem value="4">4 video bersamaan</SelectItem>
              <SelectItem value="5">5 video bersamaan (tercepat)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] leading-relaxed text-gray-500">Mode kilat merender beberapa video SEKALIGUS — makin banyak, makin cepat (memakai lebih banyak CPU/GPU).</p>
        </div>
      </Section>

      {/* ===== OTOMATISASI BATCH (v1.0.16) ===== */}
      <Section icon={<Bot className="h-4 w-4" />} title="Otomatisasi Batch" hint={pl.autoShutdown ? "shutdown ON" : pl.smartSplit ? "split cerdas" : "lanjutan"}>
        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs leading-snug text-gray-300">Potong di jeda sunyi (smart split)</Label>
          <Switch checked={!!pl.smartSplit} onCheckedChange={(v) => setPl({ smartSplit: v })} className="data-[state=checked]:bg-blue-500" />
        </div>
        {!!pl.smartSplit && <p className="text-[11px] leading-relaxed text-emerald-400/90">✓ Titik potong digeser otomatis ke jeda sunyi audio terdekat (±8 detik) — klip berhenti di tempat dramatis, bukan di tengah kalimat.</p>}
        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs leading-snug text-gray-300">Bunyi &quot;ting&quot; saat tiap film selesai</Label>
          <Switch checked={pl.soundDone !== false} onCheckedChange={(v) => setPl({ soundDone: v })} className="data-[state=checked]:bg-blue-500" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs leading-snug text-gray-300">Lanjutkan batch — lewati yang sudah ada</Label>
          <Switch checked={pl.skipExisting !== false} onCheckedChange={(v) => setPl({ skipExisting: v })} className="data-[state=checked]:bg-blue-500" />
        </div>
        <p className="text-[11px] leading-relaxed text-gray-500">Bagian yang filenya sudah lengkap di folder hasil DILEWATI — cocok untuk melanjutkan batch besar yang terputus listrik atau aplikasi tertutup.</p>
        {desktop && (
          <>
            <div className="flex items-center justify-between gap-3">
              <Label className="text-xs leading-snug text-gray-300">Matikan PC setelah batch selesai</Label>
              <Switch checked={!!pl.autoShutdown} onCheckedChange={(v) => setPl({ autoShutdown: v })} className="data-[state=checked]:bg-blue-500" />
            </div>
            {!!pl.autoShutdown && <p className="text-[11px] leading-relaxed text-amber-400/90">PC akan mati otomatis 60 detik setelah SEMUA film selesai tanpa gagal — jalankan batch semalaman dengan tenang. Pastikan tidak ada pekerjaan lain.</p>}
          </>
        )}
      </Section>

      {/* ===== SUBTITLE AI ===== */}
      <Section icon={<Captions className="h-4 w-4" />} title="Subtitle AI" hint={pl.autoSub ? pl.subLevel || "ringan" : "mati"}>
        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs leading-snug text-gray-300">Subtitle AI otomatis dari suara (bahasa Indonesia)</Label>
          <Switch checked={!!pl.autoSub} onCheckedChange={(v) => setPl({ autoSub: v })} className="data-[state=checked]:bg-blue-500" />
        </div>
        {!!pl.autoSub && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {(["ringan", "sedang", "akurat"] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => setPl({ subLevel: lv })}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize ${pl.subLevel === lv ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25"}`}
                >
                  {lv}
                  <span className="block text-[10px] font-normal text-gray-500">{modelSizeLabel(lv)}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-amber-400/90">Model AI diunduh sekali (butuh internet pada pemakaian pertama), setelah itu berjalan offline di perangkatmu. Memahami bahasa Indonesia resmi &amp; gaul.</p>
          </div>
        )}
      </Section>

      {showSave && (
        <div className="space-y-1.5">
          <Button className="h-9 w-full gap-1.5 bg-blue-600 text-xs font-bold text-white hover:bg-blue-500" onClick={applyAndSave}>
            <Save className="h-4 w-4" />
            Terapkan &amp; Simpan Setelan
          </Button>
          <p className="text-center text-[11px] leading-relaxed text-gray-600">Setelan tersimpan otomatis dipakai lagi untuk video berikutnya — termasuk setelah aplikasi ditutup.</p>
        </div>
      )}
    </div>
  );
}
