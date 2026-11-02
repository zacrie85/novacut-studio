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
  }, []);
  const change = (t: ApplyTarget) => {
    setTarget(t);
    saveApplyTarget(t);
  };
  return [target, change];
}

export function ApplyTargetSwitch({ value, onChange }: { value: ApplyTarget; onChange: (t: ApplyTarget) => void }) {
  const base = "flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-[10px] font-semibold transition";
  return (
    <div className="space-y-1.5 rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/[0.06] p-2">
      <div className="text-[9px] font-semibold tracking-wider text-fuchsia-300">TERAPKAN SETELAN INI KE</div>
      <div className="flex gap-1.5">
        <button
          onClick={() => onChange("timeline")}
          aria-pressed={value === "timeline"}
          className={`${base} ${value === "timeline" ? "border-cyan-300 bg-cyan-400/20 text-cyan-100" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-cyan-400/40"}`}
        >
          <Scissors className="h-3 w-3" /> Klip Timeline
        </button>
        <button
          onClick={() => onChange("playlist")}
          aria-pressed={value === "playlist"}
          className={`${base} ${value === "playlist" ? "border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-100" : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-fuchsia-400/40"}`}
        >
          <ListVideo className="h-3 w-3" /> Video Playlist
        </button>
      </div>
      {value === "playlist" && (
        <p className="text-[9px] leading-relaxed text-fuchsia-200/80">
          Setelan di menu ini otomatis diterapkan ke <b>semua video</b> hasil Export &amp; Split langsung dari Playlist — tanpa perlu masuk timeline.
        </p>
      )}
    </div>
  );
}
