"use client";

// NOVACUT Studio - Mode Sederhana: wizard 4 langkah untuk export langsung
//   1) Pilih Video   2) Atur (rasio/subtitle)   3) Teks (ukuran/posisi/font)
//   4) Export & Split (+ pengaturan Cover Otomatis di Depan)
// Semua fitur tetap tersedia di Mode Pro (tombol kanan atas).

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FolderOpen, FolderSearch, Image as ImageIcon, Loader2, Rocket, Scissors, Sparkles, Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditor } from "@/lib/editor/store";
import { fmtEta, fmtSize, fmtTime } from "@/lib/editor/constants";
import { COVER_FRAMES } from "@/lib/editor/covers";
import { regenCoverWithFrame, runBatchExport, triggerDownload } from "@/lib/editor/exporter";
import type { CoverFrameStyle } from "@/lib/editor/types";
import { FramePicker } from "./FramePicker";
import { importFiles } from "@/lib/editor/mediaImport";
import { forgetExportDir, isDesktopFS, loadSavedExportDir, openInFolder, pickExportDir, rememberExportDir } from "@/lib/editor/fsBridge";
import { saveUiMode } from "@/lib/editor/uiPrefs";
import { useToast } from "@/hooks/use-toast";
import { PlaylistSettingsForm } from "./panels/PlaylistSettingsForm";
import { TextStyleSettings } from "./panels/TextStyleSettings";

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
  const estParts = settings.mode === "single" ? selected.length : settings.splitBy === "count" ? Math.max(1, Math.min(50, settings.parts)) * selected.length : Math.max(selected.length, Math.ceil(D / Math.max(1, settings.partSeconds)));

  const firstSel = selected[0];
  // Langkah TEKS: selaraskan judul/deskripsi/label dengan setelan langkah "Atur"
  // (sama seperti yang dipakai saat render) agar pratinjau 100% representatif.
  const autoName = firstSel ? firstSel.name.replace(/\.[^.]+$/, "") : "";
  useEffect(() => {
    if (step !== 3) return;
    const title = pl.autoTitle ? autoName : pl.titleCustom.trim() || autoName;
    const perVideoParts = settings.mode === "single" ? 1 : settings.splitBy === "count" ? Math.max(1, Math.min(50, settings.parts)) : Math.max(1, Math.ceil((firstSel?.duration || 1) / Math.max(1, settings.partSeconds)));
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
            <div className="space-y-4">
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
                      {fmtTime(D)} → ±{estParts} video hasil
                    </div>
                  </div>
                )}
              </div>

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
                      {cover.coverAssetId ? "✔ Cover siap dipakai (dibuat di Cover Studio)." : "Belum ada cover — AI akan membuatkan otomatis dari video."}
                    </div>
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-2.5 py-1.5 text-[11px] leading-relaxed text-blue-200/90">
                      Latar cover: <b>{cover.bgStyle === "hitam" ? "hitam polos" : "adegan dari video"}</b>
                      {cover.bgStyle === "adegan" ? (<> · semua bagian <b>{cover.bgScope === "beda" ? "berbeda adegan" : "sama"}</b></>) : null}
                      {cover.frameStyle && cover.frameStyle !== "none" ? (<> · bingkai <b>{COVER_FRAMES.find((f) => f.id === cover.frameStyle)?.label}</b></>) : null}
                      {cover.mode === "auto" ? " — ubah di Mode Pro → tab Cover" : " · gambar pilihanmu"}
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
          )}
        </div>
      </div>
    </div>
  );
}
