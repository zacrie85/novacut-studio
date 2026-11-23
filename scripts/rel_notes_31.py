#!/usr/bin/env python3
"""Buat GitHub Release v1.0.31 (fitur Cover Otomatis = Poster Hollywood + 99 gaya) — build exe otomatis oleh CI.
BUTUH token valid di /tmp/gh_auth.env."""
import json, pathlib, sys, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.31"

body = """**NOVACUT Studio v1.0.31 — COVER OTOMATIS = POSTER HOLLYWOOD (99 GAYA)** 🎬

Metode pembuat poster (yang dipakai untuk foto kawan) sekarang masuk ke dalam NOVACUT! Menu **Cover Otomatis di Depan** punya mesin baru.

**Apa yang baru**
1. Pilihan latar cover baru: **"🎬 Poster Hollywood (99 Gaya)"** — di Mode Sederhana (langkah Export & Split → Cover Otomatis di Depan) dan di Mode Pro (Cover Studio)
2. **99 gaya referensi** terinspirasi genre film Hollywood: Aksi, Horor, Sci-Fi, Noir, Epik, Romantis, Komedi, Thriller, Sejarah, Superhero, Drama, Misteri, Petualangan, Dokumenter Alam, Luar Angkasa — semuanya resep ORISINAL (bukan poster film berhak cipta)
3. **🎲 Acak Otomatis per Judul** — tiap film mendapat gaya yang cocok secara deterministik (film yang sama selalu gaya yang sama), atau pilih gaya spesifik dari daftar
4. **Grade sinematik lokal** (offline & cepat): filter warna genre, tint bayangan + sorot cahaya, bloom sinematik, vignette, grain film, scrim gelap untuk teks
5. **Furnitur poster ala bioskop** di bagian atas cover: garis *"NOVACUT PICTURES MEMPERSEMBAHKAN"*, tagline khas gaya (mis. *"SATU ORANG. SATU PELUANG."*), dan blok kredit — judul film & teks part TETAP dinamis di bawah (tidak dobel, tetap bisa diatur dari menu Teks)
6. **AI Sinematik (beta) — opsional**: frame dikirim ke AI (z-ai-web-dev-sdk di main process Electron) untuk dijadikan latar dramatis seperti poster sungguhan. Tanpa internet / gagal → **otomatis fallback ke grade lokal** — cover pasti jadi
7. Bingkai cover (klasik/modern/futuristik) tetap bisa ditumpang-kan di atas poster

**Cara pakai (Mode Sederhana)**
1. Langkah **Export & Split** → nyalakan **Cover Otomatis di Depan**
2. Di **Gaya Cover**, pilih **"🎬 Poster Hollywood"**
3. Pilih gaya (atau biarkan 🎲 Acak per Judul), aktifkan AI Sinematik bila mau
4. Mulai Export — setiap film dapat cover poster Hollywood dengan judul dari nama filmnya

**Detail teknis**
- Mesin poster berjalan di canvas: satu frame terbaik per film dianalisis AI (seperti biasa), lalu di-grade sesuai gaya
- Kompatibel split: latar "tiap bagian beda adegan" tetap berfungsi, poster di-grade per adegan
- Jalur AI via IPC baru `ai:poster` (dynamic import SDK, ESM aman), timeout 180 detik per film"""

req = urllib.request.Request(
    f"https://api.github.com/repos/{REPO}/releases",
    data=json.dumps({"tag_name": TAG, "name": f"NOVACUT Studio {TAG} — COVER OTOMATIS = Poster Hollywood (99 Gaya)", "body": body, "draft": False, "prerelease": False}).encode(),
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
