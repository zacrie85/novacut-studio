#!/usr/bin/env node
/* Uji real v1.0.43: prompt default BARU pengguna + judul otomatis + edit portrait 9:16.
 * Kredensial /tmp/cf_test.env — tidak di-commit. Biaya ±125 Neuron. */
const fs = require("fs");
const env = Object.fromEntries(fs.readFileSync("/tmp/cf_test.env", "utf8").trim().split("\n").map((l) => l.split("=", 2)));
const BASE = "https://api.cloudflare.com/client/v4";

// Mirror covers.ts v1.0.43
const bersihkanJudul = (s) => {
  let t = (s || "").replace(/\[[0-9A-Za-z_-]{4,}\]/g, " ").replace(/\s*[_|\-–—]\s*$/g, "");
  t = t.replace(/[_|]+/g, " ").replace(/\s{2,}/g, " ").trim();
  return t || (s || "").trim();
};
const POSTER_PROMPT_DEFAULT =
  "BUAT POSTER SESUAI DENGAN ADEGAN YANG DIAMBIL DARI VIDEO, judul video dibagian bawah sesuai dengan nama video. didalam poster buat agar ada 2 atau 3 karakter yang tampil di poster saling berhadapan atau menghadap kedepan semua disesuaikan dengan gambar yang di ambil dari video, untuk gambarnya ambil dari adegan yang ada di video, Adegan diambil dari detik 5 sampai detik 30 video, untuk rasio poster 9:16, dengan background cinematik atau kolosal dan dengan frame futuristik atau modern mengelilingi poster, tulisan selalu dijaga di dalam tepi gambar, dan menggunakan font yang cinematik atau futuristik atau modern dinamis";
const buildPosterPrompt = (custom, title) => {
  const judul = bersihkanJudul((title || "").trim());
  const dasar = (custom || "").trim() || POSTER_PROMPT_DEFAULT;
  const judulPart = judul && !/judul\s*"/i.test(dasar) ? ` dengan menggunakan judul "${judul}" sebagai judul di poster` : "";
  return `${dasar}${judulPart}. PENTING: semua tulisan pada poster harus berada di dalam area gambar dan diberi jarak aman (margin) dari tepi — tidak boleh terpotong di tepi kiri, kanan, atas, atau bawah. Jangan menulis ulang takarir, caption, atau watermark dari gambar sumber.`;
};
const cfPosterPrompt = (prompt, deskripsi, judul) => {
  const m = judul || (String(prompt).match(/judul "([^"]+)"/) || [])[1] || "";
  const judulPart = m
    ? `The ONLY large text on the poster is the movie title: "${m.slice(0, 60).toUpperCase()}" spelled exactly letter by letter, all caps, large bold typography inside safe margins. `
    : "";
  const tema = String(prompt)
    .replace(/dengan menggunakan judul "[^"]+" sebagai judul di poster\.?/i, "")
    .replace(/film\s+Hollywood/gi, "film")
    .replace(/\bHollywood\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return `Create ONE cinematic blockbuster movie poster, professional key art. ${judulPart}` +
    `NO other words anywhere: no actor names, no credits block, no studio logos, no small text, no subtitles, no watermarks, no timestamps. ` +
    `Single cohesive composition, dramatic lighting, rich color grade. ` +
    `User instructions: ${tema || "cinematic movie poster"}. ` +
    `Scene basis (from the user's video frame): ${deskripsi || "dramatic cinematic scene"}.`;
};
const cfEditPrompt = (prompt, deskripsi, judul) =>
  `Transform this exact photograph into ONE cinematic blockbuster movie poster. ` +
  `Keep the main subject's face, hairstyle, clothing and pose recognisable from the input photo. ` +
  cfPosterPrompt(prompt, deskripsi, judul);

(async () => {
  const judul = bersihkanJudul("Reuni_Akbar_2026".replace(/\.[^.]+$/, ""));
  const prompt = buildPosterPrompt("", judul);
  console.log("[1] PROMPT FINAL (prompt default BARU + judul otomatis):");
  console.log("   ", prompt.slice(0, 240) + "…");
  const instruksi = cfEditPrompt(prompt, "epic scene with several people facing each other, dramatic cinematic mood", judul);
  console.log("\n[2] judul diekstrak:", judul, "→ instruksi:", instruksi.slice(0, 190) + "…");

  const frame = fs.readFileSync("/tmp/frame_v1043.jpg");
  const fd = new FormData();
  fd.append("prompt", instruksi.slice(0, 1800));
  fd.append("image", new Blob([frame], { type: "image/jpeg" }), "frame.jpg");
  fd.append("width", "576");
  fd.append("height", "1024");
  const res = await fetch(`${BASE}/accounts/${env.ACC}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.TOK}` },
    body: fd,
    signal: AbortSignal.timeout(180000),
  });
  const json = await res.json().catch(() => ({}));
  const b64 = json?.result?.image;
  console.log(`\n[3] EDIT portrait 9:16 → HTTP ${res.status} | success=${json?.success} | gambar=${b64 ? Math.round(b64.length * 3 / 4 / 1024) + " KB" : "—"}` + (json?.errors?.[0]?.message ? ` | ${String(json.errors[0].message).slice(0, 100)}` : ""));
  if (res.ok && b64) {
    fs.writeFileSync("/tmp/poster_v1043.jpg", Buffer.from(b64, "base64"));
    console.log("    poster tersimpan: /tmp/poster_v1043.jpg");
  }
})();
