#!/usr/bin/env node
// Uji v1.0.63 — ANTREAN MIVO: poster bergiliran satu per satu (batch 3 video
// tidak lagi mengirim frame video pertama ke semua giliran).
// (1) Statis: covers.ts memakai rantai _mivoAntre/mivoGiliran di jalur Mivo;
//     main.cjs menutup studio otomatis + menampilkan status giliran #N.
// (2) Perilaku: simulasi rantai FIFO — 3 pekerjaan dgn durasi beda; hasil harus
//     berurutan sesuai urutan PANGGILAN dan TIDAK bertumpuk (no overlap).
"use strict";
const fs = require("fs");

const covers = fs.readFileSync("src/lib/editor/covers.ts", "utf8");
const main = fs.readFileSync("electron/main.cjs", "utf8");
let gagal = 0;
const harus = (kondisi, pesan) => {
  if (kondisi) console.log("  ✓ " + pesan);
  else {
    console.error("  ✗ GAGAL: " + pesan);
    gagal++;
  }
};

console.log("(1) statis covers.ts:");
harus(covers.includes("let _mivoAntre: Promise<unknown> = Promise.resolve();"), "rantai global _mivoAntre ada");
harus(covers.includes("const mivoGiliran = <T>(kerja: () => Promise<T>): Promise<T> =>"), "helper mivoGiliran<T> ada");
harus(covers.includes("return mivoGiliran(giliranMivo);"), "jalur Mivo kembali via antrean mivoGiliran");
harus(
  covers.includes("const giliranMivo = async (): Promise<string | null> => {") &&
    covers.includes("mivoBridgeStart(frameUrl, promptMivo, size, modelMivo)") &&
    covers.includes("mivoBridgePoll?.(st.id || \"\")") &&
    covers.indexOf("giliranMivo") < covers.indexOf("mivoBridgeStart(frameUrl, promptMivo, size, modelMivo)"),
  "giliranMivo membawa frame/prompt panggilannya sendiri (closure) lalu masuk antrean",
);

console.log("(1) statis main.cjs:");
const nTutup = (main.match(/tutupStudioMivoOtomatis\(\);/g) || []).length;
harus(main.includes("const tutupStudioMivoOtomatis = (tundaMs = 4000) =>"), "helper tutupStudioMivoOtomatis ada");
harus(nTutup >= 2, `tutup otomatis dipanggil di jalur panen halaman + panen folder (ditemukan ${nTutup}×)`);
harus(main.includes("w.close();"), "jendela studio benar-benar ditutup (w.close)");
harus(main.includes("mivoStudioOtomasi) return;") || main.includes("!mivoStudioOtomasi) return;"), "jendela tanpa otomasi (dibuka manual) tidak ikut ditutup");
harus(main.includes("mivoGiliranN += 1;"), "penghitung giliran bertambah tiap mulai poster");
harus(/dengan judul "\(\[\^"\]\{1,300\}\)"/.test(main), "judul video diekstrak dr prompt utk status giliran");
harus(main.includes("🎬 Poster Mivo giliran #"), "status 'giliran #N' dipush ke kartu AI");

