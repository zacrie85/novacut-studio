#!/usr/bin/env python3
"""Buat GitHub Release v1.0.48 — bug ukuran judul poster: font terkunci maksimum & terpotong …"""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.48"

body = """**NOVACUT Studio v1.0.48 — PERBAIKAN FATAL UKURAN JUDUL POSTER (font raksasa & terpotong "…")** ✒️🔧

## 🐛 Sebab keluhan "tulisan terlalu besar & tidak semua masuk"
Bug di pencari ukuran judul poster (`posterJudulFit`): pengujian "apakah judul muat" memakai pembungkus teks **dengan batas baris yang memotong hasil ke tepat N baris + menambah "…" SEBELUM dihitung** → jumlah baris tidak pernah melebihi batas → kondisi "muat" selalu benar pada percobaan pertama → **font terkunci di ukuran MAKSIMUM** dan judul panjang **terpotong jadi "…"** (contoh nyata: poster *"AJENG FEBRIA X KADES…"*).

## ✅ Perbaikan
- Pengujian kini memakai jumlah baris **NYATA** (tanpa pemotongan) → font otomatis mengecil mengikuti panjang judul, judul selalu **UTUH** (tidak ada lagi "…")
- Ukuran maksimum judul diturunkan di semua template: Hollywood **11,5% → 7,5%** tinggi poster, Komik 11,5% → 8%, Epik 10% → 7% (judul pendek tetap tebal, tidak lagi memakan separuh poster)
- Judul panjang: maksimal 3 baris di area atas (blok ≤ ±35% tinggi poster); judul sangat panjang (100 huruf) tetap utuh dgn font terkecil
- Cover lama otomatis dibuat ulang (tanda tangan gaya v48) — tinggal klik 🎨 Buat Ulang Poster

## ✅ Diuji
Pembanding lama-vs-baru pada 4 panjang judul (8/31/60/100 huruf): semua utuh, tanpa "…", font adaptif ✓ · uji judul bersih 6/6 ✓ · build desktop hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.48.exe` & `NOVACUT-Studio-Setup-1.0.48.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Perbaikan Judul Poster: Font Adaptif & Utuh (tanpa …)", "body": body, "draft": False, "prerelease": False}).encode(),
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
