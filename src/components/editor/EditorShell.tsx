"use client";

// NOVACUT Studio - Shell utama
// Tiga mode tampilan: Layar Sambutan → Mode Sederhana (wizard) / Mode Pro (timeline).

import { useEffect, useState } from "react";
import { Clapperboard, Film, ListVideo, Music, RectangleHorizontal, RectangleVertical, Rocket, Scissors, SlidersHorizontal, Type, Wand2, Wrench, Zap, Keyboard, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Preview } from "./Preview";
import { Timeline } from "./Timeline";
import { MediaPanel } from "./panels/MediaPanel";
import { PlaylistEditorPanel } from "./panels/PlaylistEditorPanel";
import { PlaylistExportPanel } from "./panels/PlaylistExportPanel";
import { MusicPanel } from "./panels/MusicPanel";
import { CoverPanel } from "./panels/CoverPanel";
import { EffectsPanel } from "./panels/EffectsPanel";
import { TextPanel } from "./panels/TextPanel";
import { InspectorPanel } from "./panels/InspectorPanel";
import { ExportPanel } from "./panels/ExportPanel";
import { WelcomeScreen } from "./WelcomeScreen";
import { SimpleMode } from "./SimpleMode";
import { totalDuration, useEditor } from "@/lib/editor/store";
import { fmtTime } from "@/lib/editor/constants";
import { engine } from "@/lib/editor/engine";
import { loadPlaylistExportConfig } from "@/lib/editor/playlistExport";
import { applyTextStyleToStore } from "@/lib/editor/textStyle";
import { ensureAppFonts } from "@/lib/editor/fonts";
import { loadLastUiMode, saveUiMode, welcomeSkipped } from "@/lib/editor/uiPrefs";

const RATIO_OPTIONS = [
  { id: "16:9" as const, label: "16:9", hint: "Lanskap · YouTube", icon: RectangleHorizontal },
  { id: "9:16" as const, label: "9:16", hint: "Vertikal · Reels/TikTok", icon: RectangleVertical },
];

const QUALITY_OPTIONS: { id: 720 | 1080; label: string }[] = [
  { id: 720, label: "720p" },
  { id: 1080, label: "1080p" },
];

