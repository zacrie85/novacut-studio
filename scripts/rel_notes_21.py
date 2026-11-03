import json, urllib.request, os

TOK = open('/tmp/gh_auth.env').read().split('=',1)[1].strip()

def api(url, method='GET', data=None, ct='application/json'):
    h = {'Authorization': f'token {TOK}', 'Accept': 'application/vnd.github+json'}
    if ct: h['Content-Type'] = ct
    req = urllib.request.Request(url, headers=h, method=method, data=data)
    return urllib.request.urlopen(req).read()

body = """**NOVACUT Studio v1.0.21 — PRATINJAU VIDEO LANGSUNG di ZOOM & POSISI** 🖥️⚡

Sesuai permintaan: menu **ZOOM & POSISI VIDEO UTUH** kini punya **PRATINJAU VIDEO LANGSUNG** di sisi kiri — tidak perlu menebak-nebak lagi hasil zoom & gesernya seperti apa!

**APA YANG BARU** ✨
- 🖥️ **Kanvas pratinjau mini 9:16** — menampilkan gambar ASLI dari videomu (diambil otomatis dari video pertama di playlist).
- ⚡ **Live seketika** — gerakkan slider zoom (besar-kecil) atau tombol geser kiri/kanan/atas/bawah → pratinjau langsung berubah mengikuti. Berhenti di tombolnya saja, hasilnya kelihatan seketika.
- 🎯 **WYSIWYG** — matematika kadro pratinjau SAMA PERSIS dengan mesin render (framingLayout + pan). Apa yang kamu lihat di pratinjau = apa yang keluar di video hasil export.
- 📐 **Ukuran pintar** — kecil rapi (64px) di panel sempit, membesar (96px) di kartu lebar Mode Sederhana, plus label "PRATINJAU".
- 💤 **Hemat resource** — frame video hanya diambil SEKALI per video lalu tersimpan (cache), batch 50 film tetap ringan.

**DI MANA** 📍
- **Mode Sederhana** → Export & Split → Rasio & Layar → pilih "Video utuh" → menu ZOOM & POSISI VIDEO UTUH dengan pratinjau di sebelah kiri.
- **Mode Pro** → panel Langsung / panel Kanan (klip Video Playlist) → pratinjau ikut tampil bila lebar panel cukup.

Uji internal: typecheck bersih, build sukses, container query CSS terverifikasi di paket, installer 1.0.21 berisi kode pratinjau. Semua fitur sebelumnya tetap ada: bingkai cover klasik/modern/futuristik, zoom & geser berdiri sendiri, mesin Turbo WebCodecs, render paralel, subtitle AI, preset satu-klik, auto-shutdown.
"""

payload = json.dumps({"tag_name": "v1.0.21", "name": "NOVACUT Studio v1.0.21", "body": body, "draft": False, "prerelease": False}).encode()
rel = json.loads(api('https://api.github.com/repos/zacrie85/novacut-studio/releases', 'POST', payload))
print('Release dibuat:', rel['id'], rel['name'])

up = rel['upload_url'].split('{')[0]
for fn, path in [
    ("NOVACUT-Studio-Setup-1.0.21.exe", "/home/z/my-project/release/NOVACUT-Studio-Setup-1.0.21.exe"),
    ("NOVACUT-Studio-Portable-1.0.21.exe", "/home/z/my-project/release/NOVACUT-Studio-Portable-1.0.21.exe"),
]:
    print(f"Upload {fn} ({os.path.getsize(path):,} byte)...")
    data = open(path, 'rb').read()
    r = json.loads(api(f"{up}?name={fn}", 'POST', data, ct='application/octet-stream'))
    print("  -> OK, state:", r.get('state'), "| size:", r.get('size'))
print("SELESAI SEMUA")
