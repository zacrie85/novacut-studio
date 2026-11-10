#!/usr/bin/env python3
"""Decisive test: do the A-frames and B-frames ADVANCE (two live sources fighting)
or is one FROZEN (stale element)? Track motion within each content class."""
import glob
import numpy as np
from PIL import Image

def analyze(tag, frames):
    imgs = np.array([np.asarray(Image.open(f).convert('L').resize((96, 126)), dtype=np.float32) for f in frames])
    n = len(imgs)
    # classify each frame to class A or B by brightness (2-means-ish)
    b = imgs.mean(axis=(1, 2))
    thr = (b.max() + b.min()) / 2
    cls = (b > thr).astype(int)  # 1 = bright (B), 0 = dark (A)
    # motion within each class: diff between consecutive frames OF THE SAME class
    seqs = {0: [], 1: []}
    for i in range(n):
        seqs[int(cls[i])].append(i)
    print(f"--- {tag}: n={n}, class counts: A(dark)={len(seqs[0])} B(bright)={len(seqs[1])}")
    for c, idxs in seqs.items():
        if len(idxs) < 3:
            print(f"  class {c}: too few ({len(idxs)})")
            continue
        motions = []
        for k in range(1, len(idxs)):
            d = np.abs(imgs[idxs[k]] - imgs[idxs[k - 1]]).mean()
            motions.append(d)
        m = np.array(motions)
        print(f"  class {c}: motion between consecutive same-class frames: mean={m.mean():.2f} median={np.median(m):.2f} p90={np.percentile(m,90):.2f} frozen(<1.0)={int((m<1.0).sum())}/{len(m)}")

analyze("SAMPLE BARU (part 21/30)", sorted(glob.glob('/tmp/vfall/f*.png')))
analyze("SAMPLE LAMA (part 2/30)", sorted(glob.glob('/tmp/vold/f*.png')))
