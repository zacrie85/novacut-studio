#!/usr/bin/env python3
"""Sumber VFR: segmen gambar unik dengan durasi TIDAK RATA (gap hingga 0.4s)
+ audio — mereplikasi video hasil rekaman layar/unduhan yang memicu kedip."""
import os
import numpy as np
from PIL import Image

W, H = 604, 938
OUT = "/tmp/vfr"
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))

# 60 segmen, durasi bergantian pendek (2 frame) & panjang (12 frame = gap 0.4s)
durs = []
k = 0
while sum(durs) < 65 * 30:
    durs.append(2 if k % 2 == 0 else 12)
    k += 1
# potong tepat 65s
total = sum(durs)
while total - durs[-1] >= 65 * 30:
    total -= durs[-1]
    durs.pop()
print("segmen:", len(durs), "total frame:", sum(durs), "= ", sum(durs) / 30, "s")

lines = ["ffconcat version 1.0"]
for i, d in enumerate(durs):
    t = i / len(durs)
    # warna unik per segmen (ramp waktu) + tepi pola utk keunikan spasial
    base = int(50 + 160 * t)
    img = np.zeros((H, W, 3), dtype=np.uint8)
    img[:, :, 0] = base
    img[:, :, 1] = int(base * 0.7) + (i * 7) % 40
    img[:, :, 2] = int(255 - base * 0.5)
    # blok penanda unik per segmen (grid 4 blok dengan pola bit i)
    for b in range(8):
        on = (i >> b) & 1
        y0, y1 = 100 + b * 40, 130 + b * 40
        img[y0:y1, 40:100] = (255, 255, 255) if on else (0, 0, 0)
    Image.fromarray(img).save(f"{OUT}/seg{i:03d}.png")
    lines.append(f"file 'seg{i:03d}.png'")
    lines.append(f"duration {d[i] / 30:.6f}".replace("d[i]", str(durs[i])) if False else f"duration {durs[i] / 30:.6f}")
# ffmpeg concat: file terakhir perlu durasi dobel
lines.append(f"file 'seg{len(durs)-1:03d}.png'")
with open(f"{OUT}/list.ffconcat", "w") as f:
    f.write("\n".join(lines) + "\n")
print("list.ffconcat ok")
