#!/usr/bin/env node
/* UJI REAL jalur poster Cloudflare NOVACUT (mirror persis cfEditPoster v1.0.41).
 * Kredensial dibaca dari /tmp/cf_test.env (ACC, TOK) — TIDAK di-commit.
 * Estimasi biaya: tes koneksi 0 + vision ±30 + edit ±125 Neuron (kuota gratis 10k/hari). */
const fs = require("fs");

const env = Object.fromEntries(
  fs.readFileSync("/tmp/cf_test.env", "utf8").trim().split("\n").map((l) => l.split("=", 2))
);
const ACC = env.ACC, TOK = env.TOK;
const BASE = "https://api.cloudflare.com/client/v4";
const EDIT_MODEL = "@cf/black-forest-labs/flux-2-klein-4b";
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

// ===== Mirror buildPosterPrompt (covers.ts v1.0.41) =====
const bersihkanJudul = (s) => {
  let t = (s || "").replace(/\[[0-9A-Za-z_-]{4,}\]/g, " ").replace(/\s*[_|\-–—]\s*$/g, "");
  t = t.replace(/[_|]+/g, " ").replace(/\s{2,}/g, " ").trim();
  return t || (s || "").trim();
};
const POSTER_PROMPT_DEFAULT =
  "Rubahlah gambar ini menjadi poster untuk sebuah film Hollywood. Buat poster dengan gaya modern sinematik, tanpa takarir video, tanpa watermark";
const buildPosterPrompt = (custom, title) => {
  const judul = bersihkanJudul((title || "").trim());
  const dasar = (custom || "").trim() || POSTER_PROMPT_DEFAULT;
  const judulPart = judul && !/judul\s*"/i.test(dasar) ? ` dengan menggunakan judul "${judul}" sebagai judul di poster` : "";
  return `${dasar}${judulPart}. PENTING: semua tulisan pada poster harus berada di dalam area gambar dan diberi jarak aman (margin) dari tepi — tidak boleh terpotong di tepi kiri, kanan, atas, atau bawah. Jangan menulis ulang takarir, caption, atau watermark dari gambar sumber.`;
};
// ===== Mirror cfPosterPrompt + cfEditPrompt (main.cjs v1.0.41) =====
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

const dataUrlToBuf = (dataUrl) => Buffer.from(String(dataUrl || "").replace(/^data:[^,]+,/, ""), "base64");

