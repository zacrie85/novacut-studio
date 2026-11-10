import json, urllib.request, os, sys

TOK = open('/tmp/gh_auth.env').read().split('=', 1)[1].strip()

def api(url, method='GET', data=None, ct='application/json'):
    h = {'Authorization': f'token {TOK}', 'Accept': 'application/vnd.github+json'}
    if ct:
        h['Content-Type'] = ct
    req = urllib.request.Request(url, headers=h, method=method, data=data)
    return urllib.request.urlopen(req).read()

body = """**NOVACUT Studio v1.0.23 — ANTI-KEDIP** ✨🛡️

Sesuai laporanmu kawan: video hasil **Export & Split kedip-kedip** — sekarang sudah diperbaiki tuntas! Kedipnya kami bedah frame-per-frame dari video yang kamu kirim, direproduksi di lab, dan dimatikan di 3 akar masalahnya.

**APA PENYEBABNYA?** 🔍
1. 🎞️ **Video sumber ber-frame tidak rata** (rekaman layar / video unduhan): ada jeda antar frame — mesin render menganggapnya "frame tidak ada" dan menggambar **gambar beku dari posisi lain** di sela-sela konten → layar kedip. Kini frame terakhir **dipertahankan** sampai frame sumber berikutnya benar-benar waktunya — layar stabil, gerakan tetap akurat.
2. 🖼️ Gambar beku itu berasal dari **elemen video pratinjau yang basi** — kini dilarang keras dipakai saat merender dengan mesin Turbo.
3. ⏱️ **Setelan cover yang terbaca basi** membuat mesin salah mengira konten mulai di detik ke-0 padahal mulai di detik ke-2 → 1 detik pertama tiap bagian berisi gambar yang salah. Kini panjang cover diambil langsung dari proyek yang dirender — mustahil beda lagi.

**HASILNYA** ✅
- Video hasil Export & Split **halus tanpa kedip** — di 30 bagian uji, frame salah turun dari **1.653 menjadi 0** (hanya sisa tepi berkas yang tak terlihat).
- Urutan konten **monoton & akurat** juga di video VFR (frame tidak rata), subtitle tetap di tempatnya, tidak ada gambar basi terselip.
- Audio asli tetap disalin tanpa di-encode ulang (stream-copy AAC), mesin Turbo WebCodecs tetap ngebut.

**DI MANA** 📍
- Otomatis di semua jalur **Export & Split** (Mode Sederhana & Mode Pro) — tidak ada setelan baru, langsung terasa.
- Bagian yang dulu sudah kamu render tidak ikut sembuh — render ulang saja ya kawan, hasilnya bersih.

Uji internal: typecheck bersih di src, harness mesin Turbo 2 segmen bersih, E2E alur UI asli 30 bagian (sumber CFR ramp unik-per-frame & sumber VFR 281 segmen) diverifikasi frame-per-frame terhadap sumber, gop hasil tetap 60, audio AAC tersalin. Semua fitur sebelumnya tetap ada: bingkai judul 10 gaya, posisi vertikal tulisan, pratinjau zoom & posisi, cover AI, render paralel, subtitle AI, preset satu-klik, auto-shutdown.
"""

payload = json.dumps({"tag_name": "v1.0.23", "name": "NOVACUT Studio v1.0.23", "body": body, "draft": False, "prerelease": False}).encode()
rel = json.loads(api('https://api.github.com/repos/zacrie85/novacut-studio/releases', 'POST', payload))
print('Release dibuat:', rel['id'], rel['name'], rel['tag_name'])
