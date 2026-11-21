#!/usr/bin/env python3
"""Buat GitHub Release v1.0.27 (body catatan rilis Bahasa Indonesia) —
build desktop (exe) otomatis dilampirkan oleh CI (build-desktop.yml).
BUTUH token valid di /tmp/gh_auth.env (format: GH_TOKEN=ghp_...)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.27"

body = """**NOVACUT Studio v1.0.27 — KUALITAS BARU "CEPAT 720p" (FILE DIJAGA ≤ ~50 MB)**

Permintaan kawan dikabulkan: sekarang ada pilihan kualitas yang membuat file hasil **DIJAGA tidak lebih dari ~50 MB** — pas untuk kirim via WhatsApp & chat.

**PILIHAN BARU: "Cepat 720p · ≤50 MB"** 📦
Di menu **Mode Sederhana → 2. ATUR → Rasio & Layar** (dan panel Playlist), pilihan kualitas kini 4: **Cepat** · Ringan · Tajam · Maksimal.
- **Cepat** = resolusi 720p dengan bitrate video yang **dihitung otomatis dari DURASI setiap bagian**, sehingga ukuran file selalu tepat di kisaran **~48 MB** (di bawah batas 50 MB), apa pun durasinya.
- Contoh nyata: video 3 menit yang dulu ~100 MB di "Ringan 720p" → sekarang dengan **"Cepat"** jadi **~48 MB**. Bagian 1 menit ≈ 36 MB, bagian 5 menit ≈ 48 MB.
- Bagian pendek (≤ ±80 detik) otomatis memakai bitrate maksimum 4,5 Mbps — hasilnya TIDAK mungkin lebih besar dari "Ringan". Bagian panjang pakai bitrate lebih kecil agar tetap masuk batas.
- Audio selalu di-encode ulang AAC stabil (bukan salinan asli) supaya ukuran bisa dijamin — audio sumber berbitrate tinggi tidak akan membengkakkan file.
- Catatan: untuk satu bagian lebih panjang dari ±8 menit, batas 50 MB tidak lagi memungkinkan pada kualitas layak tonton — gunakan split cerdas (bagian pendek) agar semua file tetap ≤ 50 MB.

Preset lain tidak berubah: **Ringan** 720p (±100 MB per 3 menit), **Tajam** 1080p, **Maksimal** 1080p bitrate tertinggi.

Cara pakai: pilih **"Cepat"** di Kualitas hasil lalu export seperti biasa (mesin Kilat & Turbo sama-sama mengikuti). Uji: perhitungan bitrate & estimasi ukuran diverifikasi lewat skrip (video 30s–8 menit semuanya ≤ 48 MB), tsc & ESLint bersih."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — CEPAT 720p (FILE ≤ ~50 MB)", "body": body, "draft": False, "prerelease": False}).encode(),
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
