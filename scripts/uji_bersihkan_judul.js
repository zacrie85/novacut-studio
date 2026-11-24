// Uji cepat bersihkanJudul v1.0.45 — replika logika regex dari src/lib/editor/covers.ts
function bersihkanJudul(s) {
  let t = (s || "").replace(/\[[0-9A-Za-z_-]{4,}\]/g, " ").replace(/\s*[_|\-–—]\s*$/g, "");
  t = t.replace(/[_|]+/g, " ").replace(/[-–—]+/g, " ");
  t = t
    .replace(/\b(?:part|episode|eps|ep)[- _]?\d+(?:[-_ ]?(?:of|\/|dari)?[-_ ]?\d+)?\b/gi, " ")
    .replace(/\b(?:official(?:[-_ ]?(?:live|full))?(?:[-_ ]?(?:music|lyric|audio))?(?:[-_ ]?(?:video|vid))?|live[-_ ]?music[-_ ]?video|music[-_ ]?video|video[-_ ]?official|full[-_ ]?video|videoclip|video[-_ ]?clip|lyric[-_ ]?video|hd|4k|720p|1080p|production|produksi)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+[a-z]{1,3}\s*$/i, " ")
    .replace(/\s*[_|\-–—]\s*$/g, "")
    .trim();
  return t || (s || "").trim();
}
const kasus = [
  ["eny-sagita-ngamen-5-official-live-music-video-dc-part-12-12", "eny sagita ngamen 5"],
  ["5-menit-yg-mengubah-hidup-episode-6-6", "5 menit yg mengubah hidup"],
  ["ngamen 5", "ngamen 5"],
  ["UJI COBA NOVACUT 2026", "UJI COBA NOVACUT 2026"],
  ["KONGLOMERAT MUDA SEKETIKA [42TZYEQ7MOK]", "KONGLOMERAT MUDA SEKETIKA"],
  ["Pengalaman 5 Menit yang Mengubah Hidup", "Pengalaman 5 Menit yang Mengubah Hidup"],
];
let gagal = 0;
for (const [inp, harap] of kasus) {
  const hasil = bersihkanJudul(inp);
  const ok = hasil === harap;
  if (!ok) gagal++;
  console.log(ok ? "OK  " : "GAGA", JSON.stringify(inp), "→", JSON.stringify(hasil), ok ? "" : `(harap ${JSON.stringify(harap)})`);
}
process.exit(gagal ? 1 : 0);
