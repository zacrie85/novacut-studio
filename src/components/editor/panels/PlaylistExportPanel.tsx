"use client";

// NOVACUT Studio - Playlist EXPORT LANGSUNG: daftar video yang dipecah langsung
// (Export & Split) tanpa perlu lewat timeline. Terpisah dari Playlist Editor.
// Tiap video punya baris progres sendiri saat render paralel berjalan.

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Download, FolderOpen, GripVertical, ListVideo, Loader2, Rocket, Sparkles, Trash2, Video, Zap, SlidersHorizontal, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEditor } from "@/lib/editor/store";
import { fmtSize, fmtTime } from "@/lib/editor/constants";
import { runBatchExport, triggerDownload } from "@/lib/editor/exporter";
import { isDesktopFS, openInFolder } from "@/lib/editor/fsBridge";
import { requestApplyTarget } from "../ApplyTargetSwitch";
import { useToast } from "@/hooks/use-toast";
import { PlaylistSettingsForm } from "./PlaylistSettingsForm";

function statusColor(status: string) {
  if (status === "jalan") return "text-blue-400";
  if (status === "selesai") return "text-emerald-400";
  if (status === "gagal") return "text-red-400";
  return "text-gray-500";
}

function barColor(status: string) {
  if (status === "selesai") return "bg-emerald-500";
  if (status === "gagal") return "bg-red-500";
  return "bg-blue-500";
}

