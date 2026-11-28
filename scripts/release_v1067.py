#!/usr/bin/env python3
# Rilis v1.0.67 — push main + tag, buat GitHub Release (pemicu CI build Windows),
# lalu pantau CI sampai selesai. Token dibaca dari /tmp/gh_auth.env (TIDAK dicetak).
import json, os, subprocess, sys, time, urllib.request, urllib.error

REPO = "zacrie85/novacut-studio"
TAG = "v1.0.67"

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

print("[1/4] push main (termasuk commit v1.0.66 yang tertunda)...")
push(["push", "origin", "main"])
print("[2/4] push tag...")
push(["push", "origin", TAG])

print("[3/4] buat GitHub Release (pemicu CI)...")
BODY = """**v1.0.67 — THUMBNAIL PART/EPISODE dari POSTER + (termasuk v1.0.66: cover tidak tertukar lagi — sidik piksel + batch Mivo berurutan)**

---

### v1.0.66 — COVER TIDAK TERTUKAR LAGI (keluhan: "posternya tercetak 3 tapi cover saling tertukar", "aplikasi seperti langsung memproses 2 video secara bersamaan")

**Akar masalah (dua lapis):**
1. Pemantau panen hanya mengenali poster lama lewat **STRING URL** — poster yang sama tampil lagi di halaman segar (History/kanvas) dengan URL berbeda → lolos cek → video N+1 menerima poster video N (pola off-by-one), sementara poster aslinya tetap tercetak di Mivo.
2. **Batch paralel:** 2 film disiapkan bersamaan (PREP_CONC 2) + segmen paralel (maks 5).

**Perbaikan:**
1. **SIDIK PIKSEL (aHash 8×8, 64-bit, jarak Hamming ≤ 8):** setiap gambar besar di studio dihitung sidik pikselnya; poster yang sudah tampil/dipanen tercatat SELAMANYA (URL + hash) → poster lama tak mungkin terpanen lagi untuk video lain, URL berapa pun bentuknya.
2. **Batch MIVO BERURUTAN (permintaan pengguna):** penyedia Mivo → 1 pekerja tunggal + jeda 3 detik antar video — video 1 tuntas penuh (poster → export & split) → jeda → folder dibersihkan → browser Mivo BARU → video 2 → dst. Penyedia lain tetap paralel.

### v1.0.67 — THUMBNAIL PART/EPISODE (permintaan baru: "thumbnail diambil dari poster itu, di tengah-tengah sedikit ke bawah ditambah part/episode, tulisannya sedikit besar dengan frame yang mengelilinginya")

- Setiap bagian hasil **export & split** kini dapat **`<judul>-<bagian>-thumb.jpg`** di folder yang sama dengan videonya.
- Thumbnail diambil dari **poster/cover video itu sendiri** (judul sudah tertulis di poster) + **badge part/episode**: tulisan BESAR (±8% lebar poster) dengan **FRAME GANDA putih mengelilinginya**, posisi **sedikit di bawah tengah** (58% tinggi) — sebelum diputar orang sudah tahu judulnya apa dan part ke berapa.
- Teks badge mengikuti pilihan label pengguna (Part/Episode/Bagian/EP/EPS). Bekerja di kedua mesin render (Turbo & kilat). Gagal membuat thumbnail tidak pernah menghentikan export.

DIUJI: node --check main+preload ✓, uji antrean Mivo +7 asersi thumbnail baru ✓, simulasi FIFO lulus ✓, uji skrip otomasi ✓, uji fit judul ✓, DESKTOP=1 next build hijau ✓."""
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
