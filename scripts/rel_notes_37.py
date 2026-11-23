#!/usr/bin/env python3
"""Buat GitHub Release v1.0.37 — langkah vision & tes kunci pindah ke model GRATIS.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.37"

body = """**NOVACUT Studio v1.0.37 — SEKARANG CUMA BAYAR GAMBAR POSTERNYA: LANGKAH VISION & TES KUNCI PINDAH KE MODEL GRATIS** 💸➡️🆓

Nyambung pertanyaan kwan: *kunci API Z.ai berbayar?* Faktanya — **membuat kunci API di z.ai GRATIS**, sebagian model juga **gratis penuh**. Yang berbayar hanya menggambar posternya (`glm-image` **$0.015 / poster** ± Rp250). Rilis ini mengubah sisa pipeline ke model gratis:

- **Baca adegan (vision)**: `glm-5.3-flashx` (berbayar) → **`glm-4.6v-flash`** — **GRATIS**.
- **Tes Koneksi**: ping kini pakai **`glm-4.7-flash`** — **GRATIS** (tes tidak makan saldo).
- **Hasil**: satu-satunya biaya = **$0.015 per poster** (± Rp250). 100 poster ≈ $1.5. Tanpa biaya tersembunyi.

**Tabel biaya (API Z.ai, per rilis ini)**
| Langkah | Model | Biaya |
|---|---|---|
| Membuat kunci API | — | **Gratis** |
| Tes Koneksi | glm-4.7-flash | **Gratis** |
| AI membaca adegan video | glm-4.6v-flash | **Gratis** |
| Menggambar poster HD | glm-image | **$0.015 / poster** |

**Cara pakai (tidak berubah)**: kartu **Kunci API Poster AI** → *"Cara dapat kunci"* → buat Standard API Key di z.ai → tempel → Simpan → Tes Koneksi → 🎨 Buat Ulang Poster (AI). Top-up saldo di halaman billing sesuai kebutuhan (mis. $2 sudah untuk ±130 poster).

Semua fitur v1.0.36 tetap: judul dibersihkan dari kode sampah `[...]`, anti-takarir/watermark, margin aman, fallback frame ter-grade, rasio ikut proyek, Terapkan ke semua video. Build desktop hijau ✓"""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Vision & Tes Kunci GRATIS (Bayar Cuma $0.015/Poster)", "body": body, "draft": False, "prerelease": False}).encode(),
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
