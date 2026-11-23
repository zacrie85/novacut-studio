#!/usr/bin/env python3
"""Buat GitHub Release v1.0.29 (fix permanen suara preset Cepat) — build exe otomatis oleh CI.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.29"

body = """**NOVACUT Studio v1.0.29 — PERBAIKAN TUNTAS: SUARA preset "CEPAT 720p"** 🔊

Terima kasih kawan sudah mengirim contoh video hasil export — itu kunci menemukan akar masalahnya!

**Apa yang kudapat dari video kawan**
File hasil export ternyata punya trek audio AAC, tapi isinya **heganya murni (−91 dB, angka nol semua)**. Artinya: proses encode audio jalan, tapi masukannya kosong.

**Akar masalah**
Untuk meng-encode ulang audio, aplikasi harus mendekode (mengubah) seluruh suara film sumber ke PCM — untuk film panjang (film kawan dibagi 31+ bagian = 90+ menit) ini bisa ±2 GB memori. Saat dekode itu **gagal**, versi sebelumnya **menelan error-nya diam-diam** dan tetap menulis trek audio berisi nol — hasilnya video tampak "sukses" tapi bisu. Perbaikan v1.0.28 belum menolong karena di Windows kawan encoder AAC-nya justru ADA; masalahnya ada di dekode masukan.

**Perbaikan (v1.0.29)**
- Preset **"Cepat 720p · ≤50 MB"** kini memakai **jalur audio yang sama dengan preset Ringan/Tajam/Maksimal**: audio asli **disalin utuh** (stream-copy AAC) — jalur yang sudah bertahun-tahun terbukti bersuara di semua preset lain. Tidak ada lagi dekode audio se-film untuk preset ini.
- Batas ukuran tetap dijaga: bitrate video dihitung dari durasi dengan **reservasi audio 320 kbps** — bagian 3 menit ≈ 48 MB, bagian 5 menit ≈ 48 MB (≤ 50 MB untuk bagian sampai ±6,5 menit; lebih panjang dari itu gunakan split cerdas).
- **Pengaman anti-bisu permanen**: kalau suatu saat dekode audio memang diperlukan (film dengan fade/musik) dan gagal, bagian itu kini **tercatat GAGAL dengan pesan jelas** — tidak pernah lagi menghasilkan video bisu yang tampak sukses.

Video 3 menit kawan tetap ±48 MB (dulu ~100 MB di "Ringan 720p") — sekarang **DENGAN SUARA**. Preset lain tidak berubah sama sekali."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — FIX TUNTAS suara preset CEPAT 720p", "body": body, "draft": False, "prerelease": False}).encode(),
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
