// Tes mesin POSTER HOLLYWOOD v1.0.33 dgn frame ASLI video user (Playwright/Chromium)
// Kasus A: frame asli → poster ter-grade. Kasus B: decoder gagal (img null) →
// GRADASI SINEMATIK + furnitur, BUKAN hitam. Juga uji deteksi piksel frame hitam.
import { readFileSync, writeFileSync } from "fs";
import { chromium } from "playwright";

const frameB64 = readFileSync("/tmp/render/frame_real.jpg").toString("base64");
const TITLE = "KELAS NAKAL USIR 99 GURU, TAPI TAK TAHU GURU BARU BOS MAFIA BAWAH TANAH.";
const PART = "PART 1/256";

const ST = {
  filter: "contrast(1.22) saturate(1.22) brightness(0.97)",
  tint: "#0d3a4d", tintA: 0.22,
  glow: "#ff9d3f", glowA: 0.13,
  vignette: 0.55, grain: 0.14, scrim: 0.55, accent: "#ffd166",
  tagline: "SATU ORANG. SATU PELUANG.",
};

const html = `<!doctype html><html><head><meta charset="utf8"><style>body{margin:0;background:#222}</style></head><body>
<canvas id="cA" width="1280" height="720"></canvas>
<canvas id="cB" width="1280" height="720"></canvas>
<script>
const IMG = new Image();
IMG.src = "data:image/jpeg;base64,${frameB64}";
const ST = ${JSON.stringify(ST)};
function grainCanvas() {
  const c = document.createElement("canvas"); c.width = 128; c.height = 128;
  const g = c.getContext("2d"); const d = g.createImageData(128, 128);
  for (let i = 0; i < d.data.length; i += 4) { const v = 110 + Math.random() * 90; d.data[i]=v; d.data[i+1]=v; d.data[i+2]=v; d.data[i+3]=255; }
  g.putImageData(d, 0, 0); return c;
}
function canvasIsBlack(c) { // salinan 1:1 v1.0.33
  const ctx = c.getContext("2d"); if (!ctx || !c.width || !c.height) return true;
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  let sum = 0, max = 0, n = 0;
  const step = Math.max(4, Math.floor(d.length / 4 / 4096) * 4);
  for (let i = 0; i < d.length; i += step) { const lum = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2]; sum += lum; if (lum > max) max = lum; n++; }
  return n === 0 || (sum / n < 5 && max < 24);
}
function wrapText(ctx, text, maxW, maxLines) {
  const words = text.split(" "); const lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}
function drawPoster(ctx, img, w, h) { // salinan drawPosterBackground v1.0.33
  const st = ST;
  const sw = img ? img.naturalWidth : 0, sh = img ? img.naturalHeight : 0;
  if (img && sw && sh) {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
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
  } else {
    // v1.0.33: GRADASI SINEMATIK — bukan hitam
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, st.glow); g.addColorStop(0.55, st.tint); g.addColorStop(1, "#05050a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const rg = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, h * 0.78);
    rg.addColorStop(0, "rgba(255,255,255,0.15)"); rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
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
function stats(c) {
  const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let dark = 0, sum = 0, n = 0, colorful = 0;
  for (let i = 0; i < d.length; i += 16) {
    const lum = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
    if (lum < 16) dark++;
    const mx = Math.max(d[i], d[i+1], d[i+2]), mn = Math.min(d[i], d[i+1], d[i+2]);
    if (mx - mn > 30) colorful++;
    sum += lum; n++;
  }
  return { darkRatio: (dark / n).toFixed(3), meanLum: (sum / n).toFixed(1), colorfulRatio: (colorful / n).toFixed(3) };
}
window.renderDone = (async () => {
  await new Promise((res, rej) => { IMG.onload = res; IMG.onerror = () => rej(new Error("frame gagal")); });
  const cA = document.getElementById("cA"), cB = document.getElementById("cB");
  drawPoster(cA.getContext("2d"), IMG, cA.width, cA.height);
  drawPoster(cB.getContext("2d"), null, cB.width, cB.height);
  // uji deteksi frame hitam (seperti decoder GPU yang gagal offscreen)
  const cb = document.createElement("canvas"); cb.width = 640; cb.height = 360;
  cb.getContext("2d").fillRect(0, 0, 640, 360);
  const detBlack = canvasIsBlack(cb);
  const detReal = canvasIsBlack(cA);
  return { A_realFrame: stats(cA), B_gradient: stats(cB), deteksiHitam_frameAsli: detReal, deteksiHitam_frameHitam: detBlack };
})();
</script></body></html>`;

writeFileSync("/tmp/render/poster_test33.html", html);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1300, height: 1560 } });
await page.goto("file:///tmp/render/poster_test33.html");
const res = await page.evaluate(() => window.renderDone);
for (const [name, id] of [["A_frame_asli", "cA"], ["B_gradasi_tanpa_frame", "cB"]]) {
  const dataUrl = await page.evaluate((cid) => document.getElementById(cid).toDataURL("image/png"), id);
  writeFileSync(`/tmp/render/poster33_${name}.png`, Buffer.from(dataUrl.split(",")[1], "base64"));
}
await browser.close();
console.log("HASIL:", JSON.stringify(res, null, 1));
