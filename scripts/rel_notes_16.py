import json, urllib.request, os

TOK = open('/tmp/gh_auth.env').read().split('=',1)[1].strip()

def api(url, method='GET', data=None, ct='application/json'):
    h = {'Authorization': f'token {TOK}', 'Accept': 'application/vnd.github+json'}
    if ct: h['Content-Type'] = ct
    req = urllib.request.Request(url, headers=h, method=method, data=data)
    return urllib.request.urlopen(req).read()

body = """**NOVACUT Studio v1.0.16 — 5 Fitur Baru untuk Batch Semalaman** 🌙⚡

Semua dibuat khusus untuk alur **Playlist Export & Split** dengan film panjang (2 jam+) dan batch besar.

**1. Estimasi Waktu (ETA) + Suara + Notifikasi + Matikan PC Otomatis** 💤
- Progres kini menampilkan **"±2j 15m"** — perkiraan waktu tersisa (dihitung dari berat tiap film, makin lama makin akurat)
- Bunyi **"ting!"** setiap satu film selesai + dua nada saat seluruh batch tuntas
- **Notifikasi Windows** muncul walau jendela diminimalkan
- Opsi **"Matikan PC setelah batch selesai"** — jalankan 50 film semalaman, PC mati sendiri setelah tuntas (jeda 60 detik, hanya bila TANPA kegagalan)

**2. Lanjutkan Batch yang Terputus (Resume)** ⏯️
- Bagian yang filenya **sudah lengkap di folder hasil otomatis DILEWATI**
- Listrik mati di film ke-30? Buka lagi, tekan Export — lanjut dari sana, tanpa analisis berat ulang
- Bisa dimatikan di setelan **Otomatisasi Batch**

**3. Preset Satu-Klik** 🔖
- Simpan SEMUA setelan (teks, rasio, kualitas, split, subtitle) di bawah satu nama — mis. *"Novel 8 Bagian"*
- Klik chip preset = semua setelan terpasang seketika; tersimpan walau aplikasi ditutup

**4. Smart Split — Potong di Jeda Sunyi** ✂️
- Titik potong digeser otomatis ke **jeda sunyi audio** terdekat (±8 detik)
- Klip berhenti di tempat dramatis, **bukan di tengah kalimat** — klip novel-promo terasa profesional
- Aktifkan di setelan **Otomatisasi Batch → "Potong di jeda sunyi (smart split)"**

**5. Preset Kualitas** 🎚️
- **Ringan** — 720p, 4,5 Mbps: render tercepat, file paling kecil (upload harian)
- **Tajam** — 1080p, 9 Mbps (seperti sebelumnya, disarankan)
- **Maksimal** — 1080p, 14 Mbps: paling tajam, file terbesar

Semua fitur v1.0.15 tetap ada: tulis langsung ke disk (hemat RAM), mode hemat memori otomatis, cache audio per film, pesan akhir jujur.
"""

payload = json.dumps({"tag_name": "v1.0.16", "name": "NOVACUT Studio v1.0.16", "body": body, "draft": False, "prerelease": False}).encode()
rel = json.loads(api('https://api.github.com/repos/zacrie85/novacut-studio/releases', 'POST', payload))
print('Release dibuat:', rel['id'], rel['name'])

up = rel['upload_url'].split('{')[0]
for fn, path in [
    ("NOVACUT-Studio-Setup-1.0.16.exe", "/home/z/my-project/release/NOVACUT-Studio-Setup-1.0.16.exe"),
    ("NOVACUT-Studio-Portable-1.0.16.exe", "/home/z/my-project/release/NOVACUT-Studio-Portable-1.0.16.exe"),
]:
    print(f"Upload {fn} ({os.path.getsize(path):,} byte)...")
    data = open(path, 'rb').read()
    r = json.loads(api(f"{up}?name={fn}", 'POST', data, ct='application/octet-stream'))
    print("  -> OK, state:", r.get('state'), "| size:", r.get('size'))
print("SELESAI SEMUA")
