#!/usr/bin/env python3
"""Buat GitHub Release v1.0.49 — poster CF dari adegan asli (edit robust) + mode 0 Neuron."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.49"

body = """**NOVACUT Studio v1.0.49 — POSTER DARI ADEGAN ASLI (edit CF diperkuat) + MODE 0 NEURON** 🎬🔒

## 🐛 Sebab "poster masih bukan orang asli video"
Jalur EDIT Cloudflare (frame dikirim utk disentuh) dulu **gagal diam-diam** — paling sering karena **Model Agreement BFL** (ketentuan Black Forest Labs yang wajib disetujui sekali per akun, sama seperti kasus Llama dulu) atau bentuk payload ditolak — lalu app jatuh ke txt2img yang **mengarang orang baru** dari deskripsi. Inilah poster "Ajeng Febria x Kades" berisi orang acak.

## ✅ Perbaikan
- **Model Agreement BFL disetujui otomatis** → seluruh rantai edit diulang (pola fix Llama v1.0.41)
- **Rantai edit 6 lapis**: multipart TANPA rasio dulu (komposisi/frame asli dijaga persis) → multipart dgn rasio → JSON image → JSON images[] → **OpenAI-compatible `/ai/v1/images/edits`** → **FLUX.2 dev** (multi-reference, identitas terkuat)
- **Prompt edit baru — SUBTLE EDIT**: komposisi, framing, crop, sudut kamera & aspek foto asli WAJIB sama; hanya pencahayaan, color grade & atmosfer yang berubah (tidak boleh re-imagine)
- **Alasan gagal edit kini tampil di label status** — tidak ada lagi kegagalan tersembunyi
- **MODE BARU "🎬 Adegan asli + grade studio (0 Neuron)"** di panel poster: adegan video ASLI langsung jadi dasar poster (grade sinematik + vignette lokal) + judul tetap ditulis app — identitas 100%, tanpa biaya AI sedikit pun
- Komik: bintang dekor tak lagi menimpa judul + margin baris terakhir diperluas (kasus "MONIKA" menempel tepi)

## 💰 Catatan langganan Cloudflare (pertanyaan pengguna)
**Gratis 10.000 Neuron/hari** (reset 00:00 UTC) — satu poster edit ±70–100 Neuron → **±100 poster/hari TANPA BAYAR**. Bila perlu lebih: plan Workers Paid **USD 5/bulan** + neuron tambahan **$0.011/1.000** (±Rp45/poster). Panduan: dash.cloudflare.com → Billing → Plans → Workers Paid.

## ✅ Diuji
node --check main+preload ✓ · uji judul 6/6 ✓ · uji fit judul lulus ✓ · DESKTOP=1 next build hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.49.exe` & `NOVACUT-Studio-Setup-1.0.49.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Poster dari Adegan Asli (Edit CF Diperkuat) + Mode 0 Neuron", "body": body, "draft": False, "prerelease": False}).encode(),
    headers={"Authorization": "token " + TOK, "Content-Type": "application/vnd.github+json", "Accept": "application/vnd.github+json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.load(r)
    print("release dibuat:", d.get("html_url"))
except Exception as e:
    print("GAGAL buat release:", getattr(e, "code", ""), str(e)[:200])
    sys.exit(1)
