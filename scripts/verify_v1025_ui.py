#!/usr/bin/env python3
"""Verifikasi hasil uji UI v1.0.25:
A) trim single 2..10 → 1 file, durasi ≈ 8s (ffprobe)
B) trim + split 4 → 4 file, durasi ≈ 2s per bagian
C) watermark terlihat (piksel merah logo di kuadran kiri-atas) + pita merah &
   biru bingkai t7 di bagian bawah frame
"""
import json, subprocess, sys
import numpy as np
from PIL import Image

DIR = "/tmp/v1025/ui"
meta = json.load(open(f"{DIR}/meta.json"))
fails = []

def ffprobe_dur(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", path],
        capture_output=True, text=True,
    )
    return float(json.loads(r.stdout)["format"]["duration"])

def extract_png(path, t, out):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", path, "-frames:v", "1", out], check=True)

A = [m for m in meta if m["run"] == "A"]
B = [m for m in meta if m["run"] == "B"]
C = [m for m in meta if m["run"] == "C"]

# ===== A =====
if len(A) != 1:
    fails.append(f"A: jumlah hasil {len(A)} ≠ 1")
else:
    d = ffprobe_dur(f"{DIR}/{A[0]['file']}")
    print(f"A durasi={d:.3f}s (target ≈ 8.0)")
    if abs(d - 8.0) > 0.4:
        fails.append(f"A: durasi {d:.2f} ≠ 8.0 (trim 2..10 gagal)")

# ===== B =====
if len(B) != 4:
    fails.append(f"B: jumlah hasil {len(B)} ≠ 4")
else:
    for m in B:
        d = ffprobe_dur(f"{DIR}/{m['file']}")
        print(f"B {m['file']} durasi={d:.3f}s (target ≈ 2.0)")
        if abs(d - 2.0) > 0.35:
            fails.append(f"B {m['file']}: durasi {d:.2f} ≠ 2.0")

# ===== C =====
if len(C) != 1:
    fails.append(f"C: jumlah hasil {len(C)} ≠ 1")
else:
    f = f"{DIR}/{C[0]['file']}"
    d = ffprobe_dur(f)
    print(f"C durasi={d:.3f}s (target ≈ 8.0)")
    if abs(d - 8.0) > 0.4:
        fails.append(f"C: durasi {d:.2f} ≠ 8.0")
    extract_png(f, 2.0, f"{DIR}/C-frame.png")
    im = np.asarray(Image.open(f"{DIR}/C-frame.png").convert("RGB")).astype(int)
    H, Wd = im.shape[:2]
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    # logo: lingkaran MERAH terang (pusat 20%,20%, diameter ≈ 12.5% lebar) — cari di kuadran kiri-atas
    qa = im[: H // 2, : Wd // 2]
    red = (qa[..., 0] > 170) & (qa[..., 1] < 110) & (qa[..., 2] < 110)
    print(f"C piksel merah logo di kiri-atas: {int(red.sum())}")
    if red.sum() < 300:
        fails.append("C: watermark merah TIDAK terlihat di kiri-atas")
    # bingkai t7: pita merah & biru di 35% bawah layar (judul posV default 100)
    qb = im[int(H * 0.6) :, :]
    rb = (qb[..., 0] > 190) & (qb[..., 1] > 60) & (qb[..., 1] < 150) & (qb[..., 2] < 110)
    bb = (qb[..., 2] > 170) & (qb[..., 0] > 100) & (qb[..., 0] < 190) & (qb[..., 1] > 100) & (qb[..., 1] < 190)
    print(f"C piksel pita MERAH (part) bawah: {int(rb.sum())}  piksel pita BIRU (judul) bawah: {int(bb.sum())}")
    if rb.sum() < 200:
        fails.append("C: pita merah t7 tidak terlihat")
    if bb.sum() < 200:
        fails.append("C: pita biru t7 tidak terlihat")

print("=" * 40)
if fails:
    print("GAGAL:")
    for f_ in fails:
        print(" -", f_)
    sys.exit(1)
print("SEMUA CEK UI PASS ✓")
