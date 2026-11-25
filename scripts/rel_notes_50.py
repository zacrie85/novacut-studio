#!/usr/bin/env python3
"""Buat GitHub Release v1.0.50 — bingkai sinematik 0 Neuron + template baru judul bawah + fix dobel judul."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.50"

body = """**NOVACUT Studio v1.0.50 — BINGKAI SINEMATIK (0 NEURON) + TEMPLATE BARU JUDUL DI BAWAH + FIX DOBEL JUDUL** 🎞️✨

## 🆕 Mode baru: "🎞️ Adegan asli + bg hitam sinematik (0 Neuron)"
Grade studio dianggap terlalu biasa → kini adegan video ASLI dipasang **utuh tanpa crop** di atas **background hitam sinematik**: glow lembut di belakang foto, grade teal-orange ringan (warna saja — wajah tetap asli), **bingkai garis emas + bracket sudut**, vignette, grain film, zona bawah gelap untuk judul. Identitas 100%, biaya 0.

## 🆕 Template baru (Papan Kapur & Epik dihapus)
- **Gala Malam · PREMIERE** — judul serif putih + garis emas di **BAWAH**
- **Neon Panggung · LIVE** — bingkai neon cyan-magenta + judul neon glow di **BAWAH**
Keduanya menaruh **nama video di bagian bawah** sesuai permintaan; template "Otomatis" kini memilih Komik (judul pendek) → Gala (sedang) → Hollywood (panjang). Cover lama bergaya papan/epik otomatis jatuh ke Hollywood.

## 🐛 FIX DOBEL JUDUL (teks di tengah poster)
Tulisan "judul + part" di TENGAH poster (gambar referensi) bukan bawaan video — itu **overlay judul mesin render** yang muncul karena poster adegan-asli tertandai `aiMade:false`. Kini poster yang sudah memuat judul template ditandai `aiMade:true` → mesin render **hanya menulis label PART** (Episode/Part sesuai gaya pilihan) → judul tampil SEKALI saja.

## 🆕 Opsi "⚪ Part saja — tanpa judul"
Untuk video yang SUDAH punya tulisan judul bawaan: poster digambar polos tanpa judul template, hanya label part dari mesin render → judul tidak tampil dobel.

## ✅ Diuji
uji fit judul lulus ✓ · DESKTOP=1 next build hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.50.exe` & `NOVACUT-Studio-Setup-1.0.50.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Bingkai Sinematik (0 Neuron) + Template Judul di Bawah + Fix Dobel Judul", "body": body, "draft": False, "prerelease": False}).encode(),
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
