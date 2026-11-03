// Uji unit demuxer MP4 — bandingkan hasil parse dengan ffprobe.
// Jalankan: bun scripts/test_mp4demux.ts
import { parseMp4, keyframeIndexAt, firstSampleAtOrAfter, headIsMp4 } from "../src/lib/editor/mp4Demux";

async function main() {
  for (const f of ["/tmp/turbotest/test_tail.mp4", "/tmp/turbotest/test_fast.mp4", "/tmp/turbotest/test_hevc.mp4"]) {
    const blob = await Bun.file(f);
    const head = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
    const info = await parseMp4(blob);
    console.log(`\n=== ${f} (${(info.size / 1e6).toFixed(1)} MB, mp4=${headIsMp4(head)}) ===`);
    for (const tr of info.tracks) {
      const s = tr.samples;
      const syncCount = s.filter((x) => x.sync).length;
      const first = s[0];
      const last = s[s.length - 1];
      const descLen = tr.description?.length ?? 0;
      const descHex = Array.from(tr.description?.slice(0, 6) ?? []).map((b) => b.toString(16).padStart(2, "0")).join(" ");
      console.log(
        `${tr.kind}: codec=${tr.codec} mux=${tr.videoMux ?? "-"} ${tr.width}x${tr.height} ch=${tr.channels} sr=${tr.sampleRate} ts=${tr.timescale} dur=${tr.duration.toFixed(2)}s fps=${tr.fps.toFixed(2)}`
      );
      console.log(
        `  sampel=${s.length} sync=${syncCount} desc=${descLen}B [${descHex}] pertama(dts=${first.dts.toFixed(3)},cts=${first.cts.toFixed(3)},sync=${first.sync}) terakhir(cts=${last.cts.toFixed(3)})`
      );
      // sanity: cts monoton naik (dengan B-frame dts tetap naik)
      let monoDts = true;
      for (let i = 1; i < s.length; i++) if (s[i].dts < s[i - 1].dts) { monoDts = false; break; }
      console.log(`  dts monoton=${monoDts}`);
      // uji pencarian keyframe
      const kf10 = keyframeIndexAt(tr, 10);
      console.log(`  keyframe@10s: idx=${kf10} cts=${s[kf10].cts.toFixed(3)} sync=${s[kf10].sync}`);
      const fs5 = firstSampleAtOrAfter(tr, 5);
      console.log(`  firstSample>=5s: idx=${fs5} cts=${s[fs5].cts.toFixed(3)}`);
    }
  }
}
await main();
