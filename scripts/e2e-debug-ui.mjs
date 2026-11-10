import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => !!(window).__NOVA__, null, { timeout: 120000 });

const b64 = readFileSync("/tmp/turbotest/drama65.mp4").toString("base64");
await page.evaluate(async (b) => {
  const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
  const file = new File([bin], "drama65.mp4", { type: "video/mp4" });
  const url = URL.createObjectURL(file);
  const v = document.createElement("video");
  v.src = url; v.muted = true;
  await new Promise((res) => { v.onloadedmetadata = res; v.onerror = res; setTimeout(res, 8000); });
  const st = (window).__NOVA__.getState();
  st.addAsset({ id: "as-e2e-flicker", name: "drama65.mp4", type: "video", url, duration: v.duration || 65, width: v.videoWidth || 604, height: v.videoHeight || 938, file });
  st.setUiMode("simple");
  st.addToAssetList("export", ["as-e2e-flicker"]);
  st.setExportSettings({ mode: "split", splitBy: "count", parts: 30, includeCover: false, coverDuration: 2, autoPartText: true, showTitleText: true, engineMode: "fast", exportDir: "" });
  st.setPlaylistExport({ titleDuringVideo: true, description: "UJI KEDIP E2E", labelStyle: "Part", quality: "tajam", parallel: 2, autoSub: false });
}, b64);
await page.waitForTimeout(1200);

for (let i = 0; i < 8; i++) {
  const names = await page.evaluate(() =>
    Array.from(document.querySelectorAll("button")).map((b) => (b.textContent || "").trim().slice(0, 45)).filter(Boolean)
  );
  console.log(`step ${i}:`, JSON.stringify(names));
  const mulai = names.find((n) => /Mulai Export/i.test(n));
  if (mulai) {
    await page.getByRole("button", { name: /Mulai Export/i }).click();
    console.log(">>> Mulai Export diklik");
    break;
  }
  const next = names.find((n) => /^Lanjut/i.test(n));
  if (!next) { console.log("tidak ada Lanjut lagi — berhenti"); break; }
  await page.getByRole("button", { name: new RegExp(`^${next.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 20)}`) }).first().click();
  await page.waitForTimeout(900);
}
const st = await page.evaluate(() => {
  const s = (window).__NOVA__.getState().exportState;
  return { running: s.running, label: s.label, n: s.results.length };
});
console.log("exportState:", JSON.stringify(st));
await page.waitForTimeout(12000);
const st2 = await page.evaluate(() => {
  const s = (window).__NOVA__.getState().exportState;
  return { running: s.running, label: s.label, n: s.results.length, p: s.progress };
});
console.log("exportState+12s:", JSON.stringify(st2));
await browser.close();
