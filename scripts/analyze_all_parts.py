#!/usr/bin/env python3
"""Analisis kedip semua bagian — sumber di-cache sekali, proses ringan."""
import subprocess, os, json, glob, sys
import numpy as np
from PIL import Image

W, H = 90, 160
FPS = 30
DUR = 65.0
N = 30

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

def load(d, f):
    im = Image.open(os.path.join(d, f)).convert("L").resize((W, H))
    a = np.asarray(im, dtype=np.float32)
    # normalisasi tone (grade aplikasi menggelapkan) — cocokkan POLA, bukan terang
    m = a.mean()
    s = a.std()
    return (a - m) / (s if s > 1 else 1)

SRC = "/tmp/turbotest/ramp65.mp4"
SHIFT = 2.0  # cover aktif (pl.showTitleScreen default true) — lompati periode cover
sw, sh = probe(SRC)

# cache thumbnail sumber (sekali) — pita kiri yang sama utk adil
sw2, sh2 = round(sw * 0.2), round(sh * 0.7)
sfiles = extract_scaled(SRC, "/tmp/an2/src", f"crop={sw2}:{sh2}:{round(sw * 0.03)}:{round(sh * 0.15)},scale={W}:{H}")
src = np.stack([load("/tmp/an2/src", f) for f in sfiles])
print(f"sumber: {len(src)} frame ({sw}x{sh})", flush=True)

files = sorted(glob.glob("/tmp/e2e/parts/part-*.mp4"))
print(f"bagian: {len(files)}", flush=True)
total_bad = 0
bad_parts = []
for f in files:
    part = int(os.path.basename(f).split("-")[1].split(".")[0])
    ow, oh = probe(f)
    fit = min(ow / sw, oh / sh)
    dw, dh = round(sw * fit), round(sh * fit)
    dx, dy = (ow - dw) // 2, (oh - dh) // 2
    # pita KIRI video (bebas teks judul tengah/part atas/banner bawah)
    bx = dx + round(dw * 0.03)
    by = dy + round(dh * 0.15)
    bw = round(dw * 0.2)
    bh = round(dh * 0.7)
    ofiles = extract_scaled(f, "/tmp/an2/out", f"crop={bw}:{bh}:{bx}:{by},scale={W}:{H}")
    if not ofiles:
        print(f"part {part:02d}: KOSONG!", flush=True)
        bad_parts.append(part)
        continue
    n = len(ofiles)
    r0f = int(round((part - 1) * DUR / N * FPS))
    bad = []
    prev = None
    for oi, fn in enumerate(ofiles):
        if SHIFT > 0 and oi < round(SHIFT * FPS):
            prev = None
            continue  # periode cover (gambar statis sumber) — tidak dinilai
        ov = load("/tmp/an2/out", fn)
        exp = r0f + (oi - round(SHIFT * FPS))  # frame sumber yang diharapkan
        lo, hi = max(0, exp - 20), min(len(src) - 1, exp + 20)
        best, bestd = -1, 1e18
        for si in range(lo, hi + 1):
            d = float(np.abs(src[si] - ov).mean())
            if d < bestd:
                bestd, best = d, si
        if prev is not None:
            step = best - prev
            if step < 0 or step > 4 or abs(best - exp) > 3:
                bad.append((oi, best, best - exp, step, round(bestd, 1)))
        prev = best
    total_bad += len(bad)
    if len(bad):
        bad_parts.append(part)
    tail = "; ".join(str(b) for b in bad[:3])
    print(f"part {part:02d}: frame={n} " + ("OK" if not bad else f"SALAH={len(bad)} {tail}"), flush=True)

print(f"\nTOTAL frame salah: {total_bad}; bagian bermasalah: {bad_parts}", flush=True)
