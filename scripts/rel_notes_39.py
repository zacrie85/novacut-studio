#!/usr/bin/env python3
"""Buat GitHub Release v1.0.39 — panduan Cloudflare gratis di dalam app.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.39"

body = """**NOVACUT Studio v1.0.39 — PANDUAN CLOUDFLARE GRATIS KINI DI DALAM APP** 📖🆓

Kartu **Mesin Poster AI** (pilih pill **Cloudflare (GRATIS)**) kini menampilkan **panduan 4 langkah lengkap** langsung di dalam kartu — tidak perlu buka dokumentasi lagi. Plus dua tombol pintasan: **Buka dash.cloudflare.com** (daftar + salin Account ID) dan **Buka halaman API Tokens** (buat token).

## 📖 PANDUAN: Kredensial Cloudflare GRATIS (tanpa kartu, ±5 menit)
1. **Daftar akun gratis** di dash.cloudflare.com — cukup email & password, **tanpa kartu kredit**. Paket Free sudah termasuk Workers AI.
2. **Salin Account ID** — di beranda dash.cloudflare.com, kotak **Account ID** di sisi kanan halaman → klik tombol salin.
3. **Buat API Token** — klik ikon profil (kanan-atas) → **My Profile → API Tokens → Create Token → Create Custom Token** → nama bebas (mis. "NOVACUT") → Permissions: **Account · Workers AI · Run** → *Continue to summary* → **Create Token** → salin token (⚠️ token hanya ditampilkan SEKALI).
4. **Tempel keduanya** di kartu Mesin Poster AI → **Simpan** → **Tes Koneksi** (0 Neuron, tidak makan kuota) → klik 🎨 **Buat Ulang Poster** — poster Hollywood GRATIS!

## 💰 Biaya (tetap seperti v1.0.38)
- **Cloudflare**: GRATIS — 10.000 Neuron/hari (±110-170 poster), reset 07.00 WIB
- **Z.ai**: kunci gratis; bayar $0.015 (±Rp250) per poster GLM-Image; toggle HD (terbaik ±20 dtk) / Hemat (cepat 5-10 dtk)

Diuji: node --check main/preload ✓, build desktop hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.39.exe` & `NOVACUT-Studio-Setup-1.0.39.exe` ke rilis ini."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Panduan Cloudflare Gratis di Dalam App", "body": body, "draft": False, "prerelease": False}).encode(),
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