export function EditorShell() {
  const [leftTab, setLeftTab] = useState("media");
  const [rightTab, setRightTab] = useState("klip");
  const uiMode = useEditor((s) => s.uiMode);
  const project = useEditor((s) => s.project);
  const clips = useEditor((s) => s.clips);
  const selectedClipId = useEditor((s) => s.selectedClipId);
  const duration = totalDuration(clips);

  // tentukan tampilan awal: layar sambutan (pertama kali) atau mode terakhir
  useEffect(() => {
    const last = loadLastUiMode();
    if (welcomeSkipped() || last) useEditor.getState().setUiMode(last ?? "pro");
    else useEditor.getState().setUiMode("welcome");
  }, []);

  // saat klip dipilih (mis. musik/gambar/teks baru ditambahkan), langsung tampilkan
  // panel "Klip" di kanan agar pengaturan Volume / Fade / Teks langsung terlihat
  useEffect(() => {
    if (selectedClipId) setRightTab("klip");
  }, [selectedClipId]);

  // pulihkan setelan tersimpan saat aplikasi dibuka: menu Playlist Export + gaya
  // tulisan (ukuran huruf & font) + muat font sinematik bundel (offline)
  useEffect(() => {
    useEditor.getState().setPlaylistExport(loadPlaylistExportConfig());
    applyTextStyleToStore(useEditor.getState().setTexts);
    void ensureAppFonts().then(() => {
      // render ulang preview setelah font siap agar teks memakai font asli
      window.dispatchEvent(new CustomEvent("novacut:fonts-ready"));
    });
  }, []);

  // lompat ke panel tertentu (dipakai tombol pintas di menu Playlist:
  // "Atur Teks / Efek / Klip untuk Video Playlist")
  useEffect(() => {
    const onJump = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (["klip", "efek", "teks", "export"].includes(detail)) setRightTab(detail);
      else if (["media", "playlist", "langsung", "musik", "cover"].includes(detail)) setLeftTab(detail);
    };
    window.addEventListener("novacut:jump", onJump);
    return () => window.removeEventListener("novacut:jump", onJump);
  }, []);

  // tombol pintas keyboard (Mode Pro): Spasi = putar/jeda · S = potong ·
  // ← → = mundur/maju 1 detik (tahan Shift = 5 detik) · Delete = hapus klip
  useEffect(() => {
    if (uiMode !== "pro") return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const st = useEditor.getState();
      switch (e.key) {
        case " ":
          e.preventDefault();
          engine.toggle();
          break;
        case "s":
        case "S":
          if (st.selectedClipId) st.splitClip(st.selectedClipId, st.playhead);
          break;
        case "ArrowLeft":
          e.preventDefault();
          engine.seek(Math.max(0, st.playhead - (e.shiftKey ? 5 : 1)));
          break;
        case "ArrowRight":
          e.preventDefault();
          engine.seek(st.playhead + (e.shiftKey ? 5 : 1));
          break;
        case "Delete":
        case "Backspace":
          if (st.selectedClipId) st.deleteClip(st.selectedClipId);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [uiMode]);

  const goSimple = () => {
    saveUiMode("simple");
    useEditor.getState().setUiMode("simple");
  };

  const leftTabs = (
    <Tabs value={leftTab} onValueChange={setLeftTab} className="flex h-full min-h-0 flex-col">
      <TabsList className="grid h-9 shrink-0 grid-cols-5 gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-0.5">
        <TabsTrigger value="media" className="gap-1 rounded-md px-0.5 text-[11px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
          <Clapperboard className="h-3.5 w-3.5" /> Media
        </TabsTrigger>
        <TabsTrigger value="playlist" className="gap-1 rounded-md px-0.5 text-[11px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
          <ListVideo className="h-3.5 w-3.5" /> Playlist
        </TabsTrigger>
        <TabsTrigger value="langsung" className="gap-1 rounded-md px-0.5 text-[11px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
          <Rocket className="h-3.5 w-3.5" /> Langsung
        </TabsTrigger>
        <TabsTrigger value="musik" className="gap-1 rounded-md px-0.5 text-[11px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
          <Music className="h-3.5 w-3.5" /> Musik
        </TabsTrigger>
        <TabsTrigger value="cover" className="gap-1 rounded-md px-0.5 text-[11px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
          <Wand2 className="h-3.5 w-3.5" /> Cover
        </TabsTrigger>
      </TabsList>
      <TabsContent value="media" className="mt-0 min-h-0 flex-1">
        <MediaPanel />
      </TabsContent>
      <TabsContent value="playlist" className="mt-0 min-h-0 flex-1">
        <PlaylistEditorPanel />
      </TabsContent>
      <TabsContent value="langsung" className="mt-0 min-h-0 flex-1">
        <PlaylistExportPanel />
      </TabsContent>
      <TabsContent value="musik" className="mt-0 min-h-0 flex-1">
        <MusicPanel />
      </TabsContent>
      <TabsContent value="cover" className="mt-0 min-h-0 flex-1">
        <CoverPanel />
      </TabsContent>
    </Tabs>
  );

  const rightTabs = (
    <Tabs value={rightTab} onValueChange={setRightTab} className="flex h-full min-h-0 flex-col">
      <TabsList className="grid h-9 shrink-0 grid-cols-4 gap-1 rounded-lg border border-white/[0.07] bg-black/30 p-0.5">
        <TabsTrigger value="klip" className="gap-1 rounded-md px-0.5 text-[11px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Klip
        </TabsTrigger>
        <TabsTrigger value="efek" className="gap-1 rounded-md px-0.5 text-[11px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
          <Zap className="h-3.5 w-3.5" /> Efek
        </TabsTrigger>
        <TabsTrigger value="teks" className="gap-1 rounded-md px-0.5 text-[11px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
          <Type className="h-3.5 w-3.5" /> Teks
        </TabsTrigger>
        <TabsTrigger value="export" className="gap-1 rounded-md px-0.5 text-[11px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
          <Film className="h-3.5 w-3.5" /> Export
        </TabsTrigger>
      </TabsList>
      <TabsContent value="klip" className="mt-0 min-h-0 flex-1">
        <InspectorPanel />
      </TabsContent>
      <TabsContent value="efek" className="mt-0 min-h-0 flex-1">
        <EffectsPanel />
      </TabsContent>
      <TabsContent value="teks" className="mt-0 min-h-0 flex-1">
        <TextPanel />
      </TabsContent>
      <TabsContent value="export" className="mt-0 min-h-0 flex-1">
        <ExportPanel />
      </TabsContent>
    </Tabs>
  );

  if (uiMode === "welcome") return <WelcomeScreen />;
  if (uiMode === "simple") return <SimpleMode />;

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
        {/* header */}
        <header className="flex h-13 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-card px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Scissors className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-black tracking-[0.2em] text-gray-100">NOVACUT</div>
              <div className="text-[8px] tracking-[0.3em] text-gray-500">VIDEO STUDIO</div>
            </div>
          </div>

          <input
            value={project.name}
            onChange={(e) => useEditor.getState().setProject({ name: e.target.value })}
            className="hidden w-44 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-gray-200 focus:border-blue-500/60 focus:outline-none md:block"
            aria-label="Nama proyek"
          />

          {/* pemilih rasio + kualitas */}
          <div className="hidden items-center gap-1.5 lg:flex">
            {RATIO_OPTIONS.map((r) => {
              const Icon = r.icon;
              const active = project.ratio === r.id;
              return (
                <Tooltip key={r.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => useEditor.getState().setRatio(r.id)}
                      aria-pressed={active}
                      className={`nv-seg h-8 ${active ? "nv-seg-active" : ""}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {r.label}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">{r.hint}</TooltipContent>
                </Tooltip>
              );
            })}
            <span className="mx-1 h-4 w-px bg-white/10" />
            {QUALITY_OPTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => useEditor.getState().setQuality(q.id)}
                aria-pressed={project.quality === q.id}
                className={`rounded-lg border px-2 py-1 font-mono text-[10px] transition ${project.quality === q.id ? "border-white/40 bg-white/10 text-gray-100" : "border-white/10 text-gray-500 hover:text-gray-300"}`}
              >
                {q.label}
              </button>
            ))}
            <span className="ml-1 font-mono text-[10px] text-gray-600">
              {project.width}×{project.height}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden border-white/10 bg-white/[0.04] font-mono text-[10px] text-gray-400 sm:inline-flex">
              {clips.length} klip · {fmtTime(duration)}
            </Badge>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="hidden h-8 gap-1.5 border-white/10 bg-white/[0.04] text-[11px] font-semibold text-gray-200 hover:bg-white/[0.08] xl:flex" onClick={goSimple}>
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Mode Sederhana
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Wizard 3 langkah: pilih video → atur → export</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="hidden h-8 gap-1.5 bg-blue-600 text-[11px] font-bold text-white hover:bg-blue-500 md:flex"
                  onClick={() => setRightTab("export")}
                >
                  <Film className="h-3.5 w-3.5" /> Export &amp; Split
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Buka menu Export untuk timeline</TooltipContent>
            </Tooltip>

            {/* panel mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1 border-white/10 bg-white/[0.04] text-[11px] lg:hidden">
                  <Wrench className="h-3.5 w-3.5" /> Panel
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" aria-describedby={undefined} className="h-[85vh] border-white/10 bg-card p-2">
                <SheetHeader className="px-2 pb-1 pt-0">
                  <SheetTitle className="font-display text-xs tracking-widest text-gray-300">PANEL NOVACUT</SheetTitle>
                </SheetHeader>
                <div className="grid h-[calc(85vh-3rem)] grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="min-h-0 overflow-hidden rounded-lg border border-white/10">{leftTabs}</div>
                  <div className="min-h-0 overflow-hidden rounded-lg border border-white/10">{rightTabs}</div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* body */}
        <div className="flex min-h-0 flex-1">
          {/* kiri */}
          <aside className="hidden w-[22rem] shrink-0 border-r border-white/[0.07] bg-card lg:block">{leftTabs}</aside>

          {/* tengah */}
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-[1.15] flex-col border-b border-white/[0.07]">
              <Preview />
            </div>
            <div className="h-[38%] min-h-[240px] shrink-0">
              <Timeline />
            </div>
          </main>

          {/* kanan */}
          <aside className="hidden w-[21rem] shrink-0 border-l border-white/[0.07] bg-card xl:block">{rightTabs}</aside>
        </div>

        {/* petunjuk tombol pintas */}
        <div className="hidden shrink-0 items-center gap-3 border-t border-white/[0.06] bg-card px-3 py-1 text-[10px] text-gray-600 md:flex">
          <span className="flex items-center gap-1">
            <Keyboard className="h-3 w-3" /> Pintasan:
          </span>
          <span>
            <b className="text-gray-500">Spasi</b> putar/jeda
          </span>
          <span>
            <b className="text-gray-500">S</b> potong klip
          </span>
          <span>
            <b className="text-gray-500">← →</b> mundur/maju 1 dtk (Shift = 5 dtk)
          </span>
          <span>
            <b className="text-gray-500">Del</b> hapus klip
          </span>
          <span className="ml-auto">Klik 2x klip gambar/teks/audio = tarik otomatis sampai akhir video</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
