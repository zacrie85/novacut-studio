#!/usr/bin/env python3
"""Catatan rilis NOVACUT Studio v1.0.10 (bahasa Indonesia) -> JSON untuk GitHub API."""
import json

TAG = "v1.0.10"
NAME = "NOVACUT Studio v1.0.10 — Perbaikan Export & Split Macet di 1%"

BODY = """## Perbaikan Penting v1.0.10 🎬

### 🐞 PERBAIKAN UTAMA: EXPORT & SPLIT MACET DI 1%
Pada versi 1.0.9, proses **Export & Split** (termasuk export langsung dari Playlist) berhenti di sekitar **1%** dan tidak pernah selesai — label stuck di "Merender Part 1..." tanpa pesan error.

**Penyebab:** ada kesalahan penulisan kode di mesin render (`gains.set(clipId)` — variabel tidak terdefinisi) yang membuat **loop animasi renderer berhenti diam-diam** di frame pertama saat perekaman berjalan. Karena errornya tertelan di dalam proses gambar, aplikasi tidak menampilkan pesan apa pun — progres cuma berhenti.

**Perbaikan:** variabel diperbaiki, audio video kini kembali ter-record dengan benar. Teruji otomatis end-to-end:
- ✅ Export & Split 2 bagian → selesai, progress 100%, 2 file MP4 dihasilkan
- ✅ Export batch dari Playlist (dengan layar cover + teks judul/part) → selesai 100%
- ✅ Preview tetap jalan mulus saat audio aktif

### 🏷️ Perbaikan Kecil Lain
- Nama file & label bagian pada Export & Split dari timeline kini mengikuti pilihan **Episode / Bagian / Eps / EP** di menu Teks (sebelumnya selalu "Part").

### Catatan untuk pengguna v1.0.9
Fitur v1.0.9 (posisi teks, pratinjau realtime, split bagian ke-4+ layar hitam, detik cover tidak memakan video, klik 2x tarik klip) **tetap ada** di versi ini — ditambah perbaikan di atas. **Wajib upgrade ke 1.0.10** agar export bisa jalan.

---

**Unduhan:**
- `NOVACUT-Studio-Setup-1.0.10.exe` — installer (tetap **tanpa izin administrator**, terpasang per-user)
- `NOVACUT-Studio-Portable-1.0.10.exe` — versi portable tanpa instalasi

**SHA256:**
```
0b583e406f74a91adc2d36d40f420ca484e29b282de811a411372776c556d414  NOVACUT-Studio-Setup-1.0.10.exe
caec6627eac23a8e0746d528406f29e6ef7404510c1241db47041c0c0d8a0240  NOVACUT-Studio-Portable-1.0.10.exe
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