export function PlaylistExportPanel() {
  const assets = useEditor((s) => s.assets);
  const list = useEditor((s) => s.exportList);
  const running = useEditor((s) => s.exportState.running);
  const ex = useEditor((s) => s.exportState);
  const jobs = useEditor((s) => s.batchJobs);
  const { toast } = useToast();
  const desktop = isDesktopFS();
  // drag urutan
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const videos = list.map((id) => assets.find((a) => a.id === id)).filter((a): a is NonNullable<typeof a> => !!a && a.type === "video");
  const jobById = new Map(jobs.map((j) => [j.id, j]));
  const dir = useEditor((s) => s.exportSettings.exportDir);

  const drop = (to: number) => {
    if (dragIdx !== null && dragIdx !== to) useEditor.getState().moveInAssetList("export", dragIdx, to);
    setDragIdx(null);
    setOverIdx(null);
  };

  const exportSingle = (id: string, name: string) => {
    void runBatchExport([id]);
    toast({ title: "Mulai export", description: `${name} — dirender tanpa membuka timeline.` });
  };

  return (
    <div className="nova-scroll flex h-full flex-col gap-3 overflow-y-auto p-3">
      {/* header */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Playlist Export Langsung</span>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-bold text-gray-300">{videos.length} video</span>
      </div>
      <p className="-mt-1 text-[11px] leading-relaxed text-gray-500">
        <b className="text-gray-400">Tanpa perlu masuk timeline!</b> Video dipecah langsung jadi banyak bagian — layar judul, teks part, rasio 16:9 / 9:16, subtitle AI. Dirender di latar belakang, beberapa video sekaligus.
      </p>

      {/* tombol utama */}
      <Button
        disabled={running || videos.length === 0}
        className="h-10 shrink-0 gap-2 bg-blue-600 text-sm font-bold text-white hover:bg-blue-500"
        onClick={() => void runBatchExport(videos.map((v) => v.id))}
      >
        {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {running ? "MERENDER..." : `Export & Split Semua (${videos.length})`}
      </Button>

      {/* progres per video (render paralel) */}
      {jobs.length > 0 && (
        <div className="shrink-0 space-y-1.5 rounded-xl border border-white/[0.07] bg-card p-2.5">
          <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400">
            <span className="truncate">{ex.label || "Menyiapkan..."}</span>
            <span className="shrink-0 font-mono text-gray-300">{Math.round(ex.progress * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded bg-white/10">
            <div className="h-full rounded bg-blue-500 transition-all" style={{ width: `${Math.max(2, Math.round(ex.progress * 100))}%` }} />
          </div>
          <div className="space-y-1 pt-1">
            {jobs.map((j) => (
              <div key={j.id} className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[11px]">
                  {j.status === "selesai" ? (
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                  ) : j.status === "jalan" ? (
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin text-blue-400" />
                  ) : j.status === "gagal" ? (
                    <X className="h-3 w-3 shrink-0 text-red-400" />
                  ) : (
                    <span className="h-3 w-3 shrink-0 rounded-full border border-gray-600" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-gray-300">{j.name}</span>
                  <span className={`shrink-0 ${statusColor(j.status)}`}>{j.label || j.status}</span>
                </div>
                <div className="h-1 overflow-hidden rounded bg-white/5">
                  <div className={`h-full rounded transition-all ${barColor(j.status)}`} style={{ width: `${Math.max(j.status === "antre" ? 0 : 2, Math.round(j.progress * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* hasil */}
      {ex.results.length > 0 && !running && (
        <div className="shrink-0 space-y-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Hasil: {ex.results.length} file</span>
            <div className="flex gap-1">
              {desktop && (
                <Button size="sm" variant="outline" className="h-7 gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 text-[11px] text-emerald-300 hover:bg-emerald-500/20" onClick={() => dir && void openInFolder(dir)}>
                  <FolderOpen className="h-3 w-3" /> Buka Folder
                </Button>
              )}
              {!desktop && (
                <Button size="sm" variant="outline" className="h-7 gap-1 border-white/10 bg-white/[0.04] px-2 text-[11px]" onClick={() => ex.results.forEach((r, i) => setTimeout(() => triggerDownload(r.url, r.name), i * 400))}>
                  <Download className="h-3 w-3" /> Unduh Semua
                </Button>
              )}
            </div>
          </div>
          <div className="nova-scroll max-h-32 space-y-1 overflow-y-auto pr-1">
            {ex.results.map((r) => (
              <div key={r.id} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-1 text-[11px] text-gray-300">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                <span className="min-w-0 flex-1 truncate">{r.name}</span>
                <span className="shrink-0 text-gray-500">{fmtSize(r.size)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== SETELAN ===== */}
      <PlaylistSettingsForm />

      {/* ===== AKSES CEPAT EFEK / TEKS / KLIP ===== */}
      <div className="shrink-0 space-y-2 rounded-xl border border-white/[0.07] bg-card p-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-300">Efek &amp; Teks untuk Video Playlist</div>
        <p className="text-[11px] leading-relaxed text-gray-500">
          Fitur <b className="text-gray-400">Teks</b> (ukuran huruf &amp; 16 font), <b className="text-gray-400">Efek</b> (transisi + 20 efek) dan <b className="text-gray-400">Klip</b> (kecepatan, ulang, volume, fade, zoom) bisa diterapkan ke semua video playlist — target otomatis diarahkan ke &quot;Video Playlist&quot;.
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <Button
            size="sm"
            className="h-8 gap-1 bg-white/[0.05] text-[11px] text-gray-200 hover:bg-white/[0.09]"
            onClick={() => window.dispatchEvent(new CustomEvent("novacut:jump", { detail: "teks" }))}
          >
            <Type className="h-3.5 w-3.5" /> Teks
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1 bg-white/[0.05] text-[11px] text-gray-200 hover:bg-white/[0.09]"
            onClick={() => {
              requestApplyTarget("playlist");
              window.dispatchEvent(new CustomEvent("novacut:jump", { detail: "efek" }));
            }}
          >
            <Zap className="h-3.5 w-3.5" /> Efek
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1 bg-white/[0.05] text-[11px] text-gray-200 hover:bg-white/[0.09]"
            onClick={() => {
              requestApplyTarget("playlist");
              window.dispatchEvent(new CustomEvent("novacut:jump", { detail: "klip" }));
            }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Klip
          </Button>
        </div>
      </div>

      {/* ===== DAFTAR VIDEO ===== */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-center gap-2 pt-1">
          <ListVideo className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Urutan Video ({videos.length})</span>
        </div>
        {videos.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-xs leading-relaxed text-gray-500">
            Playlist masih kosong.
            <br />
            Impor video di tab <b className="text-gray-400">Media</b>, lalu kirim ke sini (tombol panah) — atau pilih video lewat Mode Sederhana.
          </div>
        )}
        {videos.map((v, i) => {
          const job = jobById.get(v.id);
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
              className={`rounded-xl border bg-card p-2.5 transition ${dragIdx === i ? "border-blue-500/50 opacity-50" : isOver ? "border-blue-500/70" : "border-white/[0.07]"}`}
            >
              <div className="flex items-center gap-2.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-grab touch-none text-gray-600 hover:text-gray-300" aria-label="Tarik untuk mengubah urutan">
                      <GripVertical className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Tarik untuk mengubah urutan part</TooltipContent>
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
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-500 disabled:opacity-40" disabled={running} onClick={() => exportSingle(v.id, v.name)} aria-label="Export video ini langsung">
                      <Rocket className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Export video ini langsung — tanpa timeline</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="nv-icon-btn h-7 w-7" onClick={() => useEditor.getState().transferAsset("export", v.id)} aria-label="Kirim ke Playlist Editor">
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Kirim ke Playlist Editor (untuk diedit)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="rounded-lg p-1.5 text-gray-600 transition hover:bg-red-500/10 hover:text-red-400" onClick={() => useEditor.getState().removeFromAssetList("export", v.id)} aria-label="Keluarkan dari daftar">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Keluarkan dari daftar (video tetap di pustaka)</TooltipContent>
                </Tooltip>
              </div>
              {job && (
                <div className="mt-2 space-y-0.5">
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className={statusColor(job.status)}>{job.label || job.status}</span>
                    <span className="font-mono text-gray-500">{Math.round(job.progress * 100)}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded bg-white/5">
                    <div className={`h-full rounded transition-all ${barColor(job.status)}`} style={{ width: `${Math.max(job.status === "antre" ? 0 : 2, Math.round(job.progress * 100))}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
