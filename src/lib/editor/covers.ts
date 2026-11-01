// NOVACUT Studio - Pembuat cover: 100 template populer + AI auto-cover

import { COVER_TEMPLATES, fontStack, type CoverTemplate } from "./constants";

export interface CoverRenderInput {
  img: CanvasImageSource | null;
  title: string;
  part?: string; // mis. "Part 2/5"
  template: CoverTemplate;
  w: number;
  h: number;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = word;
      if (lines.length === maxLines - 1 && words.indexOf(word) < words.length - 1) break;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s+\S*$/, "") + "…";
    return kept;
  }
  return lines;
}

function drawBackground(ctx: CanvasRenderingContext2D, input: CoverRenderInput, darken: number) {
  const { w, h } = input;
  if (input.img) {
    const sw = (input.img as HTMLCanvasElement).width || (input.img as HTMLImageElement).naturalWidth || 2;
    const sh = (input.img as HTMLCanvasElement).height || (input.img as HTMLImageElement).naturalHeight || 2;
    const s = Math.max(w / sw, h / sh) * 1.02;
    const dw = sw * s;
    const dh = sh * s;
    ctx.drawImage(input.img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, input.template.palette.bg1);
    g.addColorStop(1, input.template.palette.bg2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  // gradasi gelap agar teks terbaca
  const g2 = ctx.createLinearGradient(0, 0, 0, h);
  g2.addColorStop(0, `rgba(0,0,0,${darken * 0.7})`);
  g2.addColorStop(0.5, `rgba(0,0,0,${darken * 0.25})`);
  g2.addColorStop(1, `rgba(0,0,0,${darken})`);
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, w, h);
}

function drawPartBadge(ctx: CanvasRenderingContext2D, part: string, pal: { fg: string; accent: string }, x: number, y: number, size: number, align: CanvasTextAlign = "left") {
  if (!part) return;
  ctx.font = `700 ${size}px ${fontStack("condensed")}`;
  ctx.textAlign = align;
  const tw = ctx.measureText(part.toUpperCase()).width;
  const padX = size * 0.5;
  const boxW = tw + padX * 2;
  const boxH = size * 1.6;
  const bx = align === "center" ? x - boxW / 2 : align === "right" ? x - boxW : x;
  ctx.fillStyle = pal.accent;
  ctx.fillRect(bx, y, boxW, boxH);
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.fillText(part.toUpperCase(), bx + padX, y + boxH / 2 + size * 0.04);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
}

function glowText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, glow: string) {
  ctx.save();
  ctx.shadowColor = glow;
  ctx.shadowBlur = 28;
  ctx.fillStyle = ctx.fillStyle;
  ctx.fillText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Render satu cover ke ctx sesuai template */
export function renderCover(ctx: CanvasRenderingContext2D, input: CoverRenderInput) {
  const { w, h, template, title, part } = input;
  const pal = template.palette;
  const accent = pal.accent;
  const fg = pal.fg;
  ctx.clearRect(0, 0, w, h);
  ctx.textBaseline = "alphabetic";

  const layouts: Record<string, () => void> = {
    impact: () => {
      drawBackground(ctx, input, 0.45);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.115}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title, w * 0.84, 3);
      const startY = h / 2 - ((lines.length - 1) * h * 0.125) / 2 + h * 0.03;
      ctx.fillStyle = fg;
      lines.forEach((ln, i) => {
        const y = startY + i * h * 0.125;
        ctx.fillStyle = "#000";
        ctx.fillText(ln, w / 2 + h * 0.006, y + h * 0.006);
        ctx.fillStyle = fg;
        ctx.fillText(ln, w / 2, y);
      });
      ctx.fillStyle = accent;
      ctx.fillRect(w / 2 - w * 0.08, startY + lines.length * h * 0.125 - h * 0.06, w * 0.16, h * 0.012);
      drawPartBadge(ctx, part, pal, w / 2, h * 0.74, h * 0.032, "center");
    },
    lower: () => {
      drawBackground(ctx, input, 0.3);
      ctx.fillStyle = "rgba(0,0,0,0.72)";
      ctx.fillRect(0, h * 0.68, w * 0.72, h * 0.24);
      ctx.fillStyle = accent;
      ctx.fillRect(0, h * 0.68, w * 0.012, h * 0.24);
      ctx.textAlign = "left";
      ctx.font = `900 ${h * 0.085}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title, w * 0.64, 2);
      lines.forEach((ln, i) => {
        ctx.fillStyle = "#000";
        ctx.fillText(ln, w * 0.04 + 3, h * 0.79 + i * h * 0.095 + 3);
        ctx.fillStyle = fg;
        ctx.fillText(ln, w * 0.04, h * 0.79 + i * h * 0.095);
      });
      if (part) {
        ctx.font = `700 ${h * 0.03}px ${fontStack("sans")}`;
        ctx.fillStyle = accent;
        ctx.fillText(part.toUpperCase(), w * 0.04, h * 0.885);
      }
    },
    banner: () => {
      drawBackground(ctx, input, 0.3);
      ctx.fillStyle = pal.bg1;
      ctx.fillRect(0, 0, w, h * 0.22);
      ctx.fillStyle = accent;
      ctx.fillRect(0, h * 0.22, w, h * 0.012);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.1}px ${fontStack("condensed")}`;
      const lines = wrapText(ctx, title, w * 0.86, 1);
      ctx.fillStyle = fg;
      ctx.fillText(lines[0]?.toUpperCase() ?? "", w / 2, h * 0.15);
      if (part) drawPartBadge(ctx, part, pal, w / 2, h * 0.8, h * 0.032, "center");
    },
    side: () => {
      drawBackground(ctx, input, 0.25);
      const g = ctx.createLinearGradient(0, 0, w * 0.62, 0);
      g.addColorStop(0, pal.bg1);
      g.addColorStop(0.75, pal.bg2);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w * 0.62, h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, w * 0.014, h);
      ctx.textAlign = "left";
      ctx.font = `900 ${h * 0.095}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title, w * 0.5, 3);
      lines.forEach((ln, i) => ctx.fillText(ln, w * 0.05, h * 0.42 + i * h * 0.11));
      ctx.fillStyle = accent;
      ctx.font = `700 ${h * 0.028}px ${fontStack("sans")}`;
      if (part) ctx.fillText(part.toUpperCase(), w * 0.05, h * 0.42 - h * 0.06);
    },
    boxed: () => {
      drawBackground(ctx, input, 0.35);
      ctx.strokeStyle = fg;
      ctx.lineWidth = h * 0.006;
      ctx.strokeRect(w * 0.09, h * 0.3, w * 0.82, h * 0.4);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.09}px ${fontStack("condensed")}`;
      const lines = wrapText(ctx, title, w * 0.72, 2);
      lines.forEach((ln, i) => {
        ctx.fillStyle = fg;
        const y = h * 0.47 + (i - (lines.length - 1) / 2) * h * 0.105;
        ctx.fillText(ln.toUpperCase(), w / 2, y);
      });
      ctx.fillStyle = pal.bg1;
      ctx.fillRect(w * 0.34, h * 0.28, w * 0.32, h * 0.045);
      ctx.fillStyle = accent;
      ctx.font = `700 ${h * 0.026}px ${fontStack("sans")}`;
      ctx.fillText((part || "VIDEO").toUpperCase(), w / 2, h * 0.312);
    },
    neon: () => {
      drawBackground(ctx, input, 0.55);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.1}px ${fontStack("display")}`;
      const lines = wrapText(ctx, title, w * 0.8, 2);
      lines.forEach((ln, i) => {
        const y = h * 0.48 + (i - (lines.length - 1) / 2) * h * 0.13;
        ctx.fillStyle = accent;
        glowText(ctx, ln.toUpperCase(), w / 2, y, accent);
        ctx.fillStyle = "#fff";
        ctx.fillText(ln.toUpperCase(), w / 2, y);
      });
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 2;
      ctx.strokeRect(w * 0.06, h * 0.08, w * 0.88, h * 0.84);
      ctx.globalAlpha = 1;
      if (part) {
        ctx.font = `700 ${h * 0.028}px ${fontStack("sans")}`;
        ctx.fillStyle = "#fff";
        ctx.fillText(part.toUpperCase(), w / 2, h * 0.62);
      }
    },
    bars: () => {
      drawBackground(ctx, input, 0.2);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h * 0.14);
      ctx.fillRect(0, h * 0.86, w, h * 0.14);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.075}px ${fontStack("condensed")}`;
      const lines = wrapText(ctx, title, w * 0.8, 2);
      lines.forEach((ln, i) => {
        ctx.fillStyle = fg;
        ctx.fillText(ln.toUpperCase(), w / 2, h * 0.62 + (i - (lines.length - 1) / 2) * h * 0.085);
      });
      ctx.fillStyle = accent;
      ctx.font = `700 ${h * 0.024}px ${fontStack("sans")}`;
      ctx.fillText((part || "").toUpperCase(), w / 2, h * 0.8);
      // garis film
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (let x = w * 0.03; x < w; x += w * 0.09) {
        ctx.fillRect(x, h * 0.055, w * 0.03, h * 0.03);
        ctx.fillRect(x, h * 0.915, w * 0.03, h * 0.03);
      }
    },
    sticker: () => {
      drawBackground(ctx, input, 0.3);
      ctx.save();
      ctx.translate(w * 0.72, h * 0.24);
      ctx.rotate(-0.12);
      ctx.fillStyle = accent;
      ctx.beginPath();
      const bw = w * 0.2;
      const bh = h * 0.13;
      ctx.roundRect(-bw / 2, -bh / 2, bw, bh, h * 0.02);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = `900 ${h * 0.032}px ${fontStack("impact")}`;
      ctx.textAlign = "center";
      ctx.fillText((part || "HOT").toUpperCase().slice(0, 12), 0, h * 0.012);
      ctx.restore();
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.105}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title, w * 0.8, 3);
      lines.forEach((ln, i) => {
        const y = h * 0.62 + (i - (lines.length - 1) / 2) * h * 0.115;
        ctx.fillStyle = "#000";
        ctx.fillText(ln, w / 2 + 4, y + 4);
        ctx.fillStyle = fg;
        ctx.fillText(ln, w / 2, y);
      });
    },
    outline: () => {
      drawBackground(ctx, input, 0.25);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.17}px ${fontStack("impact")}`;
      const lines = wrapText(ctx, title.toUpperCase(), w * 0.9, 2);
      lines.forEach((ln, i) => {
        const y = h * 0.52 + (i - (lines.length - 1) / 2) * h * 0.17;
        ctx.strokeStyle = fg;
        ctx.lineWidth = h * 0.008;
        ctx.strokeText(ln, w / 2, y);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillText(ln, w / 2, y);
      });
      ctx.fillStyle = accent;
      ctx.fillRect(w * 0.2, h * 0.7, w * 0.6, h * 0.05);
      ctx.fillStyle = "#000";
      ctx.font = `900 ${h * 0.032}px ${fontStack("impact")}`;
      ctx.fillText((part || title.slice(0, 30)).toUpperCase(), w / 2, h * 0.74);
    },
    band: () => {
      drawBackground(ctx, input, 0.25);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(-0.06);
      const g = ctx.createLinearGradient(-w * 0.55, 0, w * 0.55, 0);
      g.addColorStop(0, pal.bg1);
      g.addColorStop(1, pal.bg2);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.95;
      ctx.fillRect(-w * 0.6, -h * 0.14, w * 1.2, h * 0.28);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.fillRect(-w * 0.6, -h * 0.14, w * 1.2, h * 0.012);
      ctx.fillRect(-w * 0.6, h * 0.128, w * 1.2, h * 0.012);
      ctx.textAlign = "center";
      ctx.font = `900 ${h * 0.085}px ${fontStack("condensed")}`;
      const lines = wrapText(ctx, title, w * 0.84, 2);
      lines.forEach((ln, i) => {
        ctx.fillStyle = fg;
        ctx.fillText(ln.toUpperCase(), 0, (i - (lines.length - 1) / 2) * h * 0.095 + h * 0.032);
      });
      ctx.restore();
      if (part) drawPartBadge(ctx, part, pal, w * 0.06, h * 0.78, h * 0.03);
    },
  };

  (layouts[template.layout] ?? layouts.impact)();
}

/** Render cover ke kanvas offscreen & kembalikan dataURL */
export function renderCoverToDataURL(input: Omit<CoverRenderInput, "w" | "h">, w = 1280, h = 720): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  renderCover(ctx, { ...input, w, h });
  return c.toDataURL("image/jpeg", 0.92);
}

// ===== AI AUTO-COVER =====

export interface FrameScore {
  time: number;
  score: number;
  brightness: number;
  contrast: number;
}

/** Analisis & beri skor beberapa kandidat frame dari video */
export async function analyzeVideoFrames(url: string, duration: number, count = 8): Promise<{ scores: FrameScore[]; best: FrameScore | null }> {
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.preload = "auto";
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 90;
  const ctx = c.getContext("2d");
  const scores: FrameScore[] = [];
  if (!ctx) return { scores, best: null };

  await new Promise<void>((res) => {
    video.onloadeddata = () => res();
    video.onerror = () => res();
    setTimeout(res, 4000);
  });
  if (!video.videoWidth) return { scores, best: null };

  const times: number[] = [];
  for (let i = 0; i < count; i++) times.push(Math.min(duration - 0.1, 0.1 + ((duration - 0.3) * (i + 0.5)) / count));

  for (const t of times) {
    await new Promise<void>((res) => {
      const done = () => res();
      video.onseeked = done;
      try {
        video.currentTime = Math.max(0, t);
      } catch {
        done();
      }
      setTimeout(done, 1500);
    });
    ctx.drawImage(video, 0, 0, 160, 90);
    const data = ctx.getImageData(0, 0, 160, 90).data;
    let sum = 0;
    let sumSq = 0;
    let sat = 0;
    const n = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += lum;
      sumSq += lum * lum;
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      sat += mx === 0 ? 0 : (mx - mn) / mx;
    }
    const mean = sum / n;
    const std = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
    const meanSat = sat / n;
    // skor: pencahayaan ideal 90-170, kontras tinggi, warna hidup
    const exposure = Math.exp(-Math.pow((mean - 128) / 62, 2));
    const contrast = Math.min(1, std / 64);
    const color = Math.min(1, meanSat / 0.42);
    scores.push({ time: t, score: exposure * 0.45 + contrast * 0.35 + color * 0.2, brightness: mean, contrast: std });
  }
  scores.sort((a, b) => b.score - a.score);
  return { scores, best: scores[0] ?? null };
}

/** Ambil frame video pada waktu tertentu sebagai dataURL */
export async function grabFrame(url: string, time: number, maxW = 1280): Promise<string | null> {
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.preload = "auto";
  await new Promise<void>((res) => {
    video.onloadeddata = () => res();
    video.onerror = () => res();
    setTimeout(res, 4000);
  });
  if (!video.videoWidth) return null;
  await new Promise<void>((res) => {
    video.onseeked = () => res();
    try {
      video.currentTime = Math.max(0, time);
    } catch {
      res();
    }
    setTimeout(res, 1500);
  });
  const scale = Math.min(1, maxW / video.videoWidth);
  const c = document.createElement("canvas");
  c.width = Math.round(video.videoWidth * scale);
  c.height = Math.round(video.videoHeight * scale);
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.92);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** AI: pilih kombinasi frame + template terbaik (deterministik per judul) */
export function aiRecommendTemplates(title: string, brightness: number, count = 6): CoverTemplate[] {
  const rnd = mulberry32(hashStr(title || "novacut"));
  const long = title.length > 24;
  const dark = brightness < 105;
  const bright = brightness > 165;
  // bobot layout sesuai kondisi
  const layoutWeights: Record<string, number> = {
    impact: long ? 0.6 : 2.2,
    lower: long ? 2.2 : 1.2,
    banner: 1,
    side: long ? 2 : 1.2,
    boxed: 1.1,
    neon: dark ? 2.4 : 0.8,
    bars: dark ? 1.6 : 1,
    sticker: bright ? 1.6 : 1,
    outline: long ? 0.7 : 2.2,
    band: 1.2,
  };
  const paletteWeights: Record<string, number> = {
    cyber: dark ? 2.2 : 1,
    sunset: 1.4,
    gold: 1.5,
    ice: bright ? 1.8 : 1,
    toxic: 1,
    royal: dark ? 1.6 : 1,
    blood: 1.2,
    mono: bright ? 1.4 : 0.9,
    candy: 1.1,
    ocean: 1.2,
  };
  const scored = COVER_TEMPLATES.map((t) => ({
    t,
    s: (layoutWeights[t.layout] ?? 1) * (paletteWeights[t.palette.id] ?? 1) * (t.popular ? 1.35 : 1) * (0.75 + rnd() * 0.6),
  }));
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, count).map((x) => x.t);
}
