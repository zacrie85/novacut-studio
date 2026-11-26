#!/usr/bin/env python3
"""Buat GitHub Release v1.0.59 — retouch studio lokal + bingkai emas + part naik/besar."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.59"

body = """**NOVACUT Studio v1.0.59 — RETOUCH STUDIO LOKAL + BINGKAI EMAS (identitas 100%) + part dinaikkan & diperbesar** 🎬

## 🚨 FIX: mode "asli" kembali 100% LOKAL — AI edit CF TERBUKTI MENGUBAH GAMBAR
Bukti tangkapan layar pengguna: penyanyi perempuan diganti DUA ORANG BERBEDA oleh Cloudflare edit (flux-2 klein/dev). Dua penyebab:
1. **Bug prompt v1.0.58**: isi kolom "Prompt Poster" (berisi KISAH video, mis. "febbria... idol...") ikut dikirim sebagai *hints* → model melukis adegan BARU tentang kisah itu, bukan retouch.
2. **Sifat model edit**: flux-2 mengikuti TEKS lebih kuat daripada gambar referensi (pelajaran sama dgn v1.0.51) — prompt keep-same tidak bisa menahannya.

**Solusi (v1.0.59)**: semua kecantikan dibuat kanvas LOKAL — `posterRetouchLokalDataURL`:
- gambar ASLI cover-fit penuh + filter `brightness(1.13) saturate(1.16) contrast(1.04)` → lebih terang, warna lebih hidup, kontras halus
- glow hangat + berkas cahaya (screen) + 80 partikel kilau + 7 bokeh → **berkilau** ✨
- grade teal-orange lembut + vignette + fade bawah zona judul + grain film
- **BINGKAI EMAS DEKORATIF**: garis ganda emas + braket sudut + berlian di keempat tepi 🖼️
- **Identitas 100% terjamin** (piksel tokoh asli dipakai langsung), **0 Neuron**, cepat untuk batch 50 film

## 📏 PART/EPISODE: dinaikkan LAGI + huruf DIPERBESAR
- **Bug v1.0.58 ditemukan**: klip part di COVER punya logika posisi sendiri (exporter.ts:392) terpisah dari `posisiPartEfektif` video → perbaikan kemarin hanya menaikkan part di VIDEO, part di COVER masih 100 (menempel tepi). Kini **cover 100 → 84** DAN video 92 → **84**.
- **Huruf part DIPERBESAR**: default 5.2% → **6.8%** tinggi layar (+30%); setelan lama yang masih memakai 0.052 otomatis naik ke 0.068 (slider tetap dihormati).

## ⚙️ Lain-lain
- coverSignature **v58 → v59** → semua cover lama dibuat ulang otomatis saat export
- Label: opsi "🎬 Adegan asli + retouch studio & bingkai emas (0 Neuron)" + status "● Adegan asli + retouch studio + bingkai emas (0 Neuron)"
- Plumbing retouch CF (main.cjs/preload) tetap ada tapi tidak lagi dipakai mode "asli"

## ✅ Diuji
DESKTOP=1 next build hijau (Compiled successfully 4/4) ✓ · uji fit judul lulus ✓. CI menempelkan `NOVACUT-Studio-Portable-1.0.59.exe` & `NOVACUT-Studio-Setup-1.0.59.exe`."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Retouch studio lokal + bingkai emas (identitas 100%)", "body": body, "draft": False, "prerelease": False}).encode(),
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
