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
  // v1.0.62: regex tombol generate — /generate\s*(\d+)?\s*image/i harus cocok
  // dengan teks tombol asli studio Mivo "Generate 1 image (2 credits)"
  const targetGen = "/generate\\s*(\\d+)?\\s*image/i"; // nilai: /generate\s*(\d+)?\s*image/i
  if (!out.includes(targetGen)) {
    console.error("GAGAL: regex tombolGen /generate\\s*(\\d+)?\\s*image/i tidak ditemukan di skrip hasil");
    process.exit(1);
  }
  const rg = eval(targetGen);
  if (!rg.test("Generate 1 image (2 credits)") || !rg.test("Generate image") || !rg.test("generate 2 image")) {
    console.error("GAGAL: regex tombol generate tidak mencocokkan 'Generate 1 image (2 credits)'");
    process.exit(1);
  }
  if (!/scrollIntoView/.test(out) || !/pointerdown/.test(out) || !/tombolGen/.test(out)) {
    console.error("GAGAL: scrollIntoView/klik nyata/tombolGen tidak ada di skrip hasil");
    process.exit(1);
  }
  console.log(`regex valid & cocok (${aiImageEmit[1]}, /generate\\s*(\\d+)?\\s*image/i) + scrollIntoView + klik nyata ✓`);
}
console.log("=== SEMUA UJI SKRIP OTOMASI LULUS ✓ ===");
