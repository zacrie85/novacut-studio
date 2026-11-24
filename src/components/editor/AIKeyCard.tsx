"use client";
// v1.0.36: Kartu Kunci API Poster AI — pengguna menempel kunci API Z.ai miliknya
// (disimpan lokal di PC, tak dikirim ke mana pun selain api.z.ai).
// v1.0.38: PENYEDIA BISA DIPILIH — Z.ai (glm-image, per poster ±Rp250) ATAU
// Cloudflare Workers AI (GRATIS: 10.000 Neuron/hari ≈ 170 poster, tanpa kartu) +
// toggle kualitas HD/Hemat untuk jalur Z.ai. Semua kredensial hanya di PC lokal.
import { useEffect, useState } from "react";

type Provider = "zai" | "cloudflare";
type Quality = "hd" | "standard";

export default function AIKeyCard() {
  const [mounted, setMounted] = useState(false);
  const [provider, setProvider] = useState<Provider>("zai");
  const [quality, setQuality] = useState<Quality>("hd");
  const [hasKey, setHasKey] = useState(false);
  const [hasCF, setHasCF] = useState(false);
  const [val, setVal] = useState("");
  const [cfAcc, setCfAcc] = useState("");
  const [cfTok, setCfTok] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    void window.novacutAI?.getAIKeyStatus?.().then((s) => setHasKey(!!s?.hasKey));
    void window.novacutAI?.getCFKeyStatus?.().then((s) => setHasCF(!!s?.hasKey));
    void window.novacutAI?.getAIPrefs?.().then((p) => {
      if (p?.provider === "cloudflare") setProvider("cloudflare");
      if (p?.quality === "standard") setQuality("standard");
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

  const pill = (aktif: boolean) =>
    `rounded-md px-2 py-1 text-[11px] font-semibold transition ${aktif ? "border border-cyan-400/60 bg-cyan-500/15 text-cyan-100" : "border border-white/10 bg-white/[0.03] text-gray-400 hover:text-gray-200"}`;

  return (
    <div className="space-y-1.5 rounded-md border border-cyan-500/25 bg-cyan-500/[0.06] p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/90">Mesin Poster AI</div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${provider === "cloudflare" ? (hasCF ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300") : hasKey ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-gray-400"}`}>
          {provider === "cloudflare" ? (hasCF ? "● CF siap (gratis)" : "○ CF belum diisi") : hasKey ? "● Kunci Z.ai aktif" : "○ Z.ai belum ada kunci"}
        </span>
      </div>

      <div className="flex gap-1.5">
        <button onClick={() => gantiProvider("zai")} className={pill(provider === "zai")}>Z.ai (±Rp250/poster)</button>
        <button onClick={() => gantiProvider("cloudflare")} className={pill(provider === "cloudflare")}>Cloudflare (GRATIS)</button>
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
