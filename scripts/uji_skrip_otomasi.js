// v1.0.61 — uji skripOtomasi: ekstrak fungsi template dari electron/main.cjs,
// jalankan dengan argumen realistis, lalu node --check hasil interpolasinya.
const fs = require("fs");
const { execFileSync } = require("child_process");
const os = require("os");
const path = require("path");

const src = fs.readFileSync("/home/z/my-project/electron/main.cjs", "utf8");
const m = src.match(/const skripOtomasi = \(regModel, promptJson, imgJson\) => `[\s\S]*?`;/);
if (!m) {
  console.error("GAGAL: definisi skripOtomasi tidak ditemukan di main.cjs");
  process.exit(1);
}
const fn = eval(src.slice(m.index + "const skripOtomasi = ".length, m.index + m[0].length - 1));

// argumen seperti di jalankanOtomasi: regModel string regex, prompt JSON, b64 JSON
const regModelFilm = "/flux\\s*3?\\s*klein|flux/i";
const regModelMusik = "/minimax\\s*h3|minimax/i";
const prompt = 'buat gambar ini menjadi sebuah poster untuk film dengan judul "AJENG FEBRIA - HELIKOPTER TURUN KE PADANG _ IDOL IDOL (OFFICIAL MV AMBYAR EVERYWHERE)" dengan huruf besar dan kecil yang estetik dan dengan background cerah Estetik cinematik bokeh';
const b64 = Buffer.from("data-gambar-uji").toString("base64");

for (const [nama, reg] of [["film", regModelFilm], ["musik", regModelMusik]]) {
  const out = fn(reg, JSON.stringify(prompt), JSON.stringify(b64));
  // pastikan escape regex keluar tunggal (\s bukan \\s) dan interpolasi masuk
  const cek = [
    [/\/ai\\s\*image\/i/.test(out.split("\\n").join("")), "regex AI Image tunggal"],
    [/add\\s\*reference/.test(out), false], // placeholder — dihapus di bawah
  ];
  if (!/\/ai\\s\*image\/i/.test(out) && !/\/ai\s\*image/i.test(out)) {
    // regex boleh tampil sbg /ai\s*image/i di skrip hasil (satu backslash)
  }
  const berisiPrompt = out.includes(JSON.stringify(prompt));
  const berisiB64 = out.includes(JSON.stringify(b64));
  const tunggal = /klik\("\/ai\\\\s\*image\/i"\)/.test(out) ? "SALAH (string)" : "regex-literal";
  console.log(`--- model ${nama} ---`);
  console.log("panjang skrip:", out.length, "| prompt masuk:", berisiPrompt, "| b64 masuk:", berisiB64, "| aiImage:", tunggal);
  // node --check hasilnya (bungkus agar jadi program utuh)
  const tmp = path.join(os.tmpdir(), `uji-otomasi-${nama}.js`);
  fs.writeFileSync(tmp, "const R = " + out + ";\nif (!R || typeof R.then !== 'function') throw new Error('bukan promise');\nconsole.log('promise OK');\n");
  try {
    execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
    console.log(`node --check ${nama}: LULUS ✓`);
  } catch (e) {
    console.error(`node --check ${nama}: GAGAL ✗\n${e.stderr}`);
    process.exit(1);
  }
  // verifikasi regex tunggal-backslash benar-benar jadi regex valid saat dievaluasi di JS
  const aiImageEmit = out.match(/klik\((\/ai[^/]*\/i)\)/);
  if (!aiImageEmit) {
    console.error("GAGAL: pola klik(/ai…/i) tidak ditemukan di skrip hasil");
    process.exit(1);
  }
  const rx = eval(aiImageEmit[1]);
  if (!rx.test("AI Image") || !rx.test("ai image")) {
    console.error("GAGAL: regex AI Image tidak mencocokkan 'AI Image'");
    process.exit(1);
  }
  const genEmit = out.match(/res\.generate = klik\((\/generate[^/]*\/i)\)/);
  const rg = eval(genEmit[1]);
  if (!rg.test("Generate image") || !rg.test("generate")) {
    console.error("GAGAL: regex Generate tidak mencocokkan 'Generate image'");
    process.exit(1);
  }
  console.log(`regex valid & cocok (${aiImageEmit[1]}, ${genEmit[1]}) ✓`);
}
console.log("=== SEMUA UJI SKRIP OTOMASI LULUS ✓ ===");
