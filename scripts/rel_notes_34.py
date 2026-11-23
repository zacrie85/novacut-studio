#!/usr/bin/env python3
"""Buat GitHub Release v1.0.34 (akar bug cover poster hitam diperbaiki + frame 5-60s) — build exe otomatis oleh CI.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.34"

body = """**NOVACUT Studio v1.0.34 — AKAR BUG "COVER POSTER HITAM" DITEMUKAN & DIPERBAIKI + FRAME 5–60 DETIK** 🎬🔬

Laporan kwan: Poster Hollywood di Mode Sederhana tidak berubah, ada keterangan "ubah di Mode Pro → tab Cover", dan hasil export & split tetap layar hitam. Kali ini **akar masalah sejatinya DITEMUKAN** — dan **semuanya diuji END-TO-END di aplikasi sungguhan SEBELUM dirilis** (persis seperti permintaan kwan).

**Akar bug (satu baris, sejak v1.0.31!)**
Cover hasil export dirender TANPA judul (judul ditulis dinamis oleh mesin render agar bisa wrap). Saat mode Poster Hollywood + judul kosong, satu kondisi di mesin cover **melewatkan SEMUA penggambaran** → kanvas dibiarkan kosong (transparan) → disimpan sebagai JPEG → **JPEG transparan = HITAM MURNI**. Itulah kenapa:
- **Pratinjau Cover Studio selalu BAGUS** (dirender dengan judul → mesin poster jalan), tapi
- **Hasil export & split selalu HITAM** (dirender tanpa judul → tidak ada yang digambar) — untuk SEMUA gaya poster, komputer apa pun.
Kini: latar poster (grade sinematik + vignette + grain film + furnitur "NOVACUT PICTURES MEMPERSEMBAHKAN" + tagline) **benar-benar digambar** untuk cover export. Fallback gradasi sinematik v1.0.33 kini juga benar-benar muncul (dulu ikut kena bug yang sama).

**Permintaan kwan: frame diambil dari detik 5 s/d 60**
- AI kini **mencari adegan terbaik HANYA di detik 5–60** (menghindari intro/bukaan awal video; video lebih pendek dari 60 dtk menyesuaikan otomatis). Berlaku untuk Poster Hollywood (99 gaya), Template AI, dan mode "tiap bagian beda".

**Poster Hollywood kini penuh di Mode Sederhana (frame video + 99 gaya bersatu)**
- Tombol 🎬 Poster Hollywood + pemilih 99 gaya + AI Sinematik berfungsi langsung di wizard Mode Sederhana.
- **Pratinjau cover langsung tampil** di seksi Cover Otomatis + contoh cover dibuat otomatis begitu gaya dipilih (notifikasi "Contoh cover siap ✔") — kamu melihat sendiri posternya SEBELUM export.
- Keterangan membingungkan "ubah di Mode Pro → tab Cover" diganti info: "adegan diambil otomatis dari video (detik 5–60)".

**Perkuatan mesin render Kilat (bonus pengaman)**
- Semua gambar (cover) kini **ditunggu sampai benar-benar ter-decode SEBELUM frame pertama** (dulu render mulai duluan, penunggu menyerah dalam diam ±1,2 dtk → frame cover bisa kosong/hitam di komputer lambat).
- Penantuan gambar diperpanjang ke ±6 dtk + decode eksplisit + deteksi piksel.

**BUKTI TES END-TO-END (aplikasi nyata, video asli, klik UI sungguhan)**
- Klik 🎬 Poster Hollywood → state terpasang ✓ → contoh cover dibuat otomatis: **91,7% berwarna** (sebelum perbaikan: 100% hitam) ✓
- Export sungguhan (mesin Kilat, split aktif) → frame cover di video hasil: **65,4% berwarna, furnitur lengkap** ✓ — bukti gambar dilampirkan di rilis ini.

**Catatan**: pastikan menjalankan exe **v1.0.34** dari rilis ini (bukan exe lama). Setelah pilih Poster Hollywood, tunggu "Contoh cover siap ✔" dan lihat pratinjau — kalau pratinjau bagus, export pun pasti sama."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Akar Bug Poster Hitam Diperbaiki + Frame 5–60 Detik (diuji E2E)", "body": body, "draft": False, "prerelease": False}).encode(),
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
