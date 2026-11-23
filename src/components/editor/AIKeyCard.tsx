"use client";
// v1.0.36: Kartu Kunci API Poster AI — pengguna menempel kunci API Z.ai miliknya
// (disimpan lokal di PC, tak dikirim ke mana pun selain api.z.ai). Dengan kunci,
// poster digambar AI publik GLM-Image (HD); tanpa kunci → mode cadangan lokal.
import { useEffect, useState } from "react";

export default function AIKeyCard() {
  const [mounted, setMounted] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    void window.novacutAI?.getAIKeyStatus?.().then((s) => setHasKey(!!s?.hasKey));
  }, []);

  if (!mounted || !window.novacutAI?.setAIKey) return null;

  const simpan = async () => {
    if (busy || !val.trim()) return;
    setBusy(true);
    setMsg(null);
    const r = await window.novacutAI?.setAIKey?.(val.trim());
    setBusy(false);
    if (r?.ok) {
      setHasKey(true);
      setVal("");
      setMsg({ ok: true, text: "Kunci tersimpan di PC ini. Poster AI kini memakai AI publik GLM-Image (HD)." });
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
    setMsg(r?.ok ? { ok: true, text: "Koneksi AI publik OK — siap menggambar poster." } : { ok: false, text: r?.error || "Koneksi gagal." });
  };
  const hapus = async () => {
    if (busy) return;
    setBusy(true);
    await window.novacutAI?.clearAIKey?.();
    setBusy(false);
    setHasKey(false);
    setMsg({ ok: true, text: "Kunci dihapus — poster kembali ke mode cadangan lokal." });
  };

  return (
    <div className="space-y-1.5 rounded-md border border-cyan-500/25 bg-cyan-500/[0.06] p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/90">Kunci API Poster AI</div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${hasKey ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-gray-400"}`}>
          {hasKey ? "● Kunci aktif" : "○ Belum ada kunci"}
        </span>
      </div>
      {hasKey ? (
        <>
          <div className="text-[10px] leading-relaxed text-gray-500">
            Poster digambar <b className="text-cyan-300/90">AI publik GLM-Image (kualitas HD)</b> via Z.ai — adegan videomu dibaca AI lalu dilukis ulang jadi poster sinematik.
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
            Tanpa kunci, poster hanya memakai <b>mode cadangan</b> (frame digelapkan + tulisan overlay — bukan lukisan AI). Untuk poster Hollywood sungguhan, buat kunci API Z.ai (ada gratisannya), tempel di sini, lalu klik Buat Ulang Poster.
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
          <button
            onClick={() => void window.novacutAI?.openAIKeyPage?.()}
            className="text-[10px] text-cyan-400/90 underline transition hover:text-cyan-300"
          >
            Cara dapat kunci: buka z.ai → API Keys (buat "Standard API Key") ↗
          </button>
        </>
      )}
      {msg && <div className={`text-[10px] leading-relaxed ${msg.ok ? "text-emerald-400/90" : "text-red-400/90"}`}>{msg.text}</div>}
    </div>
  );
}
