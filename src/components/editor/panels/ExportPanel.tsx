"use client";

// NOVACUT Studio - Panel Export (timeline): Export Saja & Export & Split + hasil

import { useEffect, useState } from "react";
import { CheckCircle2, Download, FileDown, Film, FolderOpen, FolderSearch, Loader2, Scissors, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { fmtSize, fmtTime, partLabel, slugify } from "@/lib/editor/constants";
import { forgetExportDir, isDesktopFS, loadSavedExportDir, openInFolder, pickExportDir, rememberExportDir } from "@/lib/editor/fsBridge";
import { totalDuration, useEditor } from "@/lib/editor/store";
import { pickExportFormat, runExport, triggerDownload } from "@/lib/editor/exporter";
import { modelSizeLabel } from "@/lib/editor/subtitles";

export function ExportPanel() {
  const settings = useEditor((s) => s.exportSettings);
  const ex = useEditor((s) => s.exportState);
  const texts = useEditor((s) => s.texts);
  const cover = useEditor((s) => s.cover);
  const clips = useEditor((s) => s.clips);
  const st = useEditor.getState();
  const D = totalDuration(clips);

  // folder hasil render (desktop) — sinkron dengan pilihan terakhir yang diingat
  const desktop = isDesktopFS();
  const [dir, setDir] = useState(settings.exportDir || "");
  useEffect(() => {
    const saved = loadSavedExportDir();
    if (saved && !useEditor.getState().exportSettings.exportDir) {
      useEditor.getState().setExportSettings({ exportDir: saved });
      setDir(saved);
    }
  }, []);

  const onPickDir = async () => {
    const res = await pickExportDir(useEditor.getState().exportSettings.exportDir || undefined);
    if (!res.canceled && res.path) {
      useEditor.getState().setExportSettings({ exportDir: res.path });
      rememberExportDir(res.path);
      setDir(res.path);
    }
  };
  const onOpenDir = () => {
    const d = useEditor.getState().exportSettings.exportDir;
    if (d) void openInFolder(d);
  };
  const onClearDir = () => {
    useEditor.getState().setExportSettings({ exportDir: "" });
    forgetExportDir();
    setDir("");
  };

  const estParts = settings.mode === "single" ? 1 : settings.splitBy === "count" ? Math.max(1, Math.min(50, settings.parts)) : Math.max(1, Math.ceil(D / Math.max(1, settings.partSeconds)));
  const estLen = settings.mode === "single" ? D : settings.splitBy === "count" ? D / estParts : Math.max(1, settings.partSeconds);

  return (
    <div className="nova-scroll h-full space-y-3.5 overflow-y-auto p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
        <Film className="h-4 w-4 text-blue-400" /> Export Timeline
      </div>

      {/* mode */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => st.setExportSettings({ mode: "single" })}
          className={`rounded-xl border p-3 text-left transition ${settings.mode === "single" ? "border-blue-500/70 bg-blue-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
        >
          <div className={`flex items-center gap-1.5 text-xs font-bold ${settings.mode === "single" ? "text-blue-300" : "text-gray-300"}`}>
            <FileDown className="h-4 w-4" /> Export Saja
          </div>
          <div className="mt-1 text-[11px] leading-snug text-gray-500">Seluruh timeline jadi 1 file video.</div>
        </button>
        <button
          onClick={() => st.setExportSettings({ mode: "split" })}
          className={`rounded-xl border p-3 text-left transition ${settings.mode === "split" ? "border-blue-500/70 bg-blue-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
        >
          <div className={`flex items-center gap-1.5 text-xs font-bold ${settings.mode === "split" ? "text-blue-300" : "text-gray-300"}`}>
            <Scissors className="h-4 w-4" /> Export &amp; Split
          </div>
          <div className="mt-1 text-[11px] leading-snug text-gray-500">Pecah otomatis jadi banyak video + cover + teks part.</div>
        </button>
      </div>

      {/* opsi split */}
      {settings.mode === "split" && (
        <section className="space-y-2.5 rounded-xl border border-white/[0.07] bg-card p-3">
          <div className="nv-title">Pembagian</div>
          <div className="flex gap-1.5">
            <button
              onClick={() => st.setExportSettings({ splitBy: "count" })}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition ${settings.splitBy === "count" ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25"}`}
            >
              Berapa bagian
            </button>
            <button
              onClick={() => st.setExportSettings({ splitBy: "duration" })}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition ${settings.splitBy === "duration" ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25"}`}
            >
              Durasi per video
            </button>
          </div>
          {settings.splitBy === "count" ? (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Jumlah</span>
              <Input type="number" min={1} max={50} value={settings.parts} onChange={(e) => st.setExportSettings({ parts: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })} className="h-8 w-20 border-white/10 bg-white/[0.03] text-xs" />
              <span>bagian</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>@</span>
              <Input type="number" min={1} max={600} value={settings.partSeconds} onChange={(e) => st.setExportSettings({ partSeconds: Math.max(1, Math.min(600, Number(e.target.value) || 1)) })} className="h-8 w-20 border-white/10 bg-white/[0.03] text-xs" />
              <span>detik / video</span>
            </div>
          )}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-2.5 py-1.5 font-mono text-[11px] text-blue-300">
            {fmtTime(D)} → {estParts} video à ±{fmtTime(estLen)}
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-300">Teks part otomatis ({partLabel(texts.labelStyle, 1, estParts, true)})</Label>
            <Switch checked={settings.autoPartText} onCheckedChange={(v) => st.setExportSettings({ autoPartText: v })} className="data-[state=checked]:bg-blue-500" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-300">Judul di tiap video</Label>
            <Switch checked={settings.showTitleText} onCheckedChange={(v) => st.setExportSettings({ showTitleText: v })} className="data-[state=checked]:bg-blue-500" />
          </div>
        </section>
      )}

      {/* cover */}
      <section className="space-y-2 rounded-xl border border-white/[0.07] bg-card p-3">
        <div className="flex items-center justify-between">
          <Label className="nv-title">Cover otomatis di depan</Label>
          <Switch checked={settings.includeCover} onCheckedChange={(v) => st.setExportSettings({ includeCover: v })} className="data-[state=checked]:bg-blue-500" />
        </div>
        {settings.includeCover && settings.mode === "split" && (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-24">Durasi</span>
              <input type="range" min={2} max={5} step={0.5} value={settings.coverDuration} onChange={(e) => st.setExportSettings({ coverDuration: Number(e.target.value) })} className="h-1 flex-1 accent-blue-500" aria-label="Durasi cover" />
              <span className="w-9 text-right font-mono text-blue-300">{settings.coverDuration}s</span>
            </div>
            <div className="text-[11px] leading-relaxed text-gray-500">
              {useEditor.getState().cover.coverAssetId ? "✔ Cover siap (dibuat di tab Cover Studio)." : "Belum ada cover — AI akan membuatkan otomatis dari video."}
            </div>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-2.5 py-1.5 text-[11px] leading-relaxed text-blue-200/90">
              Latar cover: <b>{cover.bgStyle === "hitam" ? "hitam polos" : "adegan dari video"}</b>
              {cover.bgStyle === "adegan" ? (<> · {cover.bgScope === "sama" ? "semua bagian sama" : "tiap bagian beda"}</>) : null}
              {cover.mode === "auto" ? " — ubah di tab Cover" : " · gambar pilihanmu"}
            </div>
          </>
        )}
      </section>

      {/* mesin render */}
      <section className="space-y-2 rounded-xl border border-white/[0.07] bg-card p-3">
        <div className="nv-title">Mesin Render</div>
        <div className="flex gap-1.5">
          <button
            onClick={() => st.setExportSettings({ engineMode: "fast" })}
            className={`flex-1 rounded-lg border px-2.5 py-2 text-left transition ${settings.engineMode === "fast" ? "border-blue-500/70 bg-blue-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
          >
            <div className={`text-xs font-bold ${settings.engineMode === "fast" ? "text-blue-300" : "text-gray-300"}`}>⚡ Kilat (disarankan)</div>
            <div className="text-[10px] leading-snug text-gray-500">Tanpa memutar video — 5-10x lebih cepat</div>
          </button>
          <button
            onClick={() => st.setExportSettings({ engineMode: "compat" })}
            className={`flex-1 rounded-lg border px-2.5 py-2 text-left transition ${settings.engineMode === "compat" ? "border-blue-500/70 bg-blue-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
          >
            <div className={`text-xs font-bold ${settings.engineMode === "compat" ? "text-blue-300" : "text-gray-300"}`}>🛡️ Kompatibel</div>
            <div className="text-[10px] leading-snug text-gray-500">Rekam real-time (video diputar)</div>
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-gray-500">
          {settings.engineMode === "fast"
            ? "Video dirender di latar belakang — layar preview tidak ikut memutar video dan durasi hasil selalu tepat."
            : "Mode lama: video diputar real-time saat direkam — jangan tutup aplikasi sampai selesai."}
        </p>
      </section>

      {/* subtitle AI */}
      <section className="space-y-2 rounded-xl border border-white/[0.07] bg-card p-3">
        <div className="flex items-center justify-between">
          <div className="nv-title">Subtitle AI (Indonesia)</div>
          <Switch checked={settings.autoSub} onCheckedChange={(v) => st.setExportSettings({ autoSub: v })} className="data-[state=checked]:bg-blue-500" />
        </div>
        {settings.autoSub && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {(["ringan", "sedang", "akurat"] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => st.setExportSettings({ subLevel: lv })}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold capitalize transition ${settings.subLevel === lv ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25"}`}
                >
                  {lv}
                  <div className="text-[10px] font-normal text-gray-500">{modelSizeLabel(lv)}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-amber-400/90">
              AI menyimak suara video lalu menuliskan teksnya di layar (burn-in). Memahami bahasa Indonesia resmi &amp; gaul. Model diunduh sekali (butuh internet pada pemakaian pertama), setelah itu offline.
            </p>
          </div>
        )}
      </section>

      {/* folder hasil render */}
      <section className="space-y-2 rounded-xl border border-white/[0.07] bg-card p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 nv-title">
            <FolderSearch className="h-3.5 w-3.5" /> Folder Hasil Render
          </div>
          {desktop && (
            <div className="flex gap-1">
              <button
                onClick={() => void onPickDir()}
                className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-300 transition hover:bg-blue-500/20"
              >
                Pilih Folder
              </button>
              {dir && (
                <button
                  onClick={onOpenDir}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-gray-300 transition hover:border-blue-500/40"
                >
                  Buka
                </button>
              )}
            </div>
          )}
        </div>
        <div
          className={`truncate rounded-lg border px-2.5 py-1.5 font-mono text-[11px] ${
            dir ? "border-blue-500/25 bg-black/40 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-500"
          }`}
          title={dir || undefined}
        >
          {dir || "Folder Downloads (bawaan)"}
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="text-[11px] leading-relaxed text-gray-500">
            {desktop
              ? dir
                ? "Hasil render otomatis masuk langsung ke folder ini — tanpa dialog unduh."
                : "Pilih folder supaya hasil render otomatis tersimpan di sana."
              : "Fitur pilih folder tersedia di aplikasi desktop — di versi web hasil diunduh ke folder unduhan browser."}
          </div>
          {desktop && dir && (
            <button onClick={onClearDir} className="shrink-0 rounded-lg p-1 text-gray-600 transition hover:text-red-400" title="Kembali ke folder Downloads bawaan">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* tombol export */}
      <Button
        disabled={ex.running || D < 0.3}
        className="h-11 w-full gap-2 bg-blue-600 text-sm font-black tracking-wide text-white hover:bg-blue-500 disabled:opacity-40"
        onClick={() => void runExport()}
      >
        {ex.running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
        {ex.running ? "MERENDER..." : settings.mode === "single" ? "EXPORT VIDEO" : `EXPORT & SPLIT (${estParts} VIDEO)`}
      </Button>
      {ex.running && (
        <div className="space-y-1">
          <Progress value={ex.progress * 100} className="h-2 bg-white/5 [&>div]:bg-blue-500" />
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>{ex.label}</span>
            <span className="font-mono">{Math.round(ex.progress * 100)}%</span>
          </div>
          <div className="text-[11px] text-amber-400/90">
            {settings.engineMode === "fast"
              ? "Mode kilat: rendering berjalan di latar belakang — kamu boleh meminimalkan aplikasi, tapi jangan ditutup."
              : "Perekaman berjalan real-time — biarkan tab ini tetap terbuka."}
          </div>
        </div>
      )}
      {!ex.running && ex.label && <div className="text-center text-[11px] text-gray-500">{ex.label}</div>}

      {/* hasil */}
      {ex.results.length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="nv-title">Hasil ({ex.results.length} file)</div>
            <div className="flex gap-1">
              {desktop && dir && (
                <Button size="sm" variant="outline" className="h-7 gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 text-[11px] text-emerald-300 hover:bg-emerald-500/20" onClick={onOpenDir}>
                  <FolderOpen className="h-3 w-3" /> Buka Folder
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 border-white/10 bg-white/[0.04] px-2 text-[11px]"
                onClick={() => ex.results.forEach((r, i) => setTimeout(() => triggerDownload(r.url, r.name), i * 400))}
              >
                <Download className="h-3 w-3" /> Unduh Semua
              </Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[11px] text-gray-500 hover:text-red-300" onClick={() => st.clearExportResults()}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="nova-scroll max-h-48 space-y-1 overflow-y-auto pr-1">
            {ex.results.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1.5">
                <Film className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] text-gray-200">{r.name}</div>
                  <div className="text-[10px] text-gray-500">
                    {fmtSize(r.size)} · {fmtTime(r.duration)}
                    {r.total > 1 ? ` · ${r.part}/${r.total}` : ""}
                  </div>
                  {r.savedPath && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate" title={r.savedPath}>otomatis tersimpan di folder pilihan</span>
                    </div>
                  )}
                </div>
                <button className="rounded-lg p-1 text-blue-400 hover:bg-blue-500/10" onClick={() => triggerDownload(r.url, r.name)} aria-label="Unduh">
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button className="rounded-lg p-1 text-gray-600 hover:text-red-400" onClick={() => st.removeExportResult(r.id)} aria-label="Hapus dari daftar">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-gray-600">Nama file dari judul: {slugify(texts.title || "proyek")}</div>
        </section>
      )}

      <div className="rounded-xl border border-white/[0.07] bg-card p-2.5 text-[11px] leading-relaxed text-gray-500">
        Format keluaran <span className="font-bold text-blue-400">{pickExportFormat().label}</span> — kompatibel untuk YouTube, TikTok, Instagram &amp; Reels.
      </div>
    </div>
  );
}
