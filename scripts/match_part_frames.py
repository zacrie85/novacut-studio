#!/usr/bin/env python3
"""Map every output frame of each part to its best-matching source frame,
then report non-monotonic (flicker) frames."""
import glob, subprocess, sys, os
import numpy as np
from PIL import Image

SRC = "/tmp/turbotest/flick.webm"
PARTS = sorted(glob.glob("/tmp/repro/parts/part-*.mp4"))
TH = 48  # thumb width

SRC_AR = 604 / 938  # aspect sumber

def thumbs_from_video(path, outdir, crop_center=False):
    os.makedirs(outdir, exist_ok=True)
    for f in glob.glob(outdir + "/*"): os.remove(f)
    if crop_center:
        # buang pilar hitam kiri/kanan (proyek landscape) — ambil kolom setinggi frame
        cw_expr = f"crop=ih*{SRC_AR}:ih:(iw-ih*{SRC_AR})/2:0,scale={TH}:74"
    else:
        cw_expr = f"scale={TH}:74"
    subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", cw_expr, "-vsync", "0", f"{outdir}/f%05d.png"], check=True, timeout=300)
    files = sorted(glob.glob(outdir + "/*.png"))
    return np.array([np.asarray(Image.open(f).convert("L"), dtype=np.float32) for f in files])

print("membuat indeks frame sumber...")
src = thumbs_from_video(SRC, "/tmp/repro/srcidx")
print(f"sumber: {len(src)} frame unik")
flat = src.reshape(len(src), -1)

for part in PARTS:
    out = thumbs_from_video(part, "/tmp/repro/partidx", crop_center=True)
    n = len(out)
    # match setiap frame output ke frame sumber terdekat
    matches = []
    for i in range(n):
        d = np.abs(flat - out[i].reshape(-1)).mean(axis=1)
        matches.append(int(d.argmin()))
    matches = np.array(matches)
    # flicker = mundur > 3 frame sumber dari max yang sudah lewat, atau lompatan
    # besar maju-mundur di tengah bagian
    wrong = []
    seen_max = matches[0]
    for i in range(1, n):
        if matches[i] < seen_max - 3:
            wrong.append(i)
        seen_max = max(seen_max, matches[i])
    # juga: frame duplikat berjauhan (beku) saat sumber bergerak
    dup = sum(1 for i in range(1, n) if matches[i] == matches[i - 1])
    jumps = [int(matches[i] - matches[i - 1]) for i in range(1, n)]
    print(f"\n{os.path.basename(part)}: {n} frame, map 0..{matches.max()}")
    print(f"  mundur (flicker): {len(wrong)} frame {wrong[:20]}")
    print(f"  duplikat berurutan: {dup}/{n-1}")
    print(f"  contoh 40 map pertama: {matches[:40].tolist()}")
