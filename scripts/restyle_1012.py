#!/usr/bin/env python3
"""NOVACUT v1.0.12 - restyle massal panel: neon -> netral CapCut (aksen biru).
Pemetaan kelas presisi + pengecualian (kategori warna, teks peringatan amber,
sukses emerald). File: InspectorPanel, EffectsPanel, TextPanel, MusicPanel,
CoverPanel, FramingControls, ApplyTargetSwitch."""

import re
from pathlib import Path

ROOT = Path("/home/z/my-project/src/components/editor")
FILES = [
    ROOT / "panels/InspectorPanel.tsx",
    ROOT / "panels/EffectsPanel.tsx",
    ROOT / "panels/TextPanel.tsx",
    ROOT / "panels/MusicPanel.tsx",
    ROOT / "panels/CoverPanel.tsx",
    ROOT / "FramingControls.tsx",
    ROOT / "ApplyTargetSwitch.tsx",
]

CAT_OLD = '''const CAT_STYLE: Record<string, string> = {
  trailer: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  iklan: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  sinematik: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  trend: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
};'''
CAT_NEW = '''const CAT_STYLE: Record<string, string> = {
  trailer: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  iklan: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  sinematik: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  trend: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
};'''

REPLACEMENTS = [
    # ===== proteksi teks peringatan (tetap amber) =====
    ("text-amber-400/80", "@@AW1@@"),
    ("text-amber-300/80", "@@AW2@@"),
    ("text-emerald-300/80", "@@EW1@@"),
    ("text-emerald-400", "@@EW2@@"),
    # ===== glow shadows dihapus =====
    (r"REGEX:shadow-\[0_0_\d+px_rgba\([^\]]+\)\]", ""),
    # ===== kategori efek (EffectsPanel) =====
    (CAT_OLD, "@@CATSTYLE@@"),
    # ===== CYAN -> BLUE =====
    ("text-cyan-500/80", "text-gray-500"),
    ("text-cyan-200", "text-blue-300"),
    ("text-cyan-300", "text-blue-400"),
    ("text-cyan-400", "text-blue-400"),
    ("border-cyan-300", "border-blue-400"),
    ("border-cyan-400/50", "border-blue-500/50"),
    ("border-cyan-400/40", "border-blue-500/40"),
    ("border-cyan-400/30", "border-blue-500/30"),
    ("border-cyan-400/25", "border-blue-500/25"),
    ("border-cyan-400/20", "border-blue-500/20"),
    ("bg-cyan-400/20", "bg-blue-500/15"),
    ("bg-cyan-400/15", "bg-blue-500/10"),
    ("bg-cyan-400/10", "bg-blue-500/10"),
    ("bg-cyan-400/5", "bg-blue-500/[0.06]"),
    ("bg-cyan-500/20", "bg-blue-500/15"),
    ("bg-cyan-500/25", "bg-blue-500/20"),
    ("hover:bg-cyan-500/30", "hover:bg-blue-500/25"),
    ("hover:bg-cyan-400/20", "hover:bg-blue-500/20"),
    ("hover:bg-cyan-400/10", "hover:bg-blue-500/10"),
    ("hover:border-cyan-400/40", "hover:border-blue-500/40"),
    ("accent-cyan-400", "accent-blue-500"),
    ("bg-cyan-300", "bg-blue-400"),
    ("from-cyan-500", "from-blue-500"),
    ("to-cyan-500", "to-blue-500"),
    ("to-cyan-400", "to-blue-400"),
    ("from-cyan-400", "from-blue-400"),
    ("border-cyan-400/", "border-blue-500/"),
    ("bg-cyan-500", "bg-blue-500"),
    ("text-cyan-", "text-blue-"),
    # ===== FUCHSIA -> BLUE =====
    ("border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-100", "border-blue-500/70 bg-blue-500/15 text-blue-300"),
    ("border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-200", "border-blue-500/70 bg-blue-500/15 text-blue-300"),
    ("border-fuchsia-400/25 bg-fuchsia-400/[0.06]", "border-blue-500/25 bg-blue-500/[0.06]"),
    ("border-fuchsia-400/25 bg-fuchsia-400/[0.05]", "border-blue-500/25 bg-blue-500/[0.05]"),
    ("border-fuchsia-400/30 bg-fuchsia-400/10", "border-blue-500/30 bg-blue-500/10"),
    ("border-fuchsia-400/20 bg-fuchsia-400/5", "border-blue-500/20 bg-blue-500/[0.06]"),
    ("bg-fuchsia-400/20", "bg-blue-500/15"),
    ("bg-fuchsia-400/5", "bg-blue-500/[0.06]"),
    ("hover:border-fuchsia-400/40", "hover:border-blue-500/40"),
    ("hover:border-fuchsia-400/60", "hover:border-blue-500/60"),
    ("border-fuchsia-300", "border-blue-400"),
    ("border-fuchsia-400/", "border-blue-500/"),
    ("text-fuchsia-100", "text-blue-100"),
    ("text-fuchsia-200", "text-blue-200"),
    ("text-fuchsia-300", "text-blue-300"),
    ("hover:bg-fuchsia-500/25", "hover:bg-blue-500/25"),
    ("bg-fuchsia-500/15", "bg-blue-500/10"),
    ("bg-fuchsia-500/20", "bg-blue-500/15"),
    ("data-[state=checked]:bg-fuchsia-500", "data-[state=checked]:bg-blue-500"),
    ("accent-fuchsia-400", "accent-blue-500"),
    ("from-fuchsia-600", "from-blue-600"),
    ("hover:from-fuchsia-500", "hover:from-blue-500"),
    ("bg-fuchsia-400/", "bg-blue-500/"),
    ("bg-fuchsia-500/", "bg-blue-500/"),
    ("text-fuchsia-", "text-blue-"),
    ("border-fuchsia-", "border-blue-"),
    # ===== VIOLET -> BLUE/NETRAL =====
    ("border-violet-400/20 bg-violet-400/[0.04]", "border-white/[0.07] bg-card"),
    ("bg-violet-400/[0.04]", "bg-card"),
    ("border-violet-400/20", "border-white/10"),
    ("bg-violet-400/20", "bg-blue-500/15"),
    ("border-violet-300 bg-violet-400/20 text-violet-100", "border-blue-500/70 bg-blue-500/15 text-blue-300"),
    ("border-violet-300", "border-blue-400"),
    ("hover:border-violet-400/40", "hover:border-blue-500/40"),
    ("border-violet-400/30", "border-blue-500/30"),
    ("bg-violet-400/10", "bg-blue-500/10"),
    ("text-violet-100", "text-blue-100"),
    ("text-violet-300", "text-blue-300"),
    ("text-violet-400", "text-blue-400"),
    ("accent-violet-400", "accent-blue-500"),
    ("border-violet-400/", "border-white/10"),
    ("bg-violet-400/", "bg-blue-500/"),
    ("text-violet-", "text-blue-"),
    # ===== AMBER (bagian nilai/aksi) -> BLUE =====
    ("border-amber-300 bg-amber-400/20 text-amber-100", "border-blue-500/70 bg-blue-500/15 text-blue-300"),
    ("border-amber-300 bg-amber-400/20 text-amber-200", "border-blue-500/70 bg-blue-500/15 text-blue-300"),
    ("hover:border-amber-400/40", "hover:border-blue-500/40"),
    ("hover:bg-amber-400/5", "hover:bg-blue-500/[0.06]"),
    ("border-amber-400/20 bg-amber-400/[0.04]", "border-white/[0.07] bg-card"),
    ("bg-amber-400/[0.04]", "bg-card"),
    ("border-amber-400/20", "border-white/10"),
    ("text-amber-300", "text-blue-300"),
    ("border-amber-300", "border-blue-400"),
    ("accent-amber-400", "accent-blue-500"),
    # ===== EMERALD CTA -> BLUE (sukses tetap emerald) =====
    ("bg-emerald-600 text-[11px] font-bold text-white hover:bg-emerald-500", "bg-blue-600 text-xs font-bold text-white hover:bg-blue-500"),
    ("bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500", "bg-blue-600 text-xs font-bold text-white hover:bg-blue-500"),
    ("bg-emerald-500/20 p-0 text-emerald-300 hover:bg-emerald-500/30", "bg-blue-500/15 p-0 text-blue-400 hover:bg-blue-500/25"),
    ("border-emerald-400/40 bg-emerald-400/10", "border-blue-500/40 bg-blue-500/10"),
    ("border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300", "border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-bold text-gray-300"),
    ("border-emerald-400/30 bg-emerald-400/10", "border-blue-500/30 bg-blue-500/10"),
    ("data-[state=checked]:bg-emerald-500", "data-[state=checked]:bg-blue-500"),
    ("bg-emerald-400/10", "bg-blue-500/10"),
    # ===== latar & kontrol =====
    ("bg-black/30", "bg-white/[0.04]"),
    ("bg-[#0b0d1d]", "bg-popover"),
    # ===== ukuran teks & tombol (besar & lega) =====
    ("text-[7px]", "text-[10px]"),
    ("text-[8px]", "text-[10px]"),
    ("text-[9px]", "text-[11px]"),
    ("text-[10px]", "text-[11px]"),
    ("h-7 border-white/10 bg-white/[0.04]", "h-8 border-white/10 bg-white/[0.04]"),
    ("h-7 flex-1", "h-8 flex-1"),
    ("h-6 gap-1 px-2", "h-7 gap-1 px-2"),
    ("h-6 px-2", "h-7 px-2"),
    ("font-semibold tracking-wider text-gray-400", "font-bold uppercase tracking-wider text-gray-400"),
    ("text-[11px] font-semibold tracking-wider text-gray-300", "text-xs font-bold uppercase tracking-wider text-gray-300"),
    ("text-[11px] font-semibold tracking-wider text-gray-400", "text-xs font-bold uppercase tracking-wider text-gray-400"),
    # ===== pulihkan proteksi =====
    ("@@AW1@@", "text-amber-400/80"),
    ("@@AW2@@", "text-amber-300/80"),
    ("@@EW1@@", "text-gray-400"),
    ("@@EW2@@", "text-emerald-400"),
    ("@@CATSTYLE@@", CAT_NEW),
]

def main():
    for f in FILES:
        if not f.exists():
            print(f"LEWATI (tidak ada): {f}")
            continue
        src = f.read_text(encoding="utf-8")
        out = src
        for old, new in REPLACEMENTS:
            if old.startswith("REGEX:"):
                out = re.sub(old[6:], new, out)
            else:
                out = out.replace(old, new)
        if out != src:
            f.write_text(out, encoding="utf-8")
            print(f"OK  : {f.name}")
        else:
            print(f"KOSONG: {f.name}")

    # laporkan sisa kelas neon utk perbaikan manual
    print("\n=== SISA WARNA NEON ===")
    for f in FILES:
        if not f.exists():
            continue
        for i, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if re.search(r"cyan-|fuchsia-|violet-|amber-3|shadow-\[0_0", line):
                print(f"{f.name}:{i}: {line.strip()[:150]}")

if __name__ == "__main__":
    main()
