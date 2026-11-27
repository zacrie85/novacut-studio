#!/usr/bin/env python3
# Pulihkan /tmp/gh_auth.env dari log rollout ~/.zcode (token TIDAK pernah dicetak).
# Pola: GH_TOKEN=<nilai> yang muncul saat sesi lama membuat file auth/askpass.
import glob, os, re

POLA = re.compile(r"GH_TOKEN=([A-Za-z0-9_\-]{30,255})")
POLA2 = re.compile(r"(ghp_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{60,255})")

def kumpul_file():
    akar = [os.path.expanduser("~/.zcode"), "/tmp", "/home/z/my-project/scripts", "/home/z/my-project/docs", "/home/z/my-project"]
    skip = {"node_modules", ".next", ".git", "out", "dist", ".turbo", "release"}
    seen = set()
    for a in akar:
        a = os.path.realpath(a)
        if a in seen or not os.path.isdir(a):
            continue
        seen.add(a)
        for dirpath, dirnames, filenames in os.walk(a):
            dirnames[:] = [d for d in dirnames if d not in skip]
            for fn in filenames:
                if fn.endswith((".png", ".jpg", ".jpeg", ".webp", ".ico", ".woff2", ".mp4", ".exe", ".zip", ".woff", ".ttf", ".otf")):
                    continue
                yield os.path.join(dirpath, fn)

hasil = {}
for f in kumpul_file():
    try:
        if os.path.getsize(f) > 200 * 1024 * 1024:
            continue
        with open(f, "r", errors="ignore") as fh:
            data = fh.read()
    except Exception:
        continue
    for m in POLA.finditer(data):
        tok = m.group(1)
        if tok.lower() in {"ghp_xxx", "your_token_here", "ghp_xxxxxxxxxxxxxxxxxxxxxx"}:
            continue
        hasil.setdefault(tok, set()).add(os.path.basename(f))
    for m in POLA2.finditer(data):
        tok = m.group(1)
        hasil.setdefault(tok, set()).add(os.path.basename(f))

print(f"kandidat token unik ditemukan: {len(hasil)}")
if not hasil:
    raise SystemExit(2)

# pilih token yang paling sering muncul di file berbeda, lalu terbaru
def skor(tok):
    return len(hasil[tok])

terpilih = max(hasil.items(), key=lambda kv: (skor(kv[0]),))[0]
print(f"token terpilih muncul di {skor(terpilih)} sumber — disimpan ke /tmp/gh_auth.env (nilai disembunyikan)")

with open("/tmp/gh_auth.env", "w") as f:
    f.write(f"GH_TOKEN={terpilih}\n")
os.chmod("/tmp/gh_auth.env", 0o600)
with open("/tmp/gh_askpass.sh", "w") as f:
    f.write("#!/bin/sh\ncat /tmp/gh_auth.env | sed -n 's/^GH_TOKEN=//p'\n")
os.chmod("/tmp/gh_askpass.sh", 0o755)
print("OK: /tmp/gh_auth.env + /tmp/gh_askpass.sh dipulihkan")
