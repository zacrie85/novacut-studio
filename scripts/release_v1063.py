#!/usr/bin/env python3
# Rilis v1.0.63 — push main + tag, buat GitHub Release (pemicu CI build Windows),
# lalu pantau CI sampai selesai. Token dibaca dari /tmp/gh_auth.env (TIDAK dicetak).
import json, os, subprocess, sys, time, urllib.request, urllib.error

REPO = "zacrie85/novacut-studio"
TAG = "v1.0.63"

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
BODY = """**v1.0.63 — Poster Mivo BERGILIRAN satu per satu untuk batch banyak video + Studio Mivo ditutup otomatis setelah hasil masuk**

Lanjutan v1.0.62 (bukti pengguna: memproses 3 video sekaligus → 3 gambar referensi yang terkirim ke Mivo semuanya dari video PERTAMA → cover ketiga video identik).

**Akar masalah:** `mivoBridge` + `mivoStudioOtomasi` di main process adalah TUNGGAL. Saat batch, cover ketiga video dipanggil hampir bersamaan → saling menimpa → frame yang sampai ke studio semuanya frame video pertama, dan polling jembatan saling merebut ID.

**Perbaikan (sesuai alur yang diminta pengguna):**
- **Antrean Mivo global (FIFO) di renderer** — SATU poster Mivo pada satu waktu. Video 1: frame video 1 dikirim → Mivo menggambar → hasil masuk app → **Studio Mivo ditutup otomatis** → video 2: frame video 2 dikirim → dst sampai video terakhir.
- Frame/prompt/model tiap giliran dibawa utuh dalam closure gilirannya sendiri — **mustahil tertukar** dengan video lain.
- Timer 12 menit tiap giliran baru berjalan saat gilirannya AKTIF (bukan sejak mengantri) — antre 3 video pun tiap video tetap dapat jatah penuh.
- **Tutup otomatis**: begitu hasil dipanen (masuk app + tersimpan HASIL-*.png di folder NOVACUT-Mivo), Studio Mivo ditutup ±4 dtk — sesi login tetap tersimpan (partisi persist:mivo) → giliran berikutnya membuka studio lagi otomatis. Export & split berjalan lanjut tanpa menunggu.
- Jendela studio yang dibuka manual (tanpa otomasi) TIDAK ikut ditutup.
- Status kartu AI kini menampilkan giliran: `🎬 Poster Mivo giliran #2 — video "<judul>" — frame + prompt dikirim ke studio…`

DIUJI: node --check main+preload ✓, uji antrean Mivo baru (statis + simulasi FIFO: urutan eksekusi = urutan panggilan, hasil tak tertukar, tanpa tumpang tindih) ✓, uji skrip otomasi ✓, uji fit judul ✓, DESKTOP=1 next build hijau ✓."""
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
