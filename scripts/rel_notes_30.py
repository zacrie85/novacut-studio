#!/usr/bin/env python3
"""Buat GitHub Release v1.0.30 (fitur subtitle dari file .srt/.vtt) — build exe otomatis oleh CI.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.30"

body = """**NOVACUT Studio v1.0.30 — FITUR BARU: SUBTITLE DARI FILE (.srt / .vtt)** 💬

Permintaan kawan sudah tuntas: subtitle bisa dimasukkan **SECARA MANUAL** dan langsung **menempel di dalam video** hasil export & split!

**Cara pakai (Mode Sederhana)**
1. Buka **langkah 2 (ATUR)** → menu **"Teks di Video"**
2. Ada pilihan baru: **"Masukkan subtitle dari file (.srt / .vtt)"** — nyalakan sakelarnya
3. Klik **"Pilih file .srt / .vtt…"** dan pilih file subtitle film kawan
4. Muncul status hijau: nama file + jumlah baris yang terbaca
5. Export & Split seperti biasa — subtitle **sudah nempel langsung di dalam video** setiap bagian (burn-in, bukan file terpisah)

**Aturan pencocokan otomatis**
- Nama file subtitle **sama dengan nama film** (mis. `kembali-ke-bumi-episode-1.srt` untuk `kembali-ke-bumi-episode-1.mp4`) → subtitle hanya dipakai film itu
- Beda nama → dipakai **semua film** dalam daftar
- Playlist berisi **satu film** → subtitle selalu dipakai film itu
- Saat subtitle file aktif, **Subtitle AI otomatis dilewati** (hemat waktu render)

**Detail teknis**
- Mendukung format **SRT** dan **WebVTT (VTT)** — tahan BOM UTF-8, baris Windows (CRLF), penomoran blok, dan tag format (`<i>`, `<font>`, `{\\an8}`) dibersihkan otomatis
- Subtitle mengalir lewat jalur burn-in yang sama dengan Subtitle AI: tampil di posisi bawah layar dengan efek fade, dirender **mesin Turbo maupun Kilat**, di **semua bagian split** dengan waktu yang digeser otomatis per bagian
- Cue subtitle tidak ikut tersimpan di preset (file dipilih ulang per sesi — setelan lain preset tetap utuh)
- Posisi & ukuran mengikuti setelan teks yang sudah ada

**Selain itu**
- Bug suara (v1.0.29) sudah **dikonfirmasi BERES** oleh pengguna 🎉"""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — SUBTITLE dari file (.srt/.vtt) burn-in otomatis", "body": body, "draft": False, "prerelease": False}).encode(),
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
