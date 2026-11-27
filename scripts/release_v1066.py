#!/usr/bin/env python3
# Rilis v1.0.66 — push main + tag, buat GitHub Release (pemicu CI build Windows),
# lalu pantau CI sampai selesai. Token dibaca dari /tmp/gh_auth.env (TIDAK dicetak).
import json, os, subprocess, sys, time, urllib.request, urllib.error

REPO = "zacrie85/novacut-studio"
TAG = "v1.0.66"

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
BODY = """**v1.0.66 — COVER TIDAK TERTUKAR LAGI: SIDIK PIKSEL POSTER + BATCH MIVO BERURUTAN SATU PER SATU**

Lanjutan v1.0.65 (keluhan pengguna: 3 video → 3 poster TERCIPTA semua, tetapi cover yang dipakai SALING TERTUKAR antar video — poster video 1 terpakai di video 2, dst. "aplikasi seperti langsung memproses 2 video secara bersamaan").

**Akar masalah (dua lapis):**
1. **Pemantau panen hanya mengenali poster lama lewat STRING URL.** Poster yang sama tampil lagi di halaman segar (History/kanvas pratinjau studio Mivo) dengan URL BERBEDA (ukuran/param beda) → lolos cek URL → poll giliran berikutnya memanen poster lama itu dalam hitungan detik → video N+1 menerima poster video N (pola off-by-one), sementara poster aslinya tetap tercetak di Mivo (makanya "posternya tercetak 3 tapi tertukar").
2. **Batch berjalan paralel:** 2 film disiapkan BERSAMAAN (PREP_CONC 2) + segmen dirender paralel (maks 5) → persis persepsi pengguna "2 video diproses bersamaan".

**Perbaikan:**
1. **SIDIK PIKSEL (aHash 8×8, 64-bit):** setiap gambar besar di halaman studio dihitung sidik pikselnya (fetch CORS → createImageBitmap → kanvas 8×8 grayscale → 64 bit); pencocokan dengan jarak Hamming ≤ 8 (tahan resampling). Poster yang SUDAH tampil/dipanen tercatat SELAMANYA (URL + hash) → poster lama tak mungkin terpanen lagi untuk video lain, URL berapa pun bentuknya. Snapshot dini + snapshot otomasi + panen semuanya berbasis sidik piksel sekarang.
2. **Batch MIVO BERURUTAN (permintaan eksplisit pengguna):** penyedia Mivo → 1 pekerja tunggal + 1 prep (MAX_CONC = PREP_CONC = 1) + **jeda 3 detik antar video** ("dari video pertama ke video kedua di beri jeda dulu agar video ke dua bisa ada waktu untuk memproses posternya di mivo") — video 1 tuntas penuh (poster → export & split) → jeda → folder dibersihkan → browser Mivo BARU → video 2 → dst. Penyedia lain (Z.ai/Mage/Minimax) tetap paralel seperti biasa.

**Alur final per video:** jeda 3 dtk → folder dibersihkan → browser Mivo dibuka BARU → frame video itu diunggah → prompt (judul video itu) → Generate → hasil dipanen (dicocokkan lewat sidik piksel — bukan cuma URL) → masuk app → studio ditutup otomatis → export & split tuntas → video berikutnya.

DIUJI: node --check main+preload ✓, uji antrean Mivo +9 asersi baru (skrip sidik piksel, Hamming ≤ 8, penolakan kandidat ber-hash, hash terpanen dicatat, snapshot ber-hash, mivoUrut, MAX_CONC/PREP_CONC = 1 saat Mivo, jeda 3 dtk) ✓, simulasi FIFO lulus ✓, uji skrip otomasi ✓, uji fit judul ✓, DESKTOP=1 next build hijau ✓."""
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
