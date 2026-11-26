#!/usr/bin/env python3
"""Buat GitHub Release v1.0.54 — fix part vs template poster + mode Poster Kisah."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.54"

body = """**NOVACUT Studio v1.0.54 — FIX PART vs TEMPLATE + POSTER KISAH (ala gpt-image-2.5-flare)** 📕🔥

## 🐛 Fix: label part masih nabrak judul template Hollywood/Komik
Sebab: klip teks part DI COVER di-hardcode `pos: top` — selalu di ATAS, padahal judul template **Hollywood Zombieland** & **Komik HUMOR #BAPER** juga di ATAS → bertumpuk.

Kini zona judul poster dikenali mesin:
- **Hollywood & Komik (judul ATAS)** → part otomatis **BAWAH** ⬇️
- **Gala Malam & Neon Panggung (judul BAWAH)** → part tetap **ATAS** ⬆️
- Berlaku untuk label part di cover DAN saat video (judul mesin tampil → berlawanan titleV, v1.0.53; tidak tampil → ikut zona poster)
- Saklar "Part otomatis berlawanan judul" tetap bisa dimatikan utk geser manual

## 📕 BARU: Mode "Poster Kisah AI" — mesin poster ala gpt-image-2.5-flare
Opsi baru di **Basis Poster**: **"📕 Poster kisah AI — adegan baru dari judul (CF gratis / Mage)"**
- Judul video dipakai sbg **ALUR CERITA** → mesin merakit prompt poster blockbuster (hero di tengah, momen aksi atas, momen emosional bawah, teal-orange, fotoreal)
- **Mage/Z.ai**: frame video dikirim sbg referensi tokoh (img2img) → wajah asli terbawa ke poster — persis workflow contoh "Veteran Pasukan Khusus"
- **Cloudflare**: txt2img langsung — **0 Neuron / Rp0** (karakter karangan)
- Judul TETAP ditulis template app (ejaan 100% benar, tidak mungkin hilang); gambar AI murni tanpa teks ([TEXTFREE])

## ✅ Diuji
node --check main+preload ✓ · uji fit judul lulus ✓ · DESKTOP=1 next build hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.54.exe` & `NOVACUT-Studio-Setup-1.0.54.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Fix Part vs Template + Poster Kisah AI", "body": body, "draft": False, "prerelease": False}).encode(),
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
