// SMOKE TEST UI v1.0.25 — alur wizard Mode Sederhana sampai langkah Export:
// pastikan kartu POTONG MULAI & AKHIR, WATERMARK, menu BINGKAI PART (langkah 3)
// tampil tanpa error & bisa diinteraksi.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL_BASE = process.argv[2] || "http://localhost:3000/";
mkdirSync("/tmp/v1025/smoke", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200));
});

await page.goto(URL_BASE, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForTimeout(2500);

// layar sambutan → masuk Mode Sederhana
const btnSimple = page.getByRole("button", { name: /mode sederhana/i }).first();
if (await btnSimple.isVisible().catch(() => false)) {
  await btnSimple.click();
  console.log("klik Mode Sederhana");
} else {
  console.log("tombol Mode Sederhana tidak terlihat (mungkin langsung editor) — coba URL wizard");
}
await page.waitForTimeout(1200);

// v1.0.25: suntik 1 video dummy agar tombol Lanjut aktif (wizard butuh pilihan)
await page.evaluate(() => {
  const st = window.__NOVA__.getState();
  st.setUiMode("simple");
  if (!st.assets.some((a) => a.id === "as-smoke")) {
    st.addAsset({ id: "as-smoke", name: "smoke.mp4", type: "video", url: "about:blank", duration: 12, width: 604, height: 938 });
  }
  if (!st.exportList.includes("as-smoke")) st.addToAssetList("export", ["as-smoke"]);
});
await page.waitForTimeout(400);

// langkah 3 TEKS — cek bagian BINGKAI PART/EPISODE
await page.getByRole("button", { name: /Lanjut: Atur/i }).click().catch(() => {});
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Lanjut: Teks/i }).click().catch(() => {});
await page.waitForTimeout(800);
const partFrame = await page.getByText("BINGKAI PART/EPISODE", { exact: false }).first().isVisible().catch(() => false);
console.log("langkah 3 BINGKAI PART/EPISODE terlihat:", partFrame);
await page.screenshot({ path: "/tmp/v1025/smoke/step3-teks.png", fullPage: false });

// langkah 4 EXPORT — cek kartu POTONG MULAI & AKHIR + WATERMARK
await page.getByRole("button", { name: /Lanjut: Export/i }).click().catch(() => {});
await page.waitForTimeout(800);
const trimCard = await page.getByText("Potong Mulai & Akhir", { exact: false }).first().isVisible().catch(() => false);
const wmCard = await page.getByText("Watermark", { exact: false }).first().isVisible().catch(() => false);
console.log("langkah 4 kartu POTONG terlihat:", trimCard, "| kartu WATERMARK terlihat:", wmCard);
// nyalakan sakelar POTONG agar slider muncul
const sw = page.locator('button[role="switch"][aria-label="Potong mulai dan akhir"]').first();
if (await sw.isVisible().catch(() => false)) {
  await sw.click();
  await page.waitForTimeout(400);
  const info = await page.getByText(/Dipotong:/).first().isVisible().catch(() => false);
  console.log("setelah switch ON, baris 'Dipotong:' terlihat:", info);
}
await page.screenshot({ path: "/tmp/v1025/smoke/step4-export.png", fullPage: false });

console.log("pageerror/console error:", errors.length ? errors.slice(0, 5) : "TIDAK ADA ✓");
await browser.close();
console.log("smoke selesai");