console.log("(1b) statis main.cjs — siklus penuh per video (v1.0.64):");
harus(/HASIL-\|REFERENSI-/.test(main) || main.includes("/^HASIL-|^REFERENSI-/"), "folder NOVACUT-Mivo dibersihkan tiap awal giliran (HASIL-* + REFERENSI-* dihapus)");
harus(main.includes("fs.unlinkSync(path.join(dir, f));"), "file lama benar-benar dihapus (unlinkSync)");
const blokBuka = main.slice(main.indexOf("const bukaStudioMivo"), main.indexOf("mivo:studio-open"));
harus(blokBuka.includes("mivoStudioWin.close();") && blokBuka.includes("mivoStudioWin = null;"), "giliran baru MENUTUP jendela studio lama sebelum membuka yang baru");
harus(blokBuka.includes("new BrowserWindow"), "jendela segar dibuat per giliran (bukan loadURL pakai ulang)");
harus(main.includes("const snapshotImgLama = async () =>"), "snapshot dini img lama ada (poster lama tak terpanen lagi)");
const nSnap = (main.match(/snapshotImgLama\(/g) || []).length;
harus(nSnap >= 4, `snapshot dini dipasang di did-navigate + tunggu 4/9/14 dtk (ditemukan ${nSnap}×)`);
harus(main.includes("selesaiImg?.add(baru.s);"), "URL hasil terpanen dicatat SELAMANYA — poster sama tak bisa dipanen 2×");

console.log("(1c) statis main.cjs — penjaga identitas jendela + otomasi coba ulang (v1.0.65):");
harus(main.includes("const winMivo = mivoStudioWin;") && main.includes("if (mivoStudioWin === winMivo) mivoStudioWin = null;"), "event closed ber-PENJAGA IDENTITAS — closed jendela LAMA tak bisa menimpa referensi jendela BARU (bug utama v1.0.64)");
harus(blokBuka.includes('on("did-navigate-in-page", () => jalankanOtomasi())'), "did-navigate-in-page TANPA snapshot — hasil baru tak bisa tertelan daftar img lama");
harus(main.includes("cobaOtomasiT") && main.includes("!mivoStudioOtomasi.selesai.has(\"otomasi\")"), "poll memicu ulang otomasi tiap ±15 dtk bila belum jalan — studio tak bisa terbuka kosong selamanya");
harus(!/dulu jendela lama dipakai ulang/i.test(main.split("v1.0.64")[1] || ""), "komentar menjelaskan celah v1.0.63");

console.log("(1d) statis — sidik piksel poster + batch BERURUTAN saat Mivo (v1.0.66):");
harus(main.includes("const skripSidik = `(async (u)") || main.includes("const skripSidik = `(async (u) =>"), "skrip sidik piksel (aHash 8×8) ada di main.cjs");
harus(main.includes("createImageBitmap") && main.includes("getImageData"), "hash dihitung dari piksel asli (fetch → bitmap → kanvas 8×8)");
harus(main.includes("const hashJauh = (a, b)") && main.includes("beda <= 8"), "pencocokan hash dgn jarak Hamming ≤ 8 (tahan resampling)");
harus(main.includes("const hashSudahAda = (h)") && main.includes("selesaiHash"), "kandidat panen ditolak bila sidik pikselnya sudah pernah tercatat");
harus(main.includes("selesaiHash.push(baru.h);"), "sidik poster terpanen dicatat SELAMANYA (bukan cuma URL)");
harus(main.includes("h: await ("), "snapshot dini juga merekam sidik piksel (bukan hanya URL)");
const exp = fs.readFileSync("src/lib/editor/exporter.ts", "utf8");
harus(exp.includes("const mivoUrut = prefsAI?.provider === \"mivo\";"), "penyedia Mivo terdeteksi di runBatchExport");
harus(exp.includes("const MAX_CONC = mivoUrut ? 1 :") && exp.includes("const PREP_CONC = mivoUrut ? 1 :"), "batch Mivo BERURUTAN: 1 pekerja + 1 prep (tanpa paralel antar video)");
harus(exp.includes("Jeda 3 dtk — memberi waktu poster Mivo video sebelumnya"), "jeda 3 dtk antar video (permintaan pengguna)");

console.log("(2) perilaku antrean FIFO (simulasi):");
const buatRantai = () => {
  let rantai = Promise.resolve();
  return (kerja) => {
    const h = rantai.then(kerja, kerja);
    rantai = h.then(
      () => undefined,
      () => undefined,
    );
    return h;
  };
};
(async () => {
  const antre = buatRantai();
  const urutan = [];
  const log = [];
  // durasi sengaja tak berurutan: panggilan ke-2 paling cepat, ke-1 paling lama
  const durasi = [120, 30, 70];
  const mulai = Date.now();
  const hasil = await Promise.all(
    durasi.map((ms, i) =>
      antre(async () => {
        const tMulai = Date.now() - mulai;
        urutan.push(i + 1);
        log.push(`giliran ${i + 1}: mulai ${tMulai}ms`);
        await new Promise((r) => setTimeout(r, ms));
        log.push(`giliran ${i + 1}: selesai ${Date.now() - mulai}ms`);
        return `poster-${i + 1}`;
      }),
    ),
  );
  console.log("  " + log.join(" | "));
  harus(JSON.stringify(urutan) === "[1,2,3]", `urutan eksekusi = urutan panggilan (1,2,3) — hasil: ${urutan.join(",")}`);
  harus(JSON.stringify(hasil) === '["poster-1","poster-2","poster-3"]', "hasil tiap giliran sampai ke pemanggilnya sendiri (tidak tertukar)");
  // tidak bertumpuk: mulai giliran berikut >= selesai giliran sebelumnya
  const waktu = log.filter((l) => /mulai|selesai/.test(l)).map((l) => Number(l.match(/(\d+)ms/)[1]));
  const pasangan = [];
  for (let i = 0; i < 6; i += 2) pasangan.push([waktu[i], waktu[i + 1]]);
  const bebasTumpuk = pasangan.every(([m, s], i) => s > m && (i === 0 || m >= pasangan[i - 1][1]));
  harus(bebasTumpuk, "satu poster pada satu waktu — tidak ada dua giliran berjalan bersamaan");
  if (gagal) {
    console.error(`=== ${gagal} UJI GAGAL ✗ ===`);
    process.exit(1);
  }
  console.log("=== SEMUA UJI ANTREAN MIVO LULUS ✓ ===");
})().catch((e) => {
  console.error("GAGAL:", e);
  process.exit(1);
});
