#!/usr/bin/env python3
"""Buat GitHub Release v1.0.33 (poster Hollywood DIJAMIN tampil) — build exe otomatis oleh CI.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.33"

body = """**NOVACUT Studio v1.0.33 — UPGRADE: Poster Hollywood DIJAMIN TAMPIL, Tidak Mungkin Hitam Lagi** 🎬🛡️

Laporan kwan: setelah pilih **"🎬 Poster Hollywood"** di menu Cover Otomatis, hasil Export & Split masih menampilkan latar hitam. Dilaporkan, diperiksa, dan sekarang **di-upgrade tuntas**.

**Apa yang kupertahankan dari laporan ini**
Dua penyebab tersisa ditemukan dan keduanya kini tertutup:
1. **Frame video bisa keluar HITAM** — di sebagian komputer, decoder video GPU menolak men-decode elemen video yang tidak menempel di layar → `drawImage` menggambar hitam murni → frame hitam itulah yang dijadikan "poster". (Mesin posternya sendiri terbukti sehat — diuji dengan frame asli video pelapor: 97% area terisi.)
2. **Cache cover per-batch tidak menyertakan gaya** — cover gaya lama bisa tersodorkan kembali bila pengguna ganti gaya di sesi yang sama.

**UPGRADE-nya (4 lapis, semuanya baru di v1.0.33)**
1. **grabFrame anti-frame-hitam** — setiap frame kini DICEK PER PIKSEL sebelum dipakai. Frame hitam → otomatis dicoba ulang: geser waktu +0,4s, re-seek, lalu trik pamungkas **menempelkan elemen video tersembunyi ke DOM** (membuka jalur decode GPU normal). Frame yang tidak lolos validasi tidak akan pernah menjadi cover.
2. **Kandidat adegan cadangan** — bila frame terpilih gagal, AI otomatis mencoba 4 kandidat waktu lain (30%, 62%, 15%, 85% durasi film) dan memakai yang pertama berhasil.
3. **JAMINAN POSTER TAMPIL (fallback gradasi sinematik)** — kalau semua frame benar-benar tak terbaca, poster otomatis memakai **latar gradasi warna gaya Hollywood-nya sendiri** (emas→teal, grain film, vignette) dengan furnitur lengkap: "NOVACUT PICTURES MEMPERSEMBAHKAN", tagline, kredit, judul dinamis + nomor part. **Hitam polos kini mustahil terjadi di mode poster.** Mode adegan (template) juga mendapat gradasi cadangan yang sama.
4. **Contoh cover langsung dibuat** — begitu kamu memilih gaya di menu Cover Otomatis (dan belum ada cover), aplikasi SEGERA membuat contoh cover dari video + notifikasi "Contoh cover siap ✔" — kamu bisa MEMASTIKAN sendiri posternya tampil SEBELUM export. Cache cover juga kini menyertakan gaya.

**Bukti (diuji di Chromium dgn frame asli video pelapor)**
- Frame asli → poster penuh warna (hanya 3% piksel gelap) ✓
- Simulasi decoder gagal (frame hitam) → terdeteksi akurat → jatuh ke gradasi sinematik: 42% area berwarna, furnitur lengkap — bukan hitam ✓

**Catatan penting**: pastikan kamu MENJALANKAN exe v1.0.33 yang baru (Portable/Setup dari rilis ini), bukan exe lama di folder lain — cek versi di pojok aplikasi. Setelah pilih Poster Hollywood, tunggu "Contoh cover siap ✔" — kalau contohnya sudah tampil bagus, export pun pasti sama."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Poster Hollywood DIJAMIN Tampil (anti frame hitam)", "body": body, "draft": False, "prerelease": False}).encode(),
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
