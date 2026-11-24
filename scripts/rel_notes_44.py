#!/usr/bin/env python3
"""Buat GitHub Release v1.0.44 — sebab poster Z.ai persisten + toast jujur + judul poster per video + poster dari adegan video."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.44"

body = """**NOVACUT Studio v1.0.44 — SEBAB POSTER Z.AI TAMPIL PERSISTEN + JUDUL POSTER PER VIDEO + POSTER DARI ADEGAN VIDEO** ⚠️🏷️🎬

## ⚠️ 1. "Pakai Z.ai tapi hasilnya bukan dari Z.ai"? — SEBABNYA KINI TAMPIL JELAS
Gejala: cover yang muncul ternyata **frame klasik + tulisan app** (bukan poster AI) — dan dulu toast malah bilang "Poster AI siap ✔" padahal AI gagal (bug palsu). Kini:
- **Kotak peringatan PERSISTEN** di panel Pratinjau Poster Mode Sederhana: `⚠️ Poster AI gagal — cover memakai frame klasik` + **Sebab** dalam bahasa Indonesia + langkah solusinya (hilang otomatis saat sukses) — tidak lagi toast ±4 detik yang mudah terlewat.
- **Label status jujur**: `● Poster AI siap` (hijau) / `○ Frame klasik (AI gagal)` / `○ Belum ada poster` — dicek langsung dari aset.
- **Toast diperbaiki** (Mode Sederhana + panel lanjutan): gagal = "AI gagal — pakai cadangan + sebab", sukses = benar-benar poster AI.
- **Pesan API diterjemahkan + solusi**: saldo → *"buka z.ai → Billing → isi saldo (±Rp250/poster)"*, kunci salah → tempel ulang, 429 → tunggu 1 menit, timeout → coba lagi/pilih kualitas Hemat, koneksi → cek internet. (Ingat: **Tes Koneksi** hanya menguji model vision gratis — poster butuh saldo.)
- Cek parameter ke docs resmi z.ai: ukuran 960x1728/1728x960 **valid** (daftar rekomendasi glm-image), quality hd/standard valid.

## 🏷️ 2. Judul poster kini PER VIDEO (bug batch diperbaiki)
Gejala: export & split **2 video sekaligus** (mis. "pengalaman 5 menit" + "ngamen 5") → poster tiap video berbeda tapi **semua tertulis judul video pertama**. Penyebab: judul poster mengutamakan judul global app (terisi otomatis nama video pertama) di atas nama video yang diproses. Kini **judul poster = nama video masing-masing**, berlaku di jalur batch export, tombol "Terapkan prompt ke semua video", dan video tunggal. Ingin judul khusus? Tetap bisa via prompt manual: `judul "..."`.

## 🎬 3. Poster kini dari ADEGAN VIDEO-mu
Keluhan: "gambar yang jadi poster bukan adegan di videonya". Perbaikan dua lapis (jalur Z.ai):
- **IMG2IMG dulu** — frame utuh dikirim ke glm-image via endpoint edit (3 bentuk payload dicoba; endpoint belum tercantum di docs publik) → wajah/pakaian/adegan video terjaga. Gagal/tak didukung → otomatis kembali ke txt2img.
- **Prompt scene-first** — deskripsi frame (dari vision: JUMLAH orang, wajah, rambut, warna pakaian, properti, latar) jadi **prioritas tertinggi**; instruksi gaya "2-3 karakter berhadapan" hanya GAYA dan karakternya WAJIB orang-orang dari adegan video — AI dilarang mengarang karakter/latar baru.

## ✅ Diuji
`node --check` ✓ · build desktop hijau ✓ · pengujian nyata jalur Cloudflare di v1.0.43 tetap valid. CI menempelkan `NOVACUT-Studio-Portable-1.0.44.exe` & `NOVACUT-Studio-Setup-1.0.44.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Sebab Poster Z.ai Persisten + Judul Per Video + Poster Dari Adegan", "body": body, "draft": False, "prerelease": False}).encode(),
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
