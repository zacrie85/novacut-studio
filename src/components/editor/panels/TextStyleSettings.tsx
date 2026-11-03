"use client";

// NOVACUT Studio - Bagian "UKURAN, POSISI & FONT TULISAN":
// pratinjau langsung (realtime) + 16 font sinematik + slider ukuran huruf
// + geser posisi per 1% (kiri/kanan/atas/bawah + reset).
// Dipakai bersama: menu Teks (Mode Pro) dan langkah 3 TEKS (Mode Sederhana).
// Semua setelan dipakai hasil Export & Split dan diingat otomatis (localStorage).

import { useEffect, useRef } from "react";
import { ALargeSmall, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MonitorPlay, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { partLabel, TEXT_FONTS } from "@/lib/editor/constants";
import { drawTextOverlay } from "@/lib/editor/engine";
import { ensureAppFonts } from "@/lib/editor/fonts";
import { useEditor } from "@/lib/editor/store";
import { TEXT_STYLE_DEFAULTS, saveTextStyle, type TextStyle } from "@/lib/editor/textStyle";
import type { Ratio } from "@/lib/editor/types";

type OffKey = "titleX" | "titleY" | "descX" | "descY" | "partX" | "partY";

/** tombol geser kecil (atas/bawah/kiri/kanan) */
function NudgeBtn({ dir, onClick, label }: { dir: "l" | "r" | "u" | "d"; onClick: () => void; label: string }) {
  const Icon = dir === "l" ? ChevronLeft : dir === "r" ? ChevronRight : dir === "u" ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/25 active:bg-blue-500/40"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

/** satu baris pengatur posisi: geser kiri/kanan (X) & atas/bawah (Y) + reset */
function PosRow({ name, x, y, onMove, onReset }: { name: string; x: number; y: number; onMove: (dx: number, dy: number) => void; onReset: () => void }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-gray-400">
      <span className="w-16 shrink-0 font-semibold text-gray-300">{name}</span>
      <NudgeBtn dir="l" onClick={() => onMove(-1, 0)} label={`Geser ${name} ke kiri`} />
      <span className="w-10 text-center font-mono text-blue-400">{x > 0 ? `+${x}` : x}%</span>
      <NudgeBtn dir="r" onClick={() => onMove(1, 0)} label={`Geser ${name} ke kanan`} />
      <span className="ml-1.5 w-3 text-center text-gray-600">|</span>
      <NudgeBtn dir="u" onClick={() => onMove(0, -1)} label={`Geser ${name} ke atas`} />
      <span className="w-10 text-center font-mono text-blue-300">{y > 0 ? `+${y}` : y}%</span>
      <NudgeBtn dir="d" onClick={() => onMove(0, 1)} label={`Geser ${name} ke bawah`} />
      <button
        type="button"
        onClick={onReset}
        className="ml-auto rounded p-1 text-gray-500 hover:bg-white/10 hover:text-gray-200"
        aria-label={`Reset posisi ${name}`}
        title={`Reset posisi ${name} ke tengah`}
      >
        <RotateCcw className="h-3 w-3" />
      </button>
    </div>
  );
}

/** pratinjau LANGSUNG: kanvas mini yang menggambar persis seperti hasil export */
function LivePreview({ ratioOverride }: { ratioOverride?: Ratio }) {
  const texts = useEditor((s) => s.texts);
  const storeRatio = useEditor((s) => s.project.ratio);
  const ratio: Ratio = ratioOverride ?? storeRatio;
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let alive = true;
    const draw = () => {
      const c = ref.current;
      if (!c || !alive) return;
      const w = ratio === "9:16" ? 288 : 512;
      const h = ratio === "9:16" ? 512 : 288;
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      // latar gelap ala video (contoh adegan)
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#141a30");
      g.addColorStop(0.55, "#0b0f22");
      g.addColorStop(1, "#05060f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(120,180,255,0.07)";
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.52, w * 0.42, h * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();

      const fontAuto = texts.fontAuto || "condensed";
      const rel = (v: number | undefined, def: number) => (typeof v === "number" && isFinite(v) && v > 0 ? Math.max(0.012, Math.min(0.2, v)) : def);
      const pct = (v: number | undefined) => (typeof v === "number" && isFinite(v) ? Math.max(-0.45, Math.min(0.45, v / 100)) : 0);
      const title = texts.title.trim() || "Judul Video Muncul Di Sini";
      const desc = texts.description.trim() || "Deskripsi video di bawah judul";
      const n = Math.max(1, texts.parts || 1);
      drawTextOverlay(
        ctx,
        w,
        h,
        {
          content: title,
          sub: desc,
          size: rel(texts.titleSize, TEXT_STYLE_DEFAULTS.titleSize),
          subSize: rel(texts.descSize, TEXT_STYLE_DEFAULTS.descSize),
          color: "#ffffff",
          font: fontAuto,
          subFont: fontAuto,
          anim: "rise",
          pos: "top",
          bg: "none",
          stroke: true,
          offX: pct(texts.titleX),
          offY: pct(texts.titleY),
          subOffX: pct(texts.descX),
          subOffY: pct(texts.descY),
        },
        10,
        0,
        12
      );
      drawTextOverlay(
        ctx,
        w,
        h,
        {
          content: partLabel(texts.labelStyle || "Part", n, n, true),
          size: rel(texts.partSize, TEXT_STYLE_DEFAULTS.partSize),
          color: "#ffffff",
          font: fontAuto,
          anim: "slam",
          pos: "bottom",
          bg: "bar",
          stroke: true,
          offX: pct(texts.partX),
          offY: pct(texts.partY),
        },
        10,
        0,
        12
      );
    };
    void ensureAppFonts().then(draw);
    draw();
    return () => {
      alive = false;
    };
  }, [texts, ratio]);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-emerald-300">
        <MonitorPlay className="h-3.5 w-3.5" /> PRATINJAU LANGSUNG (REALTIME)
      </div>
      <canvas
        ref={ref}
        className={`w-full rounded-md border border-emerald-400/25 bg-black ${ratio === "9:16" ? "mx-auto max-w-[190px]" : ""}`}
        aria-label="Pratinjau langsung tulisan judul, deskripsi dan part"
      />
      <p className="text-[11px] leading-relaxed text-gray-500">
        Tampilan ini <b className="text-gray-400">persis sama</b> dengan di dalam video hasil Export &amp; Split — berubah seketika saat ukuran/posisi diubah.
      </p>
    </div>
  );
}

