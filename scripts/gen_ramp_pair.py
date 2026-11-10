#!/usr/bin/env python3
"""Sumber uji ramp: setiap frame UNIK dan terbaca pada skala thumbnail —
brightness global menyapu 30..210 sepanjang video + tekstur hash per frame.
Output: WebM (VP9) utk jalur mesin kilat, dan MP4 (H.264 ber-B-frame) utk Turbo."""
import subprocess
import numpy as np

W, H, FPS, SEC = 604, 938, 30, 30
TOTAL = FPS * SEC

def make(pipe_target, vcodec_args, out):
    xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
    cmd = [
        "ffmpeg", "-v", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-f", "lavfi", "-i", f"sine=frequency=500:duration={SEC}",
        "-vf", "format=yuv420p",
        *vcodec_args,
        "-c:a", "aac" if out.endswith("mp4") else "libopus", "-b:a", "128k", "-shortest",
        out,
    ]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for n in range(TOTAL):
        t = n / (TOTAL - 1)
        # brightness global menyapu + ramp horizontal kecil + tekstur hash 8x8
        frame = (30 + 180 * t) * np.ones((H, W), dtype=np.float32) + 25 * (xx - 0.5)
        rng = np.random.RandomState(n)
        tile = (rng.rand(H // 8 + 1, W // 8 + 1) - 0.5) * 12
        frame += np.kron(tile, np.ones((8, 8), dtype=np.float32))[:H, :W]
        p.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
    p.stdin.close()
    p.wait()
    print(out, "rc=", p.returncode)

make(None, ["-c:v", "libvpx-vp9", "-b:v", "1.2M", "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1"], "/tmp/turbotest/ramp.webm")
make(None, ["-c:v", "libx264", "-preset", "veryfast", "-bf", "2", "-g", "60"], "/tmp/turbotest/ramp.mp4")
