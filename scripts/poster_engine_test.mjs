// Tes mesin POSTER HOLLYWOOD dgn frame ASLI dari video user (Playwright/Chromium)
// Membuktikan: latar poster BUKAN hitam — frame video di-grade + furnitur poster.
import { readFileSync, writeFileSync } from "fs";
import { chromium } from "playwright";

const frameB64 = readFileSync("/tmp/render/frame_real.jpg").toString("base64");
const TITLE = "KELAS NAKAL USIR 99 GURU, TAPI TAK TAHU GURU BARU BOS MAFIA BAWAH TANAH.";
const PART = "PART 1/256";

// Salinan 1:1 parameter gaya "aksi" (p1 Benteng Terakhir) dari posterStyles.ts
const ST = {
  filter: "contrast(1.22) saturate(1.22) brightness(0.97)",
  tint: "#0d3a4d", tintA: 0.22,
  glow: "#ff9d3f", glowA: 0.13,
  vignette: 0.55, grain: 0.14, scrim: 0.55, accent: "#ffd166",
  tagline: "SATU ORANG. SATU PELUANG.",
};

const html = `<!doctype html><html><head><meta charset="utf8"><style>body{margin:0;background:#222}</style></head><body>
<canvas id="c" width="1280" height="720"></canvas>
<script>
const IMG = new Image();
IMG.src = "data:image/jpeg;base64,${frameB64}";
function grainCanvas() {
  const c = document.createElement("canvas"); c.width = 128; c.height = 128;
  const g = c.getContext("2d"); const d = g.createImageData(128, 128);
  for (let i = 0; i < d.data.length; i += 4) { const v = 110 + Math.random() * 90; d.data[i]=v; d.data[i+1]=v; d.data[i+2]=v; d.data[i+3]=255; }
  g.putImageData(d, 0, 0); return c;
}
function wrapText(ctx, text, maxW, maxLines) {
  const words = text.split(" "); const lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}
function drawPoster(ctx, img, w, h) {
  const st = ${JSON.stringify(ST)};
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
  const sw = img.naturalWidth || 0, sh = img.naturalHeight || 0;
  if (img && sw && sh) {
    const s = Math.max(w / sw, h / sh) * 1.06;
    const dw = sw * s, dh = sh * s, dx = (w - dw) / 2, dy = (h - dh) / 2;
    ctx.save();
    ctx.filter = st.filter;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = st.tintA; ctx.fillStyle = st.tint; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = st.glowA;
    const gg = ctx.createLinearGradient(0, h * 0.15, w, h);
    gg.addColorStop(0, st.glow); gg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gg; ctx.fillRect(0, 0, w, h);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 0.13;
    ctx.filter = "brightness(1.35) blur(14px)";
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }
  const vg = ctx.createRadialGradient(w/2, h/2, h*0.32, w/2, h/2, h*0.98);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + st.vignette + ")");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);
  const pat = ctx.createPattern(grainCanvas(), "repeat");
  if (pat && st.grain > 0) { ctx.save(); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = st.grain; ctx.fillStyle = pat; ctx.fillRect(0, 0, w, h); ctx.restore(); }
  const gTop = ctx.createLinearGradient(0, 0, 0, h * 0.28);
  gTop.addColorStop(0, "rgba(0,0,0,0.6)"); gTop.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gTop; ctx.fillRect(0, 0, w, h * 0.28);
  const gBot = ctx.createLinearGradient(0, h * 0.52, 0, h);
  gBot.addColorStop(0, "rgba(0,0,0,0)"); gBot.addColorStop(1, "rgba(0,0,0," + Math.min(0.85, 0.35 + st.scrim * 0.5) + ")");
  ctx.fillStyle = gBot; ctx.fillRect(0, h * 0.52, w, h * 0.48);
  // furnitur atas (1:1 dengan covers.ts)
  ctx.save();
  ctx.textAlign = "center"; ctx.shadowColor = "rgba(0,0,0,0.85)"; ctx.shadowBlur = Math.max(4, h * 0.012);
  (ctx).letterSpacing = (h * 0.012) + "px";
  ctx.font = "700 " + Math.max(9, h * 0.024) + "px 'Arial Narrow', sans-serif";
  ctx.fillStyle = st.accent;
  ctx.fillText("NOVACUT PICTURES MEMPERSEMBAHKAN", w / 2, h * 0.055);
  (ctx).letterSpacing = (h * 0.006) + "px";
  ctx.font = "400 " + Math.max(10, h * 0.028) + "px 'Arial Narrow', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.fillText(st.tagline, w / 2, h * 0.104);
  (ctx).letterSpacing = (h * 0.01) + "px";
  ctx.font = "400 " + Math.max(8, h * 0.019) + "px 'Arial Narrow', sans-serif";
  ctx.fillStyle = "rgba(228,228,228,0.72)";
  ctx.fillText("SEBUAH PRODUKSI FILM NOVACUT STUDIO", w / 2, h * 0.15);
  (ctx).letterSpacing = "0px";
  ctx.restore();
  // klip teks dinamis (judul di bawah — posisi default aplikasi)
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 " + h * 0.042 + "px Impact, 'Arial Narrow', sans-serif";
  const lines = wrapText(ctx, ${JSON.stringify(TITLE)}, w * 0.88, 2);
  lines.forEach((ln, i) => {
    const y = h * 0.84 + i * h * 0.05;
    ctx.lineWidth = h * 0.006; ctx.strokeStyle = "rgba(0,0,0,0.9)"; ctx.strokeText(ln, w / 2, y);
    ctx.fillStyle = "#fff"; ctx.fillText(ln, w / 2, y);
  });
  ctx.font = "700 " + h * 0.026 + "px 'Arial Narrow', sans-serif";
  ctx.fillStyle = "#fff"; ctx.fillText(${JSON.stringify(PART)}, w / 2, h * 0.94);
  ctx.restore();
}
window.renderDone = (async () => {
  await new Promise((res, rej) => { IMG.onload = res; IMG.onerror = () => rej(new Error("frame gagal")); });
  const c = document.getElementById("c");
  const ctx = c.getContext("2d");
  drawPoster(ctx, IMG, c.width, c.height);
  // statistik pixel: ratio non-hitam & ratio non-abu-erat (bukti bukan layar hitam)
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let dark = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) { const lum = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2]; if (lum < 16) dark++; n++; }
  return { darkRatio: (dark / n).toFixed(3), size: c.width + "x" + c.height };
})();
</script></body></html>`;

writeFileSync("/tmp/render/poster_test.html", html);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1300, height: 800 } });
await page.goto("file:///tmp/render/poster_test.html");
const stats = await page.evaluate(() => window.renderDone);
const dataUrl = await page.evaluate(() => document.getElementById("c").toDataURL("image/png"));
writeFileSync("/tmp/render/poster_test.png", Buffer.from(dataUrl.split(",")[1], "base64"));
await browser.close();
console.log("STATISTIK:", JSON.stringify(stats));
console.log("PNG tersimpan:", "/tmp/render/poster_test.png");
