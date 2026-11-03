"use client";

// NOVACUT Studio - Inspector klip terpilih: timing, speed, loop, volume, teks.
// Kini juga bisa menarget "Video Playlist": setelan kecepatan/ulang/volume/fade/
// zoom diterapkan ke semua video hasil Export & Split langsung dari Playlist.

import { Copy, ListVideo, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPEED_PRESETS, TEXT_ANIMS, TEXT_FONTS, fmtTime } from "@/lib/editor/constants";
import { normalizeEnhance } from "@/lib/editor/playlistExport";
import { selectedClip, useEditor } from "@/lib/editor/store";
import type { PlaylistEnhance } from "@/lib/editor/types";
import { FramingControls, PlaylistFramingControls } from "../FramingControls";
import { ApplyTargetSwitch, useApplyTarget } from "../ApplyTargetSwitch";

export function InspectorPanel() {
  const sel = useEditor(selectedClip);
  const st = useEditor.getState();
  const [target, setTarget] = useApplyTarget();
  const playlistMode = target === "playlist";
  const en = normalizeEnhance(useEditor((s) => s.playlistExport).enhance);

  /** tulis perubahan ke setelan playlist (target Video Playlist) */
  const patchEn = (p: Partial<PlaylistEnhance>) => {
    const cur = normalizeEnhance(useEditor.getState().playlistExport.enhance);
    useEditor.getState().setPlaylistExport({ enhance: { ...cur, ...p } });
  };

  // ===== MODE VIDEO PLAYLIST =====
  if (playlistMode) {
    return (
      <div className="nova-scroll h-full space-y-4 overflow-y-auto p-3">
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/25 bg-blue-500/[0.06] px-2.5 py-2 text-[11px] text-blue-200">
          <ListVideo className="h-4 w-4 shrink-0" />
          <span>
            Mode <b>Video Playlist</b> — setelan di bawah otomatis dipakai saat <b>Export &amp; Split dari Playlist</b> (tanpa timeline).
          </span>
        </div>
        <ApplyTargetSwitch value={target} onChange={setTarget} />

        {/* Zoom & geser */}
        <PlaylistFramingControls />

        {/* Kecepatan */}
        <section className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-gray-400">KECEPATAN (PERCEPAT / PERLAMBAT)</span>
            <span className="font-mono text-blue-300">{en.speed}x</span>
          </div>
          <Slider value={[en.speed]} min={0.25} max={4} step={0.25} onValueChange={([v]) => patchEn({ speed: v })} />
          <div className="flex flex-wrap gap-1">
            {SPEED_PRESETS.map((sp) => (
              <button
                key={sp}
                onClick={() => patchEn({ speed: sp })}
                className={`rounded border px-1.5 py-0.5 font-mono text-[11px] transition ${en.speed === sp ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/5 text-gray-400 hover:border-blue-500/40"}`}
              >
                {sp}x
              </button>
            ))}
          </div>
          <div className="text-[11px] text-gray-500">0.5x = slow motion · 2x = cepat · 4x = time-lapse. Pembagian part otomatis menyesuaikan durasi baru.</div>
        </section>

        {/* Ulang */}
        <section className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-gray-400">MENGULANG POTONGAN (LOOP)</span>
            <span className="font-mono text-blue-300">{en.loopCount}x</span>
          </div>
          <Slider value={[en.loopCount]} min={1} max={10} step={1} onValueChange={([v]) => patchEn({ loopCount: v })} />
          <div className="text-[11px] text-gray-500">Potongan video diputar ulang {en.loopCount === 1 ? "sekali (normal)" : `${en.loopCount} kali beruntun`} di setiap hasil export.</div>
        </section>

        {/* Audio */}
        <section className="space-y-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">AUDIO VIDEO PLAYLIST</div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-12">Volume</span>
            <Slider value={[Math.round(en.volume * 100)]} min={0} max={200} step={5} onValueChange={([v]) => patchEn({ volume: v / 100 })} className="flex-1" />
            <span className="w-9 text-right font-mono text-emerald-300">{Math.round(en.volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-12">Fade in</span>
            <Slider value={[en.fadeIn]} min={0} max={5} step={0.1} onValueChange={([v]) => patchEn({ fadeIn: v })} className="flex-1" />
            <span className="w-9 text-right font-mono text-emerald-300">{en.fadeIn.toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-12">Fade out</span>
            <Slider value={[en.fadeOut]} min={0} max={5} step={0.1} onValueChange={([v]) => patchEn({ fadeOut: v })} className="flex-1" />
            <span className="w-9 text-right font-mono text-emerald-300">{en.fadeOut.toFixed(1)}s</span>
          </div>
          <div className="text-[11px] leading-relaxed text-gray-500">Volume &amp; fade mengatur suara asli video. Untuk musik latar, gunakan tab Musik lalu tambahkan ke timeline sebelum export dari playlist.</div>
        </section>
      </div>
    );
  }

  // ===== MODE KLIP TIMELINE (perilaku lama) =====
  if (!sel) {
    return (
      <div className="nova-scroll h-full space-y-3 overflow-y-auto p-3">
        <ApplyTargetSwitch value={target} onChange={setTarget} />
        <div className="flex h-40 items-center justify-center p-6 text-center text-xs leading-relaxed text-gray-500">
          <p className="max-w-[15rem]">
            Pilih klip di timeline untuk mengatur detail: kecepatan, ulang, volume, teks — atau pilih target <b className="text-blue-300">Video Playlist</b> di atas.
          </p>
        </div>
      </div>
    );
  }

  const asset = st.getAsset(sel.assetId);
  const isMedia = sel.kind === "video" || sel.kind === "audio";

  return (
    <div className="nova-scroll h-full space-y-4 overflow-y-auto p-3">
      <ApplyTargetSwitch value={target} onChange={setTarget} />

      <div>
        <div className="text-[11px] font-semibold tracking-widest text-blue-400">KLIP TERPILIH</div>
        <div className="truncate text-sm font-semibold text-gray-100">{sel.kind === "text" ? sel.text?.content : asset?.name ?? "Klip"}</div>
        <div className="mt-0.5 font-mono text-[11px] text-gray-500">
          {fmtTime(sel.start)} → {fmtTime(sel.start + sel.duration)} · {sel.duration.toFixed(2)}s {isMedia && asset ? `· sumber ${fmtTime(sel.inPoint)}` : ""}
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="h-8 flex-1 gap-1 border-white/10 bg-white/5 text-[11px]" onClick={() => st.duplicateClip(sel.id)}>
          <Copy className="h-3 w-3" /> Duplikat
        </Button>
        <Button size="sm" variant="outline" className="h-8 flex-1 gap-1 border-red-400/30 bg-red-500/10 text-[11px] text-red-300 hover:bg-red-500/20" onClick={() => st.deleteClip(sel.id)}>
          <Trash2 className="h-3 w-3" /> Hapus
        </Button>
      </div>

      {/* Zoom & geser (kadro manual) */}
      {(sel.kind === "video" || sel.kind === "image") && <FramingControls target="selected" />}

      {/* Kecepatan */}
      <section className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold uppercase tracking-wider text-gray-400">KECEPATAN (PERCEPAT / PERLAMBAT)</span>
          <span className="font-mono text-blue-300">{sel.speed}x</span>
        </div>
        <Slider value={[sel.speed]} min={0.25} max={4} step={0.25} onValueChange={([v]) => st.setClipSpeed(sel.id, v)} />
        <div className="flex flex-wrap gap-1">
          {SPEED_PRESETS.map((sp) => (
            <button
              key={sp}
              onClick={() => st.setClipSpeed(sel.id, sp)}
              className={`rounded border px-1.5 py-0.5 font-mono text-[11px] transition ${sel.speed === sp ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/5 text-gray-400 hover:border-blue-500/40"}`}
            >
              {sp}x
            </button>
          ))}
        </div>
        {sel.kind === "video" && <div className="text-[11px] text-gray-500">0.5x = slow motion · 2x = cepat · 4x = time-lapse</div>}
      </section>

      {/* Ulang */}
      <section className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold uppercase tracking-wider text-gray-400">MENGULANG POTONGAN (LOOP)</span>
          <span className="font-mono text-blue-300">{sel.loopCount}x</span>
        </div>
        <Slider value={[sel.loopCount]} min={1} max={10} step={1} onValueChange={([v]) => st.setClipLoop(sel.id, v)} />
        <div className="text-[11px] text-gray-500">Potongan klip diputar ulang {sel.loopCount === 1 ? "sekali (normal)" : `${sel.loopCount} kali beruntun`}.</div>
      </section>

      {/* Audio */}
      {isMedia && (
        <section className="space-y-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">AUDIO</div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-12">Volume</span>
            <Slider value={[sel.volume * 100]} min={0} max={200} step={5} onValueChange={([v]) => st.updateClip(sel.id, { volume: v / 100 })} className="flex-1" />
            <span className="w-9 text-right font-mono text-emerald-300">{Math.round(sel.volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-12">Fade in</span>
            <Slider value={[sel.fadeIn]} min={0} max={5} step={0.1} onValueChange={([v]) => st.updateClip(sel.id, { fadeIn: v })} className="flex-1" />
            <span className="w-9 text-right font-mono text-emerald-300">{sel.fadeIn.toFixed(1)}s</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-12">Fade out</span>
            <Slider value={[sel.fadeOut]} min={0} max={5} step={0.1} onValueChange={([v]) => st.updateClip(sel.id, { fadeOut: v })} className="flex-1" />
            <span className="w-9 text-right font-mono text-emerald-300">{sel.fadeOut.toFixed(1)}s</span>
          </div>
        </section>
      )}

      {/* Teks */}
      {sel.kind === "text" && sel.text && (
        <section className="space-y-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">ISI TEKS</div>
          <Input value={sel.text.content} onChange={(e) => st.updateClip(sel.id, { text: { ...sel.text!, content: e.target.value } })} className="h-8 border-white/10 bg-white/[0.04] text-xs" />
          <Input value={sel.text.sub ?? ""} onChange={(e) => st.updateClip(sel.id, { text: { ...sel.text!, sub: e.target.value || undefined } })} placeholder="Baris kedua (opsional)" className="h-8 border-white/10 bg-white/[0.04] text-xs" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-gray-500">FONT</label>
              <Select value={sel.text.font} onValueChange={(v) => st.updateClip(sel.id, { text: { ...sel.text!, font: v } })}>
                <SelectTrigger className="h-8 border-white/10 bg-white/[0.04] text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-popover text-[11px]">
                  {TEXT_FONTS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-gray-500">ANIMASI</label>
              <Select value={sel.text.anim} onValueChange={(v) => st.updateClip(sel.id, { text: { ...sel.text!, anim: v } })}>
                <SelectTrigger className="h-8 border-white/10 bg-white/[0.04] text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-popover text-[11px]">
                  {TEXT_ANIMS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-14">Ukuran</span>
            <Slider value={[sel.text.size * 1000]} min={20} max={200} step={5} onValueChange={([v]) => st.updateClip(sel.id, { text: { ...sel.text!, size: v / 1000 } })} className="flex-1" />
            <span className="w-9 text-right font-mono text-blue-300">{sel.text.size.toFixed(3)}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gray-400">Warna</label>
            <input type="color" value={sel.text.color} onChange={(e) => st.updateClip(sel.id, { text: { ...sel.text!, color: e.target.value } })} className="h-7 w-12 cursor-pointer rounded border border-white/10 bg-transparent" aria-label="Warna teks" />
            {(["top", "center", "bottom"] as const).map((p) => (
              <button
                key={p}
                onClick={() => st.updateClip(sel.id, { text: { ...sel.text!, pos: p } })}
                className={`rounded border px-1.5 py-0.5 text-[11px] ${sel.text!.pos === p ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/5 text-gray-400"}`}
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
                className={`rounded border px-1.5 py-0.5 text-[11px] capitalize ${sel.text!.bg === b ? "border-blue-400 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/5 text-gray-400"}`}
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
