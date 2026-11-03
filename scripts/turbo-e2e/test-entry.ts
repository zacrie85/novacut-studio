// Uji E2E mesin Turbo di Electron (tanpa UI): decode WebCodecs murni +
// compose + encode + tulis disk via IPC streaming — dua bagian split.
import { audioCopyAllowed, exportSegmentTurbo, turboEligible } from "../../src/lib/editor/turboExport";
import type { Clip, MediaAsset, Track } from "../../src/lib/editor/types";
import type { RenderState } from "../../src/lib/editor/engine";

async function main() {
  const res: Record<string, unknown> = { ok: false, steps: [] as unknown[] };
  const steps = res.steps as unknown[];
  const t0 = performance.now();
  try {
    // muat file sumber (film uji 20 detik)
    const resp = await fetch("file:///tmp/turbotest/test_tail.mp4");
    const blob = await resp.blob();
    const file = new File([blob], "test_tail.mp4", { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    const asset: MediaAsset = { id: "as-test", name: "test_tail.mp4", type: "video", url, duration: 20, width: 640, height: 360, file };
    const chk = await turboEligible(asset);
    steps.push({ step: "turboEligible", ...chk });
    if (!chk.ok) throw new Error("tidak eligible: " + chk.reason);

    // cover (kanvas → dataURL)
    const cc = document.createElement("canvas");
    cc.width = 640;
    cc.height = 360;
    const cx = cc.getContext("2d")!;
    const g = cx.createLinearGradient(0, 0, 640, 360);
    g.addColorStop(0, "#0f172a");
    g.addColorStop(1, "#0e7490");
    cx.fillStyle = g;
    cx.fillRect(0, 0, 640, 360);
    cx.fillStyle = "#fff";
    cx.font = "900 44px sans-serif";
    cx.textAlign = "center";
    cx.fillText("NOVACUT TURBO TEST", 320, 190);
    const cover: MediaAsset = { id: "as-cover", name: "cover", type: "image", url: cc.toDataURL("image/png"), duration: 0, width: 640, height: 360 };

    const shift = 3;
    const segs: [number, number][] = [
      [0, 10],
      [10, 20],
    ];
    for (let si = 0; si < segs.length; si++) {
      const [r0, r1] = segs[si];
      const vTrack: Track = { id: "tv", kind: "video", name: "V", muted: false, hidden: false };
      const tTrack: Track = { id: "tt", kind: "text", name: "T", muted: false, hidden: false };
      const videoClip: Clip = { id: "cl-v", trackId: "tv", kind: "video", assetId: asset.id, start: shift, duration: r1 - r0, inPoint: r0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0, effects: [], zoom: 1, panX: 0, panY: 0 };
      const coverClip: Clip = { id: "cl-c", trackId: "tv", kind: "image", assetId: cover.id, start: 0, duration: shift, inPoint: 0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0.3, effects: ["fx-kenburns"], zoom: 1, panX: 0, panY: 0, label: "Cover" };
      const titleClip: Clip = { id: "cl-t", trackId: "tt", kind: "text", start: 0.15, duration: shift - 0.25, inPoint: 0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0, effects: [], zoom: 1, panX: 0, panY: 0, text: { content: "Judul Uji Turbo", sub: "Bagian " + (si + 1), size: 0.06, subSize: 0.03, color: "#ffffff", font: "condensed", anim: "slam", pos: "center", bg: "gradient", stroke: true } };
      const partClip: Clip = { id: "cl-p", trackId: "tt", kind: "text", start: shift + 0.4, duration: r1 - r0 - 0.4, inPoint: 0, speed: 1, loopCount: 1, volume: 1, fadeIn: 0, fadeOut: 0, effects: [], zoom: 1, panX: 0, panY: 0, text: { content: "Part " + (si + 1), size: 0.05, color: "#ffffff", font: "condensed", anim: "slam", pos: "bottom", bg: "bar", stroke: true } };
      const rs: RenderState = { clips: [coverClip, videoClip, titleClip, partClip], tracks: [vTrack, tTrack], assets: [asset, cover], project: { width: 640, height: 360 } };
      const copy = audioCopyAllowed(rs, videoClip, asset);
      const t1 = performance.now();
      let lastP = 0;
      const out = await exportSegmentTurbo({
        rs,
        clip: videoClip,
        asset,
        start: r0,
        end: r1,
        shift,
        bitrate: 9_000_000,
        directSave: { dir: "/tmp/turbotest/out", name: `turbo-seg${si + 1}` },
        audioCopy: copy,
        onProgress: (p) => {
          if (p - lastP >= 0.5) {
            lastP = p;
            console.log(`seg${si + 1} progress ${p.toFixed(2)}`);
          }
        },
      });
      steps.push({ step: `seg${si + 1}`, ms: Math.round(performance.now() - t1), savedPath: out.savedPath, size: out.size, audioCopy: copy });
    }
    res.ok = true;
    res.ms = Math.round(performance.now() - t0);
  } catch (e) {
    res.error = String((e as Error)?.stack || e);
  }
  console.log("TURBO_RESULT " + JSON.stringify(res));
}
main();
