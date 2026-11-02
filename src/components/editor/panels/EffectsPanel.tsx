"use client";

// NOVACUT Studio - Panel Efek: 28 transisi + 20 efek blockbuster.
// Bisa diterapkan ke klip timeline ATAU langsung ke semua video hasil
// Export & Split dari Playlist (target "Video Playlist").

import { useState } from "react";
import { Eraser, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CLIP_EFFECTS, TRANSITIONS, TRANSITION_CATS } from "@/lib/editor/constants";
import { normalizeEnhance } from "@/lib/editor/playlistExport";
import { selectedClip, useEditor } from "@/lib/editor/store";
import { ApplyTargetSwitch, useApplyTarget } from "../ApplyTargetSwitch";

const CAT_STYLE: Record<string, string> = {
  trailer: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  iklan: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  sinematik: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  trend: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
};

export function EffectsPanel() {
  const sel = useEditor(selectedClip);
  const [cat, setCat] = useState<string>("trailer");
  const [target, setTarget] = useApplyTarget();
  const st = useEditor.getState();
  const en = normalizeEnhance(useEditor((s) => s.playlistExport).enhance);
  const playlistMode = target === "playlist";

  if (!playlistMode && !sel) {
    return (
      <div className="nova-scroll h-full space-y-3 overflow-y-auto p-3">
        <ApplyTargetSwitch value={target} onChange={setTarget} />
        <div className="flex h-40 items-center justify-center p-6 text-center text-xs text-gray-500">
          Pilih klip di timeline untuk menerapkan transisi &amp; efek — atau pilih target <b className="text-fuchsia-300">Video Playlist</b> di atas.
        </div>
      </div>
    );
  }
  if (!playlistMode && sel?.kind === "audio") {
    return <div className="flex h-full items-center justify-center p-6 text-center text-xs text-gray-500">Efek visual hanya untuk klip video / gambar / teks. Untuk audio atur volume di tab Klip.</div>;
  }

  const trans = playlistMode ? (en.transitionType ? { type: en.transitionType, duration: en.transitionDuration } : null) : sel!.transition;

  /** tulis perubahan ke setelan playlist (target Video Playlist) */
  const patchEn = (p: Parameters<ReturnType<typeof useEditor.getState>["setPlaylistExport"]>[0]) => {
    const cur = normalizeEnhance(useEditor.getState().playlistExport.enhance);
    useEditor.getState().setPlaylistExport({ enhance: { ...cur, ...p } });
  };

  return (
    <div className="nova-scroll h-full space-y-4 overflow-y-auto p-3">
      <ApplyTargetSwitch value={target} onChange={setTarget} />

      {/* Transisi */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-gray-300">
            <Zap className="h-4 w-4 text-amber-300" /> TRANSISI MASUK
          </div>
          {trans && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] text-red-300 hover:bg-red-500/10"
              onClick={() => (playlistMode ? patchEn({ transitionType: null }) : st.setClipTransition(sel!.id, null))}
            >
              Hapus
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {TRANSITION_CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold transition ${cat === c.id ? CAT_STYLE[c.id] : "border-white/10 bg-white/[0.03] text-gray-400"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {trans && (
          <div className="flex items-center gap-2 rounded-md border border-fuchsia-400/20 bg-fuchsia-400/5 px-2 py-1">
            <span className="flex-1 truncate text-[10px] text-fuchsia-200">{TRANSITIONS.find((t) => t.id === trans.type)?.name}</span>
            <input
              type="range"
              min={0.2}
              max={2}
              step={0.1}
              value={trans.duration}
              onChange={(e) => (playlistMode ? patchEn({ transitionDuration: Number(e.target.value) }) : st.setClipTransition(sel!.id, trans.type, Number(e.target.value)))}
              className="h-1 w-20 accent-fuchsia-400"
              aria-label="Durasi transisi"
            />
            <span className="w-8 text-right font-mono text-[9px] text-fuchsia-300">{trans.duration.toFixed(1)}s</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          {TRANSITIONS.filter((t) => t.cat === cat).map((t) => {
            const active = trans?.type === t.id;
            return (
              <button
                key={t.id}
                title={t.desc}
                onClick={() => (playlistMode ? patchEn({ transitionType: t.id, transitionDuration: en.transitionDuration || 0.6 }) : st.setClipTransition(sel!.id, t.id))}
                className={`rounded-md border px-2 py-1.5 text-left transition ${active ? "border-amber-300 bg-amber-400/20 text-amber-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-amber-400/40 hover:bg-amber-400/5"}`}
              >
                <div className="text-[10px] font-semibold leading-tight">{t.name}</div>
                <div className="truncate text-[8px] text-gray-500">{t.desc}</div>
              </button>
            );
          })}
        </div>
        {!playlistMode && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-full gap-1 border-white/10 bg-white/5 text-[10px]"
            onClick={() => {
              // terapkan transisi kategori ini ke semua sambungan klip video pada track yang sama
              const state = useEditor.getState();
              const clips = state.clips.filter((c) => c.trackId === sel!.trackId && c.kind !== "audio").sort((a, b) => a.start - b.start);
              const type = TRANSITIONS.filter((t) => t.cat === cat)[0]?.id;
              if (type) clips.forEach((c, i) => i > 0 && state.setClipTransition(c.id, type));
            }}
          >
            <Sparkles className="h-3 w-3" /> Terapkan ke semua sambungan di layer ini
          </Button>
        )}
        {playlistMode && (
          <p className="text-[9px] leading-relaxed text-gray-500">
            Transisi tampil di awal setiap bagian (paling terlihat saat perginya dari layar judul ke video).
          </p>
        )}
      </section>

      {/* Efek klip */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-gray-300">
            <Sparkles className="h-4 w-4 text-emerald-300" /> EFEK BLOCKBUSTER
          </div>
          {(playlistMode ? en.effects.length > 0 : sel!.effects.length > 0) && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 gap-1 px-2 text-[10px] text-red-300 hover:bg-red-500/10"
              onClick={() => (playlistMode ? patchEn({ effects: [] }) : st.clearClipEffects(sel!.id))}
            >
              <Eraser className="h-3 w-3" /> Bersihkan
            </Button>
          )}
        </div>
        {(["grade", "fx"] as const).map((group) => (
          <div key={group} className="space-y-1">
            <div className="text-[9px] font-semibold tracking-widest text-gray-500">{group === "grade" ? "COLOR GRADING" : "EFEK VISUAL"}</div>
            <div className="grid grid-cols-2 gap-1.5">
              {CLIP_EFFECTS.filter((e) => e.group === group).map((e) => {
                const active = playlistMode ? en.effects.includes(e.id) : sel!.effects.includes(e.id);
                const toggle = () => {
                  if (playlistMode) {
                    const list = en.effects.includes(e.id) ? en.effects.filter((x) => x !== e.id) : [...en.effects, e.id];
                    patchEn({ effects: list });
                  } else {
                    st.toggleClipEffect(sel!.id, e.id);
                  }
                };
                return (
                  <button
                    key={e.id}
                    title={e.desc}
                    onClick={toggle}
                    className={`rounded-md border px-2 py-1.5 text-left transition ${active ? "border-emerald-300 bg-emerald-400/20 text-emerald-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-emerald-400/40"}`}
                  >
                    <div className="text-[10px] font-semibold leading-tight">{e.name}</div>
                    <div className="truncate text-[8px] text-gray-500">{e.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* kecepatan cepat di sini juga */}
      <section className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
        <div className="text-[10px] font-semibold tracking-wider text-gray-400">KECEPATAN &amp; ULANG KLIP</div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span className="w-14">Speed</span>
          <Slider
            value={[playlistMode ? en.speed : sel!.speed]}
            min={0.25}
            max={4}
            step={0.25}
            onValueChange={([v]) => (playlistMode ? patchEn({ speed: v }) : st.setClipSpeed(sel!.id, v))}
            className="flex-1"
          />
          <span className="w-10 text-right font-mono text-amber-300">{(playlistMode ? en.speed : sel!.speed)}x</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span className="w-14">Ulang</span>
          <Slider
            value={[playlistMode ? en.loopCount : sel!.loopCount]}
            min={1}
            max={10}
            step={1}
            onValueChange={([v]) => (playlistMode ? patchEn({ loopCount: v }) : st.setClipLoop(sel!.id, v))}
            className="flex-1"
          />
          <span className="w-10 text-right font-mono text-fuchsia-300">{(playlistMode ? en.loopCount : sel!.loopCount)}×</span>
        </div>
        <div className="text-[9px] leading-relaxed text-gray-500">Perlambat (0.25x) untuk slow-motion sinematik, percepat untuk time-lapse. &quot;Ulang&quot; memutar ulang potongan klip berkali-kali.</div>
      </section>
    </div>
  );
}
