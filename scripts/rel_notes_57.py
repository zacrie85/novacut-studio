#!/usr/bin/env python3
"""Buat GitHub Release v1.0.57 — bg sinematik berkilau (frame + cahaya)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.57"

body = """**NOVACUT Studio v1.0.57 — "ADEGAN ASLI + BG SINEMATIK BERKILAU" (frame utuh + cahaya berkilau)** ✨

## ✨ Upgrade sesuai permintaan pengguna
Menu: Mode Sederhana → Export → Cover Otomatis di Depan → Poster Hollywood (AI) → Buat Ulang Poster → **"🎞️ Adegan asli + bg sinematik berkilau AI (Cloudflare)"**

Hasil yang diinginkan: **poster dgn frame/adegan asli tetap utuh + background sinematik + CAHAYA BERKILAU**. Diwujudkan lewat 3 lapis:

1. **Prompt plate baru** — latar AI kini dipinta: berkas cahaya emas turun dari atas → glow terang di tengah (tempat tokoh dipasang), kilau/bokeh, lens flare, teal-orange (identitas aman: adegan asli TIDAK pernah dikirim ke AI — pelajaran v1.0.51).
2. **Berkas cahaya + glow di BELAKANG tokoh** (digambar renderer, blend `screen`) — 5 berkas volumetrik emas/teal + halo hangat di tengah → tokoh tampak menyala dari belakang ala spotlight panggung.
3. **110 partikel kilau + 9 bokeh besar** di atas komposit (menumpuk di sekitar tokoh, jarang di zona judul) — kilau dijamin tampil walau plate AI polos.

## ⚙️ Detail
- covers.ts: `buildBackdropPrompt` v57 (sparkling cinematic light, center glow utk hero) + `posterKompositCineDataURL` (+berkas/halo di belakang adegan, +partikel kilau di atas grade teal-orange)
- exporter.ts: `coverSignature` **v52 → v57** → semua cover aslihitam LAMA otomatis dibuat ulang saat export berikutnya
- SimpleMode: label opsi + status "● Bg sinematik + kilau — adegan asli + latar AI"

## ✅ Diuji
DESKTOP=1 next build hijau (Compiled successfully 4/4) ✓ · uji fit judul lulus ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.57.exe` & `NOVACUT-Studio-Setup-1.0.57.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Bg sinematik BERKILAU (frame utuh + cahaya)", "body": body, "draft": False, "prerelease": False}).encode(),
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
