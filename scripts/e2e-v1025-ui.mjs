// UJI UI v1.0.25 — jalur batch PENUH (runBatchExport → buildBatchClip):
// A) POTONG MULAI & AKHIR mode Export Saja: 2..10 dtk → 1 file ≈ 8 dtk
// B) POTONG + SPLIT 4 bagian → 4 file ≈ 2 dtk per bagian
// C) POTONG + WATERMARK (logo merah X20% Y20% 25%×25%) + bingkai t7 komposit
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const URL_BASE = process.argv[2] || "http://localhost:3210/";
const DUR = Number(process.argv[3] || 12); // durasi nvtest.mp4 (ffprobe)
const OUT_DIR = "/tmp/v1025/ui";
mkdirSync(OUT_DIR, { recursive: true });

const nvB64 = readFileSync("/home/z/my-project/upload/nvtest.mp4").toString("base64");
const wmB64 = readFileSync("/tmp/v1025/wm/logo.png").toString("base64");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on("pageerror", (e) => console.log("PAGEERROR", String(e).slice(0, 300)));
await page.goto(URL_BASE, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForFunction(() => !!window.__NOVA_TEST__ && !!window.__NOVA__, null, { timeout: 120000 });
console.log("hook uji siap (dev server) — durasi nvtest =", DUR);

const runs = await page.evaluate(
  async ([b64nv, dur, wmB]) => {
    const N = window.__NOVA__;
    const T = window.__NOVA_TEST__;
    const st = N.getState();
    const bin = Uint8Array.from(atob(b64nv), (c) => c.charCodeAt(0));
    const file = new File([bin], "nvtest.mp4", { type: "video/mp4" });
    const url = URL.createObjectURL(file);
    const asset = { id: "as-ui1", name: "nvtest", type: "video", url, duration: dur, width: 604, height: 938, file };
    st.addAsset(asset);
    st.addToAssetList("export", [asset.id]);
    // dasar: tanpa cover & teks agar durasi hasil = durasi konten murni
    st.setPlaylistExport({ showTitleScreen: false, titleDuringVideo: false, showPartText: false, ratio: "9:16", fitMode: "fill", parallel: 1, wmOn: false, wmSrc: "" });
    st.setTexts({ title: "HATIKU BAGAI TERPENJARA", description: "", titleFrame: "", partFrame: "", parts: 4 });

    const waitDone = () =>
      new Promise((resolve) => {
        const iv = setInterval(() => {
          const es = N.getState().exportState;
          if (!es.running) {
            clearInterval(iv);
            resolve(es);
          }
        }, 250);
      });
    const blobToB64 = async (blob) => {
      const ab = await blob.arrayBuffer();
      let s = "";
      const u8 = new Uint8Array(ab);
      for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
      return btoa(s);
    };
    const fetchResults = async (es) => {
      const out = [];
      for (const r of es.results) {
        let b64 = "";
        try {
          const blob = await (await fetch(r.url)).blob();
          b64 = await blobToB64(blob);
        } catch (e) {
          b64 = "ERR:" + String(e).slice(0, 80);
        }
        out.push({ name: r.name, duration: r.duration, size: r.size, savedPath: r.savedPath || "", b64 });
      }
      return out;
    };
    const out = {};

    // ===== A: trim 2..10, mode Export Saja =====
    st.clearExportResults();
    st.setExportSettings({ mode: "single", trimOn: true, trimStart: 2, trimEnd: 10 });
    await T.runBatchExport([asset.id]);
    out.A = await fetchResults(await waitDone());

    // ===== B: trim 2..10 + split 4 bagian =====
    st.clearExportResults();
    st.setExportSettings({ mode: "split", splitBy: "count", parts: 4 });
    await T.runBatchExport([asset.id]);
    out.B = await fetchResults(await waitDone());

    // ===== C: trim + WATERMARK + bingkai t7 komposit (part di pita merah) =====
    st.clearExportResults();
    st.setExportSettings({ mode: "single" });
    st.setPlaylistExport({
      wmOn: true,
      wmSrc: "data:image/png;base64," + wmB,
      wmX: 20,
      wmY: 20,
      wmW: 25,
      wmH: 25,
      wmOpacity: 100,
      wmTintAmt: 0,
      showPartText: true, // teks part → masuk pita merah komposit t7
      titleDuringVideo: true, // judul (dengan pita t7) tampil selama video
    });
    st.setTexts({ titleFrame: "t7", title: "HATIKU BAGAI TERPENJARA" });
    await T.runBatchExport([asset.id]);
    out.C = await fetchResults(await waitDone());

    // kembalikan watermark/matikan agar tidak mengotori run lain
    st.setPlaylistExport({ wmOn: false, wmSrc: "" });
    st.setTexts({ titleFrame: "" });
    return out;
  },
  [nvB64, DUR, wmB64]
);

const dump = [];
for (const [k, arr] of Object.entries(runs)) {
  console.log(`${k}: ${arr.length} file — ${arr.map((r) => `${r.name}(${Number(r.duration).toFixed(2)}s,${r.size ?? 0}B)`).join(", ")}`);
  arr.forEach((r, i) => {
    const nm = `${k}-${String(i + 1).padStart(2, "0")}.mp4`;
    writeFileSync(`${OUT_DIR}/${nm}`, Buffer.from(r.b64, "base64"));
    dump.push({ run: k, file: nm, name: r.name, duration: r.duration, size: r.size });
  });
}
writeFileSync(`${OUT_DIR}/meta.json`, JSON.stringify(dump, null, 2));
await browser.close();
console.log("selesai —", OUT_DIR);
