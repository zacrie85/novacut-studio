import json, urllib.request, os

TOK = open('/tmp/gh_auth.env').read().split('=',1)[1].strip()

def api(url, method='GET', data=None, ct='application/json'):
    h = {'Authorization': f'token {TOK}', 'Accept': 'application/vnd.github+json'}
    if ct: h['Content-Type'] = ct
    req = urllib.request.Request(url, headers=h, method=method, data=data)
    return urllib.request.urlopen(req).read()

body = """**NOVACUT Studio v1.0.19 — BINGKAI COVER: Klasik / Modern / Futuristik** 🖼️✨

Upgrade khusus bagian **Cover** — kini gambar cover otomatis bisa dipakaikan **BINGKAI** pilihanmu sendiri, mengelilingi seluruh gambar cover. Dibuat persis sesuai permintaan: 3 gaya bingkai, pilih secara MANUAL, tampil **semi-transparan 75%**.

**3 PILIHAN BINGKAI (dipilih manual)** 🎨
- 🏛️ **KLASIK** — bingkai ganda emas + belah ketupat di tiap sudut + lengkung ukiran di tengah sisi. Gaya poster bioskop vintage.
- ⬜ **MODERN** — garis rounded putih bersih + garis tipis kedua di luarnya + kotak aksen di 2 sudut. Minimalis & rapi.
- 🔷 **FUTURISTIK** — bracket sudut HUD menyala (glow) + bingkai chamfer 45° + garis tick teknis + segitiga penunjuk. Gaya sci-fi.
- ➖ **TANPA BINGKAI** — cover polos seperti biasa (bawaan).

**DI MANA & CARA PAKAI** 📍
- **Mode Sederhana** → langkah Export & Split → kartu **"Cover Otomatis di Depan"**: pilihan bingkai ada di bawah slider Durasi — lengkap dengan **pratinjau mini langsung** di tiap tombol (yang tampil persis seperti hasilnya).
- **Mode Pro** → tab **Cover (Cover Studio)**: seksi "BINGKAI COVER" + pratinjau besar ikut berubah seketika.
- Bingkai berlaku untuk SEMUA jalur cover: cover otomatis AI dari adegan video, latar hitam polos, gambar unggahan sendiri (termasuk mode "apa adanya"), dan "tiap bagian beda adegan".
- Ganti bingkai = cover otomatis diperbarui. Cover lama yang belum berbingkai diperbarui **instan** (latar tidak berubah sedikit pun); pindah antar bingkai dibuat ulang dari sumber.

**BONUS PERBAIKAN** 🔧
- Fix bug lama: thumbnail grid **100 template** di Cover Studio tidak pernah tergambar (ref dipasang di tombol, bukan canvas) — kini semua thumbnail tampil normal.
- Cache cover per batch kini menyertakan gaya bingkai — tak ada cover lama yang basi saat batch export.

Uji internal: typecheck bersih, render visual 4 gaya diverifikasi, installer 1.0.19 diverifikasi berisi kode bingkai. Semua fitur sebelumnya tetap ada: mesin Turbo WebCodecs, render paralel per bagian, subtitle AI, preset satu-klik, auto-shutdown.
"""

payload = json.dumps({"tag_name": "v1.0.19", "name": "NOVACUT Studio v1.0.19", "body": body, "draft": False, "prerelease": False}).encode()
rel = json.loads(api('https://api.github.com/repos/zacrie85/novacut-studio/releases', 'POST', payload))
print('Release dibuat:', rel['id'], rel['name'])

up = rel['upload_url'].split('{')[0]
for fn, path in [
    ("NOVACUT-Studio-Setup-1.0.19.exe", "/home/z/my-project/release/NOVACUT-Studio-Setup-1.0.19.exe"),
    ("NOVACUT-Studio-Portable-1.0.19.exe", "/home/z/my-project/release/NOVACUT-Studio-Portable-1.0.19.exe"),
]:
    print(f"Upload {fn} ({os.path.getsize(path):,} byte)...")
    data = open(path, 'rb').read()
    r = json.loads(api(f"{up}?name={fn}", 'POST', data, ct='application/octet-stream'))
    print("  -> OK, state:", r.get('state'), "| size:", r.get('size'))
print("SELESAI SEMUA")
