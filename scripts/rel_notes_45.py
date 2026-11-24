#!/usr/bin/env python3
"""Buat GitHub Release v1.0.45 — poster dari adegan video (identity lock) + judul bersih + jalur poster transparan."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.45"

body = """**NOVACUT Studio v1.0.45 — POSTER KINI DARI ADEGAN VIDEO-MU (IDENTITY LOCK) + JUDUL POSTER BERSIH** 🎬🔒🧹

## 🎬 1. "Poster beda banget dari videonya" — AKAR MASALAHNYA DITEMUKAN & DIPERBAIKI
Pertanyaanmu tepat: *apakah frame video dikirim ke Cloudflare?* **Ya, frame dikirim** — tapi 2 hal membuat poster tetap terasa bukan dari video:
- **Prompt edit bertentangan**: prompt edit dulu menempelkan instruksi pengguna utuh ("2-3 karakter saling berhadapan", "background kolosal") SEMENTARA juga menyuruh mempertahankan subjek → model bingung dan **mengarang orang/latar baru** (bukti: poster "ngamen 5" berisi 2 orang acak di bawah lampu panggung, padahal videonya bukan itu).
- **Jalur edit gagal diam-diam** → poster digambar **teks-saja** tanpa frame, tanpa tanda apa pun di layar.

Perbaikan:
- **IDENTITY LOCK (prioritas tertinggi)** di prompt edit: jumlah orang, wajah, rambut, pakaian, properti, dan latar **WAJIB sama persis dengan frame video** — dilarang menambah/mengganti/mengarang orang atau lokasi. Instruksi pengguna (2-3 karakter, kolosal, futuristik) kini **hanya gaya** (pencahayaan, warna, komposisi, bingkai) — orangnya tetap orang videomu.
- Jalur teks-saja (fallback) pun kini **scene-first**: deskripsi adegan jadi prioritas tertinggi, instruksi pengguna diturunkan jadi gaya saja (paritas dengan jalur Z.ai di v1.0.44).

## 🧹 2. Judul poster bersih — tidak ada lagi coretan "OFFITIL MUSC VIEEO"
Dulu **nama file mentah** dipakai sebagai judul poster — "eny-sagita-ngamen-5-official-live-music-video-dc-part-12-12" → AI mencetak sampah "OFFITIL MUSC VIEEO" di bawah judul. Kini kata sampah otomatis dibuang: `official / live music video / music video / production / hd / 4k / resolusi`, nomor `part|episode 12/12`, dan inisial ekor → judul bersih: **"Eny Sagita Ngamen 5"**, **"5 menit yg mengubah hidup"**. Uji 6 kasus lulus semua ✓

## 🔍 3. Jalur poster kini TRANSPARAN di layar
Label status di panel Pratinjau Poster kini menunjukkan asal poster:
- `● Poster AI dari frame video` (hijau) — img2img sukses, adegan videomu yang dipakai
- `● Poster AI teks-saja (edit frame gagal)` (kuning) — edit gagal & poster digambar dari deskripsi teks → kalau label ini muncul terus, screenshot & kirim ke dev (endpoint edit Cloudflare perlu dicek di akunmu)

## ✅ Diuji
Uji bersihkan judul 6/6 ✓ · `node --check` ✓ · build desktop hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.45.exe` & `NOVACUT-Studio-Setup-1.0.45.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Poster Dari Adegan Video (Identity Lock) + Judul Bersih", "body": body, "draft": False, "prerelease": False}).encode(),
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
