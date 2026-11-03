"use client";

// NOVACUT Studio - Layar Sambutan: pilih alur kerja saat aplikasi dibuka
// 1) Edit Video (timeline penuh / Mode Pro)
// 2) Export Langsung & Split (Mode Sederhana — wizard 4 langkah: Pilih → Atur → Teks → Export)

import { useState } from "react";
import { Rocket, Scissors } from "lucide-react";
import { useEditor } from "@/lib/editor/store";
import { saveUiMode, setWelcomeSkipped, welcomeSkipped } from "@/lib/editor/uiPrefs";

export function WelcomeScreen() {
  const [skip, setSkip] = useState(welcomeSkipped());

  const pilih = (mode: "pro" | "simple") => {
    setWelcomeSkipped(skip);
    saveUiMode(mode);
    useEditor.getState().setUiMode(mode);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-y-auto bg-background px-6 py-10 text-foreground">
      {/* logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
          <Scissors className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-xl font-black tracking-[0.2em]">NOVACUT</div>
          <div className="text-[10px] tracking-[0.35em] text-muted-foreground">VIDEO STUDIO</div>
        </div>
      </div>

      <p className="mt-6 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        Selamat datang kawan! Pilih cara kerja yang paling nyaman — <span className="text-gray-300">bisa diganti kapan saja</span> lewat tombol mode di bagian atas aplikasi.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {/* alur 1: edit video di timeline */}
        <button
          onClick={() => pilih("pro")}
          className="group rounded-2xl border border-white/10 bg-card p-6 text-left transition hover:border-blue-500/60 hover:bg-white/[0.03]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <Scissors className="h-6 w-6" />
          </div>
          <div className="mt-4 text-base font-bold text-gray-100">Edit Video (Timeline)</div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Potong, gabung, atur efek, teks, musik &amp; cover — kontrol penuh seperti aplikasi edit profesional.
          </p>
          <div className="mt-4 text-xs font-bold text-blue-400 group-hover:underline">Buka Mode Pro →</div>
        </button>

        {/* alur 2: export langsung */}
        <button
          onClick={() => pilih("simple")}
          className="group rounded-2xl border border-white/10 bg-card p-6 text-left transition hover:border-blue-500/60 hover:bg-white/[0.03]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <Rocket className="h-6 w-6" />
          </div>
          <div className="mt-4 text-base font-bold text-gray-100">Export Langsung &amp; Split</div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Pilih video → atur → atur teks (posisi &amp; font) → export &amp; split dengan cover otomatis. Empat langkah mudah tanpa timeline.
          </p>
          <div className="mt-4 text-xs font-bold text-blue-400 group-hover:underline">Buka Mode Sederhana →</div>
        </button>
      </div>

      <label className="mt-8 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={skip} onChange={(e) => setSkip(e.target.checked)} className="h-4 w-4 accent-blue-500" />
        Jangan tampilkan layar sambutan lagi
      </label>
    </div>
  );
}
