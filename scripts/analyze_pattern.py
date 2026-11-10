#!/usr/bin/env python3
"""Check alternating pattern: is frame N similar to frame N+2? (A/B/A/B flicker)"""
import glob
import numpy as np
from PIL import Image

frames = sorted(glob.glob('/tmp/vfr/f*.png'))
imgs = []
for f in frames:
    im = Image.open(f).convert('L').resize((190, 249))
    imgs.append(np.asarray(im, dtype=np.float32))
imgs = np.array(imgs)
n = len(imgs)

d1 = [np.abs(imgs[i]-imgs[i-1]).mean() for i in range(1, n)]          # adjacent
d2 = [np.abs(imgs[i]-imgs[i-2]).mean() for i in range(2, n)]          # skip-1
d3 = [np.abs(imgs[i]-imgs[i-3]).mean() for i in range(3, n)]          # skip-2
d6 = [np.abs(imgs[i]-imgs[i-6]).mean() for i in range(6, n)]          # skip-5
print(f"n={n}")
print(f"mean diff adjacent  (N vs N+1): {np.mean(d1):6.2f}")
print(f"mean diff skip-1    (N vs N+2): {np.mean(d2):6.2f}   <- kecil jika pola A/B/A/B")
print(f"mean diff skip-2    (N vs N+3): {np.mean(d3):6.2f}")
print(f"mean diff skip-5    (N vs N+6): {np.mean(d6):6.2f}")

# how many adjacent pairs are near-identical (<2)?
near = sum(1 for d in d1 if d < 2.0)
print(f"\nnear-identical adjacent pairs (<2): {near}/{len(d1)}")
near2 = sum(1 for d in d2 if d < 2.0)
print(f"near-identical skip-1 pairs (<2):   {near2}/{len(d2)}")

# show a timeline of first 40 sampled frames: which are "new content" vs repeats
print("\ntimeline: idx  d(N-1,N)  d(N-2,N)")
for i in range(1, min(40, n)):
    dm1 = np.abs(imgs[i]-imgs[i-1]).mean()
    dm2 = np.abs(imgs[i]-imgs[i-2]).mean() if i >= 2 else float('nan')
    tag = "REPEAT-2" if dm2 < 2.0 else ("REPEAT-1" if dm1 < 2.0 else "new")
    print(f"{i:3d}  {dm1:7.2f}  {dm2:7.2f}  {tag}")
