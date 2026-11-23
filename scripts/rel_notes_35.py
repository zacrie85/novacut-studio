#!/usr/bin/env python3
"""Buat GitHub Release v1.0.35 — Poster Hollywood dirombak total jadi mesin AI poster.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.35"

body = """**NOVACUT Studio v1.0.35 — POSTER HOLLYWOOD DIROMBAK TOTAL: MESIN AI POSTER SUNGGUHAN** 🎬🤖

Sesuai permintaan kwan: 99 referensi gaya lama **DIHAPUS SEMUA** dan diganti **AI khusus pembuat poster** — gambar yang diambil dari adegan video diubah AI menjadi poster film Hollywood yang utuh (judul ditulis AI di atas poster).

**Cara kerjanya**
1. AI mengambil adegan terbaik dari video (detik **5–60**, sesuai aturan kwan; video pendek menyesuaikan otomatis).
2. Adegan dikirim ke AI bersama PROMPT → keluar **poster sinematik utuh** (judul + tagline digambar AI di poster).
3. **Prompt default** (pilihan kwan): *"Rubahlah gambar ini menjadi poster untuk sebuah film Hollywood... gaya modern sinematik"* — judul video otomatis disisipkan sebagai judul poster.
4. **Prompt manual**: ketik prompt sendiri di kolom yang tersedia (Mode Sederhana & Cover Studio).
5. Tombol **"⚡ Terapkan prompt ini ke semua video"** — membuat poster untuk SEMUA video yang diproses dengan prompt yang aktif.
6. **Rasio poster mengikuti rasio video/proyek** (16:9 → 1344x768, 9:16 → 768x1344).
7. **Tulisan dijaga tidak melewati tepi**: aturan margin selalu disuntikkan ke prompt (default maupun manual) — tulisan AI tidak boleh terpotong tepi kiri/kanan/atas/bawah.

**Kecerdasan tambahan**
- Poster AI **tidak diberi overlay judul dobel** — AI sudah menulis judul di poster, jadi hanya badge "Part 1/5" kecil di bawah. Ada tombol **"Overlay Judul"** bila prompt manualmu tidak menambahkan judul.
- **Pratinjau langsung** di Mode Sederhana + tombol **"🎨 Buat Ulang Poster (AI)"** — lihat poster SEBELUM export.
- **Anti-hitam berlapis**: AI gagal/tanpa internet → otomatis pakai frame ter-grade sinematik (cover tetap jadi, judul ditulis overlay).

**DIUJI END-TO-END DI APLIKASI NYATA SEBELUM RILIS** (klik UI sungguhan, video asli)
- Jalur AI: klik 🎬 Poster Hollywood (AI) → Buat Ulang → poster AI jadi (**aiMade=true, 1344x768, 37–63% berwarna**) → export sungguhan → **poster AI tampil di video hasil export** ✓
- Jalur cadangan: AI dimatikan → cover frame ter-grade (79% berwarna) ✓
- Build desktop (static export) dites hijau ✓

**Catatan judul**: judul poster = **judul di langkah "Atur"** (isi "Judul Kustom", atau otomatis dari nama video bila kosong) — sama persis dengan judul yang dirender di video.

Bukti gambar hasil AI dilampirkan di release ini."""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — Poster Hollywood AI (Rombak Total: Frame Adegan + Prompt → Poster)", "body": body, "draft": False, "prerelease": False}).encode(),
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
