#!/usr/bin/env python3
"""Buat GitHub Release v1.0.56 — Jembatan Mivo (semi-otomatis, QRIS)."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.56"

body = """**NOVACUT Studio v1.0.56 — JEMBATAN MIVO: tetap pakai kredit Mivo (QRIS), semi-otomatis** 🟢

## 🟢 BARU: Penyedia ke-5 "Mivo (QRIS · semi-otomatis)" — tanpa kunci API
Mivo tidak punya API publik, tapi kini jalurnya dibuat semi-otomatis. App menyiapkan **semuanya**; pengguna hanya 3 langkah di Mivo:

1. Klik 🎨 **Buat Ulang Poster** → prompt final otomatis TERSALIN ke clipboard + frame tersimpan sebagai `REFERENSI-frame.png` di folder **NOVACUT-Mivo** (Documents) + tab Mivo terbuka otomatis.
2. Di Mivo: pilih Minimax H3 → 9:16 → 1K → paste prompt (Ctrl+V) → Add reference images → pilih REFERENSI-frame.png → Generate.
3. Unduh hasil → simpan ke folder **NOVACUT-Mivo** (nama bebas).
4. App mendeteksi otomatis (±3 dtk, scan folder) → poster langsung jadi cover. Tunggu maks 12 menit.

## ⚙️ Detail teknis
- main.cjs: `mivo:bridge-start` (folder Documents/NOVACUT-Mivo + tulis frame + `clipboard.writeText` prompt final + bersihTextFree/aturanTanpaTeks/fotoreal) + `mivo:bridge-poll` (scan gambar terbaru > waktu mulai, skip REFERENSI-*, tahan file setengah unduh, timeout 12 mnt) + `mivo:open-folder` (shell.openPath) + whitelist URL mivo.com
- covers.ts: branch provider `mivo` di aiPosterizeDataURL (poll loop, bukan Promise.race) + via `mivo-jembatan`
- AIKeyCard: tombol + panduan 4 langkah + 📁 Buka folder + 🌐 Buka Studio + status `● Jembatan Mivo siap (QRIS)`
- SimpleMode: label `● Poster via Mivo (jembatan semi-otomatis)`

## ✅ Diuji
node --check main+preload ✓ · uji fit judul lulus ✓ · DESKTOP=1 next build hijau ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.56.exe` & `NOVACUT-Studio-Setup-1.0.56.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Jembatan Mivo (semi-otomatis, QRIS)", "body": body, "draft": False, "prerelease": False}).encode(),
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
