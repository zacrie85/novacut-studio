import json, urllib.request, os

TOK = open('/tmp/gh_auth.env').read().split('=',1)[1].strip()

def api(url, method='GET', data=None, ct='application/json'):
    h = {'Authorization': f'token {TOK}', 'Accept': 'application/vnd.github+json'}
    if ct: h['Content-Type'] = ct
    req = urllib.request.Request(url, headers=h, method=method, data=data)
    return urllib.request.urlopen(req).read()

body = """**NOVACUT Studio v1.0.15 — Perbaikan Fatal Export** 🔧

v1.0.14 punya bug fatal: **SEMUA export langsung gagal** dengan pesan merah *"The target must be provided and an instance of Target"*. Versi ini memperbaikinya sepenuhnya. Maaf kawan! 🙏

**Penyebab:**
- Mesin tulis-disk baru di v1.0.14 memakai kelas target buatan sendiri yang **tidak dikenali** pustaka muxer MP4/WebM (pustaka hanya menerima kelas `Target` miliknya) → setiap file langsung gagal sebelum render dimulai.

**Perbaikan:**
- ✅ Sekarang memakai **StreamTarget bawaan resmi** pustaka — Export & Split jalan normal lagi
- ✅ File tetap **TULIS LANGSUNG ke disk** per potongan 8 MB (hemat RAM — film 2 jam+ aman, tidak menumpuk di memori)
- ✅ Tulis berposisi (pwrite): patch metadata MP4/WebM masuk ke posisi byte yang benar
- ✅ Antrean tulis **di-flush & diverifikasi sebelum file ditutup**; bila ada potongan gagal (mis. disk penuh) file langsung dibuang — tidak ada file korup
- ✅ Pesan akhir batch kini **JUJUR**: bila ada file gagal tampil *"Batch selesai — X file GAGAL ✗"* (dulu tetap bilang "semua tersimpan ✓" padahal gagal semua)

**Catatan untuk film panjang (2 jam ke atas):** pastikan sisa ruang disk cukup (±1 GB per film 2 jam). Semua fitur v1.0.14 tetap ada: mode hemat memori otomatis, cache audio per film, pembersihan dekoder tiap film selesai, dan UI anti-hang.
"""

payload = json.dumps({"tag_name": "v1.0.15", "name": "NOVACUT Studio v1.0.15", "body": body, "draft": False, "prerelease": False}).encode()
rel = json.loads(api('https://api.github.com/repos/zacrie85/novacut-studio/releases', 'POST', payload))
print('Release dibuat:', rel['id'], rel['name'])

up = rel['upload_url'].split('{')[0]
for fn, path in [
    ("NOVACUT-Studio-Setup-1.0.15.exe", "/home/z/my-project/release/NOVACUT-Studio-Setup-1.0.15.exe"),
    ("NOVACUT-Studio-Portable-1.0.15.exe", "/home/z/my-project/release/NOVACUT-Studio-Portable-1.0.15.exe"),
]:
    size = os.path.getsize(path)
    print(f"Upload {fn} ({size:,} byte)...")
    data = open(path, 'rb').read()
    r = json.loads(api(f"{up}?name={fn}", 'POST', data, ct='application/octet-stream'))
    print("  -> OK, state:", r.get('state'), "| size:", r.get('size'))
print("SELESAI SEMUA")
