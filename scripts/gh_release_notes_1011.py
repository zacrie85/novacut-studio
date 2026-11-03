#!/usr/bin/env python3
"""Buat release v1.0.11 di GitHub + unggah 2 aset installer."""
import json
import os
import subprocess
import sys
import time
import urllib.request

REPO = "zacrie85/novacut-studio"
TAG = "v1.0.11"
VERSION = "1.0.11"

SETUP = "/home/z/my-project/download/NOVACUT-Studio-Setup-1.0.11.exe"
PORTABLE = "/home/z/my-project/download/NOVACUT-Studio-Portable-1.0.11.exe"

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

BODY = f"""# NOVACUT Studio v{VERSION} — Mesin Render Kilat + Subtitle AI + Export Paralel

Upgrade besar! Export & Split sekarang **tidak memutar video lagi**, jauh **lebih cepat**, bisa **banyak video sekaligus**, dan bisa **memberi subtitle otomatis** dari suara video.

## Yang baru

### 1. Export tanpa memutar video
Selama Export & Split, video di preview **tidak ikut diputar** lagi. Semua rendering berjalan di latar belakang (offscreen) — kamu bebas mengerjakan hal lain, bahkan meminimalkan aplikasi.

### 2. Mesin render kilat (jauh lebih cepat)
Mesin render baru berbasis **WebCodecs**: decode, komposisi, dan encode berjalan secepat yang perangkat sanggup — bukan lagi real-time. Durasi hasil selalu tepat. Di menu Export ada pilihan mesin:
- **Kilat (disarankan)** — tanpa memutar video, 5–10x lebih cepat
- **Kompatibel** — jalur lama (rekam real-time) bila ada masalah di perangkat tertentu

### 3. Export & Split paralel
Menu Playlist → **Render paralel (1–5 video bersamaan)**. Beberapa video dirender BERSAMAAN sehingga total waktu jauh lebih pendek. Progres tiap pekerjaan terlihat, hasil tetap otomatis tersimpan/terunduh.

### 4. Subtitle AI otomatis (bahasa Indonesia)
AI **menyimak suara video** lalu menuliskan teksnya **langsung di dalam video hasil export** (burn-in). Fokus bahasa Indonesia **resmi & gaul**. Tiga tingkat:
- **Ringan** — paling cepat (±45 MB, unduh pertama saja)
- **Sedang** — seimbang (±80 MB)
- **Akurat** — paling teliti (±250 MB)

Tersedia di menu Export (timeline) dan menu Playlist (batch). Model AI diunduh **sekali** (butuh internet pada pemakaian pertama), setelah itu berjalan offline. Inferensi berjalan di Web Worker terpisah sehingga aplikasi **tidak membeku**.

### 5. Efek & Klip untuk video Playlist
Video yang di-Export & Split langsung dari Playlist sekarang **mengikuti menu Efek dan Klip** (target "Video Playlist"): color grading (Noir, Teal & Orange, Vintage, dll.), efek visual (Vignette, Letterbox, Grain, dll.), kecepatan, ulang, volume, fade, zoom/geser, dan transisi. Tekan tombol **Efek** / **Klip** di panel Playlist untuk langsung mengarah ke target yang benar.

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
            "name": f"NOVACUT Studio v{VERSION} — Render Kilat + Subtitle AI + Paralel",
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
