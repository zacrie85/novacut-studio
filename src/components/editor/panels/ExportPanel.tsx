"use client";

// NOVACUT Studio - Panel Export: Export Saja & Export & Split + hasil

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
      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-gray-300">
        <Film className="h-4 w-4 text-cyan-300" /> EXPORT
      </div>

      {/* mode */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => st.setExportSettings({ mode: "single" })}
          className={`rounded-lg border p-2.5 text-left transition ${settings.mode === "single" ? "border-cyan-300 bg-cyan-400/15 shadow-[0_0_14px_rgba(34,211,238,0.25)]" : "border-white/10 bg-white/[0.03] hover:border-cyan-400/40"}`}
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-200">
            <FileDown className="h-3.5 w-3.5" /> Export Saja
          </div>
          <div className="mt-0.5 text-[9px] leading-snug text-gray-500">Seluruh timeline jadi 1 file video.</div>
        </button>
        <button
          onClick={() => st.setExportSettings({ mode: "split" })}
          className={`rounded-lg border p-2.5 text-left transition ${settings.mode === "split" ? "border-fuchsia-300 bg-fuchsia-400/15 shadow-[0_0_14px_rgba(232,121,249,0.25)]" : "border-white/10 bg-white/[0.03] hover:border-fuchsia-400/40"}`}
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-fuchsia-200">
            <Scissors className="h-3.5 w-3.5" /> Export &amp; Split
          </div>
          <div className="mt-0.5 text-[9px] leading-snug text-gray-500">Pecah otomatis jadi banyak video + cover + teks part.</div>
        </button>
      </div>

      {/* opsi split */}
      {settings.mode === "split" && (
        <section className="space-y-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="text-[10px] font-semibold tracking-wider text-gray-400">PEMBAGIAN</div>
          <div className="flex gap-1.5">
            <button
              onClick={() => st.setExportSettings({ splitBy: "count" })}
              className={`flex-1 rounded border px-2 py-1 text-[10px] ${settings.splitBy === "count" ? "border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-200" : "border-white/10 bg-white/5 text-gray-400"}`}
            >
              Berapa bagian
            </button>
            <button
              onClick={() => st.setExportSettings({ splitBy: "duration" })}
              className={`flex-1 rounded border px-2 py-1 text-[10px] ${settings.splitBy === "duration" ? "border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-200" : "border-white/10 bg-white/5 text-gray-400"}`}
            >
              Durasi per video
            </button>
          </div>
          {settings.splitBy === "count" ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Jumlah</span>
              <Input type="number" min={1} max={50} value={settings.parts} onChange={(e) => st.setExportSettings({ parts: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })} className="h-7 w-20 border-white/10 bg-black/30 text-xs" />
              <span className="text-[10px] text-gray-400">bagian</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">@</span>
              <Input type="number" min={1} max={600} value={settings.partSeconds} onChange={(e) => st.setExportSettings({ partSeconds: Math.max(1, Math.min(600, Number(e.target.value) || 1)) })} className="h-7 w-20 border-white/10 bg-black/30 text-xs" />
              <span className="text-[10px] text-gray-400">detik / video</span>
            </div>
          )}
          <div className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-1.5 font-mono text-[10px] text-cyan-300">
            {fmtTime(D)} → {estParts} video à ±{fmtTime(estLen)}
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-gray-300">Teks part otomatis ({partLabel(texts.labelStyle, 1, estParts, true)})</Label>
            <Switch checked={settings.autoPartText} onCheckedChange={(v) => st.setExportSettings({ autoPartText: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-gray-300">Judul di tiap video</Label>
            <Switch checked={settings.showTitleText} onCheckedChange={(v) => st.setExportSettings({ showTitleText: v })} />
          </div>
        </section>
      )}

      {/* cover */}
      <section className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-semibold tracking-wider text-gray-400">COVER OTOMATIS DI DEPAN</Label>
          <Switch checked={settings.includeCover} onCheckedChange={(v) => st.setExportSettings({ includeCover: v })} />
        </div>
        {settings.includeCover && settings.mode === "split" && (
          <>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="w-24">Durasi</span>
              <input type="range" min={2} max={5} step={0.5} value={settings.coverDuration} onChange={(e) => st.setExportSettings({ coverDuration: Number(e.target.value) })} className="h-1 flex-1 accent-violet-400" aria-label="Durasi cover" />
              <span className="w-9 text-right font-mono text-violet-300">{settings.coverDuration}s</span>
            </div>
            <div className="text-[9px] leading-relaxed text-gray-500">
              {useEditor.getState().cover.coverAssetId ? "✔ Cover siap (dibuat di tab Cover Studio)." : "Belum ada cover — AI akan membuatkan otomatis dari video."}
            </div>
            <div className="rounded border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 text-[9px] leading-relaxed text-cyan-200/90">
              Latar cover: <b>{cover.bgStyle === "hitam" ? "hitam polos" : "adegan dari video"}</b>
              {cover.bgStyle === "adegan" ? (<> · {cover.bgScope === "sama" ? "semua bagian sama" : "tiap bagian beda"}</>) : null}
              {cover.mode === "auto" ? " — ubah di tab Cover" : " · gambar pilihanmu"}
            </div>
          </>
        )}
      </section>

      {/* mesin render */}
      <section className="space-y-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-2.5">
        <div className="text-[10px] font-semibold tracking-wider text-amber-300">MESIN RENDER</div>
        <div className="flex gap-1.5">
          <button
            onClick={() => st.setExportSettings({ engineMode: "fast" })}
            className={`flex-1 rounded border px-2 py-1.5 text-left ${settings.engineMode === "fast" ? "border-amber-300 bg-amber-400/20 text-amber-100" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-amber-400/40"}`}
          >
            <div className="text-[10px] font-bold">⚡ Kilat (disarankan)</div>
            <div className="text-[8px] leading-snug opacity-80">Tanpa memutar video — 5-10x lebih cepat</div>
          </button>
          <button
            onClick={() => st.setExportSettings({ engineMode: "compat" })}
            className={`flex-1 rounded border px-2 py-1.5 text-left ${settings.engineMode === "compat" ? "border-amber-300 bg-amber-400/20 text-amber-100" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-amber-400/40"}`}
          >
            <div className="text-[10px] font-bold">🛡️ Kompatibel</div>
            <div className="text-[8px] leading-snug opacity-80">Rekam real-time (video diputar)</div>
          </button>
        </div>
        <p className="text-[9px] leading-relaxed text-gray-500">
          {settings.engineMode === "fast"
            ? "Video dirender di latar belakang — layar preview tidak ikut memutar video dan durasi hasil selalu tepat."
            : "Mode lama: video diputar real-time saat direkam — jangan tutup aplikasi sampai selesai."}
        </p>
      </section>

      {/* subtitle AI */}
      <section className="space-y-2 rounded-lg border border-violet-400/20 bg-violet-400/[0.04] p-2.5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold tracking-wider text-violet-300">SUBTITLE AI OTOMATIS (INDONESIA)</div>
          <Switch checked={settings.autoSub} onCheckedChange={(v) => st.setExportSettings({ autoSub: v })} />
        </div>
        {settings.autoSub && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-1">
              {(["ringan", "sedang", "akurat"] as const).map((lv) => (
                <button
                  key={lv}
                  onClick={() => st.setExportSettings({ subLevel: lv })}
                  className={`rounded border px-1.5 py-1 text-[9px] font-semibold capitalize ${settings.subLevel === lv ? "border-violet-300 bg-violet-400/20 text-violet-100" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-violet-400/40"}`}
                >
                  {lv}
                  <div className="text-[7px] font-normal opacity-70">{modelSizeLabel(lv)}</div>
                </button>
              ))}
            </div>
            <p className="text-[9px] leading-relaxed text-amber-300/80">
              AI menyimak suara video lalu menuliskan teksnya di layar (burn-in). Memahami bahasa Indonesia resmi &amp; gaul. Model diunduh sekali (butuh internet pada pemakaian pertama), setelah itu offline.
            </p>
          </div>
        )}
      </section>

      {/* folder hasil render */}
      <section className="space-y-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-gray-300">
            <FolderSearch className="h-3.5 w-3.5 text-emerald-300" /> FOLDER HASIL RENDER
          </div>
          {desktop && (
            <div className="flex gap-1">
              <button
                onClick={() => void onPickDir()}
                className="rounded border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-200 transition hover:bg-emerald-400/25"
              >
                Pilih Folder
              </button>
              {dir && (
                <button
                  onClick={onOpenDir}
                  className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold text-gray-300 transition hover:border-emerald-400/40 hover:text-emerald-200"
                >
                  Buka
                </button>
              )}
            </div>
          )}
        </div>
        <div
          className={`truncate rounded border px-2 py-1.5 font-mono text-[10px] ${
            dir ? "border-emerald-400/25 bg-black/40 text-emerald-300" : "border-white/10 bg-black/30 text-gray-500"
          }`}
          title={dir || undefined}
        >
          {dir || "Folder Downloads (bawaan)"}
        </div>
        <div className="flex items-start justify-between gap-2">
          <div className="text-[9px] leading-relaxed text-gray-500">
            {desktop
              ? dir
                ? "Hasil render otomatis masuk langsung ke folder ini — tanpa dialog unduh."
                : "Pilih folder supaya hasil render otomatis tersimpan di sana."
              : "Fitur pilih folder tersedia di aplikasi desktop — di versi web hasil diunduh ke folder unduhan browser."}
          </div>
          {desktop && dir && (
            <button onClick={onClearDir} className="shrink-0 rounded p-1 text-gray-600 transition hover:text-red-300" title="Kembali ke folder Downloads bawaan">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </section>

      {/* tombol export */}
      <Button
        disabled={ex.running || D < 0.3}
        className="h-11 w-full gap-2 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-cyan-500 bg-[length:200%_100%] text-sm font-black tracking-wide text-white shadow-[0_0_22px_rgba(217,70,239,0.35)] transition hover:bg-[position:100%_0] disabled:opacity-40"
        onClick={() => void runExport()}
      >
        {ex.running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
        {ex.running ? "MERENDER..." : settings.mode === "single" ? "EXPORT VIDEO" : `EXPORT & SPLIT (${estParts} VIDEO)`}
      </Button>
      {ex.running && (
        <div className="space-y-1">
          <Progress value={ex.progress * 100} className="h-2 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-fuchsia-400" />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{ex.label}</span>
            <span className="font-mono">{Math.round(ex.progress * 100)}%</span>
          </div>
          <div className="text-[9px] text-amber-400/80">
            {settings.engineMode === "fast"
              ? "Mode kilat: rendering berjalan di latar belakang — kamu boleh meminimalkan aplikasi, tapi jangan ditutup."
              : "Perekaman berjalan real-time — biarkan tab ini tetap terbuka."}
          </div>
        </div>
      )}
      {!ex.running && ex.label && <div className="text-center text-[10px] text-gray-500">{ex.label}</div>}

      {/* hasil */}
      {ex.results.length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold tracking-wider text-gray-400">HASIL ({ex.results.length} FILE)</div>
            <div className="flex gap-1">
              {desktop && dir && (
                <Button size="sm" variant="outline" className="h-6 gap-1 border-emerald-400/30 bg-emerald-400/10 px-2 text-[9px] text-emerald-200 hover:bg-emerald-400/20" onClick={onOpenDir}>
                  <FolderOpen className="h-3 w-3" /> Buka Folder
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-6 gap-1 border-white/10 bg-white/5 px-2 text-[9px]"
                onClick={() => ex.results.forEach((r, i) => setTimeout(() => triggerDownload(r.url, r.name), i * 400))}
              >
                <Download className="h-3 w-3" /> Unduh Semua
              </Button>
              <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-[9px] text-gray-500 hover:text-red-300" onClick={() => st.clearExportResults()}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="nova-scroll max-h-48 space-y-1 overflow-y-auto pr-1">
            {ex.results.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5">
                <Film className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] text-gray-200">{r.name}</div>
                  <div className="text-[9px] text-gray-500">
                    {fmtSize(r.size)} · {fmtTime(r.duration)}
                    {r.total > 1 ? ` · ${r.part}/${r.total}` : ""}
                  </div>
                  {r.savedPath && (
                    <div className="flex items-center gap-1 text-[9px] text-emerald-400">
                      <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate" title={r.savedPath}>otomatis tersimpan di folder pilihan</span>
                    </div>
                  )}
                </div>
                <button className="rounded p-1 text-cyan-300 hover:bg-cyan-400/10" onClick={() => triggerDownload(r.url, r.name)} aria-label="Unduh">
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button className="rounded p-1 text-gray-600 hover:text-red-300" onClick={() => st.removeExportResult(r.id)} aria-label="Hapus dari daftar">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-gray-600">Nama file dari judul: {slugify(texts.title || "proyek")}</div>
        </section>
      )}

      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-[9px] leading-relaxed text-gray-600">
        Format keluaran <span className="font-bold text-cyan-300">{pickExportFormat().label}</span> — kompatibel untuk YouTube, TikTok, Instagram &amp; Reels.
      </div>
    </div>
  );
}
