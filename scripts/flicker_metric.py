#!/usr/bin/env python3
"""Metrik kedip tanpa pemetaan: pada kolom konten (bebas teks), kedip = selisih
frame berurutan BESAR (konten melompat) & skip-2 KECIL (pola A/B). Video sehat
(ramp lambat) = selisih berurutan kecil. Kontrol positif: sampel user."""
import glob, os, shutil, subprocess, sys
import numpy as np
from PIL import Image

AR = 604 / 938

def content_band(path, crop=True):
    outdir = "/tmp/repro/band"
    shutil.rmtree(outdir, ignore_errors=True)
    os.makedirs(outdir, exist_ok=True)
    vf = (f"crop=ih*{AR}:ih*0.5:(iw-ih*{AR})/2:ih*0.3,scale=48:40" if crop else "scale=48:40")
    subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-vsync", "0", f"{outdir}/f%05d.png"], check=True, timeout=300)
    files = sorted(glob.glob(outdir + "/*.png"))
    return np.array([np.asarray(Image.open(f).convert("L"), dtype=np.float32) for f in files])

def report(tag, path, crop=True):
    imgs = content_band(path, crop)
    n = len(imgs)
    if n < 5:
        print(f"{tag}: terlalu sedikit frame ({n})"); return
    d1 = np.abs(imgs[1:] - imgs[:-1]).mean(axis=(1, 2))
    d2 = np.abs(imgs[2:] - imgs[:-2]).mean(axis=(1, 2))
    print(f"{tag}: n={n} | selisih-berurutan mean={d1.mean():6.2f} p95={np.percentile(d1,95):6.2f} | "
          f"skip-2 mean={d2.mean():6.2f} | rasio d1/d2={d1.mean()/max(d2.mean(),0.01):4.2f}")

target = sys.argv[1] if len(sys.argv) > 1 else "/tmp/repro/parts5"
parts = sorted(glob.glob(target + "/*.mp4"))
for p in parts:
    crop = "part-" in os.path.basename(p)  # hasil UI ber-pillarbox + teks → crop
    report(os.path.basename(p), p, crop)
print("--- kontrol positif (sampel user, harus kedip) ---")
report("USER-baru", "/home/z/my-project/upload/video kedip kedip.mp4", crop=False)
report("USER-lama", "/home/z/my-project/upload/20261110-0300-42.4890889.mp4", crop=False)
