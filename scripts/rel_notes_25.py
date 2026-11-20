#!/usr/bin/env python3
"""Buat GitHub Release v1.0.25 (body catatan rilis Bahasa Indonesia) —
build desktop (exe) otomatis dilampirkan oleh CI (build-desktop.yml).
BUTUH token valid di /tmp/gh_auth.env (format: GH_TOKEN=ghp_...)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.25"

body = """**NOVACUT Studio v1.0.25 — POTONG DETIK + 6 BINGKAI REFERENSI BARU + WATERMARK**

Semua permintaan upgrade kawan ada di sini — 3 fitur baru dalam satu versi:

**1) POTONG MULAI & AKHIR (DETIK)** ✂️
Di menu **Export & Split** (Mode Sederhana langkah Export dan panel Playlist Export Langsung) ada kartu baru **POTONG MULAI & AKHIR (DETIK)**: atur dari detik berapa mulai dan detik berapa berakhir.
- Contoh: video 5 menit, isi **120** (mulai) dan **245** (berakhir) → hanya bagian 2:00–4:05 yang di-export & dipecah jadi bagian.
- Ada input angka **dan** slider geser + info langsung "Dipotong: 2:00 → 4:05 (durasi 2:05)".
- Kosongkan berakhir (0) = sampai video habis. Estimasi jumlah bagian ikut menghitung durasi terpotong.
- Berlaku untuk **semua video yang dipilih** (yang lebih pendek otomatis menyesuaikan) — mesin kilat maupun mesin Turbo, cover, teks part & smart split semuanya mengikuti rentang yang benar.
- Uji terverifikasi: sumber ramp 30 detik dipotong detik 5–15 → hasil 300 frame SEMUA persis frame sumber 150–449 (0 frame mundur, selisih terang rata-rata < 0.5 level) di kedua mesin.

**2) 6 BINGKAI REFERENSI BARU untuk JUDUL & PART** 🖼️
Dari 5 gambar referensi yang dikirim kawan (gambar 3 punya 2 varian warna, keduanya dibuatkan):
- **Pita Ganda TV** (REF 1) — dibuat **SAMA PERSIS** dengan referensi: pita merah di atas untuk **PART**, pita biru besar di bawah untuk **JUDUL**, lengkap dengan strip putih diagonal, lipatan, ekor pita & kilau kuning. Tulisan **ikut miring mengikuti bentuk pita** (italic) persis seperti permintaan.
- **Banner Hitam Merah** (REF 2) — lingkaran gelap + banner hitam mengkilap aksen merah.
- **Bola Glossy Biru** & **Bola Glossy Merah** (REF 3 + variannya) — bola glossy + banner metalik berbingkai silver.
- **Pita Oranye 3D** (REF 4) — pita melengkung tepi ungu dengan ekor lipat.
- **Neon Biru-Pink** (REF 5) — bingkai neon menyala, interior kosong sepenuhnya.
Menu **BINGKAI PART/EPISODE** baru di langkah Teks — semua gaya bisa dipakai untuk teks part juga. Catatan: bila BINGKAI JUDUL memakai Pita Ganda TV, teks part otomatis masuk ke pita merah di atasnya (satu kesatuan persis seperti referensi). Interior semua bingkai tetap kosong — video terlihat di dalamnya.

**3) WATERMARK (LOGO GAMBAR PNG/JPEG)** 🏷️
Kartu **WATERMARK** di menu Export: pilih gambar logo, dicap di atas semua video hasil export.
- **Posisi** geser bebas (X/Y 0–100%) · **Warna** (pilih warna + kekuatan timpa, area transparan tetap transparan) · **Transparansi** 2–100% · **Panjang & Lebar diatur manual** (boleh melesihat rasio asli).
- Gambar otomatis diturunkan skalanya (≤640px) agar hemat penyimpanan, setelan diingat untuk export berikutnya.
- Tampil di pratinjau, mesin kilat & mesin Turbo — jalur gambar yang sama persis (WYSIWYG).

Preset satu-klik kini ikut menyimpan rentang potong. Setelan lama dimigrasi otomatis (aman, tidak ada setelan yang berubah sendiri).

Uji: tsc bersih di src, build desktop sukses, uji E2E penuh — trim mapping frame-per-frame PASS di mesin kilat & Turbo, split 4 bagian dari rentang terpotong tepat 4×2.00s, watermark & pita t7 terverifikasi piksel pada hasil export asli, alur wizard tanpa error."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — POTONG DETIK + 6 BINGKAI BARU + WATERMARK", "body": body, "draft": False, "prerelease": False}).encode(),
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
