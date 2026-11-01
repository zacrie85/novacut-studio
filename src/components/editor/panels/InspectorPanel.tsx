"use client";

// NOVACUT Studio - Inspector klip terpilih: timing, speed, loop, volume, teks

import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPEED_PRESETS, TEXT_ANIMS, TEXT_FONTS, fmtTime } from "@/lib/editor/constants";
import { selectedClip, useEditor } from "@/lib/editor/store";

export function InspectorPanel() {
  const sel = useEditor(selectedClip);
  const st = useEditor.getState();

  if (!sel) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-xs text-gray-500">
        Pilih klip di timeline untuk mengatur detail: kecepatan, ulang, volume, teks.
      </div>
    );
  }

  const asset = st.getAsset(sel.assetId);
  const isMedia = sel.kind === "video" || sel.kind === "audio";

  return (
    <div className="nova-scroll h-full space-y-4 overflow-y-auto p-3">
      <div>
        <div className="text-[10px] font-semibold tracking-widest text-cyan-400">KLIP TERPILIH</div>
        <div className="truncate text-sm font-semibold text-gray-100">{sel.kind === "text" ? sel.text?.content : asset?.name ?? "Klip"}</div>
        <div className="mt-0.5 font-mono text-[10px] text-gray-500">
          {fmtTime(sel.start)} → {fmtTime(sel.start + sel.duration)} · {sel.duration.toFixed(2)}s {isMedia && asset ? `· sumber ${fmtTime(sel.inPoint)}` : ""}
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-7 flex-1 gap-1 border-white/10 bg-white/5 text-[10px]" onClick={() => st.duplicateClip(sel.id)}>
          <Copy className="h-3 w-3" /> Duplikat
        </Button>
        <Button size="sm" variant="outline" className="h-7 flex-1 gap-1 border-red-400/30 bg-red-500/10 text-[10px] text-red-300 hover:bg-red-500/20" onClick={() => st.deleteClip(sel.id)}>
          <Trash2 className="h-3 w-3" /> Hapus
        </Button>
      </div>

      {/* Kecepatan */}
      <section className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold tracking-wider text-gray-400">KECEPATAN (PERCEPAT / PERLAMBAT)</span>
          <span className="font-mono text-amber-300">{sel.speed}x</span>
        </div>
        <Slider value={[sel.speed]} min={0.25} max={4} step={0.25} onValueChange={([v]) => st.setClipSpeed(sel.id, v)} />
        <div className="flex flex-wrap gap-1">
          {SPEED_PRESETS.map((sp) => (
            <button
              key={sp}
              onClick={() => st.setClipSpeed(sel.id, sp)}
              className={`rounded border px-1.5 py-0.5 font-mono text-[9px] transition ${sel.speed === sp ? "border-amber-300 bg-amber-400/20 text-amber-200" : "border-white/10 bg-white/5 text-gray-400 hover:border-amber-400/40"}`}
            >
              {sp}x
            </button>
          ))}
        </div>
        {sel.kind === "video" && <div className="text-[9px] text-gray-500">0.5x = slow motion · 2x = cepat · 4x = time-lapse</div>}
      </section>

      {/* Ulang */}
      <section className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold tracking-wider text-gray-400">MENGULANG POTONGAN (LOOP)</span>
          <span className="font-mono text-fuchsia-300">{sel.loopCount}x</span>
        </div>
        <Slider value={[sel.loopCount]} min={1} max={10} step={1} onValueChange={([v]) => st.setClipLoop(sel.id, v)} />
        <div className="text-[9px] text-gray-500">Potongan klip diputar ulang {sel.loopCount === 1 ? "sekali (normal)" : `${sel.loopCount} kali beruntun`}.</div>
      </section>

      {/* Audio */}
      {isMedia && (
        <section className="space-y-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="text-[10px] font-semibold tracking-wider text-gray-400">AUDIO</div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="w-12">Volume</span>
            <Slider value={[sel.volume * 100]} min={0} max={200} step={5} onValueChange={([v]) => st.updateClip(sel.id, { volume: v / 100 })} className="flex-1" />
            <span className="w-9 text-right font-mono text-emerald-300">{Math.round(sel.volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="w-12">Fade in</span>
            <Slider value={[sel.fadeIn]} min={0} max={5} step={0.1} onValueChange={([v]) => st.updateClip(sel.id, { fadeIn: v })} className="flex-1" />
            <span className="w-9 text-right font-mono text-emerald-300">{sel.fadeIn.toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="w-12">Fade out</span>
            <Slider value={[sel.fadeOut]} min={0} max={5} step={0.1} onValueChange={([v]) => st.updateClip(sel.id, { fadeOut: v })} className="flex-1" />
            <span className="w-9 text-right font-mono text-emerald-300">{sel.fadeOut.toFixed(1)}s</span>
          </div>
        </section>
      )}

      {/* Teks */}
      {sel.kind === "text" && sel.text && (
        <section className="space-y-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="text-[10px] font-semibold tracking-wider text-gray-400">ISI TEKS</div>
          <Input value={sel.text.content} onChange={(e) => st.updateClip(sel.id, { text: { ...sel.text!, content: e.target.value } })} className="h-8 border-white/10 bg-black/30 text-xs" />
          <Input value={sel.text.sub ?? ""} onChange={(e) => st.updateClip(sel.id, { text: { ...sel.text!, sub: e.target.value || undefined } })} placeholder="Baris kedua (opsional)" className="h-8 border-white/10 bg-black/30 text-xs" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] text-gray-500">FONT</label>
              <Select value={sel.text.font} onValueChange={(v) => st.updateClip(sel.id, { text: { ...sel.text!, font: v } })}>
                <SelectTrigger className="h-8 border-white/10 bg-black/30 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0b0d1d] text-[11px]">
                  {TEXT_FONTS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-gray-500">ANIMASI</label>
              <Select value={sel.text.anim} onValueChange={(v) => st.updateClip(sel.id, { text: { ...sel.text!, anim: v } })}>
                <SelectTrigger className="h-8 border-white/10 bg-black/30 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#0b0d1d] text-[11px]">
                  {TEXT_ANIMS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="w-14">Ukuran</span>
            <Slider value={[sel.text.size * 1000]} min={20} max={200} step={5} onValueChange={([v]) => st.updateClip(sel.id, { text: { ...sel.text!, size: v / 1000 } })} className="flex-1" />
            <span className="w-9 text-right font-mono text-fuchsia-300">{sel.text.size.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-gray-400">Warna</label>
            <input type="color" value={sel.text.color} onChange={(e) => st.updateClip(sel.id, { text: { ...sel.text!, color: e.target.value } })} className="h-7 w-12 cursor-pointer rounded border border-white/10 bg-transparent" aria-label="Warna teks" />
            {(["top", "center", "bottom"] as const).map((p) => (
              <button
                key={p}
                onClick={() => st.updateClip(sel.id, { text: { ...sel.text!, pos: p } })}
                className={`rounded border px-1.5 py-0.5 text-[9px] ${sel.text!.pos === p ? "border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-200" : "border-white/10 bg-white/5 text-gray-400"}`}
              >
                {p === "top" ? "Atas" : p === "center" ? "Tengah" : "Bawah"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(["none", "bar", "box", "gradient"] as const).map((b) => (
              <button
                key={b}
                onClick={() => st.updateClip(sel.id, { text: { ...sel.text!, bg: b } })}
                className={`rounded border px-1.5 py-0.5 text-[9px] capitalize ${sel.text!.bg === b ? "border-cyan-300 bg-cyan-400/20 text-cyan-200" : "border-white/10 bg-white/5 text-gray-400"}`}
              >
                {b === "none" ? "polos" : b}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
