"use client";

// NOVACUT Studio v1.0.19 - Pemilih bingkai cover (Tanpa / Klasik / Modern / Futuristik)
// Pratinjau mini digambar dengan drawCoverFrame yang SAMA PERSIS dengan hasil export (WYSIWYG).

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { COVER_FRAMES, drawCoverFrame } from "@/lib/editor/covers";
import type { CoverFrameStyle } from "@/lib/editor/types";

/** Kanvas kecil: contoh latar adegan + bingkai (persis seperti hasil aslinya) */
function FrameThumb({ style }: { style: CoverFrameStyle }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const w = c.width;
    const h = c.height;
    // latar contoh: gradasi senja sinematik
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#1b2a4a");
    g.addColorStop(0.55, "#3d2f63");
    g.addColorStop(1, "#0b0d14");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // "matahari" + siluet agar terlihat seperti adegan film
    ctx.fillStyle = "rgba(255,196,88,0.9)";
    ctx.beginPath();
    ctx.arc(w * 0.66, h * 0.42, h * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w * 0.32, h * 0.58);
    ctx.lineTo(w * 0.58, h);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.45, h);
    ctx.lineTo(w * 0.78, h * 0.7);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    drawCoverFrame(ctx, w, h, style, "#5ec8f8");
  }, [style]);
  return <canvas ref={ref} width={96} height={54} className="block h-auto w-full rounded-[3px]" />;
}

/** Baris tombol pilihan bingkai cover — dipakai Mode Sederhana & Cover Studio */
export function FramePicker({ value, onChange, disabled }: { value: CoverFrameStyle; onChange: (id: CoverFrameStyle) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {COVER_FRAMES.map((f) => {
        const sel = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(f.id)}
            title={f.desc}
            className={`group relative overflow-hidden rounded-md border p-1 transition ${sel ? "border-blue-400 bg-blue-500/15 ring-1 ring-blue-300" : "border-white/10 bg-white/[0.03] hover:border-blue-500/40"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <FrameThumb style={f.id} />
            <div className="flex w-full items-center justify-center gap-0.5 overflow-hidden pt-0.5">
              {sel && <Check className="h-2.5 w-2.5 shrink-0 text-blue-300" />}
              <span className={`truncate text-[10px] font-bold leading-none ${sel ? "text-blue-100" : "text-gray-400"}`}>{f.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
