#!/usr/bin/env python3
# Rilis v1.0.61 — push main + tag, buat GitHub Release (pemicu CI build Windows),
# lalu pantau CI sampai selesai. Token dibaca dari /tmp/gh_auth.env (TIDAK dicetak).
import json, os, subprocess, sys, time, urllib.request, urllib.error

REPO = "zacrie85/novacut-studio"
TAG = "v1.0.61"

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
BODY = """**v1.0.61 — Jalur Mivo diperbaiki + prompt otomatis dengan judul video**

Dua keluhan pengguna diperbaiki:

**1. Memakai Mivo tapi hasil "terhubung ke Cloudflare"**
Akar masalah: pilihan penyedia **Mivo** tidak pernah tersimpan — kata `mivo` tidak ada di whitelist penyimpanan preferensi AI, jadi klik pill "Mivo (QRIS)" diabaikan dan setelan diam-diam kembali ke Cloudflare lama. Kini pilihan Mivo tersimpan betul dan dipulihkan saat aplikasi dibuka (pill kartu AI tidak lagi kembali ke Z.ai).

**2. Aplikasi belum bisa mengirim prompt ke Mivo**
Kini otomatis — prompt dikirim ke Studio Mivo dengan template (judul diisi otomatis dari setiap video yang diproses):

> buat gambar ini menjadi sebuah poster untuk film dengan judul "<JUDUL VIDEO>" dengan huruf besar dan kecil yang estetik dan dengan background cerah Estetik cinematik bokeh

**Otomasi mengikuti alur asli studio Mivo:** klik "AI Image" → **unggah gambar referensi dulu** (kotak prompt Mivo baru AKTIF setelah referensi ditambahkan — inilah penyebab prompt dulu tak pernah terkirim) → pilih model (🎬 FLUX 3 Klein film / 🎵 Minimax H3 musik) → prompt diisi otomatis (dicoba ulang 4×) → scroll ke paling bawah → klik "Generate image" → hasil dipanen otomatis dari halaman studio jadi cover (fallback: folder NOVACUT-Mivo).

**Anti judul dobel:** poster Mivo sudah memuat judul sesuai template — judul template aplikasi tidak ditimpa lagi di atasnya.

Cara pakai: kartu AI → pilih **Mivo (QRIS · semi-otomatis)** → pilih model 🎬 Film / 🎵 Musik → klik **Buat Ulang Poster**."""
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
