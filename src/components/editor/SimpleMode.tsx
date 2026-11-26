"use client";

// NOVACUT Studio - Mode Sederhana: wizard 4 langkah untuk export langsung
//   1) Pilih Video   2) Atur (rasio/subtitle)   3) Teks (ukuran/posisi/font)
//   4) Export & Split (+ pengaturan Cover Otomatis di Depan)
// Semua fitur tetap tersedia di Mode Pro (tombol kanan atas).

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FolderOpen, FolderSearch, Image as ImageIcon, Loader2, Rocket, Scissors, Sparkles, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditor } from "@/lib/editor/store";
import { fmtEta, fmtSize, fmtTime, POSTER_TEMPLATES } from "@/lib/editor/constants";
import { bersihkanJudul, COVER_FRAMES, jalurPosterAI, alasanJalurPosterAI, kesalahanPosterAI, POSTER_PROMPT_DEFAULT } from "@/lib/editor/covers";
import AIKeyCard from "./AIKeyCard";
import { ensureCoverAsset, regenAllCoverPrompts, regenCoverWithFrame, runBatchExport, triggerDownload } from "@/lib/editor/exporter";
import type { CoverConfig, CoverFrameStyle } from "@/lib/editor/types";
import { FramePicker } from "./FramePicker";
import { importFiles } from "@/lib/editor/mediaImport";
import { forgetExportDir, isDesktopFS, loadSavedExportDir, openInFolder, pickExportDir, rememberExportDir } from "@/lib/editor/fsBridge";
import { saveUiMode } from "@/lib/editor/uiPrefs";
import { useToast } from "@/hooks/use-toast";
import { PlaylistSettingsForm } from "./panels/PlaylistSettingsForm";
import { TextStyleSettings } from "./panels/TextStyleSettings";
import { TrimControls } from "./TrimControls";
import { WatermarkControls } from "./WatermarkControls";

