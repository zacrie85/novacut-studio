#!/usr/bin/env python3
"""Generate GitHub release JSON payload for NOVACUT Studio versions."""
import json
import sys

SHA = {
    "1.0.6": {
        "NOVACUT-Studio-Setup-1.0.6.exe": "e0d62a82caaa0c2c3e724d4032306ecc304c8bf6662bcd260f823ad87c5a5699",
        "NOVACUT-Studio-Portable-1.0.6.exe": "4e5e6a4a9edeaf1aa2a826767bb91ac2a8aead318acaecdde8472c4ec97e5d1d",
    },
    "1.0.7": {
        "NOVACUT-Studio-Setup-1.0.7.exe": "2572655c948ee352499bea2bb0577fdd9992189076639a54390703db1cdbbb88",
        "NOVACUT-Studio-Portable-1.0.7.exe": "42982ae0d3a717be0821c1500274d353c70f4222b1b0f3bda7f9b43301e92986",
    },
}

BODY_106 = """## Installer tidak minta password administrator lagi

**Perbaikan untuk laporan:** saat install di laptop yang ada passwordnya, installer meminta autentifikasi password administrator.

Solusi di versi ini — installer kini **PER-USER**:

- Install **tanpa izin administrator / tanpa password** sama sekali (klik 2x, langsung jalan)
- Aplikasi terpasang di `%LOCALAPPDATA%\\Programs\\NOVACUT Studio` — cara yang sama seperti Google Chrome / VS Code
- Ikon desktop + menu Start tetap dibuat otomatis, tetap ada uninstaller
- Tidak menulis ke folder sistem (Program Files / registry HKLM), jadi tidak butuh UAC

## Unduhan

- `NOVACUT-Studio-Setup-1.0.6.exe` — installer per-user (tanpa password)
- `NOVACUT-Studio-Portable-1.0.6.exe` — versi portable tanpa install, tinggal jalankan

## SHA256

```
{sha_setup}
{sha_portable}
```
"""

BODY_107 = """## Teks judul, deskripsi & part kini TAMPIL di dalam video

**Perbaikan untuk laporan:** "aku export & split dari playlist, videonya berhasil di export & split akan tetapi tulisan judul, deskripsi dan part/episode-nya tidak tampil di dalam videonya."

Yang diperbaiki di versi ini:

- Tulisan **judul video, deskripsi, dan Part/Episode/Bagian** kini benar-benar tergambar **di dalam video** hasil Export & Split langsung dari playlist
- **Perbaikan bug engine:** sebelumnya klip teks saling menimpa sehingga salah satunya tidak pernah terlihat di hasil render — kini semua klip teks aktif digambar bertumpuk (judul di atas, part di bawah, tampil bersamaan)
- Teks tampil **selama video berjalan sampai selesai** (tidak hilang di tengah jalan)
- Gaya label mengikuti pilihan di menu playlist: **Episode / Bagian / Eps / EP**
- Metadata playlist default aktif otomatis + setelan lama otomatis dimigrasikan
- Tetap kompatibel dengan fitur sebelumnya: rasio 16:9 / 9:16, hasil .MP4, pilihan folder penyimpanan, installer tanpa password admin

## Unduhan

- `NOVACUT-Studio-Setup-1.0.7.exe` — installer per-user (tanpa password)
- `NOVACUT-Studio-Portable-1.0.7.exe` — versi portable tanpa install, tinggal jalankan

## SHA256

```
{sha_setup}
{sha_portable}
```
"""

ver = sys.argv[1]  # "1.0.6" or "1.0.7"
shas = SHA[ver]
body = (BODY_106 if ver == "1.0.6" else BODY_107).format(
    sha_setup=shas["NOVACUT-Studio-Setup-%s.exe" % ver],
    sha_portable=shas["NOVACUT-Studio-Portable-%s.exe" % ver],
)
payload = {
    "tag_name": "v%s" % ver,
    "name": "NOVACUT Studio %s" % ver,
    "body": body,
    "draft": False,
    "prerelease": False,
}
print(json.dumps(payload))