/** Bagian lengkap "UKURAN, POSISI & FONT TULISAN" (dipakai Mode Pro & Mode Sederhana) */
export function TextStyleSettings({ ratioOverride }: { ratioOverride?: Ratio }) {
  const texts = useEditor((s) => s.texts);
  const textPreview = useEditor((s) => s.textPreview);
  const st = useEditor.getState();

  const titleSize = texts.titleSize ?? TEXT_STYLE_DEFAULTS.titleSize;
  const descSize = texts.descSize ?? TEXT_STYLE_DEFAULTS.descSize;
  const partSize = texts.partSize ?? TEXT_STYLE_DEFAULTS.partSize;
  const fontAuto = texts.fontAuto ?? TEXT_STYLE_DEFAULTS.fontAuto;
  const titleX = texts.titleX ?? 0;
  const titleY = texts.titleY ?? 0;
  const descX = texts.descX ?? 0;
  const descY = texts.descY ?? 0;
  const partX = texts.partX ?? 0;
  const partY = texts.partY ?? 0;

  /** simpan gaya tulisan ke localStorage agar bertahan setelah aplikasi ditutup */
  const persistStyle = (p: Partial<TextStyle>) => {
    const t = useEditor.getState().texts;
    saveTextStyle({
      titleSize: t.titleSize ?? TEXT_STYLE_DEFAULTS.titleSize,
      descSize: t.descSize ?? TEXT_STYLE_DEFAULTS.descSize,
      partSize: t.partSize ?? TEXT_STYLE_DEFAULTS.partSize,
      fontAuto: t.fontAuto ?? TEXT_STYLE_DEFAULTS.fontAuto,
      titleX: t.titleX ?? 0,
      titleY: t.titleY ?? 0,
      descX: t.descX ?? 0,
      descY: t.descY ?? 0,
      partX: t.partX ?? 0,
      partY: t.partY ?? 0,
      ...p,
    });
  };

  const setOff = (key: OffKey, delta: number) => {
    const cur = Math.max(-45, Math.min(45, (texts[key] ?? 0) + delta));
    st.setTexts({ [key]: cur });
    persistStyle({ [key]: cur } as Partial<TextStyle>);
  };
  const resetOff = (keys: [OffKey, OffKey]) => {
    st.setTexts({ [keys[0]]: 0, [keys[1]]: 0 });
    persistStyle({ [keys[0]]: 0, [keys[1]]: 0 } as Partial<TextStyle>);
  };

  return (
    <div className="space-y-2.5 rounded-lg border border-blue-500/20 bg-blue-500/[0.05] p-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-blue-400">
        <ALargeSmall className="h-4 w-4" /> UKURAN, POSISI &amp; FONT TULISAN
      </div>
      <p className="text-[11px] leading-relaxed text-gray-500">
        Atur besar &amp; posisi huruf <b className="text-gray-400">judul</b>, <b className="text-gray-400">deskripsi</b> &amp; <b className="text-gray-400">part/episode</b> — dipakai di hasil Export &amp; Split dari Playlist. Tulisan kepanjangan otomatis turun ke bawah dan <b className="text-blue-400">tidak melewati batas kiri/kanan video</b>.
      </p>

      <LivePreview ratioOverride={ratioOverride} />

      <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.05] px-2 py-1.5">
        <Label className="text-[11px] leading-snug text-gray-300">Tampilkan tulisan di layar preview</Label>
        <Switch checked={textPreview} onCheckedChange={(v) => useEditor.getState().setTextPreview(v)} className="data-[state=checked]:bg-blue-500" />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">FONT TULISAN (16 FONT SINEMATIK &amp; IKLAN)</label>
        <select
          value={fontAuto}
          onChange={(e) => {
            st.setTexts({ fontAuto: e.target.value });
            persistStyle({ fontAuto: e.target.value });
          }}
          className="h-8 w-full rounded-md border border-white/10 bg-white/[0.04] px-2 text-xs text-gray-200"
          aria-label="Font tulisan otomatis"
        >
          {TEXT_FONTS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <span className="w-16 shrink-0">Judul</span>
        <Slider value={[Math.round(titleSize * 1000)]} min={15} max={120} step={5} onValueChange={([v]) => { st.setTexts({ titleSize: v / 1000 }); persistStyle({ titleSize: v / 1000 }); }} className="flex-1" aria-label="Ukuran huruf judul" />
        <span className="w-10 text-right font-mono text-blue-400">{(titleSize * 100).toFixed(1)}%</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <span className="w-16 shrink-0">Deskripsi</span>
        <Slider value={[Math.round(descSize * 1000)]} min={10} max={80} step={5} onValueChange={([v]) => { st.setTexts({ descSize: v / 1000 }); persistStyle({ descSize: v / 1000 }); }} className="flex-1" aria-label="Ukuran huruf deskripsi" />
        <span className="w-10 text-right font-mono text-blue-400">{(descSize * 100).toFixed(1)}%</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <span className="w-16 shrink-0">Part/Eps</span>
        <Slider value={[Math.round(partSize * 1000)]} min={20} max={140} step={5} onValueChange={([v]) => { st.setTexts({ partSize: v / 1000 }); persistStyle({ partSize: v / 1000 }); }} className="flex-1" aria-label="Ukuran huruf part" />
        <span className="w-10 text-right font-mono text-blue-400">{(partSize * 100).toFixed(1)}%</span>
      </div>

      {/* ===== POSISI: GESER ATAS/BAWAH/KIRI/KANAN ===== */}
      <div className="space-y-1.5 rounded-md border border-blue-500/20 bg-blue-500/[0.05] p-2">
        <div className="text-[11px] font-semibold tracking-wider text-blue-300">POSISI TULISAN (GESER PER 1%)</div>
        <PosRow name="Judul" x={titleX} y={titleY} onMove={(dx, dy) => { setOff("titleX", dx); setOff("titleY", dy); }} onReset={() => resetOff(["titleX", "titleY"])} />
        <PosRow name="Deskripsi" x={descX} y={descY} onMove={(dx, dy) => { setOff("descX", dx); setOff("descY", dy); }} onReset={() => resetOff(["descX", "descY"])} />
        <PosRow name="Part/Eps" x={partX} y={partY} onMove={(dx, dy) => { setOff("partX", dx); setOff("partY", dy); }} onReset={() => resetOff(["partX", "partY"])} />
      </div>

      <p className="text-[11px] leading-relaxed text-gray-400">
        ✓ Ukuran &amp; posisi dalam % layar — diingat otomatis untuk export berikutnya juga.
      </p>
    </div>
  );
}
