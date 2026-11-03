"use client";

// NOVACUT Studio - Saklar target penerapan menu Efek / Klip:
// "Klip Timeline" (perilaku lama) atau "Video Playlist" (diterapkan ke semua
// hasil Export & Split langsung dari Playlist). Pilihan tersimpan di localStorage.

import { useEffect, useState } from "react";
import { ListVideo, Scissors } from "lucide-react";

const KEY = "novacut.applyTarget";

export type ApplyTarget = "timeline" | "playlist";

export function loadApplyTarget(): ApplyTarget {
  if (typeof window === "undefined") return "timeline";
  try {
    return window.localStorage.getItem(KEY) === "playlist" ? "playlist" : "timeline";
  } catch {
    return "timeline";
  }
}

function saveApplyTarget(t: ApplyTarget) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, t);
  } catch {
    /* abaikan */
  }
}

/** hook state target — dipakai panel Efek & panel Klip */
export function useApplyTarget(): [ApplyTarget, (t: ApplyTarget) => void] {
  const [target, setTarget] = useState<ApplyTarget>("timeline");
  useEffect(() => {
    setTarget(loadApplyTarget());
    // ikuti permintaan dari panel lain (mis. tombol akses cepat di Playlist)
    const h = (e: Event) => setTarget((e as CustomEvent).detail as ApplyTarget);
    window.addEventListener("novacut:applyTarget", h);
    return () => window.removeEventListener("novacut:applyTarget", h);
  }, []);
  const change = (t: ApplyTarget) => {
    setTarget(t);
    saveApplyTarget(t);
  };
  return [target, change];
}

/** minta SEMUA panel Efek/Klip yang terbuka langsung mengganti target
 * (dipakai tombol "Teks/Efek/Klip" di panel Playlist supaya otomatis
 * mengarah ke "Video Playlist" — tidak perlu disetel manual) */
export function requestApplyTarget(t: ApplyTarget) {
  saveApplyTarget(t);
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("novacut:applyTarget", { detail: t }));
}

export function ApplyTargetSwitch({ value, onChange }: { value: ApplyTarget; onChange: (t: ApplyTarget) => void }) {
  const base = "flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition";
  return (
    <div className="space-y-1.5 rounded-lg border border-blue-500/25 bg-blue-500/[0.06] p-2">
      <div className="text-[11px] font-semibold tracking-wider text-blue-300">TERAPKAN SETELAN INI KE</div>
      <div className="flex gap-1.5">
        <button
          onClick={() => onChange("timeline")}
          aria-pressed={value === "timeline"}
          className={`${base} ${value === "timeline" ? "border-blue-400 bg-blue-500/15 text-blue-100" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-blue-500/40"}`}
        >
          <Scissors className="h-3 w-3" /> Klip Timeline
        </button>
        <button
          onClick={() => onChange("playlist")}
          aria-pressed={value === "playlist"}
          className={`${base} ${value === "playlist" ? "border-blue-500/70 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-blue-500/40"}`}
        >
          <ListVideo className="h-3 w-3" /> Video Playlist
        </button>
      </div>
      {value === "playlist" && (
        <p className="text-[11px] leading-relaxed text-blue-200/80">
          Setelan di menu ini otomatis diterapkan ke <b>semua video</b> hasil Export &amp; Split langsung dari Playlist — tanpa perlu masuk timeline.
        </p>
      )}
    </div>
  );
}
