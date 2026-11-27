#!/usr/bin/env python3
# Rilis v1.0.65 — push main + tag, buat GitHub Release (pemicu CI build Windows),
# lalu pantau CI sampai selesai. Token dibaca dari /tmp/gh_auth.env (TIDAK dicetak).
import json, os, subprocess, sys, time, urllib.request, urllib.error

REPO = "zacrie85/novacut-studio"
TAG = "v1.0.65"

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
BODY = """**v1.0.65 — STUDIO MIVO TUNTAS OTOMATIS LAGI: penjaga identitas jendela + otomasi coba-ulang (perbaikan "browser tidak menutup, export & split terblokir")**

Lanjutan v1.0.64 (bukti video pengguna: jendela Studio Mivo terbuka segar tetapi KOSONG — tanpa unggahan frame, tanpa prompt, tanpa Generate — sementara app macet di "Menyiapkan cover…" dan browser tak pernah ditutup otomatis → export & split tidak berjalan).

**Akar masalah (race v1.0.64):** giliran baru MENUTUP jendela studio lama lalu langsung membuat jendela segar → event `closed` milik jendela LAMA menyala belakangan (async) → `mivoStudioWin = null` MENIMPA referensi jendela BARU → otomasi tidak pernah jalan (guard `!mivoStudioWin` selalu lolos), panen tidak bisa memeriksa halaman, dan penutup otomatis tak pernah menyala → tunggu 12 menit per video, export & split terblokir.

**Perbaikan:**
1. **Penjaga identitas pada event `closed`** — referensi hanya di-nol-kan bila yang tertutup MEMANG jendela terakhir (`if (mivoStudioWin === winMivo)`); kehilangan referensi mustahil lagi
2. **Otomasi coba-ulang dari poll** — bila jendela terbuka tetapi otomasi belum pernah jalan (pemicu navigasi terlewat / halaman lambat), poll memicunya ulang tiap ±15 dtk → studio tak bisa terbuka kosong selamanya
3. **did-navigate-in-page tidak lagi snapshot** — navigasi-in-page SPA bisa menyala justru saat hasil tampil; snapshot pada momen itu memasukkan HASIL BARU ke daftar "img lama" → hasil tak terpanen. Snapshot cukup di did-navigate (halaman penuh) + timer 4/9/14 dtk

Alur siklus tetap: folder dibersihkan → browser dibuka BARU → frame video itu diunggah → prompt → Generate → hasil dipanen → studio ditutup otomatis → export & split lanjut → video berikutnya.

DIUJI: node --check main+preload ✓, uji antrean Mivo +3 asersi baru (penjaga identitas, did-navigate-in-page tanpa snapshot, otomasi coba-ulang) ✓, simulasi FIFO lulus ✓, uji skrip otomasi ✓, uji fit judul ✓, DESKTOP=1 next build hijau ✓."""
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
