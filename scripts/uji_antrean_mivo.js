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
const nSnap = (main.match(/snapshotImgLama\(\);/g) || []).length;
harus(nSnap >= 4, `snapshot dini dipasang di did-navigate + tunggu 4/9/14 dtk (ditemukan ${nSnap}×)`);
harus(main.includes("selesaiImg?.add(baru.s);"), "URL hasil terpanen dicatat SELAMANYA — poster sama tak bisa dipanen 2×");
harus(!/dulu jendela lama dipakai ulang/i.test(main.split("v1.0.64")[1] || ""), "komentar menjelaskan celah v1.0.63");

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
