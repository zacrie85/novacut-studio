#!/usr/bin/env python3
"""Buat GitHub Release v1.0.60 — Studio Mivo dalam app + 2 preset kualitas pas."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.60"

body = """**NOVACUT Studio v1.0.60 — STUDIO MIVO DALAM APP (browser mandiri + otomasi) + 2 PRESET KUALITAS BARU** 🌐⚖️

## 1️⃣ STUDIO MIVO DALAM APP — ide pengguna: kombinasi manual + otomatis
Browser mandiri kini ADA DI DALAM aplikasi:
- **Login tersimpan** — jendela terpisah memuat mivo.com dengan partisi `persist:mivo` → login cukup **SEKALI**, sesi diingat selamanya
- **Navigasi otomatis** — langsung membuka `mivo.com/generate/studio`
- **Otomasi best-effort** (berjalan saat halaman studio terbuka): pilih model (**🎬 FLUX Klein utk video film** / 🎵 **Minimax H3 utk video music** — pilihan tersimpan), **isi prompt otomatis**, **unggah REFERENSI-frame.png otomatis** (injeksi File ke `input[type=file]`), **klik Generate otomatis**
- **Panen hasil 2 cara**: gambar besar BARU di halaman studio diunduh otomatis dari CDN (tanpa simpan manual) ATAU scan folder NOVACUT-Mivo seperti sebelumnya
- **Status langkah real-time** di kartu AI → Mivo: ✓ model / ✓ prompt / ✓ frame / ✓ generate / ⚠ langkah yang perlu manual
- **Fallback manual utuh**: prompt tetap di clipboard + frame tetap di folder — langkah yang selector-nya tidak kena tinggal dilanjutkan tangan
- Tombol **"🌐 Studio Mivo dalam app (login tersimpan)"** + pilihan model di kartu AI (Mivo)

Catatan jujur: otomasi berbasis selector best-effort — bila Mivo mengubah tampilan, langkah terkait jatuh ke manual dan statusnya jelas ditampilkan.

## 2️⃣ KUALITAS HASIL: 4 → 6 PRESET
Dua pilihan baru sesuai permintaan pengguna:
- **⚖️ Pas Asli** — TOTAL semua split ≈ besar file asli, dibagi rata: 1 GB → 10 split ≈ 100 MB/split; 20 split ≈ 50 MB/split
- **⚖️ Pas ½ Asli** — TOTAL ≈ setengah file asli: 1 GB → 10 split ≈ 50 MB/split; 20 split ≈ 25 MB/split

Teknis: bitrate video = (ukuran file asli ×8 × margin container 0.97 ÷ durasi total) − reservasi audio, seragam untuk semua bagian; ukuran file asli dibaca dari disk (`fs:file-size`), 1080p, batas layak 600 kbps–20 Mbps.

## ⚙️ Detail
- main.cjs: jendela Studio Mivo (persist:mivo) + `skripOtomasi`/`jalankanOtomasi`/`bukaStudioMivo` + panen DOM di `mivo:bridge-poll` (kini async) + `mivo:studio-open` + `fs:file-size` + push status `mivo:studio-status`
- preload/fsBridge: `mivoBridgeStart(+model)`, `mivoStudioOpen`, `onMivoStudioStatus`, `fileSize`
- covers.ts: model Mivo dari `localStorage.novacut.mivoModel` dibawa ke studio
- PlaylistSettingsForm: grid 6 preset + penjelasan; types: quality union +2
- exporter.ts: rumus bitrate pas/pasSetengah (durasi total dari pr.ranges)

## ✅ Diuji
node --check main+preload ✓ · uji fit judul lulus ✓ · DESKTOP=1 next build hijau (Compiled successfully 4/4) ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.60.exe` & `NOVACUT-Studio-Setup-1.0.60.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Studio Mivo dalam app + kualitas Pas Asli / Pas ½", "body": body, "draft": False, "prerelease": False}).encode(),
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
