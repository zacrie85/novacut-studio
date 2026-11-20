#!/usr/bin/env python3
"""Logo watermark uji: lingkaran merah + cincin putih di latar transparan."""
from PIL import Image, ImageDraw

img = Image.new("RGBA", (240, 240), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.ellipse([20, 20, 220, 220], fill=(230, 30, 20, 255))
d.ellipse([55, 55, 185, 185], outline=(255, 255, 255, 255), width=14)
img.save("/tmp/v1025/wm/logo.png")
print("logo.png tersimpan", img.size)
