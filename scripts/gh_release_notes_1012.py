#!/usr/bin/env python3
"""Buat release v1.0.12 di GitHub + unggah 2 aset installer."""
import json
import os
import subprocess
import sys
import time
import urllib.request

REPO = "zacrie85/novacut-studio"
TAG = "v1.0.12"
VERSION = "1.0.12"

SETUP = "/home/z/my-project/download/NOVACUT-Studio-Setup-1.0.12.exe"
PORTABLE = "/home/z/my-project/download/NOVACUT-Studio-Portable-1.0.12.exe"

def sha256(path):
    out = subprocess.run(["sha256sum", path], capture_output=True, text=True)
    return out.stdout.split()[0]

def api(url, method="GET", data=None, token=None, ctype="application/json"):
    req = urllib.request.Request(url, method=method)
    req.add_header("Accept", "application/vnd.github+json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    if data is not None:
        if isinstance(data, (dict, list)):
            data = json.dumps(data).encode()
        req.add_header("Content-Type", ctype)
    return urllib.request.urlopen(req, data=data, timeout=120)

BODY = f"""# NOVACUT Studio v{VERSION} — Tampilan Baru + 2 Playlist Terpisah + Mode Sederhana

Update besar tampilan & kemudahan pemakaian! Warna lebih tenang ala aplikasi edit profesional (CapCut/Premiere), teks lebih besar & lega, layar sambutan, mode sederhana 3 langkah, dan **playlist kini dipecah jadi 2 menu terpisah** sesuai alur kerjamu.

## Yang baru

### 1. Tampilan baru bergaya profesional
Seluruh antarmuka dirapikan: latar gelap netral, **satu aksen biru**, tanpa efek glow berlebihan, teks & tombol lebih besar supaya nyaman di mata. Timeline, preview, dan semua panel mengikuti gaya yang sama.

### 2. Layar sambutan
Saat aplikasi dibuka, langsung muncul 2 pilihan besar: **Edit Video (Timeline)** atau **Export Langsung & Split**. Ada centang "Jangan tampilkan lagi" — dan tombol pindah mode selalu ada di bagian atas.

### 3. Mode Sederhana — wizard 3 langkah
Untuk yang mau cepat: **Pilih Video → Atur → Export**. Satu langkah per layar dengan tombol besar. Mode Pro (layout editor penuh) tetap ada dan bisa diganti kapan saja lewat tombol "Mode Sederhana / Mode Pro".

### 4. Playlist dipecah jadi 2 menu terpisah
- **Playlist** (Playlist Editor) — antrean video yang akan dikelola di timeline: potong, efek, teks, musik.
- **Langsung** (Playlist Export Langsung) — antrean video yang langsung di-Export & Split tanpa lewat editor.
Video bisa dipindah antar daftar dengan satu tombol panah. Saat impor, video otomatis masuk Playlist Editor.

### 5. Urutan video bisa ditarik (drag & drop)
Tahan ikon grip lalu geser untuk mengubah urutan part 1, 2, 3... di kedua playlist.

### 6. Progres export tampil per video
Saat render paralel (1-5 video) berjalan, **tiap video punya baris progres sendiri** di panel: antre / merender / selesai / gagal — plus ringkasan hasil & tombol buka folder.

### 7. Tombol pintas keyboard
**Spasi** = putar/jeda · **S** = potong klip · **← →** = mundur/maju 1 detik (tahan Shift = 5 detik) · **Del** = hapus klip. Petunjuknya selalu terlihat di garis bawah aplikasi.

### 8. Tooltip bahasa Indonesia
Semua tombol ikon punya keterangan saat disentuh mouse — tidak perlu menebak-nebak lagi.

## Unduhan

| File | Fungsi |
| --- | --- |
| `NOVACUT-Studio-Setup-{VERSION}.exe` | Installer per-user — **tanpa izin administrator** |
| `NOVACUT-Studio-Portable-{VERSION}.exe` | Versi portable — tinggal jalankan |

SHA256:

```
Setup    {sha256(SETUP)}
Portable {sha256(PORTABLE)}
```

**Catatan:** Installer tetap per-user (asInvoker) — tidak minta password administrator.
"""

def main():
    token = os.environ.get("GH_TOKEN")
    if not token:
        for line in open("/tmp/gh_auth.env"):
            if line.startswith("export GH_TOKEN="):
                token = line.strip().split("=", 1)[1]
    if not token:
        sys.exit("token tidak ada")

    # hindari duplikat bila dijalankan ulang
    rel = None
    with api(f"https://api.github.com/repos/{REPO}/releases", token=token) as r:
        for x in json.load(r):
            if x.get("tag_name") == TAG:
                rel = x
                break
    if rel:
        print("release sudah ada:", rel["id"])
    else:
        payload = {
            "tag_name": TAG,
            "target_commitish": "main",
            "name": f"NOVACUT Studio v{VERSION} — Tampilan Baru + 2 Playlist Terpisah + Mode Sederhana",
            "body": BODY,
            "draft": False,
            "prerelease": False,
        }
        with api(f"https://api.github.com/repos/{REPO}/releases", method="POST", data=payload, token=token) as r:
            rel = json.load(r)
        print("release dibuat:", rel["id"])

    rid = rel["id"]
    existing = {a["name"] for a in (json.load(api(f"https://api.github.com/repos/{REPO}/releases/{rid}/assets", token=token)))}
    for path in (SETUP, PORTABLE):
        name = os.path.basename(path)
        if name in existing:
            print("aset sudah ada:", name)
            continue
        size = os.path.getsize(path)
        print("unggah", name, size, "bytes ...")
        url = f"https://uploads.github.com/repos/{REPO}/releases/{rid}/assets?name={name}"
        with open(path, "rb") as f:
            req = urllib.request.Request(url, method="POST", data=f)
            req.add_header("Content-Type", "application/octet-stream")
            req.add_header("Authorization", f"Bearer {token}")
            resp = json.load(urllib.request.urlopen(req, timeout=1800))
        print("  ok:", resp["name"], resp["size"], "state:", resp["state"])
        time.sleep(1)
    print("SELESAI. URL:", rel.get("html_url"))

if __name__ == "__main__":
    main()
