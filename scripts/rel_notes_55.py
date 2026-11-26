#!/usr/bin/env python3
"""Buat GitHub Release v1.0.55 — provider ke-4 MiniMax H3 (mesin Mivo)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.55"

body = """**NOVACUT Studio v1.0.55 — PENYEDIA ke-4: MINIMAX H3 (MESIN "MINIMAX H3" DARI MIVO.COM)** 🟠

## 🟠 BARU: Mesin Mivo favoritmu kini di dalam aplikasi!
Pengguna memakai **"Minimax H3" (2 kredit/img)** di mivo.com/generate/studio dan hasilnya bagus. Riset: **Mivo TIDAK punya API publik** (QRIS hanya untuk top-up web) — TAPI mesinnya, **MiniMax H3 Image**, ADA API resmi di **platform.minimax.io**. Jadi mesin yang SAMA kini terpasang di kartu Mesin Poster AI.

**Tombol baru: `MiniMax H3 (mesin Mivo)`** di kartu Mesin Poster AI (Mode Sederhana → Cover Otomatis → Poster Hollywood AI):
- `POST /v1/images/edits` — frame video dikirim sbg referensi img2img (seperti "Add reference images" di Mivo)
- `POST /v1/images/generations` — txt2img fallback + Poster Kisah
- Model `MiniMax-H3-Image`, respons langsung `b64_json` (tanpa polling), 1K (768x1344 / 1344x768, kelipatan 32)
- **Prompt rewrite otomatis** di sisi API — sama dgn checkbox "Prompt rewrite" di studio Mivo
- Panduan 4 langkah + tombol 🔑 Buka API Keys + **Tes Koneksi 0 kredit** (GET /v1/models)

## ⚙️ Detail teknis
- main.cjs: `minimax_key.json` (mode 0600) + handler `minimax:set-key/key-status/clear-key/test-key` + branch `provider === "minimax"` (img2img → txt2img fallback, timeout 240 dtk)
- preload/fsBridge: setMiniMaxKey/getMiniMaxKeyStatus/clearMiniMaxKey/testMiniMaxKey/openMiniMaxAPI
- covers.ts dispatch provider ke-4; AIKeyCard: tombol + panduan + status `● MiniMax siap (mesin Mivo)`

## ✅ Diuji
node --check main+preload ✓ · uji fit judul lulus ✓ · DESKTOP=1 next build hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.55.exe` & `NOVACUT-Studio-Setup-1.0.55.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Penyedia ke-4: MiniMax H3 (mesin Mivo)", "body": body, "draft": False, "prerelease": False}).encode(),
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
