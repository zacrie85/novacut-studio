#!/usr/bin/env python3
"""Buat GitHub Release v1.0.43 — perbaikan poster Z.ai + PART di atas poster + prompt default baru."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.43"

body = """**NOVACUT Studio v1.0.43 — POSTER Z.AI DIPERBAIKI + TULISAN PART DI ATAS POSTER + PROMPT DEFAULT BARU** 🔧🏷️🎬

## 🔧 1. Poster Z.ai tidak pernah muncul? SEKARANG DIPERBAIKI
Gejala: kunci Z.ai terkonek (Tes Koneksi OK) tapi poster yang muncul selalu **poster bawaan**. Penyebabnya ditemukan di kode:
- **Vision fatal** — satu kegagalan `glm-4.6v-flash` (model tua/pensiun/saldo) membatalkan SELURUH blok poster Z.ai → selalu jatuh ke cover cadangan. Kini vision **tidak fatal**: gagal deskripsi → poster TETAP digambar (judul tetap terbawa di prompt) + ada **model cadangan glm-5.3-flash**.
- **Pesan sebab kini TAMPIL** — toast di app menampilkan alasan persis dari main process (saldo habis / model tidak ada / kunci salah / timeout), bukan lagi "cek koneksi" buta.
- Respons gambar kini menerima `url` ATAU `b64_json` (tahan perubahan bentuk API).
- ⚠️ Catatan: bila toast bilang saldo/kredit habis → isi saldo kecil di halaman **Billing** z.ai (±Rp250/poster; vision gratis).

## 🏷️ 2. Tulisan PART otomatis di ATAS poster AI (per bagian!)
Poster AI (Cloudflare/Z.ai) dibuat **sekali** per video → sebelumnya bagian ke-2, ke-3 dst. tidak membawa tulisan Part yang jelas. Kini saat **Export & Split**:
- Setiap bagian otomatis mendapat tulisan **PART/EPISODE/EP** (mengikuti gaya & "Ukuran Part" di menu Teks) **digambar di bagian ATAS poster**, latar bar jelas — tidak lagi badge kecil di bawah yang mudah tak terlihat.
- Tetap otomatis: bagian 1 = "Part 1/3", bagian 2 = "Part 2/3", dst.

## 🎬 3. Prompt default baru (versi pengguna)
POSTER_PROMPT_DEFAULT diganti dengan promptmu: poster sesuai adegan video, **2-3 karakter saling berhadapan/menghadap depan**, background **cinematik/kolosal**, **frame futuristik/modern mengelilingi poster**, judul video di **bagian bawah** sesuai nama video, tulisan dijaga di dalam tepi, font cinematik/futuristik/modern dinamis. Adegan diambil dari **detik 5-30** (sebelumnya 5-60). Judul video tetap disisipkan otomatis.

## ✅ Diuji nyata
Pipeline Cloudflare end-to-end dengan frame video asli + prompt baru → poster **576×1024 (9:16 persis)**: 3 karakter berhadapan ✓ frame futuristik ✓ judul dieja benar ✓. Build desktop hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.43.exe` & `NOVACUT-Studio-Setup-1.0.43.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Poster Z.ai Diperbaiki + PART di Atas Poster + Prompt Baru", "body": body, "draft": False, "prerelease": False}).encode(),
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
