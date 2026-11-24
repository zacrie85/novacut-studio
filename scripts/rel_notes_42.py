#!/usr/bin/env python3
"""Buat GitHub Release v1.0.42 — panel pratinjau poster penuh + panduan kunci Z.ai.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.42"

body = """**NOVACUT Studio v1.0.42 — PANEL PRATINJAU POSTER PENUH (9:16) + PANDUAN KUNCI Z.AI** 🖼️🔑

## 🖼️ Panel Pratinjau Poster khusus di Langkah 4 (Export & Split)
Keluhan: pratinjau cover di Mode Sederhana hanya strip kecil (`h-28`, terpotong `object-cover`) — poster 9:16 tak terlihat utuh.
Kini Langkah 4 = **dua kolom**:
- **Kiri**: semua pengaturan (pembagian, potong, watermark, cover, folder, tombol export, progres)
- **Kanan**: panel **🖼️ Pratinjau Poster** khusus — *sticky* mengikuti scroll, **rasio penuh sesuai proyek (9:16 / 16:9)**, gambar `object-contain` (**tidak terpotong lagi**), ukuran besar (±340px lebar → poster 9:16 setinggi ±600px)
- Belum ada poster? Panel menampilkan kotak panduan "aktifkan Cover + Buat Ulang Poster"
- Responsif: layar sempit → panel turun di bawah pengaturan (tetap terlihat penuh)

## 🔑 Panduan Kunci API Z.ai (±Rp250/poster) kini DI DALAM app
Kartu Mesin Poster AI → pill **Z.ai** (saat belum ada kunci) menampilkan panduan 4 langkah + tombol pintasan:
1. Buka **z.ai** → daftar/masuk akun (cukup email, kartu tidak wajib)
2. Ikon akun → **API Keys** → **Create API Key** → pilih **Standard API Key** → salin (hanya tampil sekali)
3. Bila kredit belum ada: halaman **Billing** → isi saldo (±Rp250 ≈ 1 poster; vision pembaca adegan **gratis** — glm-4.6v-flash)
4. Tempel kunci di kartu → **Simpan** → **Tes Koneksi** → 🎨 **Buat Ulang Poster**
Tombol pintasan baru: **🔑 Buka z.ai → API Keys ↗** (langsung ke halaman kunci) + **Tes Koneksi** tersedia sejak awal. Langkah mengikuti quick-start resmi docs.z.ai (Register → API Keys → Standard API Key → Billing).

## 💰 Perbandingan penyedia poster (dua-duanya kini berpanduan lengkap di app)
- **Cloudflare**: GRATIS, frame utuh + FLUX.2 Klein editing (±80 poster/hari) — panduan 4 langkah ada sejak v1.0.39
- **Z.ai**: bayar per pakai ±Rp250/poster GLM-Image (HD/Hemat) — panduan 4 langkah baru di v1.0.42

Diuji: build desktop hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.42.exe` & `NOVACUT-Studio-Setup-1.0.42.exe` ke rilis ini."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Panel Pratinjau Poster Penuh + Panduan Kunci Z.ai", "body": body, "draft": False, "prerelease": False}).encode(),
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
