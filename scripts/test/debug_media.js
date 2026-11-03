(async () => {
  const out = {};
  // 1) audio decode test
  try {
    const ab = await (await fetch("/nv-test-video.mp4")).arrayBuffer();
    const ctx = new OfflineAudioContext(1, 1, 48000);
    const buf = await ctx.decodeAudioData(ab);
    const ch = buf.getChannelData(0);
    let rms = 0, cnt = 0;
    for (let i = 0; i < ch.length; i += 97) { rms += ch[i] * ch[i]; cnt++; }
    out.audio = { dur: +buf.duration.toFixed(2), rate: buf.sampleRate, rms: +Math.sqrt(rms / cnt).toFixed(4) };
  } catch (e) { out.audio = "FAIL: " + e.message; }
  // 2) video element draw test
  try {
    const v = document.createElement("video");
    v.src = "/nv-test-video.mp4"; v.preload = "auto"; v.muted = true;
    await new Promise((r) => { v.onloadeddata = r; v.onerror = () => r(null); setTimeout(r, 6000); });
    out.readyState = v.readyState;
    out.videoWidth = v.videoWidth;
    v.currentTime = 2;
    await new Promise((r) => { v.onseeked = r; setTimeout(r, 4000); });
    const c = document.createElement("canvas"); c.width = 80; c.height = 45;
    const cx = c.getContext("2d");
    cx.drawImage(v, 0, 0, 80, 45);
    const d = cx.getImageData(0, 0, 80, 45).data;
    let mean = 0; const n = d.length / 4;
    for (let i = 0; i < d.length; i += 4) mean += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    out.frameMean = +(mean / n).toFixed(1);
  } catch (e) { out.video = "FAIL: " + e.message; }
  return JSON.stringify(out);
})()
