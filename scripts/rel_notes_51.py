#!/usr/bin/env python3
"""Buat GitHub Release v1.0.51 — bg sinematik aslihitam di-OUTPAINT AI Cloudflare (penuh 9:16)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.51"

body = """**NOVACUT Studio v1.0.51 — BG SINEMATIK DI-OUTPAINT AI (PENUH 9:16)** 🎞️🔥

## 🐛 Keluhan v1.0.50
"Adegan asli + bg hitam sinematik" membuat frame video **landscape** tampak **KECIL** di kanvas 9:16 (contain-fit) — sisa atas/bawah hitam kosong.

## ✅ Perbaikan v1.0.51
Background sinematik kini **DIOLAH AI CLOUDFLARE (OUTPAINT)**:
- Adegan/people **ASLI tetap di tengah** — identitas terkunci (faces, clothing, pose unchanged)
- Lingkungan **diperluas AI sampai kanvas PENUH tepi-ke-tepi 9:16** — lanjutan adegan yang sama: atmosfer konser gelap sinematik, haze + bokeh dramatis, grade teal-orange, grain film, zona atas/bawah lebih gelap (ruang judul)
- REAL-PHOTO LOOK dijaga: bukan kolase, bukan ilustrasi, bukan kartun/3D
- **TANPA fallback txt2img** di mode ini (txt2img mengarang orang baru → identitas hilang); AI gagal → jatuh ke latar hitam sinematik LOKAL (0 Neuron, wajah tetap asli) + alasan gagal tampil di label status
- Label opsi kini "🎞️ Adegan asli + bg sinematik AI (Cloudflare)"; label status "● Bg sinematik AI — outpaint frame video" / "○ Bg sinematik lokal (AI gagal)"

## 🔧 Teknis
`cfEditOutpaintPrompt` di main process + flag `expand` di IPC `ai:poster` (preload & fsBridge ikut); `buildOutpaintPrompt` renderer (hormati Prompt Poster pengguna + aturan tanpa teks); coverSignature v51 → cover aslihitam lama otomatis dibuat ulang.

## ✅ Diuji
node --check main+preload ✓ · uji fit judul lulus ✓ · DESKTOP=1 next build hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.51.exe` & `NOVACUT-Studio-Setup-1.0.51.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Bg Sinematik Outpaint AI (Penuh 9:16)", "body": body, "draft": False, "prerelease": False}).encode(),
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
