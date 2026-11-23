// Poster film Hollywood dari foto pengguna — tahap 1: transformasi AI (tanpa teks)
// Pakai z-ai-web-dev-sdk (backend) dengan gambar lokal sebagai data URL base64.
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

const SRC = "upload/WIN_20260728_08_55_40_Pro.jpg";
const PROMPT =
  "Epic Hollywood blockbuster movie poster artwork: keep this man's face and identity exactly unchanged, " +
  "confident heroic expression, dramatic cinematic rim lighting, moody teal and orange color grading, " +
  "dark dramatic city skyline at dusk behind him with volumetric fog and glowing lights, wind-blown dark coat, " +
  "cinematic atmosphere, ultra-detailed, photorealistic, high contrast, " +
  "bottom third of the image dark and empty for title text, " +
  "absolutely no text, no letters, no words, no watermark, no logo";
const JOBS = [
  ["scripts/poster_bg_portrait.png", "768x1344"],
  ["scripts/poster_bg_landscape.png", "1344x768"],
];

const zai = await ZAI.create();
const dataUrl = `data:image/jpeg;base64,${fs.readFileSync(SRC).toString("base64")}`;

for (const [out, size] of JOBS) {
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const res = await zai.images.generations.edit({ prompt: PROMPT, images: [{ url: dataUrl }], size });
      const b64 = res?.data?.[0]?.base64;
      if (!b64) throw new Error("respons tanpa base64");
      fs.writeFileSync(out, Buffer.from(b64, "base64"));
      console.log(`OK ${out} (${size}) — ${(b64.length * 0.75 / 1024).toFixed(0)} KB`);
      ok = true;
    } catch (e) {
      console.warn(`gagal attempt ${attempt} untuk ${size}:`, e.message?.slice(0, 200));
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
      else throw e;
    }
  }
}
console.log("EDIT_DONE");
