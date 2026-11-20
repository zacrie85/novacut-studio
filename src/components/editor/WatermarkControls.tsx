"use client";

// NOVACUT Studio v1.0.25 - WATERMARK: gambar PNG/JPEG sebagai tanda air di atas
// video hasil export. Posisi (X/Y), warna (tint + kekuatan), transparansi dan
// PANJANG & LEBAR diatur MANUAL sesuai permintaan pengguna. Gambar otomatis
// diturunkan skalanya (sisi terpanjang 640px) agar hemat penyimpanan.
// Digambar lewat drawWatermark di composeFrame — pratinjau, mesin kilat &
// mesin Turbo memakai jalur yang sama persis (WYSIWYG).

import { useRef } from "react";
import { Image as ImageIcon, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useEditor } from "@/lib/editor/store";
import { ensureWatermark } from "@/lib/editor/watermark";
import type { PlaylistExportConfig } from "@/lib/editor/types";

const WM_DEFAULTS = { wmOn: false, wmX: 85, wmY: 88, wmW: 22, wmH: 22, wmOpacity: 65, wmTint: "#ffffff", wmTintAmt: 0 };

/** turunkan skala gambar ke sisi terpanjang 640px lalu simpan sebagai dataURL */
async function fileToDataURL(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("gambar tidak dapat dibaca"));
      img.src = url;
    });
    const MAX = 640;
    const scale = Math.min(1, MAX / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const w = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
    const h = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("kanvas tidak tersedia");
    ctx.drawImage(img, 0, 0, w, h);
    // JPEG asli boleh tetap JPEG (lebih hemat); selain itu PNG agar transparansi asli dipertahankan
    return file.type === "image/jpeg" ? c.toDataURL("image/jpeg", 0.9) : c.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function WmRow({ name, value, min, max, step = 1, onChange, suffix = "%", fmt }: { name: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; suffix?: string; fmt?: (v: number) => string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-gray-400">
      <span className="w-20 shrink-0 font-semibold text-gray-300">{name}</span>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="flex-1" aria-label={name} />
      <span className="w-12 shrink-0 text-right font-mono text-blue-300">{fmt ? fmt(value) : `${Math.round(value)}${suffix}`}</span>
    </div>
  );
}

export function WatermarkControls() {
  const pl = useEditor((s) => s.playlistExport);
  const set = useEditor.getState().setPlaylistExport;
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "Bukan gambar", description: "Pilih file PNG atau JPEG ya kawan." });
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast({ title: "Gambar terlalu besar", description: "Maksimal 8 MB — kompres dulu ya kawan." });
      return;
    }
    try {
      const src = await fileToDataURL(f);
      set({ wmSrc: src, wmOn: true } as Partial<PlaylistExportConfig>);
      void ensureWatermark(src);
      toast({ title: "Watermark siap ✓", description: `${f.name} — atur posisi, ukuran & transparansinya di bawah.` });
    } catch {
      toast({ title: "Gambar gagal dibaca", description: "Coba file PNG/JPEG lain ya kawan." });
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.07] bg-card p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
          <ImageIcon className="h-3.5 w-3.5 text-blue-400" /> Watermark (Logo Gambar)
        </div>
        <Switch checked={!!pl.wmOn} onCheckedChange={(v) => set({ wmOn: v } as Partial<PlaylistExportConfig>)} disabled={!pl.wmSrc} className="data-[state=checked]:bg-blue-500" aria-label="Watermark aktif" />
      </div>
      <p className="text-[11px] leading-relaxed text-gray-500">
        Pilih gambar <b className="text-gray-400">PNG/JPEG</b> (mis. logo channel) — akan dicap di atas semua video hasil export. Atur posisi, warna, transparansi serta <b className="text-blue-400">panjang &amp; lebar manual</b> di bawah.
      </p>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-[11px] font-bold text-blue-300 transition hover:bg-blue-500/20"
        >
          {pl.wmSrc ? "Ganti Gambar" : "Pilih Gambar PNG/JPEG"}
        </button>
        {pl.wmSrc ? (
          <>
            {/* pratinjau gambar di atas latar papan-catur (transparansi terlihat) */}
            <span className="relative inline-block h-10 w-16 overflow-hidden rounded-md border border-white/15" aria-label="Pratinjau watermark">
              <span className="absolute inset-0 bg-[conic-gradient(#8884_0_25%,#5554_0_50%,#8884_0_75%,#5554_0)] bg-[length:10px_10px] opacity-70" />
              <img src={pl.wmSrc} alt="Watermark" className="absolute inset-0 h-full w-full object-contain" />
            </span>
            <button
              type="button"
              onClick={() => set({ wmSrc: "", wmOn: false } as Partial<PlaylistExportConfig>)}
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
              aria-label="Hapus watermark"
              title="Hapus gambar watermark"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <span className="text-[11px] text-gray-600">Belum ada gambar — watermark mati.</span>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />

      {pl.wmSrc && pl.wmOn && (
        <div className="space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
          <WmRow name="Posisi X" value={pl.wmX ?? 85} min={0} max={100} onChange={(v) => set({ wmX: v } as Partial<PlaylistExportConfig>)} />
          <WmRow name="Posisi Y" value={pl.wmY ?? 88} min={0} max={100} onChange={(v) => set({ wmY: v } as Partial<PlaylistExportConfig>)} />
          <WmRow name="Panjang" value={pl.wmW ?? 22} min={3} max={100} onChange={(v) => set({ wmW: v } as Partial<PlaylistExportConfig>)} />
          <WmRow name="Lebar" value={pl.wmH ?? 22} min={3} max={100} onChange={(v) => set({ wmH: v } as Partial<PlaylistExportConfig>)} />
          <WmRow name="Transparansi" value={pl.wmOpacity ?? 65} min={2} max={100} onChange={(v) => set({ wmOpacity: v } as Partial<PlaylistExportConfig>)} />
          <p className="text-[10px] leading-relaxed text-gray-600">Panjang &amp; lebar diatur bebas (bisa melesihat rasio asli). Transparansi 100 = penuh terlihat, 2 = samar.</p>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="w-20 shrink-0 font-semibold text-gray-300">Warna</span>
            <input
              type="color"
              value={pl.wmTint || "#ffffff"}
              onChange={(e) => set({ wmTint: e.target.value } as Partial<PlaylistExportConfig>)}
              className="h-6 w-9 shrink-0 cursor-pointer rounded border border-white/15 bg-transparent"
              aria-label="Warna watermark"
            />
            <Slider value={[pl.wmTintAmt ?? 0]} min={0} max={100} step={1} onValueChange={([v]) => set({ wmTintAmt: v } as Partial<PlaylistExportConfig>)} className="flex-1" aria-label="Kekuatan warna" />
            <span className="w-12 shrink-0 text-right font-mono text-blue-300">{Math.round(pl.wmTintAmt ?? 0)}%</span>
          </div>
          <p className="text-[10px] leading-relaxed text-gray-600">Kekuatan warna 0 = warna asli gambar; makin besar makin tertimpa warna pilihan (area transparan tetap transparan).</p>
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-[11px] text-gray-500 hover:text-gray-200"
              disabled={pl.wmX === WM_DEFAULTS.wmX && pl.wmY === WM_DEFAULTS.wmY && pl.wmW === WM_DEFAULTS.wmW && pl.wmH === WM_DEFAULTS.wmH && pl.wmOpacity === WM_DEFAULTS.wmOpacity && pl.wmTintAmt === WM_DEFAULTS.wmTintAmt}
              onClick={() => set(WM_DEFAULTS as Partial<PlaylistExportConfig>)}
              aria-label="Reset watermark ke bawaan"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
