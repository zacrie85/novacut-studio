#!/usr/bin/env python3
"""Download 16 fonts (5 existing + 11 new cinematic) from Google Fonts as TTF
into public/fonts/ for offline bundling in the Electron app."""
import re
import urllib.request
from pathlib import Path

OUT = Path("/home/z/my-project/public/fonts")
OUT.mkdir(parents=True, exist_ok=True)

FAMILIES = [
    # (css2 family query, weight, output filename)
    ("Orbitron", 900, "Orbitron-900.ttf"),
    ("Anton", 400, "Anton-Regular.ttf"),
    ("Bebas Neue", 400, "BebasNeue-Regular.ttf"),
    ("Rajdhani", 700, "Rajdhani-700.ttf"),
    ("Playfair Display", 800, "PlayfairDisplay-800.ttf"),
    ("Montserrat", 800, "Montserrat-800.ttf"),
    ("Oswald", 600, "Oswald-600.ttf"),
    ("Archivo Black", 400, "ArchivoBlack-Regular.ttf"),
    ("Barlow Condensed", 600, "BarlowCondensed-600.ttf"),
    ("Cinzel", 700, "Cinzel-700.ttf"),
    ("Teko", 700, "Teko-700.ttf"),
    ("Russo One", 400, "RussoOne-Regular.ttf"),
    ("Michroma", 400, "Michroma-Regular.ttf"),
    ("Italiana", 400, "Italiana-Regular.ttf"),
    ("Righteous", 400, "Righteous-Regular.ttf"),
    ("Alfa Slab One", 400, "AlfaSlabOne-Regular.ttf"),
]

def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

ok, fail = 0, []
for fam, weight, fname in FAMILIES:
    try:
        css_url = f"https://fonts.googleapis.com/css2?family={fam.replace(' ', '+')}:wght@{weight}&display=swap"
        css = fetch(css_url).decode("utf-8", "replace")
        # ambil url font truetype terakhir (latin subset)
        urls = re.findall(r"url\((https://fonts\.gstatic\.com/[^)]+\.ttf)\)", css)
        if not urls:
            fail.append((fam, "no ttf url in css"))
            continue
        data = fetch(urls[-1])
        if len(data) < 5000:
            fail.append((fam, f"too small: {len(data)}"))
            continue
        (OUT / fname).write_bytes(data)
        print(f"OK  {fam} w{weight} -> {fname} ({len(data)//1024} KB)")
        ok += 1
    except Exception as e:  # noqa: BLE001
        fail.append((fam, str(e)))

print(f"\nDownloaded {ok}/{len(FAMILIES)}")
for f in fail:
    print("FAIL", f)
