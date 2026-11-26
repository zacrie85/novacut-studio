#!/usr/bin/env python3
"""Buat GitHub Release v1.0.58 — retouch AI + frame dekoratif + strip kuning dihapus."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.58"

body = """**NOVACUT Studio v1.0.58 — "ADEGAN ASLI + RETOUCH AI & FRAME DEKORATIF" + strip kuning dihapus** 🎬

## 1️⃣ Garis kuning di bawah cover DIHAPUS
Strip premiere kuning tebal di dasar poster (dekorasi template Komik #BAPER) dihapus — permintaan pengguna lewat tangkapan layar.

## 2️⃣ Posisi Part/Episode dinaikkan
Saat judul di atas → part/episode otomatis berlawanan (di bawah) dulu di 100% (menempel tepi bawah). Kini dinaikkan ke **92%** — tidak menempel lagi.

## 3️⃣ Mode "Adegan asli" KINI DIPROSES CLOUDFLARE (bukan lagi 0 Neuron)
Jawaban atas pertanyaan pengguna ("kenapa 0 neuron, apakah tidak diproses Cloudflare?"): benar — mode lama 100% grading lokal kanvas, TIDAK pernah memanggil AI. Kini:

- Frame video dikirim ke Cloudflare **img2img (FLUX.2 klein 4B → fallback FLUX.2 dev)** dgn prompt retouch WAJIB keep-same: komposisi/orang/wajah/pose/latar dipertahankan 100%
- AI hanya: **mencerahkan**, menata warna sinematik teal-orange, kilau lembut, dan **MENGDESAIN frame/bingkai dekoratif** di keempat tepi poster sesuai tema glamor
- Gagal → otomatis jatuh ke grade studio lokal (cover tetap jadi, seperti dulu)
- Untuk Z.ai/Mage: prompt retouch lewat jalur img2img normal (frame dikirim sbg referensi)

## ⚙️ Detail teknis
- covers.ts: strip kuning komik dihapus (blok fillRect #ffd400 + garis) + `buildRetouchPrompt` baru ([TEXTFREE] + keep-same + ornamental golden frame) + opts.retouch di aiPosterizeDataURL
- main.cjs: cabang `payload.retouch` provider cloudflare → `cfEditPoster` langsung (tanpa describe) + auto-agreement BFL sekali
- exporter.ts: mode "asli" → aiPosterizeDataURL(retouch) → komposisi judul template → fallback lokal; coverSignature **v57 → v58** (cover lama regen otomatis)
- textStyle.ts: posisiPartEfektif bawah 100 → 92
- SimpleMode: opsi "🎬 Adegan asli + retouch AI & frame dekoratif (Cloudflare)" + status dinamis "● Adegan asli + retouch AI + frame AI" / "○ grade studio lokal (AI gagal)"

## ✅ Diuji
node --check main+preload ✓ · uji fit judul lulus ✓ · DESKTOP=1 next build hijau (Compiled successfully 4/4) ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.58.exe` & `NOVACUT-Studio-Setup-1.0.58.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Retouch AI + frame dekoratif, strip kuning dihapus", "body": body, "draft": False, "prerelease": False}).encode(),
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