(async () => {
  // ===== 0) Tes koneksi (0 Neuron) =====
  const r0 = await fetch(`${BASE}/accounts/${ACC}/ai/models/search?per_page=1`, { headers: { Authorization: `Bearer ${TOK}` } });
  const j0 = await r0.json().catch(() => ({}));
  console.log("[0] TES KONEKSI:", r0.ok && j0?.success !== false ? "OK ✓" : `GAGAL: ${j0?.errors?.[0]?.message || r0.status}`);
  if (!(r0.ok && j0?.success !== false)) process.exit(1);

  // ===== 1) Rakit prompt — nama video otomatis jadi judul =====
  const judul = bersihkanJudul("uji_coba_novacut_2026".replace(/\.[^.]+$/, ""));
  const prompt = buildPosterPrompt("", judul);
  console.log("\n[1] PROMPT FINAL (buildPosterPrompt):");
  console.log("   ", prompt.slice(0, 260));

  // ===== 2) Frame → dataURL =====
  const frame = fs.readFileSync("/tmp/frame_test.jpg");
  const dataUrl = `data:image/jpeg;base64,${frame.toString("base64")}`;

  // ===== 3) Vision (llama, ±30 Neuron) + auto-agree lisensi Meta =====
  const panggilVision = async () => {
    const rv = await fetch(`${BASE}/accounts/${ACC}/ai/run/${VISION_MODEL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOK}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: [
          { type: "image_url", image_url: { url: dataUrl } },
          { type: "text", text: "Describe this video frame as a cinematic movie-poster scene brief in English (max 120 words): subject's age, gender, hair, clothing, expression and exact pose; key props; setting and background; lighting direction; dominant color palette; overall mood. IGNORE any burned-in subtitles, captions or watermarks — do not mention them." },
        ] }],
        max_tokens: 300,
      }),
      signal: AbortSignal.timeout(90000),
    });
    return { rv, jv: await rv.json().catch(() => ({})) };
  };
  let deskripsi = "";
  try {
    let { rv, jv } = await panggilVision();
    const pesan = String(jv?.errors?.[0]?.message || "");
    if (/model agreement|agree/i.test(pesan)) {
      console.log("\n[2] VISION minta persetujuan lisensi → kirim {prompt:'agree'} …");
      const ra = await fetch(`${BASE}/accounts/${ACC}/ai/run/${VISION_MODEL}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${TOK}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "agree" }),
        signal: AbortSignal.timeout(30000),
      });
      const ja = await ra.json().catch(() => ({}));
      console.log("    agree:", ra.ok && ja?.success !== false ? "DITERIMA ✓" : `gagal: ${ja?.errors?.[0]?.message || ra.status}`);
      ({ rv, jv } = await panggilVision());
    }
    if (rv.ok && jv?.success !== false) {
      deskripsi = String(jv?.result?.response || "").trim();
      console.log("\n[2] VISION (±30 Neuron): OK ✓ —", deskripsi.slice(0, 180) + "…");
    } else console.log("\n[2] VISION gagal (tak fatal):", jv?.errors?.[0]?.message || rv.status);
  } catch (e) { console.log("\n[2] VISION gagal (tak fatal):", String(e).slice(0, 120)); }

  const instruksi = cfEditPrompt(prompt, deskripsi, judul);
  console.log("\n[3] INSTRUKSI EDIT (cfEditPrompt):");
  console.log("   ", instruksi.slice(0, 300) + "…");
  console.log("    mengandung 'Hollywood'?", /hollywood/i.test(instruksi) ? "YA ⚠️" : "TIDAK ✓");

  // ===== 4) Jalur EDIT Klein 4B — 3 bentuk input, sesuai main.cjs =====
  const url = `${BASE}/accounts/${ACC}/ai/run/${EDIT_MODEL}`;
  const auth = { Authorization: `Bearer ${TOK}` };
  const body64 = dataUrl.split(",").pop();
  const ambil = (r) => (r?.image ? Buffer.from(r.image, "base64") : null);
  const bentuk = [];
  let berhasil = null, namaBentuk = "";

  // 1) multipart/form-data (bentuk resmi schema CF)
  bentuk.push(["multipart/form-data (prompt + image Blob)", async () => {
    const fd = new FormData();
    fd.append("prompt", instruksi.slice(0, 1800));
    fd.append("image", new Blob([dataUrlToBuf(dataUrl)], { type: "image/jpeg" }), "frame.jpg");
    const res = await fetch(url, { method: "POST", headers: auth, body: fd, signal: AbortSignal.timeout(180000) });
    const json = await res.json().catch(() => ({}));
    return { res, json };
  }]);
  // 2) JSON {prompt, image: base64}
  bentuk.push(["JSON {prompt, image}", async () => {
    const res = await fetch(url, { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ prompt: instruksi.slice(0, 1800), image: body64 }), signal: AbortSignal.timeout(180000) });
    return { res, json: await res.json().catch(() => ({})) };
  }]);
  // 3) JSON {prompt, images: [base64]} (multi-reference)
  bentuk.push(["JSON {prompt, images:[...]}", async () => {
    const res = await fetch(url, { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ prompt: instruksi.slice(0, 1800), images: [body64] }), signal: AbortSignal.timeout(180000) });
    return { res, json: await res.json().catch(() => ({})) };
  }]);

  for (const [nama, kirim] of bentuk) {
    try {
      console.log(`\n[4] mencoba ${nama} …`);
      const { res, json } = await kirim();
      const img = ambil(json?.result);
      const pesan = json?.errors?.[0]?.message || "";
      console.log(`    HTTP ${res.status} | success=${json?.success} | gambar=${img ? img.length + " byte" : "—"}` + (pesan ? ` | pesan: ${String(pesan).slice(0, 120)}` : ""));
      if (res.ok && json?.success !== false && img) { berhasil = img; namaBentuk = nama; break; }
    } catch (e) { console.log("    error:", String(e).slice(0, 140)); }
  }

  if (berhasil) {
    fs.writeFileSync("/tmp/poster_edit_result.jpg", berhasil);
    console.log(`\n✅ HASIL: jalur EDIT BERFUNGSI via ${namaBentuk} (±125 Neuron)`);
    console.log("    poster tersimpan: /tmp/poster_edit_result.jpg (" + berhasil.length + " byte)");
  } else {
    console.log("\n⚠️  Semua bentuk jalur EDIT gagal — fallback FLUX.1 schnell (txt2img) yang dipakai app.");
    // Tes fallback schnell sekali (±58 Neuron) agar fallback terbukti juga:
    try {
      const rs = await fetch(`${BASE}/accounts/${ACC}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: instruksi.slice(0, 1800), steps: 4, width: 1024, height: 576 }),
        signal: AbortSignal.timeout(180000),
      });
      const js = await rs.json().catch(() => ({}));
      const img = ambil(js?.result);
      if (rs.ok && img) {
        fs.writeFileSync("/tmp/poster_fallback.jpg", img);
        console.log(`✅ FALLBACK schnell OK (±58 Neuron) — poster: /tmp/poster_fallback.jpg (${img.length} byte)`);
      } else console.log("    fallback schnell gagal:", js?.errors?.[0]?.message || rs.status);
    } catch (e) { console.log("    fallback error:", String(e).slice(0, 120)); }
  }
  console.log("\nEstimasi total Neuron terpakai uji ini: ±" + (30 + (berhasil ? 125 : 0) + (!berhasil ? 58 : 0)) + " dari 10.000/hari");
})();
