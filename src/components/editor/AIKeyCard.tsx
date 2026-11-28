"use client";
// v1.0.36: Kartu Kunci API Poster AI — pengguna menempel kunci API Z.ai miliknya
// (disimpan lokal di PC, tak dikirim ke mana pun selain api.z.ai).
// v1.0.38: PENYEDIA BISA DIPILIH — Z.ai (glm-image, per poster ±Rp250) ATAU
// Cloudflare Workers AI (GRATIS: 10.000 Neuron/hari ≈ 170 poster, tanpa kartu) +
// toggle kualitas HD/Hemat untuk jalur Z.ai. Semua kredensial hanya di PC lokal.
// v1.0.47: penyedia ke-3 Mage (mage.space) — gpt-image, ±9 Gems ≈ Rp145/gambar.
// v1.0.55: penyedia ke-4 MiniMax H3 (platform.minimax.io) — mesin "Minimax H3"
// yang sama dengan di mivo.com/generate/studio, via API resminya sendiri.
import { useEffect, useState } from "react";

type Provider = "zai" | "cloudflare" | "mage" | "minimax" | "mivo";
type Quality = "hd" | "standard";

export default function AIKeyCard() {
  const [mounted, setMounted] = useState(false);
  const [provider, setProvider] = useState<Provider>("zai");
  const [quality, setQuality] = useState<Quality>("hd");
  const [hasKey, setHasKey] = useState(false);
  const [hasCF, setHasCF] = useState(false);
  const [hasMage, setHasMage] = useState(false);
  const [hasMiniMax, setHasMiniMax] = useState(false);
  const [val, setVal] = useState("");
  const [cfAcc, setCfAcc] = useState("");
  const [cfTok, setCfTok] = useState("");
  const [mageKey, setMageKey] = useState("");
  const [miniKey, setMiniKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    void window.novacutAI?.getAIKeyStatus?.().then((s) => setHasKey(!!s?.hasKey));
    void window.novacutAI?.getCFKeyStatus?.().then((s) => setHasCF(!!s?.hasKey));
    void window.novacutAI?.getMageKeyStatus?.().then((s) => setHasMage(!!s?.hasKey));
    void window.novacutAI?.getMiniMaxKeyStatus?.().then((s) => setHasMiniMax(!!s?.hasKey));
    void window.novacutAI?.getAIPrefs?.().then((p) => {
      if (p?.provider === "cloudflare") setProvider("cloudflare");
      if (p?.provider === "mage") setProvider("mage");
      if (p?.provider === "minimax") setProvider("minimax");
      // v1.0.61: pill Mivo kini dipulihkan saat app dibuka (dulu tidak ada di
      // sini → tampilan pil kembali ke Z.ai padahal jalur Mivo tersimpan)
      if (p?.provider === "mivo") setProvider("mivo");
      if (p?.quality === "standard") setQuality("standard");
    });
  }, []);

  // v1.0.60: model Mivo (film → FLUX Klein / musik → Minimax H3) + status langkah
  // otomasi yang di-push dari main process saat Studio Mivo dalam app berjalan
  const [mivoModel, setMivoModel] = useState<"film" | "musik">(() => {
    try {
      return localStorage.getItem("novacut.mivoModel") === "musik" ? "musik" : "film";
    } catch {
      return "film";
    }
  });
  const [statusMivo, setStatusMivo] = useState<string[]>([]);
  useEffect(() => {
    window.novacutAI?.onMivoStudioStatus?.((d) => {
      if (!d?.pesan) return;
      setStatusMivo((prev) => [`${d.ok ? "✓" : "⚠"} ${d.pesan}`, ...prev].slice(0, 6));
    });
  }, []);

  if (!mounted || !window.novacutAI?.setAIKey) return null;

  const gantiProvider = (p: Provider) => {
    setProvider(p);
    setMsg(null);
    void window.novacutAI?.setAIPrefs?.({ provider: p });
  };
  const gantiKualitas = (q: Quality) => {
    setQuality(q);
    void window.novacutAI?.setAIPrefs?.({ quality: q });
    setMsg({ ok: true, text: q === "standard" ? "Kualitas Hemat aktif — poster digambar lebih cepat (±5-10 detik) via Z.ai." : "Kualitas HD aktif — poster paling detail (±20 detik) via Z.ai." });
  };
  const simpan = async () => {
    if (busy || !val.trim()) return;
    setBusy(true);
    setMsg(null);
    const r = await window.novacutAI?.setAIKey?.(val.trim());
    setBusy(false);
    if (r?.ok) {
      setHasKey(true);
      setVal("");
      setMsg({ ok: true, text: "Kunci Z.ai tersimpan di PC ini. Poster AI kini memakai GLM-Image (harga ±Rp250/poster)." });
    } else {
      setMsg({ ok: false, text: r?.error || "Gagal menyimpan kunci." });
    }
  };
  const tes = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const r = await window.novacutAI?.testAIKey?.();
    setBusy(false);
    setMsg(r?.ok ? { ok: true, text: "Koneksi Z.ai OK — kunci valid (tes pakai model gratis, tak makan saldo)." } : { ok: false, text: r?.error || "Koneksi gagal." });
  };
  const hapus = async () => {
    if (busy) return;
    setBusy(true);
    await window.novacutAI?.clearAIKey?.();
    setBusy(false);
    setHasKey(false);
    setMsg({ ok: true, text: "Kunci Z.ai dihapus." });
  };
  const simpanCF = async () => {
    if (busy || !cfAcc.trim() || !cfTok.trim()) return;
    setBusy(true);
    setMsg(null);
    const r = await window.novacutAI?.setCFKey?.(cfAcc.trim(), cfTok.trim());
    setBusy(false);
    if (r?.ok) {
      setHasCF(true);
      setCfAcc("");
      setCfTok("");
      setMsg({ ok: true, text: "Kredensial Cloudflare tersimpan di PC ini. Poster kini GRATIS (kuota 10.000 Neuron/hari ≈ 170 poster)." });
    } else {
      setMsg({ ok: false, text: r?.error || "Gagal menyimpan kredensial." });
    }
  };
  const tesCF = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const r = await window.novacutAI?.testCFKey?.();
    setBusy(false);
    setMsg(r?.ok ? { ok: true, text: "Koneksi Cloudflare OK — jalur poster GRATIS siap (tes tanpa memakai kuota)." } : { ok: false, text: r?.error || "Koneksi gagal." });
  };
  const hapusCF = async () => {
    if (busy) return;
    setBusy(true);
    await window.novacutAI?.clearCFKey?.();
    setBusy(false);
    setHasCF(false);
    setMsg({ ok: true, text: "Kredensial Cloudflare dihapus." });
  };
  // v1.0.47: Mage (mage.space) — kunci mage_sk_, per gambar ±9 Gems ≈ Rp145
  const simpanMage = async () => {
    if (busy || !mageKey.trim()) return;
    setBusy(true);
    setMsg(null);
    const r = await window.novacutAI?.setMageKey?.(mageKey.trim());
    setBusy(false);
    if (r?.ok) {
      setHasMage(true);
      setMageKey("");
      setMsg({ ok: true, text: "Kunci Mage tersimpan di PC ini. Poster kini via gpt-image-2.5-flare (±9 Gems ≈ Rp145/gambar)." });
    } else {
      setMsg({ ok: false, text: r?.error || "Gagal menyimpan kunci." });
    }
  };
  const tesMage = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const r = await window.novacutAI?.testMageKey?.();
    setBusy(false);
    setMsg(r?.ok ? { ok: true, text: "Koneksi Mage OK — kunci valid (tes tanpa memakai Gems)." } : { ok: false, text: r?.error || "Koneksi gagal." });
  };
  const hapusMage = async () => {
    if (busy) return;
    setBusy(true);
    await window.novacutAI?.clearMageKey?.();
    setBusy(false);
    setHasMage(false);
    setMsg({ ok: true, text: "Kunci Mage dihapus." });
  };
  // v1.0.55: MiniMax H3 (platform.minimax.io) — mesin "Minimax H3" di mivo.com
  const simpanMiniMax = async () => {
    if (busy || !miniKey.trim()) return;
    setBusy(true);
    setMsg(null);
    const r = await window.novacutAI?.setMiniMaxKey?.(miniKey.trim());
    setBusy(false);
    if (r?.ok) {
      setHasMiniMax(true);
      setMiniKey("");
      setMsg({ ok: true, text: "Kunci MiniMax tersimpan di PC ini. Poster kini via MiniMax H3 — mesin yang sama dengan \"Minimax H3\" di mivo.com." });
    } else {
      setMsg({ ok: false, text: r?.error || "Gagal menyimpan kunci." });
    }
  };
  const tesMiniMax = async () => {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    const r = await window.novacutAI?.testMiniMaxKey?.();
    setBusy(false);
    setMsg(r?.ok ? { ok: true, text: "Koneksi MiniMax OK — kunci valid (tes via daftar model, tanpa memakai kredit)." } : { ok: false, text: r?.error || "Koneksi gagal." });
  };
  const hapusMiniMax = async () => {
    if (busy) return;
    setBusy(true);
    await window.novacutAI?.clearMiniMaxKey?.();
    setBusy(false);
    setHasMiniMax(false);
    setMsg({ ok: true, text: "Kunci MiniMax dihapus." });
  };

  const pill = (aktif: boolean) =>
    `rounded-md px-2 py-1 text-[11px] font-semibold transition ${aktif ? "border border-cyan-400/60 bg-cyan-500/15 text-cyan-100" : "border border-white/10 bg-white/[0.03] text-gray-400 hover:text-gray-200"}`;

  return (
    <div className="space-y-1.5 rounded-md border border-cyan-500/25 bg-cyan-500/[0.06] p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/90">Mesin Poster AI</div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${provider === "cloudflare" ? (hasCF ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300") : provider === "mage" ? (hasMage ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-gray-400") : provider === "minimax" ? (hasMiniMax ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-gray-400") : provider === "mivo" ? "bg-emerald-500/15 text-emerald-300" : hasKey ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-gray-400"}`}>
          {provider === "cloudflare" ? (hasCF ? "● CF siap (gratis)" : "○ CF belum diisi") : provider === "mage" ? (hasMage ? "● Mage siap (±Rp145)" : "○ Mage belum ada kunci") : provider === "minimax" ? (hasMiniMax ? "● MiniMax siap (mesin Mivo)" : "○ MiniMax belum ada kunci") : provider === "mivo" ? "● Jembatan Mivo siap (QRIS)" : hasKey ? "● Kunci Z.ai aktif" : "○ Z.ai belum ada kunci"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => gantiProvider("zai")} className={pill(provider === "zai")}>Z.ai (±Rp250/poster)</button>
        <button onClick={() => gantiProvider("cloudflare")} className={pill(provider === "cloudflare")}>Cloudflare (GRATIS)</button>
        <button onClick={() => gantiProvider("mage")} className={pill(provider === "mage")}>Mage (±Rp145/poster)</button>
        <button onClick={() => gantiProvider("minimax")} className={pill(provider === "minimax")}>MiniMax H3 (mesin Mivo)</button>
        <button onClick={() => gantiProvider("mivo")} className={pill(provider === "mivo")}>Mivo (QRIS · semi-otomatis)</button>
      </div>

      {provider === "zai" ? (
        hasKey ? (
          <>
            <div className="text-[10px] leading-relaxed text-gray-500">
              Poster digambar <b className="text-cyan-300/90">AI publik GLM-Image via Z.ai</b> — adegan videomu dibaca AI lalu dilukis ulang jadi poster sinematik. Kualitas:
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => gantiKualitas("hd")} className={pill(quality === "hd")}>HD (terbaik, ±20 dtk)</button>
              <button onClick={() => gantiKualitas("standard")} className={pill(quality === "standard")}>Hemat (cepat, 5-10 dtk)</button>
            </div>
            <div className="flex gap-1.5">
              <button onClick={tes} disabled={busy} className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[11px] font-medium text-cyan-100 transition hover:border-cyan-400 disabled:opacity-50">
                {busy ? "Menguji…" : "Tes Koneksi"}
              </button>
              <button onClick={hapus} disabled={busy} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-gray-300 transition hover:border-red-500/40 disabled:opacity-50">
                Hapus Kunci
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-[10px] leading-relaxed text-gray-500">
              <b className="text-cyan-300/90">Bayar per pakai — ±Rp250/poster</b> (tanpa langganan; vision pembaca adegan GRATIS). Ikuti 4 langkah:
              <br /><b>1.</b> Buka <b>z.ai</b> → daftar/masuk akun (cukup email; kartu tidak wajib).
              <br /><b>2.</b> Klik ikon akun kanan-atas → <b>API Keys</b> → <b>Create API Key</b> → pilih <b>Standard API Key</b> → salin (hanya tampil sekali!).
              <br /><b>3.</b> Bila kredit belum ada: halaman <b>Billing</b> di z.ai → isi saldo (±Rp250 ≈ 1 poster; pembaca adegan gratis).
              <br /><b>4.</b> Tempel kunci di bawah → Simpan → Tes Koneksi → klik 🎨 Buat Ulang Poster.
            </div>
            <div className="flex gap-1.5">
              <input
                type="password"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void simpan()}
                placeholder="Tempel kunci API Z.ai (xxxx…)"
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-gray-200 placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none"
                aria-label="Kunci API Z.ai"
              />
              <button onClick={() => void simpan()} disabled={busy || !val.trim()} className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-1 text-[11px] font-semibold text-cyan-100 transition hover:border-cyan-400 disabled:opacity-50">
                Simpan
              </button>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => void window.novacutAI?.openAIKeyPage?.()}
                className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-100 transition hover:border-cyan-400"
              >
                🔑 Buka z.ai → API Keys ↗
              </button>
              <button onClick={tes} disabled={busy} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold text-gray-300 transition hover:border-white/25 disabled:opacity-50">
                {busy ? "Menguji…" : "Tes Koneksi"}
              </button>
            </div>
          </>
        )
      ) : provider === "mage" ? (
        !window.novacutAI?.setMageKey ? (
          <div className="text-[10px] leading-relaxed text-amber-300/80">
            Jalur Mage tersedia di NOVACUT Studio v1.0.47+ — update aplikasimu.
          </div>
        ) : hasMage ? (
          <>
            <div className="text-[10px] leading-relaxed text-gray-500">
              Poster via <b className="text-fuchsia-300/90">gpt-image-2.5-flare di mage.space</b> — frame videomu dikirim utuh (img2img), teks tetap ditulis aplikasi. Harga <b>±9 Gems ≈ Rp145/gambar</b> — bayar per gambar, tanpa langganan; generasi gagal dikembalikan otomatis.
            </div>
            <div className="flex gap-1.5">
              <button onClick={tesMage} disabled={busy} className="rounded-md border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-1 text-[11px] font-medium text-fuchsia-100 transition hover:border-fuchsia-400 disabled:opacity-50">
                {busy ? "Menguji…" : "Tes Koneksi"}
              </button>
              <button onClick={hapusMage} disabled={busy} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-gray-300 transition hover:border-red-500/40 disabled:opacity-50">
                Hapus Kunci
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-[10px] leading-relaxed text-gray-500">
              <b className="text-fuchsia-300/90">Bayar per gambar ±9 Gems ≈ Rp145</b> (1.000 Gems = $1 di paket standar; akun butuh 1 pembayaran pertama apa pun). Ikuti 4 langkah:
              <br /><b>1.</b> Buka <b>mage.space</b> → daftar/masuk akun.
              <br /><b>2.</b> Beli <b>Gem pack</b> (mis. $1 = 1.000 Gems ≈ ±110 gambar) — signup bonus Gems hanya berlaku di aplikasi Mage, bukan API.
              <br /><b>3.</b> Buka <b>API → API Keys</b> → <b>Create API Key</b> → salin kunci <b>mage_sk_…</b> (hanya tampil sekali!).
              <br /><b>4.</b> Tempel di bawah → Simpan → Tes Koneksi → klik 🎨 Buat Ulang Poster.
            </div>
            <div className="flex gap-1.5">
              <input
                type="password"
                value={mageKey}
                onChange={(e) => setMageKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void simpanMage()}
                placeholder="Tempel kunci Mage (mage_sk_…)"
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-gray-200 placeholder:text-gray-600 focus:border-fuchsia-500/50 focus:outline-none"
                aria-label="Kunci API Mage"
              />
              <button onClick={() => void simpanMage()} disabled={busy || !mageKey.trim()} className="rounded-md border border-fuchsia-500/40 bg-fuchsia-500/15 px-2 py-1 text-[11px] font-semibold text-fuchsia-100 transition hover:border-fuchsia-400 disabled:opacity-50">
                Simpan
              </button>
            </div>
            <button
              onClick={() => void window.novacutAI?.openMageAPI?.()}
              className="rounded-md border border-fuchsia-500/40 bg-fuchsia-500/10 px-2 py-1 text-[10px] font-semibold text-fuchsia-100 transition hover:border-fuchsia-400"
            >
              🔑 Buka mage.space → API Keys ↗
            </button>
          </>
        )
      ) : provider === "minimax" ? (
        !window.novacutAI?.setMiniMaxKey ? (
          <div className="text-[10px] leading-relaxed text-amber-300/80">
            Jalur MiniMax tersedia di NOVACUT Studio v1.0.55+ — update aplikasimu.
          </div>
        ) : hasMiniMax ? (
          <>
            <div className="text-[10px] leading-relaxed text-gray-500">
              Poster via <b className="text-orange-300/90">MiniMax H3 — mesin yang SAMA dengan &quot;Minimax H3&quot; di mivo.com</b>, lewat API resmi platform.minimax.io. Frame videomu dikirim sebagai referensi (img2img, seperti &quot;Add reference images&quot; di Mivo), prompt rewrite otomatis, teks tetap ditulis aplikasi. Bayar per token — perkiraan ±Rp100-500/poster 1K (cek tagihan di dashboard).
            </div>
            <div className="flex gap-1.5">
              <button onClick={tesMiniMax} disabled={busy} className="rounded-md border border-orange-500/40 bg-orange-500/10 px-2 py-1 text-[11px] font-medium text-orange-100 transition hover:border-orange-400 disabled:opacity-50">
                {busy ? "Menguji…" : "Tes Koneksi"}
              </button>
              <button onClick={hapusMiniMax} disabled={busy} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-gray-300 transition hover:border-red-500/40 disabled:opacity-50">
                Hapus Kunci
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-[10px] leading-relaxed text-gray-500">
              <b className="text-orange-300/90">Mesin &quot;Minimax H3&quot; dari mivo.com, via API resminya</b> — prompt rewrite otomatis (sama dgn di Mivo), referensi hingga 16 gambar, hasil 1K-4K. Ikuti 4 langkah:
              <br /><b>1.</b> Buka <b>platform.minimax.io</b> → daftar/masuk (Google atau email).
              <br /><b>2.</b> Menu <b>Billing/Top-up</b> → isi kredit (kartu internasional; QRIS hanya untuk top-up di web Mivo).
              <br /><b>3.</b> Halaman <b>API Keys</b> → <b>Create new key</b> → salin (hanya tampil sekali!).
              <br /><b>4.</b> Tempel di bawah → Simpan → Tes Koneksi → klik 🎨 Buat Ulang Poster.
            </div>
            <div className="flex gap-1.5">
              <input
                type="password"
                value={miniKey}
                onChange={(e) => setMiniKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void simpanMiniMax()}
                placeholder="Tempel kunci API MiniMax (…)"
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-gray-200 placeholder:text-gray-600 focus:border-orange-500/50 focus:outline-none"
                aria-label="Kunci API MiniMax"
              />
              <button onClick={() => void simpanMiniMax()} disabled={busy || !miniKey.trim()} className="rounded-md border border-orange-500/40 bg-orange-500/15 px-2 py-1 text-[11px] font-semibold text-orange-100 transition hover:border-orange-400 disabled:opacity-50">
                Simpan
              </button>
            </div>
            <button
              onClick={() => void window.novacutAI?.openMiniMaxAPI?.()}
              className="rounded-md border border-orange-500/40 bg-orange-500/10 px-2 py-1 text-[10px] font-semibold text-orange-100 transition hover:border-orange-400"
            >
              🔑 Buka platform.minimax.io → API Keys ↗
            </button>
          </>
        )
      ) : provider === "mivo" ? (
        !window.novacutAI?.mivoBridgeStart ? (
          <div className="text-[10px] leading-relaxed text-amber-300/80">
            Jalur Mivo tersedia di NOVACUT Studio v1.0.56+ — update aplikasimu.
          </div>
        ) : (
          <>
            <div className="text-[10px] leading-relaxed text-gray-500">
              <b className="text-lime-300/90">Tetap pakai kredit Mivo (top-up QRIS), tanpa kunci API</b> — kini dengan <b className="text-lime-300/90">STUDIO MIVO DALAM APP</b> (login tersimpan, cukup sekali) + otomasi:
              <br /><b>1.</b> Pilih model di bawah (🎬 Film → FLUX Klein / 🎵 Musik → Minimax H3), login sekali di jendela Studio.
              <br /><b>2.</b> Klik 🎨 <b>Buat Ulang Poster</b> → app otomatis: buka studio, pilih model, isi prompt, unggah <b>REFERENSI-frame.png</b>, klik Generate — langkah yang gagal dilanjutkan manual (prompt di clipboard, frame di folder <b>NOVACUT-Mivo</b>).
              <br /><b>3.</b> App memanen hasil otomatis (dari halaman ATAU folder) ±3 dtk → langsung jadi cover (tunggu maks 12 menit) → <b>Studio Mivo ditutup otomatis</b>.
              <br /><b>4.</b> <b>Banyak video sekaligus? BERURUTAN satu per satu</b> — video 1 tuntas (poster → export & split) → <b>jeda 3 dtk</b> → folder NOVACUT-Mivo dibersihkan → <b>browser Mivo dibuka BARU</b> → frame video 2 → poster baru → dst. Poster lama tak mungkin terpakai ulang: <b>sidik piksel</b> tiap poster tercatat (bukan cuma URL).
              <br /><b>5.</b> <b>Thumbnail tiap bagian</b> — setiap hasil export & split dapat <b>-thumb.jpg</b> di folder yang sama: poster/cover video itu + tulisan <b>part/episode BESAR ber-frame</b> sedikit di bawah tengah → sebelum diputar orang sudah tahu judulnya apa dan part ke berapa.
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold text-gray-400">Model Mivo:</span>
              {([["film", "🎬 Film → FLUX Klein"], ["musik", "🎵 Musik → Minimax H3"]] as const).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => {
                    setMivoModel(v);
                    try {
                      localStorage.setItem("novacut.mivoModel", v);
                    } catch {}
                  }}
                  className={mivoModel === v ? "rounded-md border border-lime-400/70 bg-lime-500/20 px-2 py-1 text-[10px] font-semibold text-lime-200" : "rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-gray-400 hover:border-lime-500/40"}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <button
                onClick={() => void window.novacutAI?.mivoStudioOpen?.(mivoModel)}
                className="rounded-md border border-lime-500/50 bg-lime-500/15 px-2 py-1 text-[10px] font-semibold text-lime-100 transition hover:border-lime-400"
              >
                🌐 Studio Mivo dalam app (login tersimpan)
              </button>
              <button
                onClick={() => void window.novacutAI?.openMivoFolder?.()}
                className="rounded-md border border-lime-500/40 bg-lime-500/10 px-2 py-1 text-[10px] font-semibold text-lime-100 transition hover:border-lime-400"
              >
                📁 Buka folder NOVACUT-Mivo
              </button>
              <button
                onClick={() => void window.novacutAI?.openMivoStudio?.()}
                className="rounded-md border border-lime-500/40 bg-lime-500/10 px-2 py-1 text-[10px] font-semibold text-lime-100 transition hover:border-lime-400"
              >
                🌐 Buka mivo.com ↗ (browser luar)
              </button>
            </div>
            {statusMivo.length > 0 && (
              <div className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] leading-relaxed text-gray-300">
                {statusMivo.map((s, i) => (
                  <div key={i}>{s}</div>
                ))}
              </div>
            )}
          </>
        )
      ) : !window.novacutAI?.setCFKey ? (
        <div className="text-[10px] leading-relaxed text-amber-300/80">
          Jalur Cloudflare tersedia di NOVACUT Studio v1.0.38+ — update aplikasimu.
        </div>
      ) : hasCF ? (
        <>
          <div className="text-[10px] leading-relaxed text-gray-500">
            Poster dibuat dari <b className="text-emerald-300/90">FRAME videomu yang dikirim utuh ke Cloudflare</b> (FLUX.2 Klein, mode editing — wajah & adegan terjaga); kuota edit habis → otomatis FLUX.1 schnell. Kuota 10.000 Neuron/hari ≈ 80-170 poster, reset jam 07.00 WIB. Tanpa kartu, tanpa tagihan.
          </div>
          <div className="flex gap-1.5">
            <button onClick={tesCF} disabled={busy} className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-100 transition hover:border-emerald-400 disabled:opacity-50">
              {busy ? "Menguji…" : "Tes Koneksi"}
            </button>
            <button onClick={hapusCF} disabled={busy} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-gray-300 transition hover:border-red-500/40 disabled:opacity-50">
              Hapus Kredensial
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-[10px] leading-relaxed text-gray-500">
            <b className="text-emerald-300/90">100% GRATIS & tanpa kartu</b> — kuota 10.000 Neuron/hari (±80-170 poster), reset jam 07.00 WIB. Ikuti 4 langkah:
            <br /><b>1.</b> Daftar akun gratis di dash.cloudflare.com (cukup email & password).
            <br /><b>2.</b> Di beranda dash, salin <b>Account ID</b> (kotak di sisi kanan halaman) → tempel di bawah.
            <br /><b>3.</b> Klik ikon profil kanan-atas → <b>My Profile → API Tokens → Create Token</b> → Create Custom Token → nama bebas (mis. &quot;NOVACUT&quot;) → Permissions: <b>Account · Workers AI · Run</b> → Continue → Create Token → salin token (hanya tampil sekali!).
            <br /><b>4.</b> Tempel keduanya di sini → Simpan → Tes Koneksi → klik 🎨 Buat Ulang Poster.
          </div>
          <input
            value={cfAcc}
            onChange={(e) => setCfAcc(e.target.value)}
            placeholder="Account ID (32 huruf hex)"
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-gray-200 placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none"
            aria-label="Account ID Cloudflare"
          />
          <div className="flex gap-1.5">
            <input
              type="password"
              value={cfTok}
              onChange={(e) => setCfTok(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void simpanCF()}
              placeholder="API Token (izin Workers AI: Run)"
              className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-gray-200 placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none"
              aria-label="API Token Cloudflare"
            />
            <button onClick={() => void simpanCF()} disabled={busy || !cfAcc.trim() || !cfTok.trim()} className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-100 transition hover:border-emerald-400 disabled:opacity-50">
              Simpan
            </button>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <button
              onClick={() => void window.novacutAI?.openCFHome?.()}
              className="text-[10px] text-emerald-400/90 underline transition hover:text-emerald-300"
            >
              Buka dash.cloudflare.com (langkah 1-2) ↗
            </button>
            <button
              onClick={() => void window.novacutAI?.openCFDash?.()}
              className="text-[10px] text-emerald-400/90 underline transition hover:text-emerald-300"
            >
              Buka halaman API Tokens (langkah 3) ↗
            </button>
          </div>
        </>
      )}

      {msg && <div className={`text-[10px] leading-relaxed ${msg.ok ? "text-emerald-400/90" : "text-red-400/90"}`}>{msg.text}</div>}
    </div>
  );
}
