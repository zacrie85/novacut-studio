"use client";

// NOVACUT Studio v1.0.25 - POTONG MULAI & AKHIR (rentang detik) untuk
// Export & Split langsung dari playlist. Contoh: video 5 menit, mulai detik 120
// dan berhenti di detik 245 → hanya rentang itu yang dirender lalu dipecah
// jadi bagian. Dicangkok di buildBatchClip (inPoint + durasi) sehingga mesin
// kilat & mesin Turbo, pembagian bagian, cover, teks & smart split semuanya
// mengikuti rentang yang dipilih. Dipakai di Mode Sederhana langkah Export
// dan panel Playlist Export Langsung (Mode Pro).

import { Scissors } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { fmtTime } from "@/lib/editor/constants";
import { useEditor } from "@/lib/editor/store";

export function TrimControls({ durMax }: { durMax: number }) {
  const settings = useEditor((s) => s.exportSettings);
  const set = useEditor.getState().setExportSettings;
  // durasi acuan: durasi video terpilih (per video di-clamp saat render)
  const max = Math.max(0.1, durMax || 0);
  const s0 = Math.min(Math.max(0, settings.trimStart || 0), Math.max(0, max - 0.1));
  const e0 = settings.trimEnd && settings.trimEnd > s0 ? Math.min(settings.trimEnd, max) : max;
  const dur = Math.max(0.1, e0 - s0);
  const tidakValid = settings.trimOn && !!settings.trimEnd && settings.trimEnd <= (settings.trimStart || 0);

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.07] bg-card p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
          <Scissors className="h-3.5 w-3.5 text-blue-400" /> Potong Mulai &amp; Akhir (Detik)
        </div>
        <Switch checked={settings.trimOn} onCheckedChange={(v) => set({ trimOn: v })} className="data-[state=checked]:bg-blue-500" aria-label="Potong mulai dan akhir" />
      </div>
      <p className="text-[11px] leading-relaxed text-gray-500">
        Misal video 5 menit: isi <b className="text-blue-300">120</b> (mulai) dan <b className="text-blue-300">245</b> (berakhir) → hanya bagian itu yang di-export &amp; dipecah. Kosongkan akhir (0) = sampai video habis. Berlaku untuk semua video yang dipilih (yang lebih pendek otomatis menyesuaikan).
      </p>
      {settings.trimOn && (
        <>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-16 shrink-0 font-semibold text-gray-300">Mulai</span>
            <Input
              type="number"
              min={0}
              max={max}
              step={0.1}
              value={settings.trimStart || 0}
              onChange={(e) => set({ trimStart: Math.max(0, Math.min(max - 0.1, Number(e.target.value) || 0)) })}
              className="h-8 w-24 border-white/10 bg-white/[0.03] text-xs"
              aria-label="Detik mulai potong"
            />
            <input
              type="range"
              min={0}
              max={max}
              step={0.1}
              value={s0}
              onChange={(e) => set({ trimStart: Math.min(e0 - 0.2, Number(e.target.value)) })}
              className="h-1 flex-1 accent-blue-500"
              aria-label="Geser detik mulai"
            />
            <span className="w-14 shrink-0 text-right font-mono text-blue-300">{fmtTime(s0)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-16 shrink-0 font-semibold text-gray-300">Berakhir</span>
            <Input
              type="number"
              min={0}
              max={max}
              step={0.1}
              value={settings.trimEnd || 0}
              onChange={(e) => set({ trimEnd: Math.max(0, Math.min(max, Number(e.target.value) || 0)) })}
              placeholder="0 = habis"
              className="h-8 w-24 border-white/10 bg-white/[0.03] text-xs"
              aria-label="Detik akhir potong"
            />
            <input
              type="range"
              min={0}
              max={max}
              step={0.1}
              value={settings.trimEnd ? e0 : max}
              onChange={(e) => set({ trimEnd: Math.max(s0 + 0.2, Number(e.target.value)) })}
              className="h-1 flex-1 accent-blue-500"
              aria-label="Geser detik akhir"
            />
            <span className="w-14 shrink-0 text-right font-mono text-blue-300">{settings.trimEnd ? fmtTime(e0) : "Habis"}</span>
          </div>
          <div className={`rounded-lg border px-2.5 py-1.5 font-mono text-[11px] ${tidakValid ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-blue-500/20 bg-blue-500/[0.06] text-blue-300"}`}>
            {tidakValid ? "⚠ Akhir harus LEBIH BESAR dari mulai — otomatis diperbaiki saat render." : `Dipotong: ${fmtTime(s0)} → ${settings.trimEnd ? fmtTime(e0) : "akhir video"} (durasi ${fmtTime(dur)})`}
          </div>
        </>
      )}
    </div>
  );
}
