#!/usr/bin/env python3
"""Buat GitHub Release v1.0.38 — jalur poster GRATIS Cloudflare + kualitas HD/Hemat.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.38"

body = """**NOVACUT Studio v1.0.38 — POSTER AI 100% GRATIS VIA CLOUDFLARE (TANPA KARTU!) + KUALITAS HD/HEMAT** 🆓🎨

Nyambung keluhan kwan yang tak punya kartu internasional: kartu **Mesin Poster AI** kini punya pilihan **penyedia** —

## 🟢 Cloudflare Workers AI — GRATIS, tanpa kartu, tanpa tagihan
- Pilih pill **Cloudflare (GRATIS)** → isi **Account ID** + **API Token** (izin `Workers AI: Run`) → Simpan → **Tes Koneksi** (tes memakai 0 Neuron).
- Kuota resmi Cloudflare: **10.000 Neuron/hari gratis** (paket Free, reset 00:00 UTC / 07.00 WIB). Satu poster ≈ vision ±30 + FLUX ±58 = **±88 Neuron → ±110 poster/hari gratis**; kubulat jadi **±170/poster-hari** kalau vision dilewati.
- Alur: frame → **Llama 3.2 11B Vision** (baca adegan) → **FLUX.1 [schnell]** (lukis poster sinematik) — rasio ikut proyek (16:9 / 9:16).
- Cara dapat kredensial (±5 menit, tanpa kartu): buat akun di dash.cloudflare.com → salin **Account ID** (halaman Workers & AI) → **My Profile → API Tokens → Create Token** (izin Workers AI: Run) → tempel ke kartu.

## 🔵 Z.ai (GLM-Image) — tetap tersedia, kunci gratis, bayar per poster
- Harga tak berubah: **$0.015/poster (±Rp250)**; kunci & model baca adegan (glm-4.6v-flash) + tes kunci (glm-4.7-flash) **gratis**.
- **BARU: toggle kualitas** — `HD (terbaik, ±20 dtk)` atau `Hemat (cepat, 5-10 dtk)`. Jujur: di Z.ai harga dua-duanya sama ($0.015) — **Hemat menghemat waktu**, menghemat dolar beneran ada di jalur Cloudflare.

| Langkah | Z.ai | Cloudflare |
|---|---|---|
| Buat kunci/akun | Gratis, tanpa kartu | Gratis, tanpa kartu |
| AI baca adegan | Gratis (glm-4.6v-flash) | Gratis (kuota harian) |
| Tes koneksi | Gratis | Gratis (0 Neuron) |
| Menggambar poster | $0.015 (±Rp250) | **Gratis** (kuota harian) |

**Keselamatan biaya**: jalur Cloudflare **tidak akan** diam-diam pindah ke Z.ai saat gagal — poster kembali ke mode cadangan lokal, jadi tidak ada biaya kejutan. Kredensial tersimpan lokal (`userData/cf_key.json`, mode 0600).

Diuji: node --check main/preload ✓, build desktop hijau ✓. CI akan menempelkan `NOVACUT-Studio-Portable-1.0.38.exe` & `NOVACUT-Studio-Setup-1.0.38.exe` ke rilis ini."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Poster AI GRATIS via Cloudflare (Tanpa Kartu) + HD/Hemat", "body": body, "draft": False, "prerelease": False}).encode(),
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
