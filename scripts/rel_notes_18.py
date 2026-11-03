import json, urllib.request, os

TOK = open('/tmp/gh_auth.env').read().split('=',1)[1].strip()

def api(url, method='GET', data=None, ct='application/json'):
    h = {'Authorization': f'token {TOK}', 'Accept': 'application/vnd.github+json'}
    if ct: h['Content-Type'] = ct
    req = urllib.request.Request(url, headers=h, method=method, data=data)
    return urllib.request.urlopen(req).read()

body = """**NOVACUT Studio v1.0.18 — TURBO Menyala untuk Film AV1** 🔧⚡

**Masalah yang diperbaiki:**
Sebagian film menampilkan *"Mode kilat (Turbo mati: decoder av01... tidak tersedia)"* — export tetap jalan (otomatis pakai mesin kilat lama), tapi mesin Turbo mati untuk film-film itu.

**Penyebab:** string codec AV1 dibangun TERBALIK — huruf tier sebelum level (`av01.0.M01.08`) → format tidak sah → ditolak Chromium.

**Perbaikan:**
- String codec kini sesuai registri WebCodecs: `av01.0.01M.08` (level dulu, baru tier) → decoder AV1 (dav1d) aktif → **mesin Turbo menyala untuk semua film AV1**
- Error decoder kini tertangani rapi: bagian yang gagal langsung diulang mesin kilat lama (tanpa unhandled rejection)

**Uji:** film AV1 (libaom) di-split 2 bagian → kedua hasil MP4 h264+AAC valid; film H264 tetap normal (regresi aman).

Fitur v1.0.17 tetap ada: render paralel per bagian (2-3x lebih cepat), mesin Turbo WebCodecs murni + audio stream-copy, ETA + auto-shutdown, resume batch, preset, smart split.
"""

payload = json.dumps({"tag_name": "v1.0.18", "name": "NOVACUT Studio v1.0.18", "body": body, "draft": False, "prerelease": False}).encode()
rel = json.loads(api('https://api.github.com/repos/zacrie85/novacut-studio/releases', 'POST', payload))
print('Release dibuat:', rel['id'], rel['name'])

up = rel['upload_url'].split('{')[0]
for fn, path in [
    ("NOVACUT-Studio-Setup-1.0.18.exe", "/home/z/my-project/release/NOVACUT-Studio-Setup-1.0.18.exe"),
    ("NOVACUT-Studio-Portable-1.0.18.exe", "/home/z/my-project/release/NOVACUT-Studio-Portable-1.0.18.exe"),
]:
    print(f"Upload {fn} ({os.path.getsize(path):,} byte)...")
    data = open(path, 'rb').read()
    r = json.loads(api(f"{up}?name={fn}", 'POST', data, ct='application/octet-stream'))
    print("  -> OK, state:", r.get('state'), "| size:", r.get('size'))
print("SELESAI SEMUA")
