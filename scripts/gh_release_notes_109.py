#!/usr/bin/env python3
"""Catatan rilis NOVACUT Studio v1.0.9 (bahasa Indonesia) -> JSON untuk GitHub API."""
import json

TAG = "v1.0.9"
NAME = "NOVACUT Studio v1.0.9 — Posisi Teks, Pratinjau Realtime & Perbaikan Split"

BODY = """## Upgrade Besar v1.0.9 🎬

### 1. PENGATURAN POSISI TULISAN (Judul, Deskripsi & Part)
Menu **Teks** sekarang punya tombol geser **kiri / kanan / atas / bawah** (per 1%, sampai ±45% layar) untuk:
- **Judul** video
- **Deskripsi** (baris kedua)
- **Part / Episode / Bagian / Eps / EP**

Posisi tersimpan otomatis & langsung dipakai di setiap video hasil **Export & Split** dari Playlist.

### 2. PRATINJAU LANGSUNG (REALTIME)
Setiap perubahan **ukuran huruf** maupun **posisi** langsung terlihat tanpa perlu export:
- Di **layar preview utama** (menempel di atas video timeline)
- Di **kanvas pratinjau langsung** di dalam menu Teks — tampilannya persis sama dengan hasil video

Bisa dimatikan lewat sakelar "Tampilkan tulisan di layar preview".

### 3. PERBAIKAN: SPLIT BAGIAN KE-4 KE ATAS LAYAR HITAM
Penyebab ditemukan: posisi sumber video terhitung **dobel** saat proyek tiap bagian dibangun, sehingga bagian ke-2 dst. melompati isi video dan bagian akhir melewati ujung video (hitam). Kini klip dipotong **tepat sepanjang rentang bagian** — teruji otomatis: bagian N berisi sumber detik `[(N-1)×durasi .. N×durasi]`, termasuk mode kecepatan 2x dan klip audio.

### 4. DETIK COVER TIDAK LAGI MEMAKAN DETIK VIDEO
Layar cover kini benar-benar diletakkan **di depan** isi video (isi digeser, tidak terpotong), dan frame video sudah **disiapkan sejak cover tampil** sehingga tidak ada lag hitam di awal isi. Akibatnya hasil splitan **1, 2, 3, dst. tersambung mulus** — akhir bagian 1 lanjut tepat di awal bagian 2.

### 5. KLIK 2x = TARIK OTOMATIS SAMPAI AKHIR VIDEO
Di menu **TIMELINE**, klik 2x klip **gambar / teks / audio** → durasinya otomatis ditarik sampai ke akhir video yang ada di timeline. Tidak perlu lagi klik-tahan-menggeser. (Petunjuk tampil di toolbar timeline.)

### Stabilitas Export
- Satu elemen media per aset + pembersihan otomatis antar video batch — mencegah penumpukan memori/dekoder saat memproses playlist panjang.

---

**Unduhan:**
- `NOVACUT-Studio-Setup-1.0.9.exe` — installer (tetap **tanpa izin administrator**, terpasang per-user)
- `NOVACUT-Studio-Portable-1.0.9.exe` — versi portable tanpa instalasi

**SHA256:**
```
66e3a12509f55fa93372bb191963343684ad0fe730b4671a375555d715ad59b7  NOVACUT-Studio-Setup-1.0.9.exe
5bb0e322e0a7fd745c1cd6f82d289bb9e20c050257fb56bf4a04f81d5b0bfdd0  NOVACUT-Studio-Portable-1.0.9.exe
```

Terima kasih sudah pakai NOVACUT Studio! 🚀"""

payload = {
    "tag_name": TAG,
    "target_commitish": "main",
    "name": NAME,
    "body": BODY,
    "draft": False,
    "prerelease": False,
}

print(json.dumps(payload))
