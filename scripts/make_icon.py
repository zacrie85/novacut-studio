#!/usr/bin/env python3
"""Generate ikon NOVACUT Studio (futuristik: play-triangle neon + garis cut)."""
from PIL import Image, ImageDraw, ImageFilter

S = 1024
img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# --- latar rounded square dengan gradasi vertikal ---
bg = Image.new("RGBA", (S, S), (0, 0, 0, 0))
bd = ImageDraw.Draw(bg)
top = (10, 12, 34, 255)
bottom = (26, 8, 46, 255)
for y in range(S):
    t = y / S
    c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)) + (255,)
    bd.line([(0, y), (S, y)], fill=c)

mask = Image.new("L", (S, S), 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([32, 32, S - 32, S - 32], radius=200, fill=255)
img.paste(bg, (0, 0), mask)
d = ImageDraw.Draw(img)

# --- bingkai neon tipis ---
frame = Image.new("RGBA", (S, S), (0, 0, 0, 0))
fd = ImageDraw.Draw(frame)
fd.rounded_rectangle([52, 52, S - 52, S - 52], radius=180, outline=(56, 224, 255, 230), width=10)
fd.rounded_rectangle([76, 76, S - 76, S - 76], radius=160, outline=(168, 85, 247, 160), width=6)
frame = frame.filter(ImageFilter.GaussianBlur(3))
img.alpha_composite(frame)

# --- segitiga play dengan gradasi cyan->magenta + glow ---
tri = [(370, 300), (370, 724), (742, 512)]
glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.polygon(tri, fill=(56, 224, 255, 180))
glow = glow.filter(ImageFilter.GaussianBlur(46))
img.alpha_composite(glow)
glow2 = Image.new("RGBA", (S, S), (0, 0, 0, 0))
gd2 = ImageDraw.Draw(glow2)
gd2.polygon(tri, fill=(217, 70, 239, 150))
glow2 = glow2.filter(ImageFilter.GaussianBlur(70))
img.alpha_composite(glow2)

grad = Image.new("RGBA", (S, S), (0, 0, 0, 0))
gdg = ImageDraw.Draw(grad)
x0, x1 = 340, 760
for x in range(x0, x1):
    t = (x - x0) / (x1 - x0)
    r = int(56 + (217 - 56) * t)
    g = int(224 + (70 - 224) * t)
    b = int(255 + (239 - 255) * t)
    gdg.line([(x, 250), (x, 780)], fill=(r, g, b, 255))
gmask = Image.new("L", (S, S), 0)
ImageDraw.Draw(gmask).polygon(tri, fill=255)
img.paste(grad, (0, 0), gmask)

# --- garis "cut" menyilang (identitas NOVACUT) ---
cut = Image.new("RGBA", (S, S), (0, 0, 0, 0))
cd = ImageDraw.Draw(cut)
cd.line([(250, 700), (790, 330)], fill=(255, 255, 255, 235), width=26)
cut = cut.filter(ImageFilter.GaussianBlur(2))
img.alpha_composite(cut)
halo = Image.new("RGBA", (S, S), (0, 0, 0, 0))
hd = ImageDraw.Draw(halo)
hd.line([(250, 700), (790, 330)], fill=(120, 240, 255, 160), width=44)
halo = halo.filter(ImageFilter.GaussianBlur(24))
img.alpha_composite(halo)

out_full = Image.new("RGBA", (S, S), (0, 0, 0, 0))
img.save("/home/z/my-project/build/icon.png")

# icon kecil untuk window
img.resize((256, 256), Image.LANCZOS).save("/home/z/my-project/build/icon-256.png")
print("icon ok:", S, "px")
