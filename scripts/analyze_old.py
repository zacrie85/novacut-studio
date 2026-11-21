#!/usr/bin/env python3
"""Run-length analysis for OLD sample (65 frames)."""
import glob
import numpy as np
from PIL import Image

frames = sorted(glob.glob('/tmp/vold/f*.png'))
imgs = np.array([np.asarray(Image.open(f).convert('L'), dtype=np.float32) for f in frames])
n = len(imgs)
d = np.abs(imgs[1:] - imgs[:-1]).mean(axis=(1, 2))
print(f'old sample: {n} frames, adjacent diff mean={d.mean():.1f} median={np.median(d):.1f}')
d2 = np.abs(imgs[2:] - imgs[:-2]).mean(axis=(1, 2))
print(f'skip-1 diff mean={d2.mean():.1f}  (kecil = pola A/B)')
# brightness sequence
b = imgs.mean(axis=(1, 2))
print('brightness per frame:')
print(' '.join(f'{x:.0f}' for x in b))
# classify alternating?
alt = sum(1 for i in range(n - 2) if abs(b[i] - b[i + 2]) < 3 and abs(b[i] - b[i + 1]) > 15)
print(f'alternating (A/B) positions: {alt}/{n-2}')
