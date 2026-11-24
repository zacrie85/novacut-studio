#!/usr/bin/env python3
"""Buat GitHub Release v1.0.41 — frame utuh + judul otomatis + uji nyata.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.41"

body = """**NOVACUT Studio v1.0.41 — FRAME VIDEO UTUH + JUDUL OTOMATIS DARI NAMA VIDEO (uji nyata Cloudflare ✓)** 🖼️🏷️🆓

## 🎯 Dua perbaikan utama (dengan bukti uji nyata!)
**1. Frame video dikirim UTUH ke Cloudflare** — jalur EDIT memakai **FLUX.2 Klein 4B** (model editing katalog CF): multipart/form-data sesuai skema resmi + rasio proyek (uji nyata: output **1024×576** 16:9 ✓) → poster dilukis **DARI frame videomu** — wajah, rambut, pakaian, pose, dan setting TERJAGA. Uji nyata: pria jas hitam di motor, bulan purnama, pohon lontar — semuanya persis frame asli, judul tercetak bersih, **tanpa coretan credits**.
**2. NAMA VIDEO OTOMATIS jadi judul poster** — bug lama: judul video hanya disisipkan bila prompt manual KOSONG; begitu pengguna menulis prompt sendiri, judul dibuang (poster kemarin jadi "HOLLYWOOD" pilihan AI). Kini **selalu** disisipkan: nama file (tanpa ekstensi, `_`→spasi) → `judul "X"` → diekstrak main process → diwajibkan jadi **satu-satunya teks besar, HURUF BESAR, dieja tepat**. Uji nyata: judul "UJI COBA NOVACUT 2026" tercetak **100% benar**. Pengguna tetap bisa menentukan judul sendiri dengan menulis `judul "..."` di prompt manual.

## 🔧 Perbaikan pendukung
- 👁️ **Auto-agree lisensi Meta Llama**: model vision minta persetujuan sekali per akun — app kini mengirim `{"prompt":"agree"}` otomatis lalu mengulang (uji nyata ✓)
- 🛡️ Kata "Hollywood" dibersihkan dari instruksi & judul dibatasi 60 karakter
- 🔁 Rantai tangguh: multipart+rasio → multipart polos → JSON `image` → JSON `images` → fallback FLUX.1 schnell (rasio) → fallback grade lokal
- 💰 Kuota tetap 10.000 Neuron/hari gratis: edit ±125 Neuron/poster (±80/hari), schnell ±58 (±170/hari), reset 07.00 WIB — total uji nyata hanya ±310 Neuron

## 📖 Panduan Cloudflare GRATIS (di dalam app, dari v1.0.39-40)
Kartu **Mesin Poster AI** → pill **Cloudflare (GRATIS)** menampilkan panduan 4 langkah + tombol pintasan: daftar dash.cloudflare.com tanpa kartu → salin **Account ID** (beranda, kotak kanan) → **My Profile → API Tokens → Create Token → Custom Token** (Permissions: **Account · Workers AI · Run**) → tempel di kartu → **Simpan → Tes Koneksi (0 Neuron)** → 🎨 **Buat Ulang Poster**.

Diuji: node --check main/preload ✓, build desktop hijau ✓ + **pipeline nyata Cloudflare end-to-end ✓**. CI menempelkan `NOVACUT-Studio-Portable-1.0.41.exe` & `NOVACUT-Studio-Setup-1.0.41.exe` ke rilis ini."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Frame Utuh + Judul Otomatis (uji nyata Cloudflare)", "body": body, "draft": False, "prerelease": False}).encode(),
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
