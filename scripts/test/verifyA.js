(async () => {
  const s = window.__novacutTest.useEditor.getState().exportState;
  const url = s.results[0].url;
  const v = document.createElement("video");
  v.src = url; v.muted = true;
  await new Promise((r) => { v.onloadedmetadata = r; v.onerror = () => r(null); setTimeout(r, 4000); });
  const dur = v.duration;
  v.currentTime = 2;
  await new Promise((r) => { v.onseeked = r; setTimeout(r, 3000); });
  const c = document.createElement("canvas"); c.width = 160; c.height = 90;
  const cx = c.getContext("2d"); cx.drawImage(v, 0, 0, 160, 90);
  const d = cx.getImageData(0, 0, 160, 90).data;
  let sum = 0, sum2 = 0, sat = 0; const n = d.length / 4;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    sum += y; sum2 += y * y;
    sat += Math.max(Math.abs(d[i] - d[i + 1]), Math.abs(d[i + 1] - d[i + 2]), Math.abs(d[i] - d[i + 2]));
  }
  const mean = sum / n; const sd = Math.sqrt(Math.max(0, sum2 / n - mean * mean)); const satAvg = sat / n;
  const ab = await (await fetch(url)).arrayBuffer();
  const actx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = await actx.decodeAudioData(ab);
  let rms = 0, cnt = 0; const ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i += 97) { rms += ch[i] * ch[i]; cnt++; }
  rms = Math.sqrt(rms / Math.max(1, cnt));
  return JSON.stringify({ dur: +dur.toFixed(2), mean: +mean.toFixed(1), sd: +sd.toFixed(1), sat: +satAvg.toFixed(1), audioRate: buf.sampleRate, audioDur: +buf.duration.toFixed(2), rms: +rms.toFixed(4), name: s.results[0].name });
})()
