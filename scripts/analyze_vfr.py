#!/usr/bin/env python3
"""Analisis VFR: tiap frame output harus menampilkan segmen sumber yang benar
(berdasarkan waktu) dan urutannya monoton — tidak ada frame basi lompat balik."""
import os, json, subprocess, glob
import numpy as np
from PIL import Image

W, H = 60, 90
FPS = 30
SHIFT = 2.0

def probe(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                        "-show_entries", "stream=width,height", "-of", "json", video],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)["streams"][0]
    return int(d["width"]), int(d["height"])

def norm(a):
    return (a - a.mean()) / max(1.0, a.std())

# --- segmen sumber + waktu mulai tiap segmen ---
import re
segs = []  # (start_sec, img_norm)
cur = 0.0
lines = open("/tmp/vfr/list.ffconcat").read().splitlines()
i = 0
files = sorted(glob.glob("/tmp/vfr/seg*.png"))
imgs = {}
for f in files:
    idx = int(os.path.basename(f)[3:6])
    imgs[idx] = norm(np.asarray(Image.open(f).convert("L").resize((W, H)), dtype=np.float32))
it = iter(lines)
for ln in it:
    if ln.startswith("file "):
        name = ln.split("'")[1]
        idx = int(name[3:6])
        nxt = next(it, "")
        dur = float(nxt.split()[1]) if nxt.startswith("duration") else 1 / 30
        if imgs[idx] is not None:
            segs.append((cur, imgs[idx]))
        cur += dur
print(f"segmen: {len(segs)}, durasi total: {cur:.2f}s", flush=True)
starts = np.array([s[0] for s in segs])

def seg_at(t):
    i = int(np.searchsorted(starts, t + 1e-9) - 1)
    return max(0, min(len(segs) - 1, i))

# --- per bagian ---
files_p = sorted(glob.glob("/tmp/e2e/parts/part-*.mp4"))
print("bagian:", len(files_p), flush=True)
total_bad = 0
bad_parts = []
PART_DUR = None
for f in files_p:
    part = int(os.path.basename(f).split("-")[1].split(".")[0])
    ow, oh = probe(f)
    # proyek 16:9 → sumber 604x938 fit dengan bar; area gambar:
    fit = min(ow / 604, oh / 938)
    dw, dh = round(604 * fit), round(938 * fit)
    dx, dy = (ow - dw) // 2, (oh - dh) // 2
    bx, by = dx + round(dw * 0.05), dy + round(dh * 0.15)
    bw, bh = round(dw * 0.35), round(dh * 0.65)
    outdir = "/tmp/anvfr/out"
    os.makedirs(outdir, exist_ok=True)
    for x in os.listdir(outdir):
        os.remove(os.path.join(outdir, x))
    subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-vsync", "0",
                    "-vf", f"crop={bw}:{bh}:{bx}:{by},scale={W}:{H}",
                    os.path.join(outdir, "f%04d.png")], check=True)
    ofiles = sorted(os.listdir(outdir))
    # waktu mulai konten bagian ini di sumber (part-1..30 × 65/30)
    src_start = (part - 1) * 65.0 / 30
    bad = []
    prev_seg = None
    for oi, fn in enumerate(ofiles):
        t_out = oi / FPS
        if t_out < SHIFT - 0.02:
            continue  # cover
        t_src = src_start + (t_out - SHIFT)
        want = seg_at(t_src)
        ov = norm(np.asarray(Image.open(os.path.join(outdir, fn)).convert("L").resize((W, H)), dtype=np.float32))
        # cari segmen terbaik di sekitar yang diharapkan (±3 segmen)
        best, bestd = -1, 1e18
        for k in range(max(0, want - 3), min(len(segs), want + 4)):
            d = float(np.abs(segs[k][1] - ov).mean())
            if d < bestd:
                bestd, best = d, k
        ok = (abs(best - want) <= 3) and bestd < 0.6
        if prev_seg is not None and best < prev_seg:
            ok = False  # mundur = kedip
        if not ok:
            bad.append((oi, want, best, round(bestd, 2)))
        prev_seg = best
    total_bad += len(bad)
    if bad:
        bad_parts.append(part)
    print(f"part {part:02d}: frame={len(ofiles)} " + ("OK" if not bad else f"SALAH={len(bad)} {bad[:4]}"), flush=True)

print(f"\nTOTAL frame salah: {total_bad}; bagian bermasalah: {bad_parts}", flush=True)
