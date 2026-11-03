import json, urllib.request, os

TOK = open('/tmp/gh_auth.env').read().split('=',1)[1].strip()

def api(url, method='GET', data=None, ct='application/json'):
    h = {'Authorization': f'token {TOK}', 'Accept': 'application/vnd.github+json'}
    if ct: h['Content-Type'] = ct
    req = urllib.request.Request(url, headers=h, method=method, data=data)
    return urllib.request.urlopen(req).read()

body = """**NOVACUT Studio v1.0.20 — ZOOM & POSISI VIDEO UTUH** 🔍🎮

Sesuai permintaan: di menu **RASIO & LAYAR**, begitu kamu memilih **"Video utuh — tanpa potong"**, kini MUNCUL MENU BARU **ZOOM & POSISI VIDEO UTUH** — atur sendiri sebesar apa video tampil dan bagian mana yang terlihat.

**ISI MENU BARU** 🎛️
- 🔍 **ZOOM (besar-kecil)** — slider 1.00x–5.00x + tombol perbesar/perkecil. **1.00x = video utuh seperti biasa** (ada bar hitam). Diperbesar → video tampil makin BESAR, tepi yang melewati layar terpotong rapi.
- 🎮 **GESER KIRI/KANAN/ATAS/BAWAH** — tombol arah untuk memilih BAGIAN VIDEO MANA yang tampil (mis. fokus ke tengah panggung atau ke sisi kanan). Tombol ◎ tengah = pusatkan lagi.
- ⤢ **ISI FRAME** — satu klik: zoom otomatis tepat sampai bar hitam hilang (video memenuhi layar penuh).
- ↺ **RESET** — kembali ke 1.00x & posisi tengah.
- Posisi X/Y tampil live (angka) + dimensi video sumber.

**DI MANA MENU INI** 📍
- **Mode Sederhana** → langkah Export & Split → seksi **Rasio & Layar** → pilih "Video utuh" → menu ZOOM & POSISI muncul tepat di bawahnya.
- **Mode Pro** → panel Playlist (Export & Split) → muncul juga di bawah pilihan yang sama. Panel Kanan (klip Video Playlist) tetap punya ZOOM & GESER seperti sebelumnya.

**SENYAP DI SEMUA MESIN RENDER** ⚙️
- Zoom & geser kini **berdiri sendiri**: tetap aktif walau toggle "efek & klip" dimatikan (dulu hanya jalan saat efek aktif).
- Hasil **identik di mesin Turbo** (WebCodecs, jalur tercepat) maupun mesin kilat — keduanya lewat jalur komposisi yang sama.
- Setelan tersimpan otomatis bersama konfigurasi export lainnya; data lama dinormalisasi aman.

Uji internal: typecheck bersih, build sukses, installer 1.0.20 diverifikasi berisi menu ZOOM & POSISI VIDEO UTUH. Semua fitur sebelumnya tetap ada: bingkai cover klasik/modern/futuristik, mesin Turbo WebCodecs, render paralel per bagian, subtitle AI, preset satu-klik, auto-shutdown.
"""

payload = json.dumps({"tag_name": "v1.0.20", "name": "NOVACUT Studio v1.0.20", "body": body, "draft": False, "prerelease": False}).encode()
rel = json.loads(api('https://api.github.com/repos/zacrie85/novacut-studio/releases', 'POST', payload))
print('Release dibuat:', rel['id'], rel['name'])

up = rel['upload_url'].split('{')[0]
for fn, path in [
    ("NOVACUT-Studio-Setup-1.0.20.exe", "/home/z/my-project/release/NOVACUT-Studio-Setup-1.0.20.exe"),
    ("NOVACUT-Studio-Portable-1.0.20.exe", "/home/z/my-project/release/NOVACUT-Studio-Portable-1.0.20.exe"),
]:
    print(f"Upload {fn} ({os.path.getsize(path):,} byte)...")
    data = open(path, 'rb').read()
    r = json.loads(api(f"{up}?name={fn}", 'POST', data, ct='application/octet-stream'))
    print("  -> OK, state:", r.get('state'), "| size:", r.get('size'))
print("SELESAI SEMUA")
