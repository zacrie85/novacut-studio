import json, urllib.request, os

TOK = open('/tmp/gh_auth.env').read().split('=',1)[1].strip()

def api(url, method='GET', data=None, ct='application/json'):
    h = {'Authorization': f'token {TOK}', 'Accept': 'application/vnd.github+json'}
    if ct: h['Content-Type'] = ct
    req = urllib.request.Request(url, headers=h, method=method, data=data)
    return urllib.request.urlopen(req).read()

body = """**NOVACUT Studio v1.0.22 — BINGKAI JUDUL 10 GAYA + POSISI VERTIKAL** 🖼️↕️

Sesuai permintaan: tulisan judul sekarang punya **BINGKAI** (10 gaya, interior kosong) dan posisi tulisan **bebas digeser dari ujung ke ujung**!

**1. POSISI VERTIKAL — BEBAS ATAS ↔ BAWAH** ↕️
- 📍 **Judul + Deskripsi: default di PALING BAWAH** — geser slidernya sampai ke PALING ATAS sesuka hatimu.
- 📍 **Part/Episode/Bagian/Eps: default di PALING ATAS** — geser slidernya sampai ke PALING BAWAH.
- 🛡️ Di ujung slider sekalipun, tulisan **tetap utuh** — tidak pernah terpotong tepi layar.
- 🎛️ Menu: **TEKS → POSISI VERTIKAL (GESER ATAS ↔ BAWAH)** — ada di Mode Sederhana (langkah TEKS) & Mode Pro (menu Teks).

**2. BINGKAI JUDUL — 10 GAYA, INTERIOR KOSONG** 🖼️
- 6 gaya sesuai gambar referensimu: **Dinamis Miring** (biru & pink), **Merah Biru** (bingkai merah + bar biru), **Berlian Biru** (banner + ikon belah ketupat), **Mewah Emas** (garis emas ganda + manik), **Emas Mahkota** (emas klasik + mahkota), **Kartun Oranye** (garis hitam tebal + bayangan oranye).
- 4 gaya futuristik buatan NOVACUT: **HUD Cyber** (bracket cyan menyala), **Neon Ungu** (glow + sirkuit), **Panel Sci-Fi** (nameplate sudut miring), **Tech Grid** (garis ganda + kotak sudut).
- ⬜ **Bagian dalam bingkai KOSONG** — hanya bagian luarnya yang digambar, video tetap terlihat di dalam bingkai, tulisan judul duduk di atasnya.
- 📏 **Besar bingkai OTOMATIS mengikuti panjang & lebar tulisan** — tulisan pendek = bingkai rapat, tulisan panjang = bingkai melebar.
- 🎚️ Mau atur sendiri? Ada slider **Lebar** & **Tinggi** (0,6x–2,5x) — bikin bingkai lebih besar/kecil/tinggi/pendek secara manual, plus tombol reset ke otomatis.
- 🖼️ Dipilih **MANUAL** lewat grid 11 pratinjau (1 Tanpa Bingkai + 10 gaya) — pratinjaunya WYSIWYG, persis seperti hasil video.

**3. SEMUA SINKRON — SATU JALUR RENDER** ⚙️
- Yang kamu lihat di pratinjau menu Teks = **persis** yang keluar di video hasil Export & Split — di mesin kilat maupun mesin Turbo WebCodecs.
- Posisi & bingkai tersimpan otomatis (diingat untuk export berikutnya). Setelan lama langsung memakai posisi default baru tanpa perlu diatur ulang.

**DI MANA** 📍
- **Mode Sederhana** → langkah **TEKS** → bagian POSISI VERTIKAL & BINGKAI JUDUL.
- **Mode Pro** → menu **Teks** → bagian yang sama.
- Bingkai dipakai pada tulisan judul **di dalam video** (saat video berjalan). Layar cover tetap seperti biasa.

Uji internal: typecheck bersih di src, build desktop sukses, 10 bingkai + 8 kasus posisi diverifikasi visual lewat render browser (default bawah/atas, ujung slider utuh, bingkai ikut teks & skala manual 1.5x), asar 1.0.22 berisi kode BINGKAI JUDUL. Semua fitur sebelumnya tetap ada: pratinjau langsung zoom & posisi, bingkai cover klasik/modern/futuristik, mesin Turbo WebCodecs, render paralel, subtitle AI, preset satu-klik, auto-shutdown.
"""

payload = json.dumps({"tag_name": "v1.0.22", "name": "NOVACUT Studio v1.0.22", "body": body, "draft": False, "prerelease": False}).encode()
rel = json.loads(api('https://api.github.com/repos/zacrie85/novacut-studio/releases', 'POST', payload))
print('Release dibuat:', rel['id'], rel['name'])

up = rel['upload_url'].split('{')[0]
for fn, path in [
    ("NOVACUT-Studio-Setup-1.0.22.exe", "/home/z/my-project/release/NOVACUT-Studio-Setup-1.0.22.exe"),
    ("NOVACUT-Studio-Portable-1.0.22.exe", "/home/z/my-project/release/NOVACUT-Studio-Portable-1.0.22.exe"),
]:
    print(f"Upload {fn} ({os.path.getsize(path):,} byte)...")
    data = open(path, 'rb').read()
    r = json.loads(api(f"{up}?name={fn}", 'POST', data, ct='application/octet-stream'))
    print('  OK:', r['name'], r['size'])

print('SELESAI')
