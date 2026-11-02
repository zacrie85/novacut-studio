"use client";

// NOVACUT Studio - Panel Teks: judul, deskripsi & generator Part/Episode otomatis

import { BookOpenText, Heading1, Repeat2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LABEL_STYLES, partLabel } from "@/lib/editor/constants";
import { useEditor } from "@/lib/editor/store";
import { useToast } from "@/hooks/use-toast";

export function TextPanel() {
  const texts = useEditor((s) => s.texts);
  const playhead = useEditor((s) => s.playhead);
  const st = useEditor.getState();
  const { toast } = useToast();

  const addTitle = () => {
    if (!texts.title.trim()) return toast({ title: "Isi judul dulu" });
    st.addTextClip({ content: texts.title, sub: texts.description || undefined, size: 0.085, font: "condensed", anim: "rise", pos: "top", bg: "gradient" }, { start: playhead, duration: 4 });
    toast({ title: "Judul ditambahkan", description: `Di posisi ${playhead.toFixed(1)}s` });
  };

  const addDescription = () => {
    if (!texts.description.trim()) return toast({ title: "Isi deskripsi dulu" });
    st.addTextClip({ content: texts.description, size: 0.045, font: "sans", anim: "fade", pos: "bottom", bg: "bar" }, { start: playhead, duration: 4 });
    toast({ title: "Deskripsi ditambahkan" });
  };

  const addPart = () => {
    const label = partLabel(texts.labelStyle, Math.max(1, texts.parts), Math.max(1, texts.parts), false);
    st.addTextClip({ content: label, size: 0.12, font: "impact", anim: "slam", pos: "bottom", bg: "bar" }, { start: playhead, duration: 2.5 });
    toast({ title: `${label} ditambahkan`, description: "Ubah nomor part di kolom bawah lalu tambah lagi." });
  };

  return (
    <div className="nova-scroll h-full space-y-3 overflow-y-auto p-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-gray-300">
        <Type className="h-4 w-4 text-fuchsia-300" /> PEMBUAT TEKS OTOMATIS
      </div>
      <p className="text-[10px] leading-relaxed text-gray-500">
        Isi 3 data: <b className="text-gray-400">judul</b>, <b className="text-gray-400">deskripsi</b>, dan <b className="text-gray-400">label part/episode</b>. Saat <b className="text-cyan-300">Export &amp; Split</b>, tulisan part akan tertulis otomatis ke dalam setiap video sesuai jumlah bagian / durasi per video yang kamu tentukan.
      </p>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold tracking-wider text-gray-400">1 · JUDUL VIDEO</label>
        <Input value={texts.title} onChange={(e) => st.setTexts({ title: e.target.value })} placeholder="mis. Trailer Senja di Jakarta" className="h-8 border-white/10 bg-black/30 text-xs" />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold tracking-wider text-gray-400">2 · DESKRIPSI VIDEO</label>
        <Textarea value={texts.description} onChange={(e) => st.setTexts({ description: e.target.value })} placeholder="mis. Kisah perjalanan yang tak terlupakan..." className="min-h-[56px] border-white/10 bg-black/30 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold tracking-wider text-gray-400">3 · GAYA LABEL</label>
          <select
            value={texts.labelStyle}
            onChange={(e) => st.setTexts({ labelStyle: e.target.value as typeof texts.labelStyle })}
            className="h-8 w-full rounded-md border border-white/10 bg-black/30 px-2 text-xs text-gray-200"
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
          <label className="text-[10px] font-semibold tracking-wider text-gray-400">NOMOR PART</label>
          <Input type="number" min={1} max={99} value={texts.parts} onChange={(e) => st.setTexts({ parts: Math.max(1, Number(e.target.value) || 1) })} className="h-8 border-white/10 bg-black/30 text-xs" />
        </div>
      </div>

      <div className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-400/5 p-2 text-center font-mono text-sm text-fuchsia-200">
        Contoh: &quot;{partLabel(texts.labelStyle, texts.parts, texts.parts, true)}&quot;
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        <Button size="sm" className="h-8 justify-start gap-2 bg-fuchsia-500/20 text-xs text-fuchsia-200 hover:bg-fuchsia-500/30" onClick={addTitle}>
          <Heading1 className="h-4 w-4" /> Tambah Judul ke Timeline
        </Button>
        <Button size="sm" className="h-8 justify-start gap-2 bg-cyan-500/20 text-xs text-cyan-200 hover:bg-cyan-500/30" onClick={addDescription}>
          <BookOpenText className="h-4 w-4" /> Tambah Deskripsi ke Timeline
        </Button>
        <Button size="sm" className="h-8 justify-start gap-2 bg-amber-500/20 text-xs text-amber-200 hover:bg-amber-500/30" onClick={addPart}>
          <Repeat2 className="h-4 w-4" /> Tambah {partLabel(texts.labelStyle, texts.parts, texts.parts, false)} ke Timeline
        </Button>
      </div>

      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-[10px] leading-relaxed text-gray-500">
        <b className="text-gray-400">Cara kerja otomatis:</b> aktifkan <b className="text-cyan-300">Teks Part Otomatis</b> di tab Export, tentukan jumlah bagian atau durasi per video — maka setiap video hasil potongan otomatis diberi tulisan {partLabel(texts.labelStyle, 1, texts.parts, true)}, {partLabel(texts.labelStyle, 2, texts.parts, true)}, dst.
      </div>
    </div>
  );
}
