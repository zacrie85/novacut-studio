// UJI VISUAL BINGKAI v1.0.25 — gambar SEMUA gaya bingkai dengan drawTextOverlay
// asli (jalur yang sama dengan hasil export) ke grid PNG untuk diperiksa visual
// terhadap 5 gambar referensi pengguna.
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";

const URL_BASE = process.argv[2] || "http://localhost:3210/";
const OUT = "/tmp/v1025/frames/grid.png";
mkdirSync("/tmp/v1025/frames", { recursive: true });

const srv = createServer((_q, r) => {
  r.writeHead(200, { "content-type": "text/html" });
  r.end("<!doctype html><title>e2e</title>");
});
await new Promise((res) => srv.listen(0, "127.0.0.1", res));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
page.on("pageerror", (e) => console.log("PAGEERROR", String(e).slice(0, 200)));
await page.goto(URL_BASE, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => !!window.__NOVA_TEST__, null, { timeout: 120000 });
await page.waitForTimeout(1500); // beri waktu font app dimuat

const dataUrl = await page.evaluate(async () => {
  const { TITLE_FRAMES, drawTextOverlay } = window.__NOVA_TEST__;
  const COLS = 2;
  const W = 480;
  const H = 270;
  const rows = Math.ceil(TITLE_FRAMES.length / COLS);
  const c = document.createElement("canvas");
  c.width = W * COLS;
  c.height = H * rows;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < TITLE_FRAMES.length; i++) {
    const f = TITLE_FRAMES[i];
    const ox = (i % COLS) * W;
    const oy = Math.floor(i / COLS) * H;
    const cell = document.createElement("canvas");
    cell.width = W;
    cell.height = H;
    const cc = cell.getContext("2d");
    const g = cc.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1b2a4a");
    g.addColorStop(0.55, "#3d2f63");
    g.addColorStop(1, "#0b0d14");
    cc.fillStyle = g;
    cc.fillRect(0, 0, W, H);
    cc.fillStyle = "rgba(255,196,88,0.85)";
    cc.beginPath();
    cc.arc(W * 0.72, H * 0.28, H * 0.12, 0, Math.PI * 2);
    cc.fill();
    // overlay teks asli: judul + deskripsi, part "Part 1" utk slot komposit t7
    drawTextOverlay(
      cc,
      W,
      H,
      {
        content: "HATIKU BAGAI TERPENJARA",
        sub: "DC PRODUCTION",
        size: 0.085,
        subSize: 0.038,
        color: "#ffffff",
        font: "condensed",
        subFont: "condensed",
        anim: "none",
        pos: "top",
        bg: "none",
        stroke: true,
        posV: 0.85,
        frame: f.id || undefined,
        partLine: "Part 1",
      },
      10,
      0,
      12
    );
    ctx.drawImage(cell, ox, oy);
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(ox, oy, 220, 24);
    ctx.fillStyle = "#9ce8ff";
    ctx.font = "700 15px system-ui, sans-serif";
    ctx.fillText(`${f.id || "(tanpa)"} — ${f.label}`, ox + 6, oy + 17);
  }
  return c.toDataURL("image/png");
});

writeFileSync(OUT, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
await browser.close();
srv.close();
console.log("grid bingkai tersimpan:", OUT);
