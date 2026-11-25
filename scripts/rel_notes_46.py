#!/usr/bin/env python3
"""Buat GitHub Release v1.0.46 — poster AI tanpa teks + frame tulisan gaya referensi (judul ditulis app)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.46"

body = """**NOVACUT Studio v1.0.46 — POSTER AI TANPA TEKS + FRAME TULISAN GAYA REFERENSI (JUDUL SELALU BENAR)** 🖼️✒️🎯

## 🎯 1. Ide barumu dijalankan: AI melukis, APP yang menulis judul
Keluhan "tulisan di poster terkadang tidak sesuai nama video" dituntun habis. Alur baru (default):
1. **Cloudflare/Z.ai membuat poster TANPA teks apa pun** — art murni 720×1280 (9:16) / 1280×720 (16:9), permintaan "no words, no letters, no numbers, no logos" + area atas & tepi bawah dijaga longgar untuk judul.
2. Art dikirim ke aplikasi (PNG/JPEG, rasio proyek).
3. **Aplikasi menempelkan judul sendiri** — diambil dari nama video (sudah dibersihkan), digambar canvas → **ejaan 100% benar setiap kali**, font konsisten, tidak bisa salah.

Pengaturan baru di Langkah 4 (di bawah tombol Buat Ulang Poster): **📝 Judul: ditulis app (selalu benar)** [default] / **🅰️ ditulis AI** (perilaku lama, kalau mau tipografi AI).

## 🎨 2. 4 FRAME POSTER gaya referensimu — posisi tulisan meniru aslinya
| Frame | Meniru | Gaya |
|---|---|---|
| **Hollywood · ZOMBIELAND** | ZOMBIELAND | Judul raksasa oranye-merah (Anton) di atas + garis putih + blok credit di dasar |
| **Komik · HUMOR #BAPER** | HUMOR #BAPER | Kata pertama putih miring + sisanya kuning besar (Alfa Slab One), outline lapis putih-hitam, bintang burst pop-art, strip premiere kuning |
| **Papan Kapur · ENIGMA** | ENIGMA | Papan tulis kayu + judul kapur putih (Barlow Condensed) + garis merah, pita kertas sobek di bawah |
| **Epik · Beauty & the Beast** | Beauty & the Beast | Judul serif emas (Cinzel) — kata tengah kecil di antara dua kata besar — + swash lengkung emas |

Pilih lewat dropdown **Template: Otomatis / 4 gaya**. Mode Otomatis: judul pendek atau mengandung `#` → Komik; selainnya → Hollywood. Nama pemeran/tanggal pada referensi **tidak dipalsukan** (datanya tidak ada di video) — zona itu jadi dekorasi murni; kalau mau bisa mengetik nama pemeran sendiri, bilang saja.

## 🔧 3. Perbaikan lanjutan
- Resolusi poster Cloudflare dinaikkan ke ±720p (720×1280 / 1280×720); bila skema menolak otomatis jatuh ke ukuran aman.
- Ganti setelan Judul/Template otomatis membuat ulang poster saat export (tanda tangan cover kini memasukkan keduanya).

## ✅ Diuji
Uji bersihkan judul 6/6 ✓ · uji logika text-free 5/5 ✓ · `node --check` ✓ · build desktop hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.46.exe` & `NOVACUT-Studio-Setup-1.0.46.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Poster AI Tanpa Teks + Frame Tulisan Gaya Referensi", "body": body, "draft": False, "prerelease": False}).encode(),
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
