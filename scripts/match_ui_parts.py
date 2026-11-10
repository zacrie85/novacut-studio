#!/usr/bin/env python3
"""Matcher UI-flow: bagian ber-pillarbox + overlay teks. Ambil kolom konten
tengah, potong pita teks atas/bawah, lalu petakan ke frame sumber terdekat."""
import glob, os, shutil, subprocess, sys
import numpy as np
from PIL import Image

SRC_DIR = sys.argv[1] if len(sys.argv) > 1 else "/tmp/repro/parts5"
SRC = "/tmp/turbotest/ramp.webm"
IDX = "/tmp/repro/nnidx"
AR = 604 / 938

def thumbs(path, outdir, crop):
    shutil.rmtree(outdir, ignore_errors=True)
    os.makedirs(outdir, exist_ok=True)
    vf = (f"crop=ih*{AR}:ih*0.55:(iw-ih*{AR})/2:ih*0.28,scale=40:40" if crop else "scale=40:40")
    subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-vsync", "0", f"{outdir}/f%05d.png"], check=True, timeout=300)
    files = sorted(glob.glob(outdir + "/*.png"))
    return np.array([np.asarray(Image.open(f).convert("L"), dtype=np.float32) for f in files])

src = thumbs(SRC, IDX + "_src", crop=False)
flat = src.reshape(len(src), -1)
print(f"sumber {len(src)} frame")
total_wrong = 0
for part in sorted(glob.glob(SRC_DIR + "/part-*.mp4")):
    out = thumbs(part, IDX, crop=True)
    n = len(out)
    matches = np.array([int(np.abs(flat - out[i].reshape(-1)).mean(axis=1).argmin()) for i in range(n)])
    wrong, seen_max = [], matches[12]  # lewati 12 frame awal (artefak teks/pemanasan)
    for i in range(13, n):
        if matches[i] < seen_max - 12:
            wrong.append(i)
        seen_max = max(seen_max, matches[i])
    total_wrong += len(wrong)
    print(f"{os.path.basename(part)}: {n} frame, map {matches[12]}..{matches[-1]} | mundur={len(wrong)} {wrong[:10]}")
print(f"TOTAL mundur: {total_wrong}")
