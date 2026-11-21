#!/usr/bin/env python3
"""Verifikasi preset 'cepat' v1.0.27: rumus bitrate & estimasi ukuran file.
Rumus (exporter.ts): bitrate = min(4.5Mbps, max(600kbps, (47MB*8 - 192kbps*dur)/dur))
Total ukuran = video(bitrate) + audio(192kbps re-encode / 128kbps Turbo) + overhead kontainer ~1MB."""

TARGET_BITS = 47_000_000 * 8
AUDIO_BPS = 192_000
MAX_BPS, MIN_BPS = 4_500_000, 600_000
OVERHEAD = 1_000_000  # ~1 MB kontainer/moov/cover

def cepat_bitrate(dur):
    return round(min(MAX_BPS, max(MIN_BPS, (TARGET_BITS - AUDIO_BPS * dur) / dur)))

print(f"{'durasi':>9} | {'bitrate':>9} | video MB | audio MB | total MB | ≤50MB?")
for dur in [30, 60, 83, 90, 120, 178, 240, 300, 475, 600, 900]:
    b = cepat_bitrate(dur)
    video = b / 8 * dur / 1e6
    audio = AUDIO_BPS / 8 * dur / 1e6
    total = video + audio + OVERHEAD / 1e6
    print(f"{dur:>7}s | {b:>7,} | {video:8.1f} | {audio:8.1f} | {total:8.1f} | {'YA' if total <= 50 else 'TIDAK (>8 menit per bagian)'}")

print()
print("Pembanding preset lama (video saja): ringan 4.5Mbps × 178s =", round(4_500_000 / 8 * 178 / 1e6), "MB")
