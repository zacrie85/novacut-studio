// NOVACUT Studio - Parser subtitle manual (.srt / .vtt) — v1.0.30
//
// Dipakai menu Teks (mode sederhana): pengguna memilih file subtitle, cue-nya
// dipetakan ke waktu SUMBER video (bentuk sama dgn SubSegment hasil Whisper)
// lalu mengalir lewat jalur burn-in subtitle yang sudah ada (klip teks bawah).
// Tahan BOM UTF-8, CRLF, penomoran blok, tag format <i>/<font>, tag ASS {\an8},
// dan cue settings WebVTT setelah timestamp.

import type { SubSegment } from "./subCore";

/** "HH:MM:SS,mmm" / "HH:MM:SS.mmm" / "MM:SS,mmm" → detik (null bila tak cocok) */
function tsToSec(ts: string): number | null {
  const m = ts.trim().match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/);
  if (!m) return null;
  const h = m[1] ? parseInt(m[1], 10) * 3600 : 0;
  return h + parseInt(m[2], 10) * 60 + parseInt(m[3], 10) + parseInt(m[4].padEnd(3, "0"), 10) / 1000;
}

/** buang tag format (<i>, <font ...>, {\an8}) — sisakan teks polos */
function cleanText(lines: string[]): string {
  return lines
    .join("\n")
    .replace(/\{\\[^}]*\}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .trim();
}

/** Parse isi file .srt atau .vtt → daftar cue terurut waktu (detik, sumber video). */
export function parseSrtOrVtt(raw: string): SubSegment[] {
  if (!raw) return [];
  const text = raw.replace(/^\uFEFF/, ""); // BOM UTF-8
  const out: SubSegment[] = [];
  for (const block of text.split(/\n{2,}/)) {
    const lines = block
      .split("\n")
      .map((l) => l.replace(/\r$/, ""))
      .filter((l) => l.trim().length > 0);
    if (!lines.length) continue;
    if (/^WEBVTT/i.test(lines[0]) || /^(NOTE|STYLE|REGION)\b/i.test(lines[0])) continue;
    const ti = lines.findIndex((l) => l.includes("-->") || l.includes("->"));
    if (ti < 0) continue;
    const parts = lines[ti].split(/-->|->/);
    if (parts.length < 2) continue;
    const t0 = tsToSec(parts[0]);
    // VTT bisa menyisipkan cue settings setelah timestamp akhir — ambil token pertama
    const t1 = tsToSec(parts[1].trim().split(/\s+/)[0] ?? "");
    if (t0 === null || t1 === null || t1 <= t0) continue;
    const body = cleanText(lines.slice(ti + 1));
    if (!body) continue;
    out.push({ start: Math.max(0, t0), end: t1, text: body.slice(0, 2000) });
    if (out.length >= 20000) break; // pengaman memori
  }
  return out.sort((a, b) => a.start - b.start || a.end - b.end);
}
