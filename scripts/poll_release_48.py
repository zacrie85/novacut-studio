#!/usr/bin/env python3
"""Pantau khusus run CI utk tag v1.0.48 (bukan run release lama) sampai aset 1.0.48 nempel."""
import json, pathlib, sys, time, urllib.request

TOK = pathlib.Path("/tmp/gh_auth.env").read_text().strip().split("=", 1)[1].strip()
REPO = "zacrie85/novacut-studio"
TAG = "v1.0.48"
HEAD = {"Authorization": "token " + TOK, "Accept": "application/vnd.github+json"}

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEAD), timeout=25) as r:
        return json.load(r)

def run44():
    runs = get(f"https://api.github.com/repos/{REPO}/actions/runs?event=release&per_page=10")["workflow_runs"]
    return next((r for r in runs if r.get("head_branch") == TAG or TAG in (r.get("display_title") or "")), None)

def assets():
    rel = get(f"https://api.github.com/repos/{REPO}/releases/tags/{TAG}")
    return [a["name"] for a in rel.get("assets", [])]

deadline = time.time() + int(sys.argv[1] if len(sys.argv) > 1 else 480)
last = ""
while time.time() < deadline:
    try:
        r = run44()
        a = assets()
        if r is None:
            st = "run v1.0.48 belum terdaftar di CI"
        else:
            st = f"run {r['id']}: status={r['status']} conclusion={r['conclusion']}"
        line = f"{st} | aset: {len(a)} -> {', '.join(a[:3]) if a else '-'}"
        if line != last:
            print(time.strftime("[%H:%M:%S]"), line, flush=True)
            last = line
        if a and any("1.0.48" in x for x in a):
            print("ASET 1.0.48 TERPASANG ✓", flush=True)
            sys.exit(0)
        if r and r["status"] == "completed" and r["conclusion"] != "success":
            print(f"CI GAGAL: {r['conclusion']} — lihat log actions", flush=True)
            sys.exit(2)
    except Exception as e:
        print("poll err:", str(e)[:120], flush=True)
    time.sleep(30)
print("waktu pantau habis — CI masih berjalan, cek lagi nanti", flush=True)
sys.exit(1)
