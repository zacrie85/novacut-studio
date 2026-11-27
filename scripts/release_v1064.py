#!/usr/bin/env python3
# Rilis v1.0.64 — push main + tag, buat GitHub Release (pemicu CI build Windows),
# lalu pantau CI sampai selesai. Token dibaca dari /tmp/gh_auth.env (TIDAK dicetak).
import json, os, subprocess, sys, time, urllib.request, urllib.error

REPO = "zacrie85/novacut-studio"
TAG = "v1.0.64"

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
BODY = """**v1.0.64 — SIKLUS PENUH PER VIDEO di Mivo: folder dibersihkan → browser Mivo dibuka BARU → poster baru dari frame video itu sendiri**

Lanjutan v1.0.63 (keluhan pengguna: 2 video berbeda masih memakai cover yang sama — "saat video pertama selesai dan lanjut ke video ke 2 prosesnya langsung berlanjut begitu saja tanpa ada nya pembukaan baru untuk browser mivo nya").

**Akar masalah yang ditemukan:** jendela studio Mivo di v1.0.63 DIPAKAI ULANG (loadURL/reload) untuk giliran ke-2 → poster video pertama masih tampil di kanvas pratinjau/History halaman yang sama → URL-nya belum pernah dicatat sebagai "sudah dipanen" → poll giliran ke-2 memanen poster LAMA itu dalam hitungan detik → video ke-2 langsung "selesai" dengan cover video pertama, tanpa generasi baru.

**Perbaikan (persis siklus yang diminta pengguna):**
1. **Folder NOVACUT-Mivo dibersihkan di awal TIAP giliran** — poster HASIL-* yang sudah dipakai + REFERENSI-frame lama dihapus (permintaan pengguna: "gambar poster yang sudah di pakai di video pertama di hapus dulu dari dalam folder NOVACUT-mivo")
2. **Browser Mivo dibuka BARU untuk tiap video** — jendela lama ditutup, jendela segar dibuat (halaman bersih tanpa frame/prompt/hasil sisa). Login tetap tersimpan (partisi persist:mivo), cukup sekali
3. **URL hasil terpanen dicatat SELAMANYA** — poster yang sama tak mungkin terpanen dua kali, kapan pun tampilnya
4. **Snapshot dini** — segera setelah halaman studio terbuka (did-navigate + 4/9/14 dtk), semua img besar yang sudah tampil dicatat → hanya gambar BENAR-BENAR BARU yang dianggap hasil
5. Tetap: antrean FIFO (satu poster Mivo pada satu waktu), frame tiap giliran milik videonya sendiri, studio ditutup otomatis setelah hasil masuk app, status "giliran #N — judul video"

DIUJI: node --check main+preload ✓, uji antrean Mivo (statis: bersih folder + jendela baru + snapshot dini + URL dicatat; simulasi FIFO: urutan = urutan panggilan, hasil tak tertukar, tanpa overlap) ✓, uji skrip otomasi ✓, uji fit judul ✓, DESKTOP=1 next build hijau ✓."""
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
