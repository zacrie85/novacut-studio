"use client";

// NOVACUT Studio - Panel Teks: judul, deskripsi & generator Part/Episode otomatis
// + bagian UKURAN, POSISI & FONT TULISAN (komponen bersama TextStyleSettings:
// pratinjau realtime, 16 font sinematik, geser posisi per 1%).
// Semua setelan dipakai hasil Export & Split.

import { useEffect } from "react";
import { BookOpenText, Heading1, Repeat2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LABEL_STYLES, partLabel } from "@/lib/editor/constants";
import { engine } from "@/lib/editor/engine";
import { useEditor } from "@/lib/editor/store";
import { TEXT_STYLE_DEFAULTS } from "@/lib/editor/textStyle";
import { TextStyleSettings } from "./TextStyleSettings";
import { useToast } from "@/hooks/use-toast";

export function TextPanel() {
  const texts = useEditor((s) => s.texts);
  const textPreview = useEditor((s) => s.textPreview);
  const playhead = useEditor((s) => s.playhead);
  const st = useEditor.getState();
  const { toast } = useToast();

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

  // pratinjau utama ikut ter-render ulang setiap gaya/posisi berubah (realtime)
  useEffect(() => {
    if (!engine.playing) engine.requestRender();
  }, [texts, textPreview]);

  const addTitle = () => {
    if (!texts.title.trim()) return toast({ title: "Isi judul dulu" });
    st.addTextClip(
      {
        content: texts.title,
        sub: texts.description || undefined,
        size: titleSize,
        subSize: descSize,
        font: fontAuto,
        subFont: fontAuto,
        anim: "rise",
        pos: "top",
        bg: "gradient",
        stroke: true,
        offX: titleX / 100,
        offY: titleY / 100,
        subOffX: descX / 100,
        subOffY: descY / 100,
      },
      { start: playhead, duration: 4 }
    );
    toast({ title: "Judul ditambahkan", description: `Di posisi ${playhead.toFixed(1)}s` });
  };

  const addDescription = () => {
    if (!texts.description.trim()) return toast({ title: "Isi deskripsi dulu" });
    st.addTextClip({ content: texts.description, size: descSize, font: fontAuto, anim: "fade", pos: "bottom", bg: "bar", stroke: true, offX: descX / 100, offY: descY / 100 }, { start: playhead, duration: 4 });
    toast({ title: "Deskripsi ditambahkan" });
  };

  const addPart = () => {
    const label = partLabel(texts.labelStyle, Math.max(1, texts.parts), Math.max(1, texts.parts), false);
    st.addTextClip({ content: label, size: partSize, font: fontAuto, anim: "slam", pos: "bottom", bg: "bar", stroke: true, offX: partX / 100, offY: partY / 100 }, { start: playhead, duration: 2.5 });
    toast({ title: `${label} ditambahkan`, description: "Ubah nomor part di kolom bawah lalu tambah lagi." });
  };

  return (
    <div className="nova-scroll h-full space-y-3 overflow-y-auto p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
        <Type className="h-4 w-4 text-blue-300" /> PEMBUAT TEKS OTOMATIS
      </div>
      <p className="text-[11px] leading-relaxed text-gray-500">
        Isi 3 data: <b className="text-gray-400">judul</b>, <b className="text-gray-400">deskripsi</b>, dan <b className="text-gray-400">label part/episode</b>. Saat <b className="text-blue-400">Export &amp; Split</b>, tulisan part akan tertulis otomatis ke dalam setiap video sesuai jumlah bagian / durasi per video yang kamu tentukan.
      </p>

      {/* ===== UKURAN, POSISI & FONT (komponen bersama dgn Mode Sederhana) ===== */}
      <TextStyleSettings />

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">1 · JUDUL VIDEO</label>
        <Input value={texts.title} onChange={(e) => st.setTexts({ title: e.target.value })} placeholder="mis. Trailer Senja di Jakarta" className="h-8 border-white/10 bg-white/[0.04] text-xs" />
      </div>
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">2 · DESKRIPSI VIDEO</label>
        <Textarea value={texts.description} onChange={(e) => st.setTexts({ description: e.target.value })} placeholder="mis. Kisah perjalanan yang tak terlupakan..." className="min-h-[56px] border-white/10 bg-white/[0.04] text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">3 · GAYA LABEL</label>
          <select
            value={texts.labelStyle}
            onChange={(e) => st.setTexts({ labelStyle: e.target.value as typeof texts.labelStyle })}
            className="h-8 w-full rounded-md border border-white/10 bg-white/[0.04] px-2 text-xs text-gray-200"
            aria-label="Gaya label part"
          >
            {LABEL_STYLES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">NOMOR PART</label>
          <Input type="number" min={1} max={99} value={texts.parts} onChange={(e) => st.setTexts({ parts: Math.max(1, Number(e.target.value) || 1) })} className="h-8 border-white/10 bg-white/[0.04] text-xs" />
        </div>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.06] p-2 text-center font-mono text-sm text-blue-200">
        Contoh: &quot;{partLabel(texts.labelStyle, texts.parts, texts.parts, true)}&quot;
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        <Button size="sm" className="h-8 justify-start gap-2 bg-blue-500/15 text-xs text-blue-200 hover:bg-blue-500/30" onClick={addTitle}>
          <Heading1 className="h-4 w-4" /> Tambah Judul ke Timeline
        </Button>
        <Button size="sm" className="h-8 justify-start gap-2 bg-blue-500/15 text-xs text-blue-300 hover:bg-blue-500/25" onClick={addDescription}>
          <BookOpenText className="h-4 w-4" /> Tambah Deskripsi ke Timeline
        </Button>
        <Button size="sm" className="h-8 justify-start gap-2 bg-amber-500/20 text-xs text-amber-200 hover:bg-amber-500/30" onClick={addPart}>
          <Repeat2 className="h-4 w-4" /> Tambah {partLabel(texts.labelStyle, texts.parts, texts.parts, false)} ke Timeline
        </Button>
      </div>

      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-[11px] leading-relaxed text-gray-500">
        <b className="text-gray-400">Cara kerja otomatis:</b> aktifkan <b className="text-blue-400">Teks Part Otomatis</b> di tab Export, tentukan jumlah bagian atau durasi per video — maka setiap video hasil potongan otomatis diberi tulisan {partLabel(texts.labelStyle, 1, texts.parts, true)}, {partLabel(texts.labelStyle, 2, texts.parts, true)}, dst.
      </div>
    </div>
  );
}
