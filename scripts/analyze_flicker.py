#!/usr/bin/env python3
"""Deteksi kedip: cocokkan frame output ke frame sumber terdekat.
Output proyek bisa beda rasio (letterbox) — crop area gambar dulu."""
import subprocess, sys, os, json
import numpy as np
from PIL import Image

def probe(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                        "-show_entries", "stream=width,height", "-of", "json", video],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)["streams"][0]
    return int(d["width"]), int(d["height"])

def extract(video, outdir, vf_extra=None, scale="90x160"):
    os.makedirs(outdir, exist_ok=True)
    for f in os.listdir(outdir):
        os.remove(os.path.join(outdir, f))
    vf = "null"
    if vf_extra:
        vf = vf_extra
    if scale:
        vf = f"{vf},scale={scale}"
    subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vsync", "0", "-vf", vf,
                    os.path.join(outdir, "f%04d.png")], check=True)
    return sorted(os.listdir(outdir))

def load_gray(path, size):
    im = Image.open(path).convert("L").resize(size)
    return np.asarray(im, dtype=np.float32)

def analyze(src_video, out_video, shift, label, r0=0.0, max_report=30):
    print(f"\n===== {label} =====", flush=True)
    sw, sh = probe(src_video)
    ow, oh = probe(out_video)
    # area gambar sumber di dalam frame output (zoom=1, tanpa pan): fit
    fit = min(ow / sw, oh / sh)
    dw, dh = round(sw * fit), round(sh * fit)
    dx, dy = (ow - dw) // 2, (oh - dh) // 2
    print(f"sumber {sw}x{sh}, output {ow}x{oh}, crop=({dx},{dy},{dw},{dh})", flush=True)
    sfiles = extract(src_video, "/tmp/an/src")
    ofiles = extract(out_video, "/tmp/an/out", f"crop={dw}:{dh}:{dx}:{dy}")
    W, H = 90, 160
    src = np.stack([load_gray(os.path.join("/tmp/an/src", f), (W, H)) for f in sfiles])
    out = [load_gray(os.path.join("/tmp/an/out", f), (W, H)) for f in ofiles]
    print(f"frame: sumber {len(src)}, output {len(out)}", flush=True)
    fps = 30
    matches = []
    for oi, ov in enumerate(out):
        t = oi / fps
        if t < shift - 0.02:
            matches.append((oi, None))  # periode cover
            continue
        exp = int(round(r0 * fps)) + int(round((t - shift) * fps))  # frame sumber yang diharapkan
        lo, hi = max(0, exp - 20), min(len(src) - 1, exp + 20)
        best, bestd = -1, 1e18
        for si in range(lo, hi + 1):
            d = float(np.abs(src[si] - ov).mean())
            if d < bestd:
                bestd, best = d, si
        matches.append((oi, (best, best - exp, round(bestd, 1))))
    # laporan
    bad = []
    prev_si = None
    for oi, m in matches:
        if m is None:
            continue
        si, off, d = m
        if prev_si is not None:
            step = si - prev_si
            if step < 0 or step > 4 or abs(off) > 3:
                bad.append((oi, si, off, step, d))
        prev_si = si
    n_content = sum(1 for _, m in matches if m is not None)
    print(f"frame konten: {n_content}, cover: {len(matches) - n_content}", flush=True)
    if not bad:
        print("RESULT: BERSIH — tidak ada lompatan/frame salah", flush=True)
    else:
        print(f"RESULT: {len(bad)} frame bermasalah (oi, srcMatch, offset, step, diff):", flush=True)
        for b in bad[:max_report]:
            print("  ", b, flush=True)
    return bad

if __name__ == "__main__":
    import sys as _s
    if "seg1" in (_s.argv[1:] or ["all"]):
        analyze("/tmp/turbotest/test_tail.mp4", "/tmp/turbotest/out/turbo-seg1.mp4", 3, "SEG1 (sumber 0-10s)", r0=0)
    elif "seg2" in _s.argv[1:]:
        analyze("/tmp/turbotest/test_tail.mp4", "/tmp/turbotest/out/turbo-seg2.mp4", 3, "SEG2 (sumber 10-20s)", r0=10)
    else:
        analyze("/tmp/turbotest/test_tail.mp4", "/tmp/turbotest/out/turbo-seg1.mp4", 3, "SEG1 (sumber 0-10s)", r0=0)
        analyze("/tmp/turbotest/test_tail.mp4", "/tmp/turbotest/out/turbo-seg2.mp4", 3, "SEG2 (sumber 10-20s)", r0=10)
