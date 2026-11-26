#!/usr/bin/env python3
"""Buat GitHub Release v1.0.53 — part/episode otomatis berlawanan judul."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.53"

body = """**NOVACUT Studio v1.0.53 — PART/EPISODE OTOMATIS BERLAWANAN JUDUL** ↕️✨

## 🐛 Keluhan (screenshot + video pengguna)
Label "PART 11/11" muncul **persis di atas judul** — dua-duanya di bawah → bertumpuk/berdesakan.

## ✅ Perbaikan
Saklar baru di menu Teks (default **AKTIF**): **"Part/episode otomatis berlawanan judul"**
- Judul di **bawah** → part otomatis muncul di **ATAS** (area kosong)
- Judul di **atas** → part otomatis muncul di **BAWAH**
- Keduanya tidak pernah bertumpuk lagi, apa pun posisi judul yang digeser
- Matikan saklarnya kalau mau geser part manual lewat slider Part/Eps seperti dulu
- Pratinjau langsung di panel Teks ikut menunjukkan posisi barunya

## 🔧 Teknis
Setelan baru `partFlip` (default true, persist localStorage — setelan lama otomatis aktif); helper `posisiPartEfektif()` dipakai di 3 titik: klip teks part saat EXPORT, pratinjau engine, dan pratinjau panel Teks — konsisten WYSIWYG.

## ✅ Diuji
DESKTOP=1 next build hijau ✓ · uji fit judul lulus ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.53.exe` & `NOVACUT-Studio-Setup-1.0.53.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Part Otomatis Berlawanan Judul", "body": body, "draft": False, "prerelease": False}).encode(),
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
