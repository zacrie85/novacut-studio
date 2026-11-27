#!/usr/bin/env python3
# Rilis v1.0.62 — push main + tag, buat GitHub Release (pemicu CI build Windows),
# lalu pantau CI sampai selesai. Token dibaca dari /tmp/gh_auth.env (TIDAK dicetak).
import json, os, subprocess, sys, time, urllib.request, urllib.error

REPO = "zacrie85/novacut-studio"
TAG = "v1.0.62"

def token():
    with open("/tmp/gh_auth.env") as f:
        for line in f:
            if line.startswith("GH_TOKEN="):
                t = line.strip().split("=", 1)[1]
                if t:
                    return t
    raise SystemExit("GH_TOKEN tidak ditemukan di /tmp/gh_auth.env")

TOK = token()

def api(url, data=None, method=None):
    req = urllib.request.Request(
        url, method=method,
        headers={"Authorization": f"Bearer {TOK}", "Accept": "application/vnd.github+json", "User-Agent": "novacut-release"},
    )
    body = None
    if data is not None:
        body = json.dumps(data).encode()
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, body, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        try:
            return json.load(e)
        except Exception:
            return {"message": f"HTTP {e.code}"}

def push(args):
    env = dict(os.environ, GIT_ASKPASS="/tmp/gh_askpass.sh")
    subprocess.run(["git"] + args, check=True, env=env, cwd="/home/z/my-project")

print("[1/4] push main...")
push(["push", "origin", "main"])
print("[2/4] push tag...")
push(["push", "origin", TAG])

print("[3/4] buat GitHub Release (pemicu CI)...")
BODY = """**v1.0.62 — Tombol "Generate 1 image (2 credits)" kini diklik otomatis + hasil disimpan otomatis**

Lanjutan v1.0.61 (video pengguna: gambar referensi ✓, prompt ✓, pilihan model ✓ — tinggal tombol Generate yang belum tertekan).

**Akar masalah:** panel studio Mivo menggulir di **kontainer dalam** (bukan halaman), jadi `window.scrollTo` lama tak berfungsi; dan klik lama menyasar elemen terpendek yang mengandung kata "generate" — mudah salah sasaran.

**Perbaikan:**
- Tombol dicari PERSIS dengan pola teks tombol asli Mivo: `Generate 1 image (2 credits)` (`/generate <angka> image/i`)
- Panel **digulir otomatis ke tombol** (`scrollIntoView`) — sesuai permintaan: "scroll ke bagian bawah dan menekan tombol generate"
- **Klik nyata**: urutan event lengkap pointerdown→mousedown→pointerup→mouseup→click di tengah tombol
- Kegagalan **dicoba ulang 3×**; sukses diverifikasi dari tombol yang berubah/disabled ("Generating…")
- Status real-time: `✓ Tombol Generate 1 image diklik — menunggu gambar jadi…` lalu `⏳ Menunggu Mivo menggambar… (N dtk)` tiap 30 dtk

**Panen hasil (save + kirim ke app):**
- Begitu gambar jadi di halaman studio → diunduh otomatis → **disimpan ke folder NOVACUT-Mivo** sebagai `HASIL-*.jpg/png` → langsung dipakai jadi cover di aplikasi
- Fallback lama tetap: scan folder NOVACUT-Mivo

Cara pakai tetap: kartu AI → **Mivo (QRIS · semi-otomatis)** → pilih 🎬 Film / 🎵 Musik → **Buat Ulang Poster** — sekarang sampai jadi tanpa sentuhan manual."""
rel = api(
    f"https://api.github.com/repos/{REPO}/releases",
    {"tag_name": TAG, "name": f"NOVACUT Studio {TAG}", "body": BODY,
     "target_commitish": "main", "draft": False, "prerelease": False},
    method="POST",
)
if rel.get("html_url"):
    print("Release dibuat:", rel["html_url"])
else:
    print("Buat release:", json.dumps(rel)[:500])

print("[4/4] pantau CI (maks 22 menit)...")
deadline = time.time() + 22 * 60
last = ""
while time.time() < deadline:
    runs = api(f"https://api.github.com/repos/{REPO}/actions/runs?per_page=5")
    cocok = [r for r in runs.get("workflow_runs", []) if r.get("head_branch") == TAG]
    if cocok:
        r = cocok[0]
        status = f"{r['name']}: status={r['status']} conclusion={r.get('conclusion')}"
        if status != last:
            print(status, flush=True)
            last = status
        if r["status"] == "completed":
            print("CI SELESAI:", r.get("conclusion"), "-", r.get("html_url", ""))
            sys.exit(0 if r.get("conclusion") == "success" else 2)
    time.sleep(45)
print("CI masih berjalan setelah 22 menit — cek https://github.com/zacrie85/novacut-studio/actions")