const STEPS = [
  { n: 1, label: "Pilih Video" },
  { n: 2, label: "Atur" },
  { n: 3, label: "Teks" },
  { n: 4, label: "Export" },
];

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          {i > 0 && <span className={`h-px w-5 sm:w-8 ${step > s.n - 1 ? "bg-blue-500" : "bg-white/15"}`} />}
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${step === s.n ? "bg-blue-500/15 text-blue-300" : step > s.n ? "text-emerald-400" : "text-gray-500"}`}>
            <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] ${step === s.n ? "bg-blue-500 text-white" : step > s.n ? "bg-emerald-500 text-white" : "bg-white/10 text-gray-400"}`}>
              {step > s.n ? <CheckCircle2 className="h-3 w-3" /> : s.n}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SimpleMode() {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const assets = useEditor((s) => s.assets);
  const list = useEditor((s) => s.exportList);
  const running = useEditor((s) => s.exportState.running);
  const ex = useEditor((s) => s.exportState);
  const jobs = useEditor((s) => s.batchJobs);
  const settings = useEditor((s) => s.exportSettings);
  const pl = useEditor((s) => s.playlistExport);
  const cover = useEditor((s) => s.cover);
  const project = useEditor((s) => s.project);
  // v1.0.44: status aset cover — poster AI sukses (aiMade) atau frame klasik (AI gagal)
  const coverAsset = assets.find((a) => a.id === cover.coverAssetId);
  const posterAIBerhasil = !!coverAsset?.aiMade;
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const desktop = isDesktopFS();
  const [dir, setDir] = useState(settings.exportDir || "");
  // v1.0.19: status penerapan bingkai cover (regenerasi cover berjalan diam-diam)
  const [frameApplying, setFrameApplying] = useState(false);

  /** v1.0.19: pilih bingkai cover — cover yang sudah ada langsung dibuat ulang agar bingkai terlihat */
  const pickFrame = (id: CoverFrameStyle) => {
    const st = useEditor.getState();
    const prev = st.cover.frameStyle ?? "none";
    if (prev === id) return;
    st.setCover({ frameStyle: id });
    if (!st.cover.coverAssetId) return; // belum ada cover — nanti dibuat otomatis saat export (bingkai ikut)
    setFrameApplying(true);
    void regenCoverWithFrame(prev)
      .then((ok) => {
        if (ok) toast({ title: "Bingkai diterapkan ✔", description: "Cover dibuat ulang dengan bingkai baru." });
      })
      .finally(() => setFrameApplying(false));
  };

  const videos = assets.filter((a) => a.type === "video");
  // v1.0.35: status merender poster AI (menonaktifkan tombol saat berjalan)
  const [posterMaking, setPosterMaking] = useState(false);

  /** v1.0.32: ubah setelan cover + buat ulang cover tersimpan agar gaya baru
   * langsung terpakai (dulu cover lama tetap dipakai di export berikutnya —
   * cover Poster Hollywood bisa keluar hitam karena cover hitam lama masih dipakai) */
  const changeCover = (patch: Partial<CoverConfig>) => {
    useEditor.getState().setCover(patch);
    const st = useEditor.getState();
    if (st.cover.coverAssetId && st.assets.some((a) => a.id === st.cover.coverAssetId)) {
      void regenCoverWithFrame().then((ok) => {
        if (ok) toast({ title: "Cover diperbarui ✔", description: "Cover tersimpan dibuat ulang dengan gaya baru." });
      });
    } else if (patch.bgStyle && st.cover.mode === "auto" && videos[0]) {
      // v1.0.33: belum ada cover sama sekali — buat CONTOH cover segera agar
      // pengguna langsung melihat hasil gaya barunya (dulu baru muncul saat export)
      toast({ title: "Membuat contoh cover…", description: "AI mengambil adegan terbaik dari video untuk cover/poster." });
      void ensureCoverAsset(videos[0]).then((id) => {
        // v1.0.44: fallback AI tetap mengembalikan id — cek aiMade, jangan anggap AI sukses
        const aiOk = !!id && !!useEditor.getState().assets.find((a) => a.id === id)?.aiMade;
        if (id && aiOk) {
          useEditor.getState().setCover({ coverAIError: "" });
          toast({ title: "Contoh poster AI siap ✔", description: "Gaya baru sudah diterapkan dan akan dipakai saat export." });
        } else if (id && patch.bgStyle === "poster") {
          const sebab = kesalahanPosterAI() || "AI tidak mengembalikan gambar";
          useEditor.getState().setCover({ coverAIError: sebab });
          toast({ title: "AI gagal — frame cadangan dipakai", description: `Contoh cover memakai frame ter-grade. ${sebab}` });
        } else if (id) {
          toast({ title: "Contoh cover siap ✔", description: "Gaya baru sudah diterapkan dan akan dipakai saat export." });
        } else {
          toast({ title: "Cover dibuat saat export", description: "Contoh cover belum bisa dibuat sekarang — akan dibuat otomatis saat export." });
        }
      });
    }
  };
  const selected = list.map((id) => assets.find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a && a.type === "video");

  // pulihkan folder terakhir (desktop)
  useEffect(() => {
    const saved = loadSavedExportDir();
    if (saved && !useEditor.getState().exportSettings.exportDir) {
      useEditor.getState().setExportSettings({ exportDir: saved });
      setDir(saved);
    }
  }, []);

  const onImport = async (files: FileList | null) => {
    setBusy(true);
    const created = await importFiles(files);
    const vids = created.filter((a) => a.type === "video").map((a) => a.id);
    if (vids.length) useEditor.getState().addToAssetList("export", vids);
    setBusy(false);
    if (created.length) toast({ title: `${created.length} media diimpor`, description: "Video otomatis dipilih untuk export." });
  };

  const toggleSel = (id: string) => {
    const st = useEditor.getState();
    if (st.exportList.includes(id)) st.removeFromAssetList("export", id);
    else st.addToAssetList("export", [id]);
  };

  const onPickDir = async () => {
    const res = await pickExportDir(useEditor.getState().exportSettings.exportDir || undefined);
    if (!res.canceled && res.path) {
      useEditor.getState().setExportSettings({ exportDir: res.path });
      rememberExportDir(res.path);
      setDir(res.path);
    }
  };

  const D = selected.reduce((m, v) => m + v.duration, 0);
  // v1.0.25: durasi terpotong per video (POTONG MULAI & AKHIR) — estimasi jumlah
  // part & estimasi waktu mengikuti rentang yang benar-benar dirender
  const Dmax = selected.reduce((m, v) => Math.max(m, v.duration), 0);
  const trimLen = (d: number) => {
    if (!settings.trimOn) return d;
    const s0 = Math.min(Math.max(0, settings.trimStart || 0), Math.max(0, d - 0.1));
    const e0 = settings.trimEnd && settings.trimEnd > s0 ? Math.min(settings.trimEnd, d) : d;
    return Math.max(0.1, e0 - s0);
  };
  const DTrim = selected.reduce((m, v) => m + trimLen(v.duration), 0);
  const estParts = settings.mode === "single" ? selected.length : settings.splitBy === "count" ? Math.max(1, Math.min(50, settings.parts)) * selected.length : Math.max(selected.length, Math.ceil(DTrim / Math.max(1, settings.partSeconds)));

  const firstSel = selected[0];
  // Langkah TEKS: selaraskan judul/deskripsi/label dengan setelan langkah "Atur"
  // (sama seperti yang dipakai saat render) agar pratinjau 100% representatif.
  const autoName = firstSel ? bersihkanJudul(firstSel.name.replace(/\.[^.]+$/, "")) : "";
  useEffect(() => {
    if (step !== 3) return;
    const title = pl.autoTitle ? autoName : pl.titleCustom.trim() || autoName;
    const perVideoParts = settings.mode === "single" ? 1 : settings.splitBy === "count" ? Math.max(1, Math.min(50, settings.parts)) : Math.max(1, Math.ceil(trimLen(firstSel?.duration || 1) / Math.max(1, settings.partSeconds)));
    useEditor.getState().setTexts({ title, description: pl.description, labelStyle: pl.labelStyle, parts: perVideoParts });
  }, [step, autoName, firstSel?.id, pl.autoTitle, pl.titleCustom, pl.description, pl.labelStyle, settings.mode, settings.splitBy, settings.parts, settings.partSeconds]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* header wizard */}
      <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.07] bg-card px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Scissors className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-xs font-black tracking-[0.2em]">NOVACUT</div>
            <div className="text-[9px] tracking-[0.25em] text-muted-foreground">MODE SEDERHANA</div>
          </div>
        </div>
        <div className="mx-auto">
          <StepBar step={step} />
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 border-white/10 bg-white/[0.04] text-xs" onClick={() => { saveUiMode("pro"); useEditor.getState().setUiMode("pro"); }}>
          <ArrowRight className="h-3.5 w-3.5" /> Mode Pro
        </Button>
      </header>

      <div className="nova-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {/* ===== LANGKAH 1: PILIH VIDEO ===== */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-lg font-bold">Pilih video yang mau di-export &amp; split</h1>
                <p className="mt-1 text-sm text-muted-foreground">Impor dari komputer, lalu ketuk video untuk memilih. Urutan pilihan = urutan part.</p>
              </div>

              <button
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-card px-4 py-7 text-center transition hover:border-blue-500/60 hover:bg-blue-500/[0.03]"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void onImport(e.dataTransfer.files);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                aria-label="Impor video"
              >
                {busy ? <Loader2 className="h-7 w-7 animate-spin text-blue-400" /> : <Upload className="h-7 w-7 text-blue-400" />}
                <div className="text-sm font-bold text-gray-200">{busy ? "Menganalisis video..." : "Impor Video"}</div>
                <div className="text-xs text-gray-500">Klik atau tarik file video ke sini</div>
                <input ref={inputRef} type="file" multiple accept="video/*" className="hidden" onChange={(e) => void onImport(e.target.files)} />
              </button>

              {videos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {videos.map((v, i) => {
                    const selIdx = list.indexOf(v.id);
                    const on = selIdx >= 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => toggleSel(v.id)}
                        aria-pressed={on}
                        className={`group relative overflow-hidden rounded-xl border text-left transition ${on ? "border-blue-500 bg-blue-500/[0.06]" : "border-white/10 bg-card hover:border-white/25"}`}
                      >
                        {v.thumb ? (
                          <img src={v.thumb} alt={v.name} className="h-28 w-full object-cover" />
                        ) : (
                          <div className="flex h-28 w-full items-center justify-center bg-white/5 text-gray-600">
                            <Video className="h-6 w-6" />
                          </div>
                        )}
                        <div className="p-2.5">
                          <div className="truncate text-xs font-medium text-gray-200">{v.name}</div>
                          <div className="text-[11px] text-gray-500">{fmtTime(v.duration)}</div>
                        </div>
                        <span
                          className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${on ? "bg-blue-500 text-white" : "border border-white/30 bg-black/50 text-gray-400"}`}
                        >
                          {on ? selIdx + 1 : i + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                !busy && <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-gray-500">Belum ada video. Impor dulu ya kawan.</div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">{selected.length} video dipilih · total {fmtTime(D)}</span>
                <Button className="h-10 gap-2 bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-500" disabled={selected.length === 0} onClick={() => setStep(2)}>
                  Lanjut: Atur <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ===== LANGKAH 2: ATUR ===== */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-lg font-bold">Atur tampilan video hasil</h1>
                <p className="mt-1 text-sm text-muted-foreground">Judul, deskripsi, rasio layar dan subtitle AI — teks lanjutan ada di langkah berikutnya.</p>
              </div>
              <PlaylistSettingsForm showSave={false} hideTitleScreen />
              <div className="rounded-xl border border-white/[0.07] bg-card p-3 text-[11px] leading-relaxed text-gray-500">
                Mau pakai <b className="text-gray-300">efek sinematik, transisi, kecepatan, zoom</b> atau atur huruf lanjutan? Buka <b className="text-blue-400">Mode Pro</b> (kanan atas) → menu Efek / Klip / Teks, pilih target &quot;Video Playlist&quot;.
              </div>
              <div className="flex items-center justify-between pt-1">
                <Button variant="outline" className="h-10 gap-2 border-white/10 bg-white/[0.04] text-sm" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Kembali
                </Button>
                <Button className="h-10 gap-2 bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-500" onClick={() => setStep(3)}>
                  Lanjut: Teks <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ===== LANGKAH 3: TEKS (UKURAN, POSISI & FONT) ===== */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-lg font-bold">Atur teks: ukuran, posisi &amp; font</h1>
                <p className="mt-1 text-sm text-muted-foreground">Geser huruf judul, deskripsi &amp; part sesukamu — pratinjau berubah seketika, hasil export mengikuti persis.</p>
              </div>
              <TextStyleSettings ratioOverride={pl.ratio} />
              <div className="flex items-center justify-between pt-1">
                <Button variant="outline" className="h-10 gap-2 border-white/10 bg-white/[0.04] text-sm" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" /> Kembali
                </Button>
                <Button className="h-10 gap-2 bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-500" onClick={() => setStep(4)}>
                  Lanjut: Export &amp; Split <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ===== LANGKAH 4: EXPORT & SPLIT ===== */}
          {step === 4 && (
            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-4">
              <div>
                <h1 className="text-lg font-bold">Export &amp; Split {selected.length} video</h1>
                <p className="mt-1 text-sm text-muted-foreground">Video dirender di latar belakang — aplikasi boleh diperkecil, jangan ditutup.</p>
              </div>

              {/* pembagian */}
              <div className="space-y-3 rounded-xl border border-white/[0.07] bg-card p-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Pembagian</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => useEditor.getState().setExportSettings({ mode: "single" })} className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${settings.mode === "single" ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25"}`}>
                    Export Saja
                    <span className="block text-[10px] font-normal text-gray-500">Tiap video jadi 1 file utuh</span>
                  </button>
                  <button onClick={() => useEditor.getState().setExportSettings({ mode: "split" })} className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${settings.mode === "split" ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25"}`}>
                    Export &amp; Split
                    <span className="block text-[10px] font-normal text-gray-500">Pecah otomatis jadi banyak video</span>
                  </button>
                </div>
                {settings.mode === "split" && (
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      <button onClick={() => useEditor.getState().setExportSettings({ splitBy: "count" })} className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${settings.splitBy === "count" ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400"}`}>
                        Berapa bagian
                      </button>
                      <button onClick={() => useEditor.getState().setExportSettings({ splitBy: "duration" })} className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${settings.splitBy === "duration" ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400"}`}>
                        Durasi per video
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {settings.splitBy === "count" ? (
                        <>
                          <span>Jumlah</span>
                          <Input type="number" min={1} max={50} value={settings.parts} onChange={(e) => useEditor.getState().setExportSettings({ parts: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })} className="h-8 w-20 border-white/10 bg-white/[0.03] text-xs" />
                          <span>bagian / video</span>
                        </>
                      ) : (
                        <>
                          <span>@</span>
                          <Input type="number" min={1} max={600} value={settings.partSeconds} onChange={(e) => useEditor.getState().setExportSettings({ partSeconds: Math.max(1, Math.min(600, Number(e.target.value) || 1)) })} className="h-8 w-20 border-white/10 bg-white/[0.03] text-xs" />
                          <span>detik / video</span>
                        </>
                      )}
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[11px] text-blue-300">
                      {fmtTime(DTrim)} → ±{estParts} video hasil
                    </div>
                  </div>
                )}
              </div>

              {/* ===== v1.0.25: POTONG MULAI & AKHIR (RENTANG DETIK) ===== */}
              <TrimControls durMax={Dmax} />

              {/* ===== v1.0.25: WATERMARK (LOGO GAMBAR PNG/JPEG) ===== */}
              <WatermarkControls />

              {/* ===== COVER OTOMATIS DI DEPAN ===== */}
              <div className="space-y-3 rounded-xl border border-white/[0.07] bg-card p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                    <ImageIcon className="h-3.5 w-3.5 text-blue-400" /> Cover Otomatis di Depan
                  </div>
                  <Switch checked={pl.showTitleScreen} onCheckedChange={(v) => useEditor.getState().setPlaylistExport({ showTitleScreen: v })} className="data-[state=checked]:bg-blue-500" aria-label="Cover otomatis di depan" />
                </div>
                {pl.showTitleScreen ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="w-16 shrink-0">Durasi</span>
                      <input type="range" min={2} max={5} step={0.5} value={settings.coverDuration} onChange={(e) => useEditor.getState().setExportSettings({ coverDuration: Number(e.target.value) })} className="h-1 flex-1 accent-blue-500" aria-label="Durasi cover" />
                      <span className="w-9 text-right font-mono text-blue-300">{settings.coverDuration}s</span>
                    </div>
                    {/* v1.0.35: GAYA COVER — template klasik atau POSTER HOLLYWOOD AI (frame video + prompt → poster sinematik) */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Gaya Cover</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => changeCover({ bgStyle: "adegan" })}
                          className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition ${cover.bgStyle === "adegan" ? "border-blue-400 bg-blue-500/15 text-blue-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-blue-500/40"}`}
                        >
                          Template AI (klasik)
                        </button>
                        <button
                          onClick={() => changeCover({ bgStyle: "poster" })}
                          className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition ${cover.bgStyle === "poster" ? "border-amber-400 bg-amber-500/15 text-amber-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-amber-500/40"}`}
                        >
                          🎬 Poster Hollywood (AI)
                        </button>
                      </div>
                      {cover.bgStyle === "poster" && (
                        <div className="space-y-1.5">
                          {/* PROMPT AI — kosong = prompt default; diisi = prompt manual pengguna */}
                          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Prompt Poster AI</div>
                          <textarea
                            value={cover.posterPrompt ?? ""}
                            onChange={(e) => useEditor.getState().setCover({ posterPrompt: e.target.value })}
                            placeholder={POSTER_PROMPT_DEFAULT + ' dengan menggunakan judul video sebagai judul di poster'}
                            rows={3}
                            className="w-full resize-none rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11px] leading-relaxed text-gray-200 placeholder:text-gray-600 focus:border-amber-500/50 focus:outline-none"
                            aria-label="Prompt poster AI"
                          />
                          <div className="text-[10px] leading-relaxed text-gray-500">
                            {cover.posterPrompt?.trim() ? (
                              <>
                                <b className="text-amber-400/90">Prompt manual aktif.</b>{" "}
                                <button className="underline hover:text-gray-300" onClick={() => useEditor.getState().setCover({ posterPrompt: "" })}>
                                  kembali ke prompt default
                                </button>
                              </>
                            ) : (
                              <>
                                <b className="text-amber-400/90">Prompt default</b> — poster Hollywood modern sinematik, judul video ditulis AI di poster.
                              </>
                            )}{" "}
                            Adegan diambil dari detik 5–30 video, rasio poster mengikuti rasio video (16:9 / 9:16), tulisan selalu dijaga di dalam tepi gambar.
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => {
                                if (posterMaking) return;
                                setPosterMaking(true);
                                toast({ title: "Membuat poster AI…", description: "Adegan video diubah jadi poster Hollywood (10–120 detik)." });
                                void ensureCoverAsset(videos[0], true).then((id) => {
                                  setPosterMaking(false);
                                  // v1.0.44: fallback AI tetap mengembalikan id — toast dulu
                                  // bilang "Poster AI siap ✔" padahal AI gagal (cover frame klasik)
                                  const aiOk = !!id && !!useEditor.getState().assets.find((a) => a.id === id)?.aiMade;
                                  if (aiOk) {
                                    useEditor.getState().setCover({ coverAIError: "" });
                                    toast({ title: "Poster AI siap ✔", description: "Poster tampil di pratinjau dan dipakai saat export." });
                                  } else {
                                    const sebab = kesalahanPosterAI() || "AI tidak mengembalikan gambar";
                                    useEditor.getState().setCover({ coverAIError: sebab });
                                    toast({ title: "AI gagal — pakai cadangan", description: `Cover memakai frame ter-grade. ${sebab}` });
                                  }
                                });
                              }}
                              disabled={posterMaking || !videos[0]}
                              className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-1.5 text-[11px] font-semibold text-amber-100 transition hover:border-amber-400 disabled:opacity-50"
                            >
                              {posterMaking ? "🎨 Merender poster…" : "🎨 Buat Ulang Poster (AI)"}
                            </button>
                            {videos.length > 1 && (
                              <button
                                onClick={() => {
                                  if (posterMaking) return;
                                  setPosterMaking(true);
                                  void regenAllCoverPrompts().then((n) => {
                                    setPosterMaking(false);
                                    toast({ title: `Poster AI: ${n} video ✔`, description: "Prompt ini dipakai poster semua video yang diproses." });
                                  });
                                }}
                                disabled={posterMaking}
                                className="rounded-md border border-blue-500/40 bg-blue-500/10 px-2 py-1.5 text-[11px] font-semibold text-blue-100 transition hover:border-blue-400 disabled:opacity-50"
                              >
                                ⚡ Terapkan prompt ini ke semua video
                              </button>
                            )}
                            {/* v1.0.50: BASIS POSTER — AI menyentuh adegan asli (edit
                            frame via CF flux-2), adegan ASLI + grade studio, atau
                            adegan ASLI + background hitam sinematik & bingkai film
                            (0 Neuron, identitas 100%) */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <select
                                value={cover.posterArtMode ?? "ai"}
                                onChange={(e) => useEditor.getState().setCover({ posterArtMode: e.target.value === "asli" ? "asli" : e.target.value === "aslihitam" ? "aslihitam" : e.target.value === "kisah" ? "kisah" : "ai" })}
                                className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[11px] text-gray-200"
                                title="Dasar gambar poster: hasil sentuhan AI, atau adegan asli persis dari video"
                              >
                                <option value="ai">🤖 AI sentuh adegan (edit frame)</option>
                                <option value="asli">🎬 Adegan asli + grade studio (0 Neuron)</option>
                                <option value="aslihitam">🎞️ Adegan asli + bg sinematik AI (Cloudflare)</option>
                                <option value="kisah">📕 Poster kisah AI — adegan baru dari judul (CF gratis / Mage / MiniMax)</option>
                              </select>
                              {/* v1.0.50: TEKS DI POSTER — judul + part (normal) atau
                              part SAJA (video sudah punya tulisan judul bawaan → judul
                              tidak dobel; label part tetap ditulis mesin render) */}
                              <select
                                value={cover.posterTextIsi ?? "judul"}
                                onChange={(e) => useEditor.getState().setCover({ posterTextIsi: e.target.value === "part" ? "part" : "judul" })}
                                className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[11px] text-gray-200"
                                title="Poster menampilkan judul + part, atau part saja (untuk video yang sudah ada tulisan judulnya)"
                              >
                                <option value="judul">📝 Judul + part (normal)</option>
                                <option value="part">⚪ Part saja — tanpa judul (video sdh ada tulisan)</option>
                              </select>
                            </div>
                            {/* v1.0.46: TEKS JUDUL POSTER — App (art AI polos + judul
                            ditulis aplikasi, ejaan selalu benar) atau AI (perilaku lama) */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <select
                                value={cover.posterTextMode ?? "app"}
                                onChange={(e) => useEditor.getState().setCover({ posterTextMode: e.target.value === "ai" ? "ai" : "app" })}
                                className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[11px] text-gray-200"
                                title="Siapa yang menulis judul di poster"
                              >
                                <option value="app">📝 Judul: ditulis app (selalu benar)</option>
                                <option value="ai">🅰️ Judul: ditulis AI (kadang salah eja)</option>
                              </select>
                              {(cover.posterTextMode ?? "app") === "app" && (
                                <select
                                  value={cover.posterTemplateId ?? "auto"}
                                  onChange={(e) => useEditor.getState().setCover({ posterTemplateId: e.target.value })}
                                  className="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-[11px] text-gray-200"
                                  title="Gaya frame tulisan poster (meniru poster referensi)"
                                >
                                  <option value="auto">🎲 Template: Otomatis</option>
                                  {POSTER_TEMPLATES.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                          <AIKeyCard />
                        </div>
                      )}
                    </div>
                    {/* v1.0.19: BINGKAI COVER — klasik / modern / futuristik, transparan 75% */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Bingkai Cover</span>
                        <span className="font-mono text-[10px] text-blue-300/80">transparan 75%</span>
                      </div>
                      <FramePicker value={cover.frameStyle ?? "none"} onChange={pickFrame} disabled={running || frameApplying} />
                      <div className="text-[11px] leading-relaxed text-gray-500">
                        {frameApplying ? "Menerapkan bingkai pada cover..." : COVER_FRAMES.find((f) => f.id === (cover.frameStyle ?? "none"))?.desc}
                      </div>
                    </div>
                    <div className="text-[11px] leading-relaxed text-gray-500">
                      {cover.coverAssetId ? "✔ Cover siap dipakai — akan tampil di depan setiap bagian." : "Belum ada cover — AI akan membuatkan otomatis dari video."}
                    </div>
                    {/* v1.0.42: pratinjau kecil dihilangkan — pratinjau PENUH rasio proyek
                     * kini tampil di panel khusus sisi kanan (tidak terpotong lagi) */}
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-2.5 py-1.5 text-[11px] leading-relaxed text-blue-200/90">
                      Latar cover: <b>{cover.bgStyle === "hitam" ? "hitam polos" : cover.bgStyle === "poster" ? "Poster Hollywood" : "adegan dari video"}</b>
                      {cover.bgStyle === "adegan" ? (<> · semua bagian <b>{cover.bgScope === "beda" ? "berbeda adegan" : "sama"}</b></>) : null}
                      {cover.frameStyle && cover.frameStyle !== "none" ? (<> · bingkai <b>{COVER_FRAMES.find((f) => f.id === cover.frameStyle)?.label}</b></>) : null}
                      {cover.mode === "auto" ? " — adegan diambil otomatis dari video (detik 5–30)" : " · gambar pilihanmu"}
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] leading-relaxed text-gray-500">Cover dimatikan — video hasil langsung mulai dari isi tanpa layar judul di depan.</p>
                )}
              </div>

              {/* folder (desktop) */}
              {desktop && (
                <div className="space-y-2 rounded-xl border border-white/[0.07] bg-card p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <FolderSearch className="h-3.5 w-3.5 text-gray-400" /> Folder Hasil
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => void onPickDir()} className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-300 transition hover:bg-blue-500/20">
                        Pilih Folder
                      </button>
                      {dir && (
                        <button onClick={() => void openInFolder(dir)} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-gray-300 transition hover:border-blue-500/40">
                          Buka
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={`truncate rounded-lg border px-2.5 py-1.5 font-mono text-[11px] ${dir ? "border-blue-500/25 bg-black/40 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-500"}`} title={dir || undefined}>
                    {dir || "Folder Downloads (bawaan)"}
                  </div>
                  {dir && (
                    <button className="text-[11px] text-gray-500 underline hover:text-gray-300" onClick={() => { useEditor.getState().setExportSettings({ exportDir: "" }); forgetExportDir(); setDir(""); }}>
                      Kembali ke folder Downloads bawaan
                    </button>
                  )}
                </div>
              )}

              {/* tombol mulai */}
              <Button
                disabled={running || selected.length === 0}
                className="h-12 w-full gap-2 bg-blue-600 text-base font-black tracking-wide text-white hover:bg-blue-500 disabled:opacity-40"
                onClick={() => {
                  void runBatchExport(selected.map((v) => v.id));
                  toast({ title: "Render dimulai", description: "Kamu boleh memperkecil aplikasi — jangan ditutup ya kawan." });
                }}
              >
                {running ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                {running ? "MERENDER..." : `Mulai Export (${estParts > selected.length ? `±${estParts} video` : `${selected.length} video`})`}
              </Button>

              {/* progres per video */}
              {jobs.length > 0 && (
                <div className="space-y-2 rounded-xl border border-white/[0.07] bg-card p-3.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
                    <span className="truncate">{ex.label || "Menyiapkan..."}</span>
                    <span className="shrink-0 font-mono">
                      {/* v1.0.16: estimasi waktu tersisa */}
                      {running && ex.eta !== undefined ? `±${fmtEta(ex.eta)} · ` : ""}
                      {Math.round(ex.progress * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-white/10">
                    <div className="h-full rounded bg-blue-500 transition-all" style={{ width: `${Math.max(2, Math.round(ex.progress * 100))}%` }} />
                  </div>
                  <div className="space-y-2 pt-1">
                    {jobs.map((j) => (
                      <div key={j.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          {j.status === "selesai" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          ) : j.status === "jalan" ? (
                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-blue-400" />
                          ) : j.status === "gagal" ? (
                            <X className="h-3.5 w-3.5 shrink-0 text-red-400" />
                          ) : (
                            <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-gray-600" />
                          )}
                          <span className="min-w-0 flex-1 truncate text-gray-300">{j.name}</span>
                          <span className={`shrink-0 ${j.status === "selesai" ? "text-emerald-400" : j.status === "gagal" ? "text-red-400" : j.status === "jalan" ? "text-blue-400" : "text-gray-500"}`}>{j.label || j.status}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded bg-white/5">
                          <div className={`h-full rounded transition-all ${j.status === "selesai" ? "bg-emerald-500" : j.status === "gagal" ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${Math.max(j.status === "antre" ? 0 : 2, Math.round(j.progress * 100))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* hasil */}
              {ex.results.length > 0 && !running && (
                <div className="space-y-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Selesai! {ex.results.length} file siap</span>
                    <div className="flex gap-1">
                      {desktop ? (
                        <Button size="sm" variant="outline" className="h-8 gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 text-[11px] text-emerald-300 hover:bg-emerald-500/20" onClick={() => dir && void openInFolder(dir)}>
                          <FolderOpen className="h-3.5 w-3.5" /> Buka Folder
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-8 gap-1 border-white/10 bg-white/[0.04] px-2 text-[11px]" onClick={() => ex.results.forEach((r, i) => setTimeout(() => triggerDownload(r.url, r.name), i * 400))}>
                          <Download className="h-3.5 w-3.5" /> Unduh Semua
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="nova-scroll max-h-40 space-y-1 overflow-y-auto pr-1">
                    {ex.results.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5 text-xs text-gray-300">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span className="min-w-0 flex-1 truncate">{r.name}</span>
                        <span className="shrink-0 text-gray-500">{fmtSize(r.size)}</span>
                        {!desktop && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="rounded p-1 text-blue-400 hover:bg-blue-500/10" onClick={() => triggerDownload(r.url, r.name)} aria-label="Unduh">
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs">Unduh file ini</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <Button variant="outline" className="h-10 gap-2 border-white/10 bg-white/[0.04] text-sm" disabled={running} onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4" /> Kembali
                </Button>
                {!running && ex.results.length > 0 && (
                  <Button variant="outline" className="h-10 gap-2 border-white/10 bg-white/[0.04] text-sm" onClick={() => { useEditor.getState().clearExportResults(); useEditor.getState().clearBatchJobs(); setStep(1); }}>
                    <Sparkles className="h-4 w-4" /> Mulai Batch Baru
                  </Button>
                )}
              </div>
              </div>

              {/* ===== v1.0.42: PANEL PRATINJAU POSTER — sisi kanan, rasio penuh proyek, sticky ===== */}
              <div className="xl:sticky xl:top-2">
                <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-card">
                  <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-3 py-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">🖼️ Pratinjau Poster</span>
                    <span className="shrink-0 font-mono text-[10px] text-blue-300/80">{project.width}×{project.height} · {project.height > project.width ? "9:16" : "16:9"}</span>
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={cover.posterArtMode === "kisah" ? (posterAIBerhasil ? "font-semibold text-emerald-400" : "font-semibold text-amber-400/90") : cover.posterArtMode === "asli" ? "font-semibold text-sky-300" : cover.posterArtMode === "aslihitam" ? (jalurPosterAI() ? "font-semibold text-emerald-400" : "font-semibold text-sky-300") : posterAIBerhasil && !jalurPosterAI().includes("edit") ? "font-semibold text-yellow-400" : posterAIBerhasil ? "font-semibold text-emerald-400" : "font-semibold text-amber-400/90"}>
                        {cover.bgStyle === "poster" ? (cover.posterArtMode === "kisah" ? (posterAIBerhasil ? "● Poster kisah AI — adegan baru dari judul" : `○ Poster kisah gagal — frame klasik${kesalahanPosterAI() ? ` — ${kesalahanPosterAI().slice(0, 60)}` : ""}`) : cover.posterArtMode === "asli" ? "○ Adegan asli + grade studio (judul via template)" : cover.posterArtMode === "aslihitam" ? (jalurPosterAI() ? "● Bg sinematik AI — adegan asli + latar AI" : `○ Adegan asli + latar lokal (AI gagal)${alasanJalurPosterAI() || kesalahanPosterAI() ? ` — ${(alasanJalurPosterAI() || kesalahanPosterAI()).slice(0, 60)}` : ""}`) : posterAIBerhasil ? (jalurPosterAI().includes("edit") ? "● Poster AI dari frame video" : `● Poster AI teks-saja — ${alasanJalurPosterAI() || "edit frame gagal"}`) : cover.coverAssetId ? "○ Frame klasik (AI gagal)" : "○ Belum ada poster") : cover.coverAssetId ? "● Template klasik" : "○ Belum ada cover"}
                      </span>
                      <span className="font-mono text-gray-500">{cover.bgStyle === "poster" ? "poster Hollywood" : "template"}</span>
                    </div>
                    {cover.coverAssetId && cover.previewUrl ? (
                      <img
                        src={cover.previewUrl}
                        alt="Pratinjau poster penuh"
                        className="w-full rounded-lg border border-white/10 object-contain shadow-2xl"
                        style={{ aspectRatio: `${project.width} / ${project.height}` }}
                      />
                    ) : (
                      <div
                        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-3 text-center"
                        style={{ aspectRatio: `${project.width} / ${project.height}` }}
                      >
                        <span className="text-3xl opacity-60">🖼️</span>
                        <span className="text-[11px] leading-relaxed text-gray-500">
                          {pl.showTitleScreen
                            ? "Belum ada poster — pilih gaya Poster Hollywood lalu klik 🎨 Buat Ulang Poster."
                            : "Cover dimatikan — aktifkan dulu Cover Otomatis di Depan."}
                        </span>
                      </div>
                    )}
                    {cover.coverAIError ? (
                      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[10px] leading-relaxed text-amber-200">
                        <b>⚠️ Poster AI gagal — cover memakai frame klasik.</b>
                        <br />Sebab: {cover.coverAIError}
                        <br />Perbaiki sebabnya lalu klik 🎨 Buat Ulang Poster.
                      </div>
                    ) : null}
                    <div className="text-[10px] leading-relaxed text-gray-500">
                      Rasio penuh sesuai proyek — persis seperti yang tampil di depan video hasil export.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
