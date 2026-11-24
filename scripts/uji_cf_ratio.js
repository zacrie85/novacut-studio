#!/usr/bin/env node
/* Uji kecil: apakah flux-2-klein-4b menerima width/height (rasio proyek) di multipart. */
const fs = require("fs");
const env = Object.fromEntries(fs.readFileSync("/tmp/cf_test.env", "utf8").trim().split("\n").map((l) => l.split("=", 2)));
const BASE = "https://api.cloudflare.com/client/v4";

(async () => {
  const frame = fs.readFileSync("/tmp/frame_sintetis.jpg");
  const instruksi =
    "Transform this exact photograph into ONE cinematic blockbuster movie poster. " +
    'Keep the main subject\'s face, hairstyle, clothing and pose recognisable from the input photo. ' +
    'The ONLY large text on the poster is the movie title: "UJI COBA NOVACUT 2026" spelled exactly letter by letter, all caps, large bold typography inside safe margins. ' +
    "NO other words anywhere: no actor names, no credits block, no studio logos, no small text, no subtitles, no watermarks. " +
    "Single cohesive composition, dramatic lighting, rich color grade.";
  const fd = new FormData();
  fd.append("prompt", instruksi.slice(0, 1800));
  fd.append("image", new Blob([frame], { type: "image/jpeg" }), "frame.jpg");
  fd.append("width", "1024");
  fd.append("height", "576");
  const res = await fetch(`${BASE}/accounts/${env.ACC}/ai/run/@cf/black-forest-labs/flux-2-klein-4b`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.TOK}` },
    body: fd,
    signal: AbortSignal.timeout(180000),
  });
  const json = await res.json().catch(() => ({}));
  const b64 = json?.result?.image;
  console.log(`HTTP ${res.status} | success=${json?.success}` + (json?.errors?.[0]?.message ? ` | pesan: ${String(json.errors[0].message).slice(0, 140)}` : ""));
  if (res.ok && b64) {
    fs.writeFileSync("/tmp/poster_ratio.jpg", Buffer.from(b64, "base64"));
    console.log("poster rasio tersimpan: /tmp/poster_ratio.jpg");
  }
})();
