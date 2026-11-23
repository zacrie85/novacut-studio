#!/usr/bin/env python3
"""Buat GitHub Release v1.0.32 (perbaikan cover Poster Hollywood keluar hitam) — build exe otomatis oleh CI.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.32"

body = """**NOVACUT Studio v1.0.32 — FIX: Cover Poster Hollywood Keluar HITAM** 🛠️

Laporan kwan: setelah pilih gaya **"🎬 Poster Hollywood"**, cover di depan video hasil export tetap **hitam polos** (tanpa adegan, tanpa furnitur poster). Laporan ini 100% benar — terima kasih sudah mengirim video contohnya!

**Akar masalah**
- Saat Export & Split, aplikasi memakai ulang **cover lama yang sudah tersimpan** tanpa mengecek apakah gaya cover sudah berubah. Cover hitam lama (dibuat sebelumnya saat gaya masih "Hitam Polos" / versi lama) terus dipakai walau pengguna sudah memilih Poster Hollywood — jadi 256 bagian pun memakai cover hitam itu.
- Fitur pengambilan gambar otomatis dari video SEBENARNYA ada (AI pilih adegan terbaik → frame dijadikan poster), tapi cover baru tidak pernah dibuat karena cover lama masih dianggap "siap".

**Perbaikan (3 lapis)**
1. **Tanda tangan gaya cover (`coverSig`)** — setiap cover mencatat kombinasi gaya saat dibuat. Saat export, bila gaya sekarang tidak cocok dengan tanda cover lama → cover **otomatis dibuat ulang** dari video (AI ambil adegan terbaik → grade poster). Semua cover lama versi sebelumnya otomatis dibuat ulang sekali (tanda lama tidak cocok).
2. **Ganti gaya = langsung jadi** — tombol "Template AI (klasik)" / "🎬 Poster Hollywood", pemilih 99 gaya, dan toggle AI Sinematik (di Mode Sederhana & Cover Studio) kini **membuat ulang cover tersimpan seketika** + notifikasi "Cover diperbarui ✔".
3. **Jalur cover mode manual dirapikan** di ensureCoverAsset (dibangun dari gambar unggahan, bukan diam-diam dari adegan video).

**Bukti perbaikan (diuji dengan frame asli video pelapor)** — mesin poster dirender di Chromium dengan frame dari video "Kelas Nakal": 97% area terisi gambar ter-grade + furnitur "NOVACUT PICTURES MEMPERSEMBAHKAN", tagline gaya, blok kredit, dan judul dinamis + "PART 1/256" di bawah. Layar hitam hanya 3%.

**Catatan upgrade**: buka NOVACUT v1.0.32 → langsung export seperti biasa. Cover pertama akan dibuat ulang otomatis (adegan dianalisis ulang, ±beberapa detik per film). Bila ingin gaya berbeda, cukup ganti di menu Cover Otomatis — cover langsung diperbarui."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — FIX: Cover Poster Hollywood Keluar Hitam", "body": body, "draft": False, "prerelease": False}).encode(),
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
