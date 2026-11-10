#!/usr/bin/env python3
"""Dump urutan kecocokan penuh satu bagian — sumber di-cache ke .npy."""
import sys, os, json, subprocess
import numpy as np
from PIL import Image

W, H, FPS = 90, 160, 30
DUR, N = 65.0, 30
SRC = "/tmp/turbotest/ramp65.mp4"
CACHE = "/tmp/an3/src.npy"

def probe(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                        "-show_entries", "stream=width,height", "-of", "json", video],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)["streams"][0]
    return int(d["width"]), int(d["height"])

def extract_scaled(video, outdir, vf):
    os.makedirs(outdir, exist_ok=True)
    for f in os.listdir(outdir):
        os.remove(os.path.join(outdir, f))
    subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vsync", "0", "-vf", vf,
                    os.path.join(outdir, "f%04d.png")], check=True)
    return sorted(os.listdir(outdir))

def load(path):
    im = Image.open(path).convert("L").resize((W, H))
    a = np.asarray(im, dtype=np.float32)
    return (a - a.mean()) / max(1.0, a.std())

sw, sh = probe(SRC)
if os.path.exists(CACHE):
    src = np.load(CACHE)
    print("cache hit:", src.shape, flush=True)
else:
    sfiles = extract_scaled(SRC, "/tmp/an3/src",
                            f"crop={round(sw*0.2)}:{round(sh*0.7)}:{round(sw*0.03)}:{round(sh*0.15)},scale={W}:{H}")
    src = np.stack([load(os.path.join("/tmp/an3/src", f)) for f in sfiles])
    np.save(CACHE, src)
    print("cache baru:", src.shape, flush=True)

parts = [int(x) for x in sys.argv[1:]] or [1]
for part in parts:
    f = f"/tmp/e2e/parts/part-{part:02d}.mp4"
    ow, oh = probe(f)
    fit = min(ow / sw, oh / sh)
    dw, dh = round(sw * fit), round(sh * fit)
    dx, dy = (ow - dw) // 2, (oh - dh) // 2
    bx, by = dx + round(dw * 0.03), dy + round(dh * 0.15)
    bw, bh = round(dw * 0.2), round(dh * 0.7)
    ofiles = extract_scaled(f, "/tmp/an3/out", f"crop={bw}:{bh}:{bx}:{by},scale={W}:{H}")
    r0f = int(round((part - 1) * DUR / N * FPS))
    print(f"=== part {part} (r0f={r0f}, out={ow}x{oh}, {len(ofiles)} frame) ===", flush=True)
    prev = None
    rows = []
    for oi, fn in enumerate(ofiles):
        ov = load(os.path.join("/tmp/an3/out", fn))
        exp = r0f + oi
        lo, hi = max(0, exp - 25), min(len(src) - 1, exp + 25)
        best, bestd = -1, 1e18
        for si in range(lo, hi + 1):
            d = float(np.abs(src[si] - ov).mean())
            if d < bestd:
                bestd, best = d, si
        step = (best - prev) if prev is not None else 0
        prev = best
        rows.append((oi, best, best - exp, step, round(bestd, 2)))
    for r in rows:
        print(r)
