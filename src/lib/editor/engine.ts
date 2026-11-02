// NOVACUT Studio - Render engine: playback multi-layer di canvas + mixing audio

import { fontStack, fmtTime } from "./constants";
import { getMusicBuffer, musicDefById } from "./music";
import { useEditor, totalDuration, type EditorState } from "./store";
import { wrapCanvasText } from "./textwrap";
import type { Clip, Track } from "./types";
import { applyGradeTints, applyOverlays, applyTransition, clipTransform, drawCover, easeOut, framingLayout, gradeFilterString } from "./visual";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function makeNoiseCanvas(w: number, h: number, alpha: boolean): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (ctx) {
    const img = ctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = alpha ? 255 : Math.random() * 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  return c;
}

class EditorEngine {
  canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private scratch = document.createElement("canvas");
  private tmpA = document.createElement("canvas");
  private tmpB = document.createElement("canvas");
  private grain = makeNoiseCanvas(256, 256, false);
  private tvNoise = makeNoiseCanvas(240, 135, true);
  private grainPattern: CanvasPattern | null = null;
  private els = new Map<string, HTMLVideoElement | HTMLAudioElement | HTMLImageElement>();
  private gains = new Map<string, GainNode>();
  private mediaSrcs = new Map<string, MediaElementAudioSourceNode>();
  private musicSessions = new Map<string, { src: AudioBufferSourceNode; gain: GainNode; session: number }>();
  private loadingMusic = new Set<string>();
  private musicBuffers = new Map<string, AudioBuffer>();
  audioCtx: AudioContext | null = null;
  recDest: MediaStreamAudioDestinationNode | null = null;
  private session = 0;
  private raf = 0;
  private renderRaf = 0;
  private lastTs = 0;
  playing = false;
  private stopAt: number | null = null;
  private onDone: (() => void) | null = null;

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    const { width, height } = useEditor.getState().project;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    if (this.ctx) {
      this.grainPattern = this.ctx.createPattern(this.grain, "repeat");
      this.renderFrame(useEditor.getState().playhead);
    }
  }

  syncSize() {
    if (!this.canvas) return;
    const { width, height } = useEditor.getState().project;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    // selalu render ulang: atribut kanvas bisa saja sudah diubah React (kanvan ter-reset)
    this.requestRender();
  }

  requestRender() {
    if (this.renderRaf) return;
    this.renderRaf = requestAnimationFrame(() => {
      this.renderRaf = 0;
      if (!this.playing) this.renderFrame(useEditor.getState().playhead);
    });
  }

  ensureAudio() {
    if (!this.audioCtx) {
      type WinAudio = Window & { webkitAudioContext?: typeof AudioContext };
      const AC = window.AudioContext || (window as WinAudio).webkitAudioContext;
      if (!AC) return;
      this.audioCtx = new AC();
      this.recDest = this.audioCtx.createMediaStreamDestination();
      // sambungkan gain yang sudah ada (dibuat sebelum export) ke perekam agar ikut terekam
      for (const g of this.gains.values()) {
        try {
          g.connect(this.recDest);
        } catch {
          /* ignore */
        }
      }
    }
    if (this.audioCtx.state === "suspended") void this.audioCtx.resume();
  }

  /** Rutekan audio elemen video/audio ke graph Web Audio (wajib agar ikut terekam saat export) */
  private routeElementAudio(clipId: string, el: HTMLVideoElement | HTMLAudioElement) {
    const ctx = this.audioCtx;
    if (!ctx || this.mediaSrcs.has(clipId)) return;
    try {
      const src = ctx.createMediaElementSource(el);
      const g = this.gainFor(clipId);
      if (g) src.connect(g);
      this.mediaSrcs.set(clipId, src);
    } catch {
      /* elemen sudah pernah dirutekan / tidak didukung */
    }
  }

  // ===== elemen media per klip =====
  private elFor(clip: Clip): HTMLVideoElement | HTMLAudioElement | HTMLImageElement | null {
    const st = useEditor.getState();
    const asset = st.assets.find((a) => a.id === clip.assetId);
    if (!asset) return null;
    let el = this.els.get(clip.id);
    if (el) return el;
    if (asset.musicId) return null; // musik pustaka: via AudioBuffer
    if (clip.kind === "video") {
      const v = document.createElement("video");
      v.src = asset.url;
      v.preload = "auto";
      v.playsInline = true;
      v.crossOrigin = "anonymous";
      // render ulang saat frame pertama siap (agar preview tidak hitam)
      v.addEventListener("loadeddata", () => this.requestRender(), { once: true });
      el = v;
    } else if (clip.kind === "audio") {
      const a = document.createElement("audio");
      a.src = asset.url;
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      el = a;
    } else {
      const img = new Image();
      img.src = asset.url;
      // render ulang saat gambar selesai dimuat
      img.onload = () => this.requestRender();
      el = img;
    }
    this.els.set(clip.id, el);
    return el;
  }

  private gainFor(clipId: string): GainNode | null {
    if (!this.audioCtx) return null;
    let g = this.gains.get(clipId);
    if (!g) {
      g = this.audioCtx.createGain();
      g.connect(this.audioCtx.destination);
      if (this.recDest) g.connect(this.recDest);
      this.gains.set(clipId, g);
    }
    return g;
  }

  private clipVolume(clip: Clip, track: Track, local: number): number {
    const fi = clip.fadeIn > 0 ? clamp(local / clip.fadeIn, 0, 1) : 1;
    const fo = clip.fadeOut > 0 ? clamp((clip.duration - local) / clip.fadeOut, 0, 1) : 1;
    return clip.volume * (track.muted ? 0 : 1) * Math.min(fi, fo);
  }

  /** Sinkronkan elemen video/audio; kembalikan elemen siap digambar (video saja) */
  private syncMedia(clip: Clip, track: Track, t: number, playing: boolean, forDraw: boolean): HTMLVideoElement | null {
    const el = this.elFor(clip);
    if (!el || !(el instanceof HTMLVideoElement)) return null;
    const local = t - clip.start;
    const srcSeg = (clip.duration * clip.speed) / Math.max(1, clip.loopCount);
    const srcTime = clip.inPoint + ((local * clip.speed) % Math.max(0.033, srcSeg));
    const rate = clamp(clip.speed, 0.25, 4);
    if (el.playbackRate !== rate) {
      try {
        el.playbackRate = rate;
      } catch {
        /* ignore */
      }
    }
    const v = this.clipVolume(clip, track, local);
    if (this.audioCtx) {
      // via graph: suara tetap terdengar & ikut terekam saat export
      this.routeElementAudio(clip.id, el);
      el.volume = 1;
      el.muted = false;
      const g = this.gainFor(clip.id);
      if (g) g.gain.value = v;
    } else {
      const g = this.gainFor(clip.id);
      if (g) g.gain.value = v;
      else {
        el.volume = clamp(v, 0, 1);
        el.muted = track.muted;
      }
    }
    if (playing) {
      if (el.paused) {
        try {
          el.currentTime = Math.min(srcTime, Math.max(0, (el.duration || 0) - 0.02));
        } catch {
          /* ignore */
        }
        void el.play().catch(() => {});
      } else if (Math.abs(el.currentTime - srcTime) > 0.35 && !el.seeking) {
        try {
          el.currentTime = Math.min(srcTime, Math.max(0, (el.duration || 0) - 0.02));
        } catch {
          /* ignore */
        }
      }
    } else {
      if (!el.paused) el.pause();
      if (Math.abs(el.currentTime - srcTime) > 0.03 && !el.seeking) {
        try {
          el.currentTime = Math.min(srcTime, Math.max(0, (el.duration || 0) - 0.02));
        } catch {
          /* ignore */
        }
      }
    }
    return forDraw ? el : null;
  }

  private syncAudioEl(clip: Clip, track: Track, t: number, playing: boolean) {
    const el = this.elFor(clip);
    if (!el || !(el instanceof HTMLAudioElement)) return;
    const local = t - clip.start;
    const srcTime = clip.inPoint + local * clip.speed;
    const v = this.clipVolume(clip, track, local);
    if (this.audioCtx) {
      this.routeElementAudio(clip.id, el);
      el.volume = 1;
      el.muted = false;
      const g = this.gainFor(clip.id);
      if (g) g.gain.value = v;
    } else {
      const g = this.gainFor(clip.id);
      if (g) g.gain.value = v;
      else {
        el.volume = clamp(v, 0, 1);
        el.muted = track.muted;
      }
    }
    if (playing) {
      if (el.paused) {
        try {
          el.currentTime = srcTime;
        } catch {
          /* ignore */
        }
        void el.play().catch(() => {});
      } else if (Math.abs(el.currentTime - srcTime) > 0.35 && !el.seeking) {
        try {
          el.currentTime = srcTime;
        } catch {
          /* ignore */
        }
      }
    } else if (!el.paused) el.pause();
  }

  private async loadMusic(assetId: string, musicId: string) {
    if (this.musicBuffers.has(assetId) || this.loadingMusic.has(assetId)) return;
    this.loadingMusic.add(assetId);
    const def = musicDefById(musicId);
    if (!def) return;
    try {
      const buf = await getMusicBuffer(def);
      this.musicBuffers.set(assetId, buf);
      this.requestRender();
    } finally {
      this.loadingMusic.delete(assetId);
    }
  }

  private stopMusicSession(clipId: string) {
    const m = this.musicSessions.get(clipId);
    if (m) {
      try {
        m.src.stop();
      } catch {
        /* ignore */
      }
      this.musicSessions.delete(clipId);
    }
  }

  private syncMusic(clip: Clip, track: Track, t: number, playing: boolean) {
    const st = useEditor.getState();
    const asset = st.assets.find((a) => a.id === clip.assetId);
    if (!asset?.musicId) return;
    const buf = this.musicBuffers.get(asset.id);
    if (!buf) {
      void this.loadMusic(asset.id, asset.musicId);
      return;
    }
    const local = t - clip.start;
    const v = this.clipVolume(clip, track, local);
    if (!playing) {
      this.stopMusicSession(clip.id);
      return;
    }
    let m = this.musicSessions.get(clip.id);
    if (!m || m.session !== this.session) {
      this.stopMusicSession(clip.id);
      if (!this.audioCtx) return;
      const src = this.audioCtx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const gain = this.audioCtx.createGain();
      gain.gain.value = v;
      src.connect(gain);
      gain.connect(this.audioCtx.destination);
      if (this.recDest) gain.connect(this.recDest);
      const offset = local % buf.duration;
      try {
        src.start(0, Math.max(0, offset));
      } catch {
        return;
      }
      m = { src, gain, session: this.session };
      this.musicSessions.set(clip.id, m);
    } else {
      m.gain.gain.value = v;
    }
  }

  // ===== menggambar klip =====
  private drawMediaFrame(ctx: CanvasRenderingContext2D, clip: Clip, t: number, w: number, h: number) {
    const st = useEditor.getState();
    const track = st.tracks.find((tr) => tr.id === clip.trackId);
    const local = t - clip.start;
    const progress = clamp(local / Math.max(0.01, clip.duration), 0, 1);
    const asset = st.assets.find((a) => a.id === clip.assetId);

    if (clip.kind === "text" && clip.text) {
      this.drawTextClip(ctx, clip, t, w, h);
      return;
    }
    if (!asset) return;

    let src: CanvasImageSource | null = null;
    let sw = 0;
    let sh = 0;
    if (clip.kind === "video") {
      const el = this.syncMedia(clip, track ?? { id: "", kind: "video", name: "", muted: false, hidden: false }, t, this.playing, true);
      if (el && el.videoWidth) {
        src = el;
        sw = el.videoWidth;
        sh = el.videoHeight;
      }
    } else if (clip.kind === "image") {
      const el = this.elFor(clip);
      if (el instanceof HTMLImageElement && el.complete && el.naturalWidth) {
        src = el;
        sw = el.naturalWidth;
        sh = el.naturalHeight;
      }
    }

    if (src) {
      const fx = clip.effects;
      const tr = clipTransform(fx, local, progress, t);
      ctx.save();
      ctx.filter = gradeFilterString(fx);
      // kadro: zoom & geser per klip (zoom 1 = ukuran asli / utuh, tanpa zoom otomatis)
      const layout = framingLayout(sw, sh, w, h, clip.zoom ?? 1);
      const panX = Math.max(-1, Math.min(1, clip.panX ?? 0));
      const panY = Math.max(-1, Math.min(1, clip.panY ?? 0));
      const dx = (w - layout.dw) / 2 + panX * layout.overX + tr.dx;
      const dy = (h - layout.dh) / 2 + panY * layout.overY + tr.dy;
      ctx.globalAlpha = 1;
      ctx.drawImage(src, dx, dy, layout.dw, layout.dh);
      ctx.restore();
      ctx.filter = "none";
      applyGradeTints(ctx, fx, w, h);
      applyOverlays(ctx, fx, w, h, { t, local, progress, grainPattern: this.grainPattern, scratch: this.scratch });
    }
  }

  private drawTextClip(ctx: CanvasRenderingContext2D, clip: Clip, t: number, w: number, h: number) {
    const td = clip.text;
    if (!td) return;
    const local = t - clip.start;
    const d = clip.duration;
    const inDur = Math.min(0.55, d * 0.35);
    const inP = clamp(local / Math.max(0.05, inDur), 0, 1);
    const outP = clamp((d - local) / Math.min(0.4, d * 0.3), 0, 1);
    let alpha = Math.min(inP >= 1 ? 1 : inP, outP);
    let dy = 0;
    let scale = 1;

    const content = td.content;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Word-wrap + auto-shrink: teks/judul panjang otomatis bersambung ke baris
    // bawah; bila blok teks lebih tinggi dari layar, ukuran font diperkecil
    // otomatis sampai semuanya muat dan terbaca.
    const maxW = w * 0.86;
    const computeLayout = (sz: number) => {
      ctx.font = `900 ${sz}px ${fontStack(td.font)}`;
      const ls = wrapCanvasText(ctx, content, maxW);
      // ukuran & font baris kedua (deskripsi) bisa diatur sendiri (menu Teks)
      const subSz = td.subSize && td.subSize > 0 ? td.subSize * h : sz * 0.42;
      let subs: string[] = [];
      if (td.sub) {
        ctx.font = `600 ${subSz}px ${fontStack(td.subFont || "sans")}`;
        subs = wrapCanvasText(ctx, td.sub, maxW);
      }
      const lh = sz * 1.12;
      const bh = ls.length * lh + (subs.length ? subs.length * subSz * 1.3 + subSz * 0.25 : 0);
      return { ls, subs, subSz, lineH: lh, blockH: bh };
    };
    let size = td.size * h;
    let layout = computeLayout(size);
    for (let guard = 0; layout.blockH > h * 0.8 && guard < 8; guard++) {
      size *= 0.86;
      layout = computeLayout(size);
    }
    const { ls: lines, subs, subSz: subSize, lineH, blockH } = layout;
    ctx.font = `900 ${size}px ${fontStack(td.font)}`;
    const posY = td.pos === "top" ? h * 0.16 + blockH / 2 : td.pos === "center" ? h / 2 : h * 0.86 - blockH / 2;

    switch (td.anim) {
      case "rise":
        dy = (1 - easeOut(inP)) * h * 0.09;
        alpha *= inP;
        break;
      case "slam": {
        const p = easeOut(Math.min(1, inP * 1.15));
        scale = 1 + (1 - p) * 1.6;
        alpha *= Math.min(1, inP * 2.2) * outP;
        if (local < 0.32 && inP >= 0.95) {
          dy = (Math.random() - 0.5) * 8;
        }
        break;
      }
      case "neon":
        alpha *= 0.78 + 0.22 * Math.abs(Math.sin(t * 18));
        break;
      case "tracking": {
        alpha *= inP;
        break;
      }
      case "glitch":
        alpha *= inP;
        break;
      case "wipe":
        alpha = 1;
        break;
      default:
        alpha *= inP;
    }
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.translate(w / 2, posY + dy);
    if (scale !== 1) ctx.scale(scale, scale);
    ctx.translate(-w / 2, -posY);

    // latar
    if (td.bg !== "none") {
      const padX = w * 0.03;
      const padY = size * 0.35;
      if (td.bg === "bar") {
        ctx.fillStyle = "rgba(0,0,0,0.62)";
        ctx.fillRect(0, posY + dy - blockH / 2 - padY, w, blockH + padY * 2);
      } else if (td.bg === "box") {
        ctx.fillStyle = "rgba(0,0,0,0.62)";
        const bx = Math.max(size * 0.3, w / 2 - maxW / 2 - padX);
        ctx.beginPath();
        ctx.roundRect(bx, posY + dy - blockH / 2 - padY, w - bx * 2, blockH + padY * 2, 12);
        ctx.fill();
      } else if (td.bg === "gradient") {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "rgba(0,0,0,0.75)");
        g.addColorStop(0.4, "rgba(0,0,0,0)");
        g.addColorStop(0.75, "rgba(0,0,0,0.75)");
        g.addColorStop(1, "rgba(0,0,0,0.9)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    }

    const drawLines = (drawer: (ln: string, i: number) => void) => {
      lines.forEach((ln, i) => drawer(ln, i));
    };

    const baseY = posY + dy - blockH / 2 + lineH / 2;
    const yFor = (i: number) => baseY + i * lineH;

    if (td.bg === "none" && td.stroke) {
      ctx.lineWidth = Math.max(2, size * 0.09);
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.lineJoin = "round";
    }

    const paintLine = (ln: string, y: number) => {
      if (td.bg === "none" && td.stroke) ctx.strokeText(ln, w / 2, y);
      ctx.fillStyle = td.color;
      ctx.fillText(ln, w / 2, y);
    };

    switch (td.anim) {
      case "typewriter": {
        const full = lines.join("\n");
        const nChars = Math.floor(full.length * Math.pow(inP, 0.85));
        let used = 0;
        drawLines((ln, i) => {
          const avail = Math.max(0, nChars - used);
          used += ln.length + 1;
          const shown = ln.slice(0, avail);
          const y = yFor(i);
          if (td.bg === "none" && td.stroke) {
            ctx.strokeText(shown, w / 2, y);
          }
          ctx.fillStyle = td.color;
          ctx.fillText(shown, w / 2, y);
          if (avail <= ln.length && avail > 0 && Math.floor(t * 3) % 2 === 0) {
            const cw = ctx.measureText(shown).width;
            ctx.fillRect(w / 2 + cw / 2 + 4, y - size * 0.42, size * 0.08, size * 0.84);
          }
        });
        break;
      }
      case "tracking": {
        const spread = (1 - easeOut(inP)) * size * 0.5;
        drawLines((ln, i) => {
          const chars = [...ln];
          const widths = chars.map((ch) => ctx.measureText(ch).width + spread);
          const totalW = widths.reduce((a, b) => a + b, 0);
          let x = w / 2 - totalW / 2;
          const y = yFor(i);
          for (let ci = 0; ci < chars.length; ci++) {
            if (td.bg === "none" && td.stroke) ctx.strokeText(chars[ci], x + widths[ci] / 2, y);
            ctx.fillStyle = td.color;
            ctx.fillText(chars[ci], x + widths[ci] / 2, y);
            x += widths[ci];
          }
        });
        break;
      }
      case "glitch": {
        drawLines((ln, i) => {
          const y = yFor(i);
          const jx = () => (Math.random() - 0.5) * size * 0.12 * (Math.random() > 0.7 ? 2.2 : 1);
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = clamp(alpha, 0, 1) * 0.6;
          ctx.fillStyle = "#ff2d55";
          ctx.fillText(ln, w / 2 + jx(), y);
          ctx.fillStyle = "#00e5ff";
          ctx.fillText(ln, w / 2 + jx(), y);
          ctx.restore();
          if (td.bg === "none" && td.stroke) ctx.strokeText(ln, w / 2, y);
          ctx.fillStyle = td.color;
          ctx.fillText(ln, w / 2 + jx() * 0.3, y);
        });
        break;
      }
      case "neon": {
        ctx.save();
        ctx.shadowColor = td.color;
        ctx.shadowBlur = size * 0.45;
        drawLines((ln, i) => {
          ctx.fillStyle = "#fff";
          ctx.fillText(ln, w / 2, yFor(i));
          ctx.fillText(ln, w / 2, yFor(i));
        });
        ctx.restore();
        break;
      }
      case "wipe": {
        const rev = easeOut(inP);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, w * rev, h);
        ctx.clip();
        drawLines((ln, i) => paintLine(ln, yFor(i)));
        ctx.restore();
        break;
      }
      default:
        drawLines((ln, i) => paintLine(ln, yFor(i)));
    }

    if (subs.length) {
      ctx.font = `600 ${subSize}px ${fontStack(td.subFont || "sans")}`;
      const subLineH = subSize * 1.3;
      const sy0 = baseY + lines.length * lineH + subSize * 0.4;
      subs.forEach((sl, i) => {
        const sy = sy0 + i * subLineH;
        if (td.bg === "none" && td.stroke) {
          ctx.lineWidth = Math.max(2, subSize * 0.14);
          ctx.strokeText(sl, w / 2, sy);
        }
        ctx.fillStyle = td.color;
        ctx.fillText(sl, w / 2, sy);
      });
    }
    ctx.restore();
  }

  // ===== kompositor utama =====
  renderFrame(t: number) {
    const ctx = this.ctx;
    if (!ctx || !this.canvas) return;
    const st = useEditor.getState();
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const clips = st.clips;
    if (!clips.length) {
      this.drawBrand(ctx, w, h);
      return;
    }
    // di ujung timeline, tampilkan frame terakhir (bukan layar hitam)
    const total = totalDuration(clips);
    const tt = t >= total && total > 0 ? Math.max(0, total - 0.001) : t;

    for (const track of st.tracks) {
      if (track.kind === "audio") {
        for (const c of clips) {
          if (c.trackId !== track.id) continue;
          if (tt < c.start || tt >= c.start + c.duration) continue;
          const asset = st.assets.find((a) => a.id === c.assetId);
          if (asset?.musicId) this.syncMusic(c, track, tt, this.playing);
          else this.syncAudioEl(c, track, tt, this.playing);
        }
        continue;
      }
      if (track.hidden) continue;
      const active = [...clips].filter((c) => c.trackId === track.id && c.start <= tt && tt < c.start + c.duration).sort((a, b) => a.start - b.start).pop();
      if (!active) continue;

      // Track teks: SEMUA klip teks yang aktif digambar bertumpuk (judul di atas
      // + part di bawah bisa tampil bersamaan; sebelumnya saling menimpa sehingga
      // salah satunya tidak pernah terlihat di hasil render).
      if (track.kind === "text") {
        const actives = clips.filter((c) => c.trackId === track.id && c.start <= tt && tt < c.start + c.duration).sort((a, b) => a.start - b.start);
        for (const tc of actives) this.drawMediaFrame(ctx, tc, tt, w, h);
        continue;
      }

      let donor: Clip | null = null;
      let transP = 0;
      if (active.transition && active.start > 0.001) {
        const dur = Math.max(0.1, active.transition.duration);
        const localT = tt - active.start;
        if (localT < dur) {
          donor = clips.find((c) => c.trackId === track.id && c.id !== active.id && Math.abs(c.start + c.duration - active.start) < 0.06) ?? null;
          if (donor) transP = clamp(localT / dur, 0, 1);
        }
      }

      if (donor) {
        this.tmpA.width = w;
        this.tmpA.height = h;
        this.tmpB.width = w;
        this.tmpB.height = h;
        const aCtx = this.tmpA.getContext("2d");
        const bCtx = this.tmpB.getContext("2d");
        if (aCtx && bCtx) {
          aCtx.fillStyle = "#000";
          aCtx.fillRect(0, 0, w, h);
          bCtx.fillStyle = "#000";
          bCtx.fillRect(0, 0, w, h);
          this.drawMediaFrame(aCtx, donor, tt, w, h);
          this.drawMediaFrame(bCtx, active, tt, w, h);
          applyTransition(active.transition!.type, ctx, this.tmpA, this.tmpB, transP, w, h, {
            scratch: this.scratch,
            noise: this.tvNoise,
            accent: "#22d3ee",
          });
        }
      } else {
        this.drawMediaFrame(ctx, active, tt, w, h);
      }
    }
  }

  private drawBrand(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#05060f");
    g.addColorStop(0.5, "#0b1030");
    g.addColorStop(1, "#12042a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = 40;
    ctx.fillStyle = "#eafcff";
    ctx.font = `900 ${h * 0.13}px ${fontStack("display")}`;
    ctx.fillText("NOVACUT", w / 2, h * 0.44);
    ctx.shadowBlur = 0;
    ctx.font = `600 ${h * 0.038}px ${fontStack("sans")}`;
    ctx.fillStyle = "#67e8f9";
    ctx.fillText("Impor media dari panel kiri untuk mulai mengedit", w / 2, h * 0.56);
    ctx.restore();
  }

  // ===== transport =====
  play(opts?: { stopAt?: number; onDone?: () => void }) {
    this.ensureAudio();
    this.stopAt = opts?.stopAt ?? null;
    this.onDone = opts?.onDone ?? null;
    const st = useEditor.getState();
    const end = this.stopAt ?? totalDuration(st.clips);
    if (st.playhead >= end - 0.02) st.setPlayhead(0);
    this.session++;
    this.playing = true;
    st.setPlaying(true);
    this.lastTs = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
  }

  private loop = (ts: number) => {
    if (!this.playing) return;
    const dt = Math.min(0.2, (ts - this.lastTs) / 1000);
    this.lastTs = ts;
    const st = useEditor.getState();
    const end = this.stopAt ?? totalDuration(st.clips);
    let t = st.playhead + dt;
    if (t >= end) {
      t = end;
      st.setPlayhead(t);
      this.renderFrame(t);
      this.pause();
      const cb = this.onDone;
      this.onDone = null;
      this.stopAt = null;
      if (cb) setTimeout(cb, 120);
      return;
    }
    st.setPlayhead(t);
    this.renderFrame(t);
    this.raf = requestAnimationFrame(this.loop);
  };

  pause() {
    this.playing = false;
    cancelAnimationFrame(this.raf);
    useEditor.getState().setPlaying(false);
    for (const [, el] of this.els) {
      if (el instanceof HTMLVideoElement || el instanceof HTMLAudioElement) el.pause();
    }
    for (const id of [...this.musicSessions.keys()]) this.stopMusicSession(id);
    this.session++;
    this.requestRender();
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  seek(t: number) {
    const st = useEditor.getState();
    const end = Math.max(0.001, totalDuration(st.clips));
    const tt = clamp(t, 0, end);
    st.setPlayhead(tt);
    if (this.playing) this.session++;
    this.renderFrame(tt);
  }

  // ===== preview musik =====
  async previewMusic(musicId: string) {
    this.ensureAudio();
    this.stopPreview();
    const def = musicDefById(musicId);
    if (!def || !this.audioCtx) return;
    const buf = await getMusicBuffer(def);
    if (!this.audioCtx) return;
    const src = this.audioCtx.createBufferSource();
    src.buffer = buf;
    const g = this.audioCtx.createGain();
    g.gain.value = 0.85;
    src.connect(g).connect(this.audioCtx.destination);
    src.start();
    this.previewSource = src;
  }

  stopPreview() {
    if (this.previewSource) {
      try {
        this.previewSource.stop();
      } catch {
        /* ignore */
      }
      this.previewSource = null;
    }
  }

  captureStream(fps = 30): MediaStream | null {
    if (!this.canvas || typeof this.canvas.captureStream !== "function") return null;
    return this.canvas.captureStream(fps);
  }
}

export const engine = new EditorEngine();

if (typeof window !== "undefined") {
  // gambar ulang saat font bundel selesai dimuat (preview memakai font asli)
  window.addEventListener("novacut:fonts-ready", () => engine.requestRender());
}

export function projectDuration(st: EditorState): number {
  return totalDuration(st.clips);
}

export function timeDisplay(t: number): string {
  return fmtTime(t, true);
}
