#!/usr/bin/env python3
"""Verifikasi preset 'cepat' v1.0.28: rumus bitrate per kasus audio.
- Re-encode AAC (platform punya encoder AAC): reservasi 192 kbps (Turbo 128k / kilat 192k)
- Salin audio asli (platform TANPA encoder AAC): reservasi 320 kbps (bitrate sumber tak diketahui)
Total = video + audio reservasi + overhead kontainer ~1 MB. Target total ≤ 50 MB."""

TARGET_BITS = 47_000_000 * 8
MAX_BPS, MIN_BPS = 4_500_000, 600_000
OVERHEAD = 1_000_000

def cepat_bitrate(dur, reserve):
    return round(min(MAX_BPS, max(MIN_BPS, (TARGET_BITS - reserve * dur) / dur)))

for label, reserve in [("RE-ENCODE AAC (reservasi 192kbps)", 192_000), ("SALIN AUDIO ASLI (reservasi 320kbps)", 320_000)]:
    print(f"== {label} ==")
    print(f"{'durasi':>9} | {'bitrate':>9} | video MB | audio MB | total MB | ≤50MB?")
    for dur in [30, 60, 90, 120, 178, 240, 300, 360, 475, 600]:
        b = cepat_bitrate(dur, reserve)
        video = b / 8 * dur / 1e6
        audio = reserve / 8 * dur / 1e6
        total = video + audio + OVERHEAD / 1e6
        print(f"{dur:>7}s | {b:>7,} | {video:8.1f} | {audio:8.1f} | {total:8.1f} | {'YA' if total <= 50 else 'lewat (bagian panjang)'}")
    print()

print("Batas durasi maksimum agar total ≤50MB (floor 600kbps aktif):")
for reserve in (192_000, 320_000):
    dmax = (TARGET_BITS / 8 - OVERHEAD) / ((MIN_BPS + reserve) / 8)
    print(f"  reservasi {reserve//1000}kbps → ±{dmax/60:.1f} menit per bagian")

print()
print("Pembanding preset lama (video saja): ringan 4.5Mbps × 178s =", round(4_500_000 / 8 * 178 / 1e6), "MB")
