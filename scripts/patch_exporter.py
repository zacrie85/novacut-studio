# Ganti blok renderJobFast lama dengan mesin antrean global per bagian (v1.0.17)
import io

P = "/home/z/my-project/src/lib/editor/exporter.ts"
src = io.open(P, encoding="utf-8").read()

START = "    /** MODE KILAT: render 1 video penuh — TIDAK menyentuh store timeline (aman paralel) */"
END = "    /** MODE KOMPATIBEL: jalur lama berurutan (rekam real-time via MediaRecorder) */"
i0 = src.index(START)
i1 = src.index(END)

NEW = r'''    // =====================================================================
    // v1.0.17 — ANTREAN GLOBAL PER BAGIAN (#7) + MESIN TURBO (#8)
    // Dulu: 1 film = 1 pekerjaan; bagian-bagiannya dirender BERGILIRAN sehingga
    // pekerja menganggur menunggu satu bagian panjang.
    // Kini: SEMUA bagian dari SEMUA film masuk SATU antrean kerja global;
    // pekerja menarik tugas selama anggaran RAM masih cukup — bagian film mana
    // pun bisa berjalan bersamaan. Setiap bagian dirender dengan MESIN TURBO
    // (WebCodecs murni + audio stream-copy) bila filmnya didukung; bila tidak,
    // bagian itu otomatis memakai mesin kilat lama. Satu bagian Turbo yang
    // gagal juga jatuh ke mesin lama — hasil tetap benar, batch tidak berhenti.
    // =====================================================================
    type PrepResult = {
      clip: Clip;
      tracks: Track[];
      ranges: { start: number; end: number }[];
      audio: AudioDecodeCache;
      tlSubs: SubSegment[];
      turbo: boolean;
      audioCopy: boolean;
    };
    const prepped = new Map<number, PrepResult>();
    /** bagian yang sudah tuntas per film (termasuk yang dilewati resume) */
    const segDone = new Map<number, Set<number>>();
    const failedSegs = new Map<number, number>();
    const segQueue: { vi: number; i: number }[] = [];
    let failedSegments = 0;
    /** terpakai RAM (MB): cache audio PCM film aktif + segmen berjalan */
    let ramUsed = 0;

    /** berat RAM cache audio PCM satu film (0 bila audio stream-copy) */
    const filmRamMB = (vi: number): number => {
      const pr = prepped.get(vi);
      if (!pr || (pr.turbo && pr.audioCopy)) return 0;
      return (jobs[vi]?.asset.duration || 0) * 0.19;
    };
    /** berat RAM satu segmen yang sedang dirender */
    const segRamMB = (vi: number, partLen: number): number => {
      const pr = prepped.get(vi);
      const streaming = !!s.exportDir && isDesktopFS();
      if (pr?.turbo) return 240 + partLen * 0.02; // decoder+encoder+kanvas
      return 150 + partLen * 0.19 + (streaming ? 0 : partLen * 1.125);
    };

    /** film tamat bila semua bagiannya sudah tuntas (render/skip/gagal) */
    const finishFilmIfDone = (vi: number, total: number) => {
      const done = segDone.get(vi);
      if (!done || done.size < total) return;
      filmActive.delete(vi);
      ramUsed -= filmRamMB(vi);
      if (ramUsed < 0) ramUsed = 0;
      jobProgress[vi] = 1;
      doneCount++;
      report();
      const fails = failedSegs.get(vi) || 0;
      const job = jobs[vi];
      if (fails > 0) {
        failedSegments += fails;
        markJob(job.origId, { status: "gagal", label: `${fails} bagian gagal ✗` });
      } else {
        markJob(job.origId, { status: "selesai", progress: 1, label: "Selesai ✓" });
        if (pl.soundDone) chime("film");
      }
      // bebaskan cache audio & catatan Turbo film ini SEKARANG
      job.audio?.dispose();
      job.audio = undefined;
      releaseTurboParse(job.asset.url);
      pruneFinished();
    };

    const markSegDone = (vi: number, i: number, total: number) => {
      const done = segDone.get(vi) ?? new Set<number>();
      done.add(i);
      segDone.set(vi, done);
      jobProgress[vi] = done.size / total;
      finishFilmIfDone(vi, total);
    };

    /** Siapkan satu film (LAZY di gilirannya): cek resume → cover/subtitle AI →
     * smart split → putuskan mesin → antrekan semua bagiannya ke antrean global */
    const prepFilm = async (job: BatchJob, vi: number): Promise<void> => {
      const jid = job.origId;
      markJob(jid, { status: "jalan", progress: 0, label: "Menyiapkan..." });
      const direct = s.exportDir && isDesktopFS() ? { dir: s.exportDir } : null;
      const { clip, tracks } = buildBatchClip(job);
      let ranges = rangesFor(clip);
      jobParts[vi] = ranges.length;
      const done = new Set<number>();
      segDone.set(vi, done);
      // ===== v1.0.16: RESUME BATCH — bagian yang filenya sudah ada dilewati
      // SEBELUM analisis berat (cover/subtitle AI) =====
      if (direct && pl.skipExisting !== false && fast) {
        const ext = fast.ext;
        markJob(jid, { label: "Memeriksa file yang sudah ada..." });
        const have: { i: number; size: number; path?: string }[] = [];
        for (let i = 0; i < ranges.length; i++) {
          const nm = `${slugify(job.title)}-${slugify(partLabel(pl.labelStyle, i + 1, ranges.length, true))}${ext}`;
          const sz = await fileSizeInDir(direct.dir, nm);
          if (sz >= 1024) have.push({ i, size: sz, path: `${direct.dir}/${nm}` });
        }
        const addResult = (h: { i: number; size: number; path?: string }) => {
          useEditor.getState().addExportResult({
            id: uid("exp"),
            name: `${slugify(job.title)}-${slugify(partLabel(pl.labelStyle, h.i + 1, ranges.length, true))}${ext}`,
            url: "",
            size: h.size,
            part: h.i + 1,
            total: ranges.length,
            duration: Math.max(0.1, ranges[h.i].end - ranges[h.i].start),
            savedPath: h.path,
          });
        };
        if (have.length === ranges.length) {
          for (const h of have) addResult(h);
          for (let i = 0; i < ranges.length; i++) done.add(i);
          finishFilmIfDone(vi, ranges.length);
          markJob(jid, { label: "Sudah ada — dilewati ✓" });
          return;
        }
        if (have.length) {
          for (const h of have) {
            addResult(h);
            done.add(h.i);
          }
          markJob(jid, { label: `${have.length}/${ranges.length} bagian sudah ada — lanjut sisanya` });
        }
      }
      await prepJob(job, jid);
      // v1.0.14: cache audio MILIK film ini — SEMUA bagian split memakai ulang
      const audio = new AudioDecodeCache(new OfflineAudioContext(1, 1, 48000));
      job.audio = audio;
      // ===== v1.0.16: SMART SPLIT — geser tiap batas ke jeda sunyi audio =====
      if (pl.smartSplit && ranges.length > 1) {
        markJob(jid, { label: "Mencari jeda sunyi (audio)..." });
        try {
          const asrc = await audio.get(job.asset.id, job.asset.url);
          const sr = asrc.sampleRate || 48000;
          if (asrc.mono && asrc.mono.length > sr) {
            ranges = adjustRangesToSilence(ranges, asrc.mono, sr, clip.speed, asrc.mono.length / sr);
          }
        } catch {
          /* analisis gagal — pakai pembagian rata biasa */
        }
      }
      const tlSubs = mapSubsToTimeline(job.subs, [clip]);
      // ===== keputusan mesin: sekali per film, bukan per bagian =====
      const chk = await turboEligible(job.asset);
      const turbo = !!chk.ok && clip.loopCount === 1;
      const audioCopy = turbo
        ? audioCopyAllowed({ clips: [clip], tracks, assets: [job.asset], project: { width: targetDims.width, height: targetDims.height } }, clip, job.asset)
        : false;
      prepped.set(vi, { clip, tracks, ranges, audio, tlSubs, turbo, audioCopy });
      if (turbo) {
        useEditor.getState().patchExportState({
          label: `${job.title} — mesin TURBO aktif (WebCodecs murni${audioCopy ? ", audio asli disalin" : ""})`,
        });
      } else if (chk.reason) {
        markJob(jid, { label: `Mode kilat (Turbo mati: ${chk.reason})` });
      }
      // antrekan bagian yang belum ada filenya — SATU ANTREAN UNTUK SEMUA FILM
      for (let i = 0; i < ranges.length; i++) {
        if (!done.has(i)) segQueue.push({ vi, i });
      }
    };

    /** Render SATU bagian — unit kerja antrean global. Mesin Turbo dulu;
     * bila gagal, bagian ini otomatis diulang dengan mesin kilat lama. */
    const renderSegment = async (vi: number, i: number) => {
      const pr = prepped.get(vi)!;
      const job = jobs[vi];
      const jid = job.origId;
      const r = pr.ranges[i];
      const total = pr.ranges.length;
      const partTxt = partLabel(pl.labelStyle, i + 1, total, true);
      const tick = makeTick();
      try {
        useEditor.getState().patchExportState({
          label: `${job.title} — ${partTxt} (${doneCount + 1}/${jobs.length} berjalan)`,
          batchIndex: vi,
          batchTotal: jobs.length,
        });
        markJob(jid, { label: total > 1 ? partTxt : "Merender..." });
        // cover bagian ini — asset LOKAL + CACHE (tanpa race store antar pekerja)
        let coverAssetId = job.coverAssetId;
        let assets = useEditor.getState().assets;
        if (job.frameTimes) {
          const cov = await makeCoverAssetCached(job.asset, job.frameTimes[i % job.frameTimes.length]);
          if (cov) {
            coverAssetId = cov.id;
            job.curCoverId = cov.id;
            assets = [...assets, cov];
          }
        }
        const cur = useEditor.getState();
        const srcState = {
          ...cur,
          clips: [pr.clip] as Clip[],
          tracks: pr.tracks,
          assets,
          cover: { ...cur.cover, coverAssetId },
          texts: { ...cur.texts, title: job.title, description: pl.description, labelStyle: pl.labelStyle },
        };
        const proj = buildSplitProject(srcState, i + 1, total, r.start, r.end, {
          persistText: pl.titleDuringVideo,
          subs: pr.tlSubs,
        });
        const rs = { clips: proj.clips, tracks: proj.tracks, assets: proj.assets, project: { width: targetDims.width, height: targetDims.height } };
        const direct = s.exportDir && isDesktopFS() ? { dir: s.exportDir } : null;
        const directSave = direct ? { dir: direct.dir, name: `${slugify(job.title)}-${slugify(partTxt)}` } : undefined;
        const bitrate = pl.quality === "ringan" ? 4_500_000 : pl.quality === "maksimal" ? 14_000_000 : 9_000_000;
        // geser cover — rumus SAMA dengan buildSplitProject
        const shift = s.includeCover && coverAssetId ? Math.max(2, Math.min(5, s.coverDuration)) : 0;
        const onProgress = (p: number) => {
          const frac = ((segDone.get(vi)?.size ?? 0) + p) / total;
          jobProgress[vi] = frac;
          tick(
            () => {
              report();
              markJob(jid, { progress: frac });
            },
            p >= 1,
          );
        };
        let res: { blob: Blob; ext: ".mp4" | ".webm"; savedPath?: string; size?: number; mime: string };
        if (pr.turbo) {
          try {
            const t = await exportSegmentTurbo({
              rs,
              clip: proj.clips.find((c) => c.kind === "video")!,
              asset: job.asset,
              start: r.start,
              end: r.end,
              shift,
              bitrate,
              ...(directSave ? { directSave } : {}),
              audioCache: pr.audio,
              audioCopy: pr.audioCopy,
              onProgress,
            });
            res = t;
          } catch (e) {
            // Turbo gagal untuk bagian ini — mesin kilat lama mengerjakan bagian ini
            console.warn(`Turbo gagal (${partTxt}) — pakai mesin kilat lama:`, e);
            res = await exportRangeFast({ start: 0, end: proj.duration, rs, audioCache: pr.audio, bitrate, ...(directSave ? { directSave } : {}), onProgress });
          }
        } else {
          res = await exportRangeFast({ start: 0, end: proj.duration, rs, audioCache: pr.audio, bitrate, ...(directSave ? { directSave } : {}), onProgress });
        }
        await blobResult(res.blob, `${slugify(job.title)}-${slugify(partTxt)}${res.ext}`, i + 1, total, proj.duration, res.savedPath, res.size);
        markSegDone(vi, i, total);
      } catch (e) {
        console.error(`Export gagal: ${job.title} ${partTxt}`, e);
        failedSegs.set(vi, (failedSegs.get(vi) || 0) + 1);
        const m = e instanceof Error ? e.message : "error";
        markJob(jid, { label: `${partTxt} gagal ✗ (${m})` });
        markSegDone(vi, i, total); // tetap dihitung tuntas agar film bisa tamat
      }
    };

    /** Penjadwal antrean global: prep film (maks 2 bersamaan, kerja AI/IO) +
     * segmen (maks 5 bersamaan & sesuai anggaran RAM ~1,5 GB). */
    const runTurboQueue = async (): Promise<number> => {
      const RAM_BUDGET_MB = 1500;
      const MAX_CONC = 5;
      const PREP_CONC = Math.min(2, Math.max(1, jobs.length));
      let prepNext = 0;
      let prepRunning = 0;
      let segRunning = 0;
      await new Promise<void>((resolve) => {
        let settled = false;
        const pump = () => {
          if (settled) return;
          // mulai prep film berikutnya
          while (prepRunning < PREP_CONC && prepNext < jobs.length) {
            const vi = prepNext++;
            prepRunning++;
            filmActive.add(vi);
            void prepFilm(jobs[vi], vi)
              .catch((e) => {
                console.error("Persiapan film gagal:", jobs[vi].title, e);
                failedSegs.set(vi, (failedSegs.get(vi) || 0) + 1);
                const total = Math.max(1, jobParts[vi] || 1);
                const done = segDone.get(vi) ?? new Set<number>();
                for (let i = 0; i < total; i++) done.add(i);
                segDone.set(vi, done);
                markJob(jobs[vi].origId, { label: `Gagal: ${e instanceof Error ? e.message : "error"}` });
                finishFilmIfDone(vi, total);
              })
              .finally(() => {
                prepRunning--;
                ramUsed += filmRamMB(vi);
                pump();
              });
          }
          // tarik segmen dari antrean selama anggaran masih cukup
          while (segQueue.length && segRunning < MAX_CONC) {
            const t = segQueue[0];
            const pr = prepped.get(t.vi);
            if (!pr) break; // film belum selesai disiapkan — tunggu
            const w = segRamMB(t.vi, Math.max(0.1, pr.ranges[t.i].end - pr.ranges[t.i].start));
            if (segRunning > 0 && ramUsed + w > RAM_BUDGET_MB) break;
            segQueue.shift();
            ramUsed += w;
            segRunning++;
            void renderSegment(t.vi, t.i).finally(() => {
              segRunning--;
              ramUsed -= w;
              if (ramUsed < 0) ramUsed = 0;
              pump();
            });
          }
          if (prepRunning === 0 && segRunning === 0 && prepNext >= jobs.length && segQueue.length === 0) {
            settled = true;
            resolve();
          }
        };
        pump();
      });
      return failedSegments;
    };

'''

