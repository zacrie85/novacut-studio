// NOVACUT Studio v1.0.25 - WATERMARK (tanda air gambar PNG/JPEG) di atas video.
// Satu jalur untuk semua: pratinjau langsung, mesin kilat & mesin Turbo —
// composeFrame memanggil drawWatermark di PALING ATAS (di atas semua track & teks).
// Gambar di-decode SEKALI lalu di-cache; hasil tint di-cache per kombinasi warna.
// Posisi = pusat gambar dalam % layar; panjang & lebar diatur MANUAL (% layar)
// sesuai permintaan pengguna (boleh melesihat rasio asli).

import type { PlaylistExportConfig } from "./types";

type WmCfg = Pick<PlaylistExportConfig, "wmSrc" | "wmX" | "wmY" | "wmW" | "wmH" | "wmOpacity" | "wmTint" | "wmTintAmt">;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** cache gambar watermark per dataURL */
const imgCache = new Map<string, HTMLImageElement>();
/** cache kanvas hasil tint per kunci "sumber|warna|kekuatan" */
const tintCache = new Map<string, HTMLCanvasElement>();

/** Decode gambar watermark (png/jpeg) — dipanggil sebelum export & saat setelan
 * berubah. Aman dipanggil berulang (cache). Resolve null bila gagal dibaca. */
export async function ensureWatermark(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  const hit = imgCache.get(src);
  if (hit) return hit.complete && hit.naturalWidth ? hit : null;
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("gambar watermark gagal dimuat"));
      img.src = src;
    });
    if (imgCache.size > 4) imgCache.clear();
    imgCache.set(src, img);
    return img;
  } catch {
    return null;
  }
}

/** kanvas hasil tint: warna solid menimpa piksel buram gambar, area transparan
 * asli tetap transparan (composite "source-atop"). */
function tinted(img: HTMLImageElement, src: string, tint: string, amt: number): HTMLCanvasElement {
  const key = `${src.length}:${src.slice(-24)}|${tint}|${amt}`;
  const hit = tintCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = Math.max(1, img.naturalWidth);
  c.height = Math.max(1, img.naturalHeight);
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = clamp(amt / 100, 0, 1);
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }
  if (tintCache.size > 8) tintCache.clear();
  tintCache.set(key, c);
  return c;
}

/** Gambar watermark ke kanvas. Pusat gambar mengikuti (wmX%, wmY%), ukuran
 * LEBAR = wmW% lebar layar & TINGGI = wmH% tinggi layar (manual). Bila gambar
 * belum ter-decode, decode dipicu diam-diam — frame berikutnya langsung tergambar. */
export function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, cfg: WmCfg) {
  const src = cfg.wmSrc || "";
  if (!src) return;
  const img = imgCache.get(src);
  if (!img || !img.complete || !img.naturalWidth) {
    void ensureWatermark(src);
    return;
  }
  const dw = clamp((Number(cfg.wmW) || 20) / 100, 0.03, 1.2) * w;
  const dh = clamp((Number(cfg.wmH) || 20) / 100, 0.03, 1.2) * h;
  const dx = clamp((clamp(Number(cfg.wmX) || 50, 0, 100) / 100) * w - dw / 2, 0, Math.max(0, w - dw));
  const dy = clamp((clamp(Number(cfg.wmY) || 50, 0, 100) / 100) * h - dh / 2, 0, Math.max(0, h - dh));
  const amt = clamp(Number(cfg.wmTintAmt) || 0, 0, 100);
  const draw = amt > 0 && cfg.wmTint ? tinted(img, src, cfg.wmTint, amt) : img;
  ctx.save();
  ctx.globalAlpha = clamp((typeof cfg.wmOpacity === "number" ? cfg.wmOpacity : 60) / 100, 0.02, 1);
  ctx.drawImage(draw, dx, dy, dw, dh);
  ctx.restore();
}
