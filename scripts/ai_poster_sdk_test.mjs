// Uji langsung z-ai-web-dev-sdk: frame video + prompt default -> poster Hollywood
// Memvalidasi kredensial, dukungan dataURL pada images.generations.edit, & kualitas hasil.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "/home/z/my-project/upload/20261110-0300-42.4890889.mp4";
const OUT = "/tmp/render/ai_poster_test.png";
const TITLE = "KELAS NAKAL USIR 99 GURU";

const b64frame = execSync(
  `ffmpeg -y -ss 1.5 -i "${SRC}" -frames:v 1 -vf scale=1344:-2 /tmp/render/ai_frame.png 2>/dev/null && base64 -w0 /tmp/render/ai_frame.png`,
  { maxBuffer: 64 * 1024 * 1024 },
).toString();

const prompt =
  `Rubahlah gambar ini menjadi poster untuk sebuah film Hollywood dengan menggunakan judul "${TITLE}" sebagai judul di poster. ` +
  `Buat poster dengan gaya modern sinematik. Semua tulisan harus berada di dalam area gambar, tidak terpotong di tepi kiri, kanan, atas, atau bawah.`;

console.log("[1] frame siap, memanggil AI (bisa 30-120 dtk)...");
const t0 = Date.now();
const mod = await import("z-ai-web-dev-sdk");
const ZAI = mod.default ?? mod;
const zai = await ZAI.create();
const res = await zai.images.generations.edit({
  prompt,
  images: [{ url: `data:image/png;base64,${b64frame}` }],
  size: "1344x768",
});
const b64 = res?.data?.[0]?.base64;
if (!b64) {
  console.log("GAGAL: respons AI kosong", JSON.stringify(res).slice(0, 300));
  process.exit(1);
}
writeFileSync(OUT, Buffer.from(b64, "base64"));
console.log(`[2] poster AI jadi dalam ${Math.round((Date.now() - t0) / 1000)}s -> ${OUT}`);
const stat = execSync(`python3 -c "
from PIL import Image
im = Image.open('${OUT}').convert('RGB')
px = list(im.getdata())[::53]
n = len(px)
dark = sum(1 for r,g,b in px if 0.299*r+0.587*g+0.114*b < 16)/n
mean = sum(0.299*r+0.587*g+0.114*b for r,g,b in px)/n
colorful = sum(1 for r,g,b in px if max(r,g,b)-min(r,g,b) > 30)/n
print(f'{im.size[0]}x{im.size[1]} gelap={dark*100:.1f}% terang={mean:.1f} warna={colorful*100:.1f}%')
"`).toString().trim();
console.log("[3] piksel:", stat);
console.log(stat.includes("gelap=100") || stat.includes("gelap=99") ? "❌ HITAM" : "✅ POSTER AI VALID");
