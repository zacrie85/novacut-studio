#!/usr/bin/env python3
"""Matcher ramp: brightness sumber menyapu monoton 30..210 → indeks frame sumber
dibaca LANGSUNG dari brightness output. Flicker = mundur >12 frame sumber."""
import glob, os, shutil, subprocess, sys
import numpy as np
from PIL import Image

SRC_DIR = sys.argv[1] if len(sys.argv) > 1 else "/tmp/repro/parts3"
IDX = "/tmp/repro/rampidx"

for part in sorted(glob.glob(SRC_DIR + "/*.mp4")):
    shutil.rmtree(IDX, ignore_errors=True)
    os.makedirs(IDX, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-i", part, "-vf", "scale=32:50", "-vsync", "0", f"{IDX}/f%05d.png"], check=True, timeout=300)
    frames = sorted(glob.glob(IDX + "/*.png"))
    imgs = np.array([np.asarray(Image.open(f).convert("L"), dtype=np.float32) for f in frames])
    b = imgs.mean(axis=(1, 2))
    est = (b - 30.0) / 180.0 * 899.0
    n = len(est)
    wrong, seen_max = [], est[0]
    for i in range(1, n):
        if est[i] < seen_max - 12:
            wrong.append(i)
        seen_max = max(seen_max, est[i])
    fwd = [i for i in range(1, n) if est[i] - est[i - 1] > 40]
    print(f"{os.path.basename(part)}: {n} frame, est {est[0]:.0f}->{est[-1]:.0f} | mundur={len(wrong)} {wrong[:12]} | lonjak={len(fwd)} {fwd[:8]}")
