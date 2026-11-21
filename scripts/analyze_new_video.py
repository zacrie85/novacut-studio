#!/usr/bin/env python3
"""Detect flicker frames in user's video: per-frame diff analysis + visual dump of anomalies."""
import subprocess, glob, os
import numpy as np
from PIL import Image

frames = sorted(glob.glob('/tmp/vfr/f*.png'))
print(f"frames: {len(frames)}")
imgs = []
for f in frames:
    im = Image.open(f).convert('L').resize((190, 249))  # 1/4 size grayscale
    imgs.append(np.asarray(im, dtype=np.float32))

# diff between consecutive sampled frames
diffs = []
for i in range(1, len(imgs)):
    d = np.abs(imgs[i] - imgs[i-1]).mean()
    diffs.append((i, d))

vals = np.array([d for _, d in diffs])
med = np.median(vals)
print(f"median diff={med:.2f} mean={vals.mean():.2f} max={vals.max():.2f}")

# flicker candidates: frame where diff to prev AND diff to next are both huge,
# i.e. an isolated spike (frame differs from both neighbors)
print("\n--- isolated spikes (frame differs from BOTH neighbors) ---")
for i in range(1, len(vals)-1):
    prev_d, cur_d, next_d = vals[i-1], vals[i], vals[i+1]
    if cur_d > max(med*6, 15) and next_d > max(med*6, 15):
        frame_idx = i+1  # position in sampled list
        print(f"sample#{frame_idx} (file {frames[frame_idx]}, orig frame ~{frame_idx*3}): "
              f"prev_d={prev_d:.2f} cur_d={cur_d:.2f} next_d={next_d:.2f}")

print("\n--- biggest 15 diffs ---")
top = sorted(range(len(vals)), key=lambda i: -vals[i])[:15]
for i in sorted(top):
    print(f"between sample#{i+1} and #{i+2} (orig frames ~{(i+1)*3}->{(i+2)*3}): d={vals[i]:.2f}")
