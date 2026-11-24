#!/usr/bin/env python3
"""Buat GitHub Release v1.0.40 — frame utuh via FLUX.2 Klein 4B + panduan CF di app.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.40"

body = """**NOVACUT Studio v1.0.40 — FRAME VIDEO DIKIRIM UTUH KE CLOUDFLARE (poster kini mirip adegan asli!) + Panduan CF gratis di dalam app** 🖼️🆓

## 🎯 Fix utama: "poster jadi beda dari videoku"
Sebelumnya (v1.0.38-39): jalur Cloudflare hanya mengirim **deskripsi teks** adegan ke FLUX.1 schnell (text-to-image) — poster jadi interpretasi baru, wajah beda, dan kata *"Hollywood"* di instruksi bocor jadi judul poster + credits jadi coretan gibberish.

Kini jalur Cloudflare memakai **FLUX.2 Klein 4B (model editing, katalog CF Agustus 2026)**:
- 🖼️ **Frame video dikirim UTUH sebagai gambar input** (multipart/form-data sesuai skema resmi CF; cadangan JSON `image` / `images`) — poster dilukis **DARI frame itu**, wajah/rambut/pakaian/pose terjaga
- 🏷️ **Judul asli video** diekstrak dan diwajibkan jadi satu-satunya teks besar; kata "Hollywood" dihapus dari instruksi (anti-bocor)
- 🚫 Credits/nama aktor/logo studio/katak kecil **diblokir** (tidak jadi coretan)
- 👁️ Deskripsi vision lebih kaya (umur, rambut, pakaian, pose, properti, palette — 120 kata)
- 🔁 Edit gagal (kuota/schema) → otomatis fallback FLUX.1 schnell text-to-image (±58 Neuron) — pipeline tak pernah mati
- 💰 Kuota tetap 10.000 Neuron/hari: edit ±125 Neuron/poster (±80/hari), schnell ±58 (±170/hari), reset 07.00 WIB

## 📖 Panduan Cloudflare GRATIS (dari v1.0.39, kini di dalam app)
Kartu **Mesin Poster AI** (pill **Cloudflare (GRATIS)**) menampilkan panduan 4 langkah + tombol pintasan **Buka dash.cloudflare.com** & **Buka halaman API Tokens**:
1. **Daftar akun gratis** di dash.cloudflare.com — cukup email, **tanpa kartu kredit**
2. **Salin Account ID** — kotak di sisi kanan beranda dash
3. **My Profile → API Tokens → Create Token → Create Custom Token** → Permissions: **Account · Workers AI · Run** → Create Token (tampil SEKALI)
4. **Tempel keduanya** di kartu → Simpan → Tes Koneksi (0 Neuron) → 🎨 **Buat Ulang Poster**

## 💰 Perbandingan penyedia
- **Cloudflare**: GRATIS, tanpa kartu — kini dengan editing frame (mirip adegan asli)
- **Z.ai**: $0.015 (±Rp250)/poster GLM-Image, toggle HD/Hemat — tetap tersedia sebagai cadangan kualitas

Diuji: node --check main/preload ✓, build desktop hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.40.exe` & `NOVACUT-Studio-Setup-1.0.40.exe` ke rilis ini."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Frame Utuh via FLUX.2 Klein + Panduan Cloudflare", "body": body, "draft": False, "prerelease": False}).encode(),
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
