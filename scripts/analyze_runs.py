#!/usr/bin/env python3
"""Full-rate run analysis of user's flicker video + representative frame dump."""
import glob, os
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
frames = sorted(glob.glob('/tmp/vfall/f*.png'))
n = len(frames)
# small grayscale thumb per frame
imgs = np.array([np.asarray(Image.open(f).convert('L').resize((96, 126)), dtype=np.float32) for f in frames])
d = np.abs(imgs[1:] - imgs[:-1]).mean(axis=(1, 2))
print(f'total frames: {n}, adjacent diff mean={d.mean():.1f} median={np.median(d):.1f}')

runs = []
start = 0
for i in range(1, n):
    if d[i - 1] > 20:
        runs.append((start, i - 1))
        start = i
runs.append((start, n - 1))
lens = [b - a + 1 for a, b in runs]
print(f'num content runs (>20 diff switch): {len(runs)}')
print(f'run lengths: {lens}')
print(f'mean run len: {np.mean(lens):.2f}')

# For each run, print range + mean brightness (to distinguish A=dark / B=bright e.g. cover card)
for idx, (a, b) in enumerate(runs[:50]):
    bright = imgs[a:b + 1].mean()
    print(f'run {idx:2d}: frames {a:3d}-{b:3d} (len {b-a+1:2d}) brightness={bright:.1f}')

# dump representative: first frame of each run for first 12 runs + a mid one
os.makedirs('/tmp/vf runs', exist_ok=True)
os.makedirs('/tmp/vfruns', exist_ok=True)
for idx, (a, b) in enumerate(runs[:16]):
    Image.open(frames[a]).save(f'/tmp/vfruns/run{idx:02d}_f{a:04d}.png')
print('dumped representative frames of first 16 runs to /tmp/vfruns/')
