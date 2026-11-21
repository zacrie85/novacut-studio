#!/usr/bin/env python3
"""Buat GitHub Release v1.0.26 (body catatan rilis Bahasa Indonesia) —
build desktop (exe) otomatis dilampirkan oleh CI (build-desktop.yml).
BUTUH token valid di /tmp/gh_auth.env (format: GH_TOKEN=ghp_...)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.26"

body = """**NOVACUT Studio v1.0.26 — 10 PITA GANDA TV BARU (JUDUL + PART SATU KESATUAN) + EFEK BAYANG & BERSINAR**

Upgrade lanjutan dari Pita Ganda TV yang kawan suka: sekarang ada **10 gaya pita ganda baru** — judul video dan tulisan Part/Episode tetap berada dalam **satu kesatuan pita**, dengan berbagai variasi bentuk: futuristik, modern, minimalis, dan dinamis. Semua gaya punya **efek bayang** (drop shadow lembut) dan **bersinar** (glow neon) di sekeliling bingkai.

**10 GAYA BARU di menu BINGKAI JUDUL** 🖼️
- **Pita Neon Cyber (g1)** — pita gelap bertepi neon sian menyala, sudut miring cyber; tulisan ikut miring.
- **Pita Emas Royal (g2)** — pil PART emas mengkilap + pita judul mewah garis emas ganda dengan manik emas.
- **Pita Hexa Sci-Fi (g3)** — panel heksagon gelap bertepi teal menyala + titik-titik teknis di sudut.
- **Pita Panah Kilat (g4)** — ujung meruncing seperti panah kecepatan, gradasi oranye menyala + jejak garis dinamis.
- **Pita Minimalis (g5)** — pita datar bersih garis putih tipis dengan bayangan biru lembut; aksen titik biru.
- **Pita Ungu Gala (g6)** — pita ungu-magenta mengkilap strip putih glossy + kilau bintang; tulisan miring.
- **Pita Terminal Hijau (g7)** — pita gelap bertepi hijau neon ala layar komputer, lengkap garis pemindaian, kursor blok & bracket sudut.
- **Pita Sunset Bloom (g8)** — pil membulat gradasi pink-oranye bersinar lembut dengan strip kilau putih.
- **Pita Baja Metalik (g9)** — panel baja perak-biru bersudut potong dengan bingkai metalik & paku sudut.
- **Pita Cyber TV Max (g10)** — evolusi Pita Ganda TV: neon sian + magenta, ekor lipat, titik sirkuit & kilau bintang; tulisan miring penuh.

**Cara pakai** — sama seperti sebelumnya: buka menu **Teks → BINGKAI JUDUL**, pilih salah satu gaya Pita Ganda baru. Teks **Part/Episode otomatis masuk ke pita atas** judul (tidak perlu setelan tambahan) — dan tulisan judul ikut miring pada gaya yang miring. Semua gaya baru juga bisa dipilih sebagai **BINGKAI PART/EPISODE** berdiri sendiri (versi pita saja). Pratinjau kecil di menu ikut menampilkan contoh PART di pita atas.

Berlaku di pratinjau langsung, pratinjau timeline, mesin kilat & mesin Turbo WebCodecs — satu jalur gambar (WYSIWYG). Setelan lama tetap aman; Pita Ganda TV asli (t7) tidak berubah.

Uji: tsc & ESLint bersih, semua 11 gaya komposit + 10 versi pita-part dirender lewat jalur export asli dan diverifikasi visual (teks terbaca, glow & bayang tampil, pita part tidak terpotong tepi layar)."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — 10 PITA GANDA TV BARU + BAYANG & BERSINAR", "body": body, "draft": False, "prerelease": False}).encode(),
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
