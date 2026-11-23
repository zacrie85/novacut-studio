#!/usr/bin/env python3
# Poster film Hollywood — tahap 2: tipografi ala bioskop di atas latar hasil AI.
# Judul diambil dari NAMA FILE foto (permintaan pengguna): WIN_20260728_08_55_40_Pro
# Tanggal & waktu tagline juga diturunkan dari nama file (20260728 · 08:55:40).
from PIL import Image, ImageDraw, ImageFilter, ImageFont

CAND_TITLE = [
    "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Bold.otf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
]
CAND_SMALL = [
    "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Regular.otf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]

def pick(cands):
    import os
    for p in cands:
        if os.path.exists(p):
            return p
    raise FileNotFoundError(cands)

TITLE_FONT = pick(CAND_TITLE)
SMALL_FONT = pick(CAND_SMALL)

TITLE_L1 = "WIN 20260728"
TITLE_L2 = "08 55 40 PRO"
TAGLINE = "08:55:40 — WAKTU MENENTUKAN SEGALANYA"
TOP = "NOVACUT PICTURES MEMPERSEMBAHKAN"
BILL_1 = "SEBUAH PRODUKSI NOVACUT PICTURES · STUDIO FILM SOROTAN"
BILL_2 = "MULAI TAYANG 28 JULI 2026 · DIFOTO DENGAN KAMERA WIN PRO"

def font(path, size):
    return ImageFont.truetype(path, size)

def text_w(fnt, s, tracking=0):
    w = 0
    for ch in s:
        w += fnt.getlength(ch) + tracking
    return w - (tracking if s else 0)

def draw_tracked(layer, draw, cx, cy, s, fnt, tracking, fill):
    """teks ber-tracking (jarak antar huruf) center di (cx, cy)"""
    w = text_w(fnt, s, tracking)
    asc, desc = fnt.getmetrics()
    x = cx - w / 2
    y = cy - (asc + desc) / 2
    for ch in s:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += fnt.getlength(ch) + tracking
    return w

def draw_tracked_stroke(layer, draw, cx, cy, s, fnt, tracking, fill, stroke, sw):
    w = text_w(fnt, s, tracking)
    asc, desc = fnt.getmetrics()
    x = cx - w / 2
    y = cy - (asc + desc) / 2
    for ch in s:
        draw.text((x, y), ch, font=fnt, fill=fill, stroke_width=sw, stroke_fill=stroke)
        x += fnt.getlength(ch) + tracking

def gradient_gold(w, h):
    img = Image.new("RGB", (w, h))
    px = img.load()
    top = (255, 246, 214)
    mid = (244, 190, 66)
    bot = (196, 138, 28)
    for y in range(h):
        t = y / max(1, h - 1)
        if t < 0.5:
            k = t / 0.5
            c = tuple(int(top[i] + (mid[i] - top[i]) * k) for i in range(3))
        else:
            k = (t - 0.5) / 0.5
            c = tuple(int(mid[i] + (bot[i] - mid[i]) * k) for i in range(3))
        for x in range(w):
            px[x, y] = c
    return img

def add_title(img, scale, small_scale=1.0):
    """scale: proporsi judul (1.0 = 96px pada lebar 768px). small_scale: proporsi teks kecil."""
    W, H = img.size
    base = W / 768 * scale
    sm = W / 768 * small_scale
    out = img.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    ds = ImageDraw.Draw(shadow)
    cx = W / 2

    # ukuran font
    f_top = font(SMALL_FONT, max(14, int(15 * sm)))
    f_tag = font(SMALL_FONT, max(15, int(17 * sm)))
    f_t1 = font(TITLE_FONT, int(96 * base))
    f_t2 = font(TITLE_FONT, int(96 * base))
    f_bill = font(SMALL_FONT, max(12, int(13 * sm)))

    # muat-kan lebar tiap baris judul ≤ 88% W
    tr1 = max(2, int(6 * base))
    while text_w(f_t1, TITLE_L1, tr1) > W * 0.88 and f_t1.size > 30:
        f_t1 = font(TITLE_FONT, f_t1.size - 2)
    while text_w(f_t2, TITLE_L2, tr1) > W * 0.88 and f_t2.size > 30:
        f_t2 = font(TITLE_FONT, f_t2.size - 2)

    # susun dari bawah
    y_bill2 = H - int(26 * base)
    y_bill1 = y_bill2 - int(20 * base)
    y_t2 = y_bill1 - int(26 * base)
    y_t1 = y_t2 - int(f_t2.size * 1.06)
    y_tag = y_t1 - int(f_t1.size * 0.62)
    y_top = int(30 * sm)

    # === gradasi gelap bawah (scrim) supaya teks menonjol ===
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    y0 = int(H * 0.45)
    for y in range(y0, H):
        t = (y - y0) / max(1, H - y0)
        sd.line([(0, y), (W, y)], fill=(0, 0, 0, int(215 * (t ** 1.2))))
    out = Image.alpha_composite(out, scrim)

    # === pita gelap lembut di belakang blok teks bawah ===
    # (menyembunyikan sisa artefak AI & menaikkan kontras judul — gaya footer poster bioskop)
    band_top = y_tag - int(46 * base)
    # blur kuat pada wilayah band: sisa teks/arteak AI melebur ke latar (kabut kota)
    blurred = out.filter(ImageFilter.GaussianBlur(int(26 * base)))
    bmask = Image.new("L", (W, H), 0)
    bmd = ImageDraw.Draw(bmask)
    feather = int(60 * base)
    for y in range(band_top, H):
        t = min(1.0, (y - band_top) / max(1, feather))
        bmd.line([(0, y), (W, y)], fill=int(255 * t))
    out = Image.composite(blurred, out, bmask)
    band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(band)
    feather = int(70 * base)
    for y in range(band_top, H):
        t = min(1.0, (y - band_top) / max(1, feather))
        bd.line([(0, y), (W, y)], fill=(5, 8, 14, int(195 * t)))
    band = band.filter(ImageFilter.GaussianBlur(2))
    out = Image.alpha_composite(out, band)

    # === vignette lembut di tepi ===
    vig = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse([int(-W * 0.25), int(-H * 0.18), int(W * 1.25), int(H * 1.18)], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(int(60 * base)))
    dark = Image.new("RGBA", (W, H), (0, 0, 0, 110))
    out = Image.composite(out, Image.alpha_composite(out, dark), vig)

    # === bayangan judul ===
    for cy, s, fnt in [(y_t1, TITLE_L1, f_t1), (y_t2, TITLE_L2, f_t2)]:
        w = text_w(fnt, s, tr1)
        asc, desc = fnt.getmetrics()
        x = cx - w / 2
        yy = cy - (asc + desc) / 2
        for ch in s:
            ds.text((x + int(4 * base), yy + int(6 * base)), ch, font=fnt, fill=(0, 0, 0, 220))
            x += fnt.getlength(ch) + tr1
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(5 * base)))
    out = Image.alpha_composite(out, shadow)

    # === judul gradien emas (mask) ===
    gold = gradient_gold(W, H).convert("RGBA")
    for cy, s, fnt in [(y_t1, TITLE_L1, f_t1), (y_t2, TITLE_L2, f_t2)]:
        mask = Image.new("L", (W, H), 0)
        md = ImageDraw.Draw(mask)
        w = text_w(fnt, s, tr1)
        asc, desc = fnt.getmetrics()
        x = cx - w / 2
        yy = cy - (asc + desc) / 2
        for ch in s:
            md.text((x, yy), ch, font=fnt, fill=255, stroke_width=int(2 * base), stroke_fill=255)
            x += fnt.getlength(ch) + tr1
        # outline gelap dulu (dari mask lebih besar), lalu isi emas
        outl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(outl)
        x = cx - w / 2
        for ch in s:
            od.text((x, yy), ch, font=fnt, fill=(20, 12, 4, 255), stroke_width=int(4 * base), stroke_fill=(20, 12, 4, 255))
            x += fnt.getlength(ch) + tr1
        out = Image.alpha_composite(out, outl)
        g = Image.composite(gold, Image.new("RGBA", (W, H), (0, 0, 0, 0)), mask)
        out = Image.alpha_composite(out, g)

    # === teks kecil ===
    draw_tracked_stroke(overlay, d, cx, y_top, TOP, f_top, int(7 * base), (232, 232, 232, 235), (0, 0, 0, 180), 2)
    draw_tracked_stroke(overlay, d, cx, y_tag, TAGLINE, f_tag, int(4 * base), (250, 214, 116, 240), (0, 0, 0, 200), 2)
    draw_tracked(overlay, d, cx, y_bill1, BILL_1, f_bill, int(3 * base), (208, 208, 208, 230))
    draw_tracked(overlay, d, cx, y_bill2, BILL_2, f_bill, int(3 * base), (208, 208, 208, 230))

    out = Image.alpha_composite(out, overlay)
    return out.convert("RGB")

# potrait: poster klasik tegak — judul besar proporsional
p = Image.open("scripts/poster_bg_portrait.png")
add_title(p, 1.0).save("download/poster-film-WIN-20260728-08-55-40-Pro-portrait.png", quality=95)
# landscape: cover film 16:9 — judul lebih kecil agar wajah tetap dominan
l = Image.open("scripts/poster_bg_landscape.png")
add_title(l, 0.7, 0.8).save("download/poster-film-WIN-20260728-08-55-40-Pro-cover-16x9.png", quality=95)

# verifikasi
from PIL import Image as I
for pth in ["download/poster-film-WIN-20260728-08-55-40-Pro-portrait.png", "download/poster-film-WIN-20260728-08-55-40-Pro-cover-16x9.png"]:
    im = I.open(pth).convert("L")
    h = im.histogram()
    print(pth, I.open(pth).size, "non-rata ratio:", round(1 - h[255] / sum(h), 3))
print("TITEL_OK")