src = src[:i0] + NEW + src[i1:]

# renderJobLegacy: buang running.add/delete (variabel sudah tidak ada)
src = src.replace("""      const jid = job.origId;
      running.add(job);
      try {
        markJob(jid, { status: "jalan", progress: 0, label: "Menyiapkan..." });
        await prepJob(job, jid);""", """      const jid = job.origId;
      try {
        markJob(jid, { status: "jalan", progress: 0, label: "Menyiapkan..." });
        await prepJob(job, jid);""")
src = src.replace("""      } finally {
        running.delete(job);
        // bersihkan elemen antar video pada mode berurutan
        engine.pruneElements();
      }""", """      } finally {
        // bersihkan elemen antar video pada mode berurutan
        engine.pruneElements();
      }""")

# dispatch: ganti runPool dengan antrean global
OLD_DISPATCH_START = "    if (fast) {\n      // v1.0.14: paralel OTOMATIS disesuaikan estimasi memori"
i2 = src.index(OLD_DISPATCH_START)
i3 = src.index("  } catch (e) {\n    const msg = e instanceof Error ? e.message : \"error\";\n    console.error(\"Batch export gagal:\", e);")
NEW_DISPATCH = """    if (fast) {
      // v1.0.17: ANTREAN GLOBAL PER BAGIAN — semua bagian dari seluruh batch
      // dikerjakan bersamaan sesuai anggaran RAM (maks 5 bagian berjalan).
      failedCount = await runTurboQueue();
    } else {
      for (let vi = 0; vi < jobs.length; vi++) {
        await renderJobLegacy(jobs[vi], vi);
      }
    }
"""
src = src[:i2] + NEW_DISPATCH + src[i3:]

io.open(P, "w", encoding="utf-8").write(src)
print("OK — blok diganti. Panjang baru:", len(src))
