#!/usr/bin/env python3
"""Buat GitHub Release v1.0.52 — mode bg sinematik dibangun ulang: KOMPOSIT (AI hanya latar kosong)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.52"

body = """**NOVACUT Studio v1.0.52 — BG SINEMATIK DIBANGUN ULANG: KOMPOSIT DIJAMIN IDENTITAS** 🎞️🛡️

## 🐛 Keluhan v1.0.51 (gagal total)
1. Poster **TIDAK ADA JUDUL**
2. Poster **penuh gambar AI** — adegan asli video hilang

Sebab: model edit Cloudflare (outpaint) mengarang ULANG seluruh adegan — instruksi "keep people unchanged" tidak dipatuhi model.

## ✅ Ide baru (v1.0.52): KOMPOSIT — AI tidak pernah menyentuh adegan asli
1. **AI hanya melukis LATAR KOSONG** — plate panggung sinematik TANPA orang (txt2img CF, gratis). Adegan asli **tidak pernah dikirim ke AI** → identitas mustahil rusak.
2. **Adegan ASLI digambar besar di tengah** latar itu (lebar ±96%, tinggi ±66%) — keempat tepinya di-feather (melebur seperti satu foto), glow lembut di belakangnya.
3. **Grade teal-orange penyatu di seluruh kanvas** + vignette + grain film → komposit terasa satu foto sinematik penuh 9:16.
4. **Judul SELALU ditulis template aplikasi** di atas komposit (Gala/Neon di bawah, Hollywood di atas) → tidak mungkin hilang. ⚠️ Pastikan "Teks di poster" = **📝 Judul + part** — jika "⚪ Part saja" memang tanpa judul (fitur).
5. AI latar gagal? → latar lokal otomatis (glow panggung lokal) — poster tetap jadi, alasan tampil di label status.

## 🔧 Teknis
- main.cjs: cabang `bgOnly` (CF langsung txt2img + retry agreement BFL); jalur outpaint `expand` DIHAPUS
- covers.ts: `buildBackdropPrompt` + `posterKompositCineDataURL` (feather mask destination-out/in + grade penyatu)
- Z.ai & Mage ikut didukung (image kosong otomatis jatuh ke txt2img mereka); coverSignature v52 → cover lama regen

## ✅ Diuji
node --check main+preload ✓ · uji fit judul lulus ✓ · DESKTOP=1 next build hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.52.exe` & `NOVACUT-Studio-Setup-1.0.52.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Bg Sinematik Komposit (Identitas Dijamin)", "body": body, "draft": False, "prerelease": False}).encode(),
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
