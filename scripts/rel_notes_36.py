#!/usr/bin/env python3
"""Buat GitHub Release v1.0.36 — Mesin Poster AI publik + judul bersih.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.36"

body = """**NOVACUT Studio v1.0.36 — AKAR MASALAH POSTER AI KETEMU + MESIN AI PUBLIK + JUDUL BERSIH** 🔍🎬

**Kenapa poster AI kemarin terasa "tidak sebagus contoh"?** Ketemu akarnya: jalur AI lama hanya jalan bila ada berkas kredensial internal (`.z-ai-config`) yang **tidak ada di PC pengguna** — jadi di PC kwan, AI-nya **tidak pernah jalan** dan yang tampil selama ini adalah *poster cadangan* (frame digelapkan + tulisan overlay biasa). Contoh bagus yang dulu dilihat kwan dibuat lewat jalur internal sandbox, bukan dari app. Rilis ini menambalnya permanen.

**1. MESIN POSTER AI PUBLIK (kunci API milik kwan sendiri)**
- Kartu baru **"Kunci API Poster AI"** di Mode Sederhana & Cover Studio: tempel kunci API Z.ai → tersimpan lokal di PC (tidak dikirim ke mana pun selain api.z.ai).
- Jalur baru `api.z.ai/api/paas/v4`: **frame adegan video → AI vision `glm-5.3-flashx` membaca adegan** (subjek, suasana, cahaya, warna; takarir/watermark diabaikan) → **`glm-image` kualitas HD (1728x960 / 960x1728)** melukis poster Hollywood utuh — judul ditulis AI, komposisi baru, bukan sekadar frame digelapkan.
- **Tes Koneksi** (ping murah, validasi kunci+saldo), **Hapus Kunci**, dan tombol **buka halaman API Keys Z.ai** langsung dari app.
- Tanpa kunci → jalur SDK lama (lingkungan yang punya config) → mode cadangan frame ter-grade. Semua jalur tetap aman, cover pasti jadi.

**2. JUDUL DIBERSIHKAN DARI KODE SAMPAH**
- Contoh nyata: `...SEKETIK. [42TZYEQ7MOK]` → kini jadi `...SEKETIK.` — kode bracket alfanumerik dari nama file video dibuang otomatis (di judul teks, judul cover, dan prompt poster AI).

**3. PROMPT LEBIH KERAS ANTI-RUSAK**
- Prompt default + prompt publik kini selalu menyuntikkan aturan: **tanpa takarir video, tanpa watermark, tanpa caption**, tulisan dijaga dalam margin aman — takarir "Pa, aku nggak apa." seperti di laporan kwan tidak akan ditiru ke poster.

**Cara pakai (sekali saja)**
1. Klik tombol *"Cara dapat kunci"* di kartu Kunci API → buat **Standard API Key** di z.ai (top-up saldo di halaman billing bila perlu).
2. Tempel kunci → **Simpan** → **Tes Koneksi** (harus "Koneksi AI publik OK").
3. Klik **🎨 Buat Ulang Poster (AI)** — poster HD ala contoh langsung jadi. Satu kunci dipakai untuk semua video & tombol "Terapkan ke semua video".

**DIUJI**: pembersih judul (3 kasus ✓), kedua endpoint publik terverifikasi hidup (autentikasi 401 tanpa kunci ✓), sintaks main/preload ✓, `DESKTOP=1 next build` hijau ✓. Jalur publik butuh kunci pribadi kwan untuk dites penuh di PC — bila Tes Koneksi gagal, cek kunci/saldo di halaman billing."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Mesin Poster AI Publik (Kunci API Sendiri) + Judul Bersih", "body": body, "draft": False, "prerelease": False}).encode(),
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
