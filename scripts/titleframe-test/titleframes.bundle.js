// src/lib/editor/titleFrames.ts
var TITLE_FRAMES = [
  { id: "", label: "Tanpa Bingkai", desc: "Tulisan judul polos tanpa bingkai" },
  { id: "t1", label: "Dinamis Miring", desc: "Gaya FRAME 1: banner miring dengan lapisan biru & pink" },
  { id: "t2", label: "Merah Biru", desc: "Gaya FRAME 2: bingkai merah tebal + bar biru gradien atas & bawah" },
  { id: "t3", label: "Berlian Biru", desc: "Gaya FRAME 3: banner rounded + ikon belah ketupat biru di kiri" },
  { id: "t4", label: "Mewah Emas", desc: "Gaya FRAME 4: garis emas ganda + ornamen belah ketupat & manik emas" },
  { id: "t5", label: "Emas Mahkota", desc: "Gaya FRAME 5: bingkai emas klasik dengan mahkota di tengah atas" },
  { id: "t6", label: "Kartun Oranye", desc: "Gaya FRAME 6: garis hitam tebal + bayangan oranye + aksen lucu" },
  { id: "f1", label: "HUD Cyber", desc: "Futuristik: sudut potong 45° dengan bracket cyan menyala" },
  { id: "f2", label: "Neon Ungu", desc: "Futuristik: bingkai neon ungu-magenta menyala + sirkuit samping" },
  { id: "f3", label: "Panel Sci-Fi", desc: "Futuristik: panel sudut miring ala nameplate sci-fi aksen teal" },
  { id: "f4", label: "Tech Grid", desc: "Futuristik: garis ganda biru-putih + kotak sudut & segitiga penunjuk" }
];
function saneTitleFrame(v) {
  if (typeof v !== "string")
    return "";
  return TITLE_FRAMES.some((f) => f.id === v) ? v : "";
}
function saneFrameScale(v) {
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n) || n <= 0)
    return 1;
  return Math.max(0.6, Math.min(2.5, n));
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, Math.min(w, h) / 2)));
}
function skewPath(ctx, x, y, w, h, sk) {
  ctx.beginPath();
  ctx.moveTo(x + sk, y);
  ctx.lineTo(x + w + sk * 0.35, y);
  ctx.lineTo(x + w - sk, y + h);
  ctx.lineTo(x - sk * 0.35, y + h);
  ctx.closePath();
}
function chamferPath(ctx, x, y, w, h, c) {
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}
function goldGrad(ctx, x, y, h) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#7c4a12");
  g.addColorStop(0.28, "#f7d98c");
  g.addColorStop(0.52, "#c9922e");
  g.addColorStop(0.78, "#ffe9a8");
  g.addColorStop(1, "#8a5a1e");
  return g;
}
function drawTitleFrame(ctx, id, x, y, w, h) {
  if (!id)
    return;
  const lw = Math.max(1, h * 0.045);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  switch (id) {
    case "t1": {
      const sk = h * 0.16;
      const ox = h * 0.1;
      const oy = h * 0.12;
      ctx.fillStyle = "rgba(96,165,250,0.92)";
      skewPath(ctx, x - ox * 0.4, y - oy, w, h, sk);
      ctx.fill();
      ctx.fillStyle = "rgba(244,114,182,0.92)";
      skewPath(ctx, x + ox * 0.4, y + oy, w, h, sk);
      ctx.fill();
      ctx.strokeStyle = "rgba(10,10,14,0.9)";
      ctx.lineWidth = lw;
      skewPath(ctx, x, y, w, h, sk);
      ctx.stroke();
      break;
    }
    case "t2": {
      const bh = h * 0.2;
      const bg = ctx.createLinearGradient(x, y, x + w, y + bh);
      bg.addColorStop(0, "#1e3fa8");
      bg.addColorStop(0.5, "#2563eb");
      bg.addColorStop(1, "#4f7cff");
      ctx.fillStyle = bg;
      ctx.fillRect(x + w * 0.02, y - bh * 0.55, w * 0.96, bh);
      ctx.fillRect(x + w * 0.02, y + h - bh * 0.45, w * 0.96, bh);
      ctx.strokeStyle = "rgba(127,29,29,0.85)";
      ctx.lineWidth = lw * 3;
      ctx.strokeRect(x + lw * 1.6, y + lw * 1.6, w, h);
      const rg = ctx.createLinearGradient(x, y, x + w, y + h);
      rg.addColorStop(0, "#b91c1c");
      rg.addColorStop(0.5, "#ef4444");
      rg.addColorStop(1, "#dc2626");
      ctx.strokeStyle = rg;
      ctx.lineWidth = lw * 3;
      ctx.strokeRect(x, y, w, h);
      break;
    }
    case "t3": {
      ctx.strokeStyle = "rgba(229,231,235,0.95)";
      ctx.lineWidth = lw * 1.2;
      rr(ctx, x, y, w, h, h * 0.26);
      ctx.stroke();
      const d = h * 1.05;
      const cx = x + h * 0.06;
      const cy = y + h / 2;
      ctx.save();
      ctx.translate(cx + lw * 1.2, cy + lw * 1.2);
      ctx.rotate(Math.PI / 4);
      ctx.strokeStyle = "rgba(30,58,138,0.9)";
      ctx.lineWidth = lw * 1.1;
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.18);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      const dg = ctx.createLinearGradient(0, -d / 2, 0, d / 2);
      dg.addColorStop(0, "#3b82f6");
      dg.addColorStop(1, "#1d4ed8");
      ctx.fillStyle = dg;
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.18);
      ctx.fill();
      ctx.strokeStyle = "rgba(191,219,254,0.9)";
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
      ctx.restore();
      break;
    }
    case "t4": {
      const g = goldGrad(ctx, x, y, h);
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.1;
      rr(ctx, x, y, w, h, h / 2);
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = lw * 0.6;
      rr(ctx, x + h * 0.14, y + h * 0.14, w - h * 0.28, h - h * 0.28, (h - h * 0.28) / 2);
      ctx.stroke();
      ctx.restore();
      const cx = x + h * 0.3;
      const cy = y + h / 2;
      const d = h * 0.4;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "rgba(20,16,8,0.4)";
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.12);
      ctx.fill();
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 0.9;
      rr(ctx, -d / 2, -d / 2, d, d, d * 0.12);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#d99a2b";
      ctx.strokeStyle = "#7c4a12";
      ctx.lineWidth = lw * 0.35;
      for (const by of [cy - d * 0.94, cy + d * 0.94]) {
        ctx.beginPath();
        ctx.arc(cx, by, h * 0.055, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case "t5": {
      const g = goldGrad(ctx, x, y, h);
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.25;
      rr(ctx, x, y, w, h, h * 0.2);
      ctx.stroke();
      const cw = h * 0.42;
      const cx = x + w / 2;
      const ch = h * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx - cw / 2, y + lw * 0.6);
      ctx.arc(cx - cw * 0.28, y - ch * 0.28, cw * 0.22, Math.PI * 0.9, Math.PI * 1.9);
      ctx.quadraticCurveTo(cx - cw * 0.16, y - ch * 0.55, cx, y - ch);
      ctx.quadraticCurveTo(cx + cw * 0.16, y - ch * 0.55, cx + cw * 0.28, y - ch * 0.28);
      ctx.arc(cx + cw * 0.28, y - ch * 0.28, cw * 0.22, Math.PI * 1.1, Math.PI * 0.1);
      ctx.lineTo(cx + cw / 2, y + lw * 0.6);
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.1;
      ctx.stroke();
      break;
    }
    case "t6": {
      ctx.strokeStyle = "rgba(249,168,37,0.95)";
      ctx.lineWidth = lw * 2.4;
      const so = h * 0.1;
      const r = h * 0.3;
      ctx.beginPath();
      ctx.moveTo(x - so + r, y - so);
      ctx.lineTo(x + w * 0.55, y - so);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - so, y - so + r);
      ctx.quadraticCurveTo(x - so, y + h + so * 0.9, x - so + r, y + h + so * 0.9);
      ctx.lineTo(x + w - r, y + h + so * 0.9);
      ctx.quadraticCurveTo(x + w + so * 0.4, y + h + so * 0.9, x + w + so * 0.4, y + h + so * 0.9 - r);
      ctx.stroke();
      ctx.strokeStyle = "rgba(12,12,16,0.94)";
      ctx.lineWidth = lw * 2;
      rr(ctx, x, y, w, h, h * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + h * 0.04, y + h * 0.03, h * 0.13, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = lw * 0.9;
      ctx.strokeStyle = "rgba(12,12,16,0.94)";
      ctx.stroke();
      const dx = x + w - h * 0.02;
      const dy = y + h * 0.02;
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(Math.PI / 4);
      const s = h * 0.22;
      ctx.fillStyle = "#f59e0b";
      rr(ctx, -s / 2, -s / 2, s, s, s * 0.15);
      ctx.fill();
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
      ctx.restore();
      const sq = h * 0.13;
      ctx.fillStyle = "#f59e0b";
      rr(ctx, dx - sq / 2, dy + h * 0.2, sq, sq, sq * 0.2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "f1": {
      ctx.shadowColor = "rgba(34,211,238,0.9)";
      ctx.shadowBlur = h * 0.22;
      ctx.strokeStyle = "rgba(34,211,238,0.9)";
      ctx.lineWidth = lw;
      chamferPath(ctx, x, y, w, h, h * 0.3);
      ctx.stroke();
      ctx.shadowBlur = 0;
      const c = h * 0.3;
      const bl = h * 0.32;
      ctx.strokeStyle = "#a5f3fc";
      ctx.lineWidth = lw * 1.8;
      ctx.beginPath();
      ctx.moveTo(x + c, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + c);
      ctx.moveTo(x + w - c, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - c);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w - bl, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + bl * 0.6);
      ctx.moveTo(x, y + h - bl * 0.6);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + bl, y + h);
      ctx.stroke();
      ctx.fillStyle = "#67e8f9";
      for (const [px, py] of [[x + c, y], [x + w - c, y], [x, y + c], [x + w, y + h - c], [x + w - c, y + h], [x + c, y + h], [x + w, y + c], [x, y + h - c]]) {
        ctx.beginPath();
        ctx.arc(px, py, h * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(103,232,249,0.85)";
      ctx.lineWidth = lw * 0.8;
      for (let i = -2;i <= 2; i++) {
        const tx = x + w / 2 + i * h * 0.16;
        const up = i % 2 === 0;
        ctx.beginPath();
        ctx.moveTo(tx, up ? y - h * 0.1 : y - h * 0.05);
        ctx.lineTo(tx, y - h * 0.02);
        ctx.stroke();
      }
      break;
    }
    case "f2": {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, "#d946ef");
      g.addColorStop(0.5, "#a855f7");
      g.addColorStop(1, "#7c3aed");
      ctx.shadowColor = "rgba(217,70,239,0.85)";
      ctx.shadowBlur = h * 0.25;
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 1.3;
      rr(ctx, x, y, w, h, h * 0.16);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = lw * 0.6;
      rr(ctx, x + h * 0.12, y + h * 0.12, w - h * 0.24, h - h * 0.24, h * 0.1);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = g;
      ctx.lineWidth = lw * 0.9;
      const my = y + h / 2;
      ctx.beginPath();
      ctx.moveTo(x - h * 0.2, my);
      ctx.lineTo(x, my);
      ctx.moveTo(x + w, my);
      ctx.lineTo(x + w + h * 0.2, my);
      ctx.stroke();
      ctx.fillStyle = "#e879f9";
      ctx.fillRect(x - h * 0.26, my - h * 0.05, h * 0.07, h * 0.1);
      ctx.fillRect(x + w + h * 0.19, my - h * 0.05, h * 0.07, h * 0.1);
      ctx.strokeStyle = "#f0abfc";
      ctx.lineWidth = lw * 0.7;
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y, h * 0.05, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h, h * 0.05, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "f3": {
      const c1 = h * 0.5;
      const c2 = h * 0.18;
      ctx.strokeStyle = "rgba(45,212,191,0.95)";
      ctx.lineWidth = lw * 1.2;
      ctx.beginPath();
      ctx.moveTo(x + c1, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + c2, y + h);
      ctx.lineTo(x, y + h - c2);
      ctx.lineTo(x, y + c1 * 0.5);
      ctx.closePath();
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = "#ccfbf1";
      ctx.lineWidth = lw * 0.6;
      ctx.beginPath();
      ctx.moveTo(x + c1 + h * 0.1, y + h * 0.12);
      ctx.lineTo(x + w - h * 0.12, y + h * 0.12);
      ctx.lineTo(x + w - h * 0.12, y + h - h * 0.12);
      ctx.lineTo(x + c2 + h * 0.08, y + h - h * 0.12);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#2dd4bf";
      const px = x + h * 0.16;
      const py = y + h / 2;
      const ps = h * 0.12;
      ctx.beginPath();
      ctx.moveTo(px, py - ps);
      ctx.lineTo(px + ps * 1.4, py);
      ctx.lineTo(px, py + ps);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(45,212,191,0.8)";
      ctx.lineWidth = lw * 0.7;
      for (let i = 0;i < 3; i++) {
        const lx = x + w - h * 0.55 + i * h * 0.18;
        ctx.beginPath();
        ctx.moveTo(lx, y + h + h * 0.06);
        ctx.lineTo(lx + h * 0.1, y + h + h * 0.06);
        ctx.stroke();
      }
      break;
    }
    case "f4": {
      ctx.strokeStyle = "rgba(191,219,254,0.9)";
      ctx.lineWidth = lw * 0.7;
      ctx.strokeRect(x, y, w, h);
      ctx.save();
      ctx.setLineDash([h * 0.22, h * 0.12]);
      ctx.strokeStyle = "rgba(59,130,246,0.95)";
      ctx.lineWidth = lw * 1.2;
      ctx.strokeRect(x + h * 0.13, y + h * 0.13, w - h * 0.26, h - h * 0.26);
      ctx.restore();
      ctx.fillStyle = "#3b82f6";
      const s = h * 0.12;
      for (const [px, py] of [[x, y], [x + w - s, y], [x, y + h - s], [x + w - s, y + h - s]]) {
        rr(ctx, px, py, s, s, s * 0.25);
        ctx.fill();
      }
      ctx.fillStyle = "#93c5fd";
      const cx = x + w / 2;
      const ts = h * 0.09;
      ctx.beginPath();
      ctx.moveTo(cx, y - ts);
      ctx.lineTo(cx + ts, y - ts * 0.1);
      ctx.lineTo(cx - ts, y - ts * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, y + h + ts);
      ctx.lineTo(cx + ts, y + h + ts * 0.1);
      ctx.lineTo(cx - ts, y + h + ts * 0.1);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}
export {
  saneTitleFrame,
  saneFrameScale,
  drawTitleFrame,
  TITLE_FRAMES
};
