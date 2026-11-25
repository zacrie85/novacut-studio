#!/usr/bin/env python3
"""Buat GitHub Release v1.0.47 — foto asli + sentuhan AI realistis, judul adaptif, pita ganda, penyedia Mage."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.47"

body = """**NOVACUT Studio v1.0.47 — POSTER FOTO ASLI + SENTUHAN AI REALISTIS, JUDUL ADAPTIF, PITA GANDA DIPERBAIKI, PENYEDIA BARU MAGE** 📸✒️🧩✨

## 📸 1. Sebab poster Cloudflare "cartoon" + arah baru: FOTO ASLI + SENTUHAN AI REALISTIS
**Sebabnya:** (a) kata "redraw as movie poster / blockbuster key art" → model gampang menafsirkan "poster" sebagai key art **bergambar/ilustrasi**; (b) prompt default lama menyuruh mengarang komposisi ("2-3 karakter berhadapan, background kolosal, frame futuristik") → model lepas dari foto asli.
**Kini semua prompt (CF edit, CF txt2img, Z.ai publik, dan prompt default app) diganti arah baru:**
- Hasil harus tampak seperti **FOTO ASLI** — orang nyata, kulit/rambut/tekstur alami, shot on cinema camera
- **NO cartoon, no anime, no drawing, no painting, no 3D render, no CGI, no plastic skin**
- Sentuhan AI hanya pada gaya: pencahayaan sinematik, gradasi warna bioskop, rim light & atmosfer halus
- Cover lama otomatis dibuat ulang (tanda tangan gaya dinaikkan) — klik 🎨 Buat Ulang Poster bila mau segera

## ✒️ 2. Judul adaptif di 4 frame poster — judul sampai ±100 huruf tetap muat
Font otomatis mengecil & melipat sampai 3 baris (Hollywood/Komik/Kapur/Epik); papan kapur mengikuti tinggi teks; teks tidak pernah lagi terpotong "…".

## 🧩 3. BINGKAI JUDUL Pita Ganda — kini bisa digeser sampai tepi bawah
Bug clamp: tinggi pita atas dihitung simetris ke batas bawah → frame berhenti ±130px di atas tepi. Kini asimetris: bawah = kotak saja (menempel tepi), atas = kotak + pita penuh (pita tak terpotong).

## ✨ 4. PENYEDIA KE-3: Mage (mage.space) — ±Rp145/gambar
Riset dokumen resmi mage.space: REST API nyata, **bayar per gambar pakai Gems, tanpa langganan** (1.000 Gems = $1). NOVACUT memakai **gpt-image-2.5-flare (±9 Gems ≈ Rp145)** — frame video dikirim utuh (img2img), teks tetap ditulis aplikasi. Fitur: kunci `mage_sk_` tersimpan lokal, Tes Koneksi **0 Gems**, edit gagal → otomatis txt2img, panduan 4 langkah di kartu Mesin Poster AI. Bandingkan: Cloudflare GRATIS (10.000 Neuron/hari) · Z.ai ±Rp250 · Mage ±Rp145.

## ✅ Diuji
Uji clamp pita ganda (batas bawah menempel tepi, pita atas utuh) ✓ · uji judul bersih 6/6 ✓ · `node --check` ✓ · build desktop hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.47.exe` & `NOVACUT-Studio-Setup-1.0.47.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Foto Asli + Sentuhan AI Realistis, Judul Adaptif, Pita Ganda, Penyedia Mage", "body": body, "draft": False, "prerelease": False}).encode(),
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
