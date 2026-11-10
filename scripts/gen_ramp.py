#!/usr/bin/env python3
"""Generator sumber ramp unik-per-frame → pipe rawvideo ke ffmpeg."""
import numpy as np
import sys

W, H, FPS, SEC = 604, 938, 30, 65
TOTAL = FPS * SEC

xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
proc = subprocess = None
import subprocess
cmd = [
    "ffmpeg", "-v", "error", "-y",
    "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
    "-f", "lavfi", "-i", f"sine=frequency=500:duration={SEC}",
    "-vf", "drawtext=text='%{n}':fontsize=48:fontcolor=white:box=1:boxcolor=red@0.8:x=8:y=8,format=yuv420p",
    "-c:v", "libx264", "-preset", "ultrafast", "-bf", "2", "-g", "60",
    "-c:a", "aac", "-b:a", "128k", "-shortest",
    "/tmp/turbotest/ramp65.mp4",
]
p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for n in range(TOTAL):
    t = n / (TOTAL - 1)
    # bidang unik: ramp horizontal + ramp waktu + tile kecil utk tekstur
    frame = (40 + 180 * (0.35 * xx + 0.65 * t)) * np.ones((H, W), dtype=np.float32)
    # tile 8x8 piksel bervariasi per-frame (hash) — pemisah frame yang lebih kuat
    rng = np.random.RandomState(n)
    tile = (rng.rand(H // 8 + 1, W // 8 + 1) - 0.5) * 14
    frame += np.kron(tile, np.ones((8, 8), dtype=np.float32))[:H, :W]
    p.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
p.stdin.close()
p.wait()
print("selesai rc=", p.returncode)
