#!/usr/bin/env python3
"""Buat GitHub Release v1.0.28 (fix suara preset Cepat) — build exe otomatis oleh CI.
BUTUH token valid di /tmp/gh_auth.env (format: GH_TOKEN=ghp_...)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.28"

body = """**NOVACUT Studio v1.0.28 — PERBAIKAN: SUARA HILANG di preset "CEPAT 720p"** 🔊

Terima kasih kawan sudah melapor! Bug ini sudah diperbaiki — preset **"Cepat 720p · ≤50 MB"** sekarang kembali bersuara.

**Penyebab**
Preset "Cepat" meng-encode ulang audio agar ukuran file pasti. Tapi di beberapa Windows, encoder AAC bawaan (WebCodecs) tidak tersedia — akibatnya file MP4 hasil export bisa **tanpa trek audio sama sekali**, atau berisi audio yang tidak bisa diputar pemutar umum (WhatsApp/Windows).

**Perbaikan (v1.0.28)**
- Aplikasi sekarang **mendeteksi dulu** apakah Windows kawan punya encoder AAC.
- **Punya** → audio di-encode ulang AAC stabil (seperti rencana, ukuran tetap terjaga).
- **Tidak punya** → audio asli **disalin utuh** (selalu AAC, pasti bersuara) dan bitrate video otomatis dikurangi sedikit lebih untuk tetap mendekati batas 50 MB.
- Status di layar export kini menunjukkan cara audio diproses: "audio asli disalin" atau "audio AAC 128 kbps".

**Catatan ukuran**: dengan preset Cepat, file ≤ ~50 MB terjaga untuk setiap bagian sampai ±6,5–8 menit (tergantung metode audio). Bagian lebih panjang dari itu akan lebih besar — gunakan **split cerdas** (bagian pendek) agar semua file tetap ≤ 50 MB.

Video 3 menit yang dulu ~100 MB di "Ringan 720p" tetap menjadi **±48 MB** di "Cepat" — sekarang DENGAN suara. Preset lain tidak berubah."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — FIX SUARA preset CEPAT 720p", "body": body, "draft": False, "prerelease": False}).encode(),
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
