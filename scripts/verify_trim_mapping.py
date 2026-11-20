#!/usr/bin/env python3
"""Verifikasi mapping trim v1.0.25 (ramp): terang menyapu 30..210 sepanjang 30s.
Trim mulai 5s (frame 150) selama 10s (300 frame) → output frame i harus ≈
frame sumber (150+i)."""
import subprocess, sys
import numpy as np

W, H = 604, 938

def frame_means(path):
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "gray", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    means = []
    while True:
        buf = p.stdout.read(W * H)
        if len(buf) < W * H:
            break
        means.append(float(np.frombuffer(buf, dtype=np.uint8).astype(np.float32).mean()))
    p.wait()
    return np.array(means)

src_path, out_path, start_frame = sys.argv[1], sys.argv[2], int(sys.argv[3])
src = frame_means(src_path)
out = frame_means(out_path)
n = len(out)
print(f"source frames={len(src)}  output frames={n} (target {10 * 30})")
exp = src[start_frame : start_frame + n]
err = out[: len(exp)] - exp
print(f"bias rata-rata={err.mean():.2f}  |err| median={np.median(np.abs(err)):.2f}  p95={np.percentile(np.abs(err), 95):.2f}  max={np.abs(err).max():.2f}")
inv = int(np.sum(np.diff(out) < -1.5))
print(f"frame mundur (turun >1.5 level): {inv}")
ok = abs(err.mean()) < 3.0 and np.median(np.abs(err)) < 3.0 and inv <= 2
print("PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
