"use client";

// NOVACUT Studio - Cover Studio: frame otomatis dari video + 100 template + AI

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ImageIcon, LayoutGrid, Sparkles, Upload, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COVER_TEMPLATES, fmtTime, partLabel } from "@/lib/editor/constants";
import { aiRecommendTemplates, analyzeVideoFrames, grabFrame, loadImage, plainCoverDataURL, renderCover, renderCoverToDataURL } from "@/lib/editor/covers";
import { useEditor } from "@/lib/editor/store";
import { uid } from "@/lib/editor/constants";
import { useToast } from "@/hooks/use-toast";
import type { CoverTemplate, MediaAsset } from "@/lib/editor/types";

export function CoverPanel() {
  const assets = useEditor((s) => s.assets);
  const cover = useEditor((s) => s.cover);
  const texts = useEditor((s) => s.texts);
  const project = useEditor((s) => s.project);
  const videos = assets.filter((a) => a.type === "video");
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement[]>([]);
  const uploadRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const source: MediaAsset | undefined = videos.find((v) => v.id === cover.frameAssetId) ?? videos[0];
  const manualAsset: MediaAsset | undefined = assets.find((a) => a.id === cover.manualAssetId);
  // latar cover: mode manual = gambar unggahan, mode auto = frame dari video
  const bgUrl = cover.mode === "manual" ? manualAsset?.url ?? null : frameUrl;
  const title = texts.title || source?.name.replace(/\.[^.]+$/, "") || "Judul Video";
  const partText = partLabel(texts.labelStyle, 1, Math.max(1, texts.parts), true);

  const template = useMemo(() => COVER_TEMPLATES.find((t) => t.id === cover.templateId) ?? COVER_TEMPLATES[0], [cover.templateId]);
  const recommended = useMemo(() => aiRecommendTemplates(title, cover.previewUrl ? 128 : 110, 6), [title, cover.previewUrl]);

  // ambil frame saat sumber/waktu berubah (mode otomatis saja)
  useEffect(() => {
    let alive = true;
    if (!source || cover.mode !== "auto") {
      setFrameUrl(null);
      return;
    }
    void grabFrame(source.url, Math.min(cover.frameTime, Math.max(0, source.duration - 0.1)), 1280).then((u) => {
      if (alive) setFrameUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [source, cover.frameTime, cover.mode]);

  // render pratinjau
  useEffect(() => {
    const c = previewRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const bgStyle = cover.mode === "auto" ? cover.bgStyle : undefined;
    if (!bgUrl) {
      renderCover(ctx, { img: null, title, part: partText, template, bgStyle, w: c.width, h: c.height });
      return;
    }
    const drawPlain = (img: HTMLImageElement) => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, c.width, c.height);
      const sw = img.naturalWidth || 2;
      const sh = img.naturalHeight || 2;
      const s = Math.max(c.width / sw, c.height / sh);
      ctx.drawImage(img, (c.width - sw * s) / 2, (c.height - sh * s) / 2, sw * s, sh * s);
    };
    let alive = true;
    void loadImage(bgUrl).then((img) => {
      if (!alive) return;
      if (cover.mode === "manual" && cover.manualPlain) drawPlain(img);
      else renderCover(ctx, { img, title, part: partText, template, bgStyle, w: c.width, h: c.height });
    });
    return () => {
      alive = false;
    };
  }, [bgUrl, cover.mode, cover.manualPlain, cover.bgStyle, template, title, partText]);

  useEffect(() => {
    if (!showAll) return;
    // render thumbnail 100 template (dibuat sekali)
    const t = setTimeout(() => {
      gridRef.current.forEach((c, i) => {
        if (!c || c.dataset.done === "1") return;
        const ctx = c.getContext("2d");
        const tpl = COVER_TEMPLATES[i];
        if (!ctx || !tpl) return;
        if (!bgUrl) {
          renderCover(ctx, { img: null, title: title.slice(0, 22), part: "", template: tpl, bgStyle: cover.mode === "auto" ? cover.bgStyle : undefined, w: c.width, h: c.height });
          c.dataset.done = "1";
          return;
        }
        void loadImage(bgUrl).then((img) => {
          renderCover(ctx, { img, title: title.slice(0, 22), part: "", template: tpl, bgStyle: cover.mode === "auto" ? cover.bgStyle : undefined, w: c.width, h: c.height });
        });
        c.dataset.done = "1";
      });
    }, 60);
    return () => clearTimeout(t);
  }, [showAll, bgUrl, title]);

  const analyze = useCallback(async () => {
    if (!source) return;
    setBusy("ai");
    toast({ title: "AI sedang menganalisis...", description: "Mencari frame paling menarik" });
    try {
      const { best } = await analyzeVideoFrames(source.url, source.duration, 8);
      if (best) {
        useEditor.getState().setCover({ frameTime: best.time });
        toast({ title: "Frame terbaik ditemukan", description: `Pada ${fmtTime(best.time)} — skor ${best.score.toFixed(2)}` });
      } else toast({ title: "Gagal menganalisis video" });
    } finally {
      setBusy(null);
    }
  }, [source, toast]);

  const applyTemplate = (t: CoverTemplate) => {
    useEditor.getState().setCover({ templateId: t.id });
  };

  const handleCoverUpload = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast({ title: "File harus gambar", description: "Gunakan file PNG atau JPG." });
        return;
      }
      const url = URL.createObjectURL(file);
      const meta = await new Promise<{ w: number; h: number }>((res) => {
        const img = new Image();
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => res({ w: 0, h: 0 });
        img.src = url;
      });
      const asset: MediaAsset = { id: uid("as"), name: file.name, type: "image", url, duration: 0, width: meta.w, height: meta.h };
      useEditor.getState().addAsset(asset);
      useEditor.getState().setCover({ mode: "manual", manualAssetId: asset.id });
      toast({ title: "Gambar cover siap ✔", description: `${file.name} — dipakai sebagai cover.` });
    },
    [toast]
  );

  const saveCover = async () => {
    // latar hitam tidak butuh frame video
    const isBlack = cover.mode === "auto" && cover.bgStyle === "hitam";
    if (cover.mode === "manual" && !manualAsset) {
      toast({ title: "Unggah gambar dulu", description: "Pilih file PNG/JPG untuk cover manual." });
      return;
    }
    if (cover.mode === "auto" && !isBlack && !frameUrl) {
      toast({ title: "Pilih video dulu", description: "Impor video di tab Media." });
      return;
    }
    const srcUrl = cover.mode === "manual" ? manualAsset!.url : frameUrl!;
    const dataUrl =
      cover.mode === "manual" && cover.manualPlain
        ? await plainCoverDataURL(srcUrl, project.width, project.height)
        : isBlack
          ? renderCoverToDataURL({ img: null, title, part: partText, template, bgStyle: "hitam" }, project.width, project.height)
          : renderCoverToDataURL({ img: await loadImage(srcUrl), title, part: partText, template, bgStyle: cover.mode === "auto" ? cover.bgStyle : undefined }, project.width, project.height);
    if (!dataUrl) {
      toast({ title: "Gagal membuat cover" });
      return;
    }
    const asset: MediaAsset = { id: uid("as"), name: `Cover - ${title}`, type: "image", url: dataUrl, duration: 0, width: project.width, height: project.height };
    useEditor.getState().addAsset(asset);
    useEditor.getState().setCover({ coverAssetId: asset.id, previewUrl: dataUrl });
    toast({ title: "Cover disimpan ✔", description: "Dipakai otomatis di Export & Split." });
  };

  const placeCover = () => {
    if (!cover.coverAssetId) {
      void saveCover();
      return;
    }
    const clipId = useEditor.getState().addClipFromAsset(cover.coverAssetId, { duration: cover.duration });
    if (clipId) {
      useEditor.getState().updateClip(clipId, { effects: ["fx-kenburns"] });
      toast({ title: "Cover di timeline", description: `Durasi ${cover.duration} detik + slow zoom` });
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-gray-400">
        <Wand2 className="h-4 w-4 text-violet-300" /> COVER STUDIO AI
      </div>

      <div className="nova-scroll -mr-1 flex-1 space-y-3 overflow-y-auto pr-1">
        {/* sumber cover: otomatis dari video / unggahan manual */}
        <div className="space-y-2 rounded-lg border border-violet-400/25 bg-violet-400/[0.05] p-2.5">
          <div className="text-[10px] font-semibold tracking-wider text-gray-400">SUMBER COVER</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => useEditor.getState().setCover({ mode: "auto" })}
              className={`rounded-md border px-2 py-1.5 text-[10px] font-medium transition ${cover.mode === "auto" ? "border-violet-300 bg-violet-400/20 text-violet-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-violet-400/40"}`}
            >
              Otomatis dari Video
            </button>
            <button
              onClick={() => useEditor.getState().setCover({ mode: "manual" })}
              className={`rounded-md border px-2 py-1.5 text-[10px] font-medium transition ${cover.mode === "manual" ? "border-violet-300 bg-violet-400/20 text-violet-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-violet-400/40"}`}
            >
              Unggah Sendiri (PNG/JPG)
            </button>
          </div>
          {cover.mode === "auto" ? (
            <div className="text-[9px] leading-relaxed text-gray-500">AI mengambil adegan terbaik dari dalam video, atau geser slider untuk pilih frame manual.</div>
          ) : (
            <div className="space-y-2">
              <input ref={uploadRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void handleCoverUpload(e.target.files)} />
              <Button variant="outline" className="h-8 w-full gap-1.5 border-white/10 bg-white/5 text-[11px]" onClick={() => uploadRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />
                <span className="truncate">{manualAsset ? manualAsset.name : "Pilih file PNG / JPG"}</span>
              </Button>
              {manualAsset && (
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-violet-300" />
                  <span className="truncate text-[9px] text-gray-500">
                    {manualAsset.width && manualAsset.height ? `${manualAsset.width}×${manualAsset.height}` : "Gambar siap dipakai"}
                  </span>
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-gray-400">
                <Checkbox checked={!!cover.manualPlain} onCheckedChange={(v) => useEditor.getState().setCover({ manualPlain: v === true })} className="h-3.5 w-3.5 border-white/20" />
                Gambar apa adanya — tanpa teks judul &amp; part
              </label>
            </div>
          )}
        </div>

        {/* latar cover: adegan video / hitam polos + penyebaran per bagian (mode otomatis) */}
        {cover.mode === "auto" && (
          <div className="space-y-2 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.05] p-2.5">
            <div className="text-[10px] font-semibold tracking-wider text-gray-400">LATAR COVER</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => useEditor.getState().setCover({ bgStyle: "adegan" })}
                className={`rounded-md border px-2 py-1.5 text-[10px] font-medium transition ${cover.bgStyle === "adegan" ? "border-cyan-300 bg-cyan-400/20 text-cyan-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-cyan-400/40"}`}
              >
                Adegan dari Video
              </button>
              <button
                onClick={() => useEditor.getState().setCover({ bgStyle: "hitam" })}
                className={`rounded-md border px-2 py-1.5 text-[10px] font-medium transition ${cover.bgStyle === "hitam" ? "border-cyan-300 bg-cyan-400/20 text-cyan-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-cyan-400/40"}`}
              >
                Hitam Polos
              </button>
            </div>
            {cover.bgStyle === "adegan" ? (
              <>
                <div className="text-[9px] text-gray-500">Saat Export &amp; Split, latar untuk tiap bagian hasil:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => useEditor.getState().setCover({ bgScope: "sama" })}
                    className={`rounded-md border px-2 py-1.5 text-[10px] font-medium transition ${cover.bgScope === "sama" ? "border-cyan-300 bg-cyan-400/20 text-cyan-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-cyan-400/40"}`}
                  >
                    Semua Bagian Sama
                  </button>
                  <button
                    onClick={() => useEditor.getState().setCover({ bgScope: "beda" })}
                    className={`rounded-md border px-2 py-1.5 text-[10px] font-medium transition ${cover.bgScope === "beda" ? "border-cyan-300 bg-cyan-400/20 text-cyan-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-cyan-400/40"}`}
                  >
                    Tiap Bagian Beda
                  </button>
                </div>
                <div className="text-[9px] leading-relaxed text-gray-600">
                  {cover.bgScope === "sama"
                    ? "Semua hasil split memakai 1 adegan yang sama."
                    : "AI memilih adegan yang berbeda untuk setiap hasil split."}
                </div>
              </>
            ) : (
              <div className="text-[9px] leading-relaxed text-gray-600">Latar hitam polos dengan tulisan judul — seperti gaya trailer klasik.</div>
            )}
          </div>
        )}

        {/* sumber & frame (mode otomatis) */}
        {cover.mode === "auto" && (
        <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="text-[10px] font-semibold tracking-wider text-gray-400">SUMBER VIDEO</div>
          <Select value={source?.id ?? ""} onValueChange={(v) => useEditor.getState().setCover({ frameAssetId: v, frameTime: 0 })}>
            <SelectTrigger className="h-8 border-white/10 bg-black/30 text-xs">
              <SelectValue placeholder="Pilih video" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#0b0d1d] text-xs">
              {videos.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {source && (
            <>
              <Slider
                value={[cover.frameTime]}
                min={0}
                max={Math.max(0.1, source.duration - 0.1)}
                step={0.1}
                onValueChange={([v]) => useEditor.getState().setCover({ frameTime: v })}
                className="py-1"
                aria-label="Pilih frame"
              />
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>Frame: {fmtTime(cover.frameTime, true)}</span>
                <Button size="sm" className="h-6 gap-1 bg-violet-500/20 px-2 text-[10px] text-violet-300 hover:bg-violet-500/30" disabled={busy === "ai"} onClick={() => void analyze()}>
                  <Sparkles className="h-3 w-3" /> {busy === "ai" ? "Menganalisis..." : "Pilih Frame Otomatis (AI)"}
                </Button>
              </div>
            </>
          )}
        </div>
        )}

        {/* pratinjau */}
        <div className="overflow-hidden rounded-lg border border-violet-400/20 shadow-[0_0_24px_rgba(167,139,250,0.12)]">
          <canvas ref={previewRef} width={project.ratio === "9:16" ? 360 : 640} height={project.ratio === "9:16" ? 640 : 360} className="mx-auto block max-h-72 w-auto max-w-full" />
        </div>

        {/* durasi cover */}
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold tracking-wider text-gray-400">DURASI COVER SAAT EXPORT</span>
            <span className="font-mono text-violet-300">{cover.duration.toFixed(1)} dtk</span>
          </div>
          <Slider value={[cover.duration]} min={2} max={5} step={0.5} onValueChange={([v]) => useEditor.getState().setCover({ duration: v })} className="py-1" aria-label="Durasi cover" />
          <div className="text-[9px] text-gray-500">Cover tampil di depan setiap bagian hasil Export &amp; Split.</div>
        </div>

        {/* rekomendasi AI */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> REKOMENDASI AI (dari 100 template)
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {recommended.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className={`truncate rounded-md border px-2 py-1.5 text-left text-[10px] transition ${t.id === cover.templateId ? "border-violet-300 bg-violet-400/20 text-violet-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-violet-400/40"}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* 100 template */}
        <div className="space-y-1.5">
          <button className="flex w-full items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] font-semibold tracking-wider text-gray-300 hover:border-white/20" onClick={() => setShowAll((v) => !v)}>
            <LayoutGrid className="h-3.5 w-3.5 text-cyan-300" /> SEMUA TEMPLATE ({COVER_TEMPLATES.length}) {showAll ? "▲" : "▼"}
          </button>
          {showAll && (
            <div key={project.ratio} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COVER_TEMPLATES.map((t, i) => (
                <button
                  key={t.id}
                  ref={(el) => {
                    if (el) gridRef.current[i] = el;
                  }}
                  onClick={() => applyTemplate(t)}
                  className={`overflow-hidden rounded-md border text-left transition hover:scale-[1.03] ${t.id === cover.templateId ? "border-violet-300 ring-1 ring-violet-300" : t.popular ? "border-amber-400/40" : "border-white/10"}`}
                  title={t.name}
                >
                  <canvas width={project.ratio === "9:16" ? 72 : 128} height={project.ratio === "9:16" ? 128 : 72} className="w-full" />
                  <div className="flex items-center gap-1 bg-black/60 px-1 py-0.5">
                    {t.id === cover.templateId && <Check className="h-2.5 w-2.5 shrink-0 text-violet-300" />}
                    <span className="truncate text-[8px] text-gray-300">{t.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button className="h-9 flex-1 gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-xs font-bold hover:from-violet-500 hover:to-fuchsia-400" onClick={() => void saveCover()}>
          <Check className="h-4 w-4" /> Simpan Cover
        </Button>
        <Button variant="outline" className="h-9 flex-1 border-white/10 bg-white/5 text-xs" onClick={placeCover}>
          Ke Timeline
        </Button>
      </div>
    </div>
  );
}
