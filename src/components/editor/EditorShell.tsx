"use client";

// NOVACUT Studio - Shell utama

import { useEffect, useState } from "react";
import { Clapperboard, Film, ListVideo, Music, RectangleHorizontal, RectangleVertical, Scissors, SlidersHorizontal, Type, Wand2, Wrench, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Preview } from "./Preview";
import { Timeline } from "./Timeline";
import { MediaPanel } from "./panels/MediaPanel";
import { PlaylistPanel } from "./panels/PlaylistPanel";
import { MusicPanel } from "./panels/MusicPanel";
import { CoverPanel } from "./panels/CoverPanel";
import { EffectsPanel } from "./panels/EffectsPanel";
import { TextPanel } from "./panels/TextPanel";
import { InspectorPanel } from "./panels/InspectorPanel";
import { ExportPanel } from "./panels/ExportPanel";
import { totalDuration, useEditor } from "@/lib/editor/store";
import { fmtTime } from "@/lib/editor/constants";

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
  const project = useEditor((s) => s.project);
  const clips = useEditor((s) => s.clips);
  const selectedClipId = useEditor((s) => s.selectedClipId);
  const duration = totalDuration(clips);

  // saat klip dipilih (mis. musik/gambar/teks baru ditambahkan), langsung tampilkan
  // panel "Klip" di kanan agar pengaturan Volume / Fade / Teks langsung terlihat
  useEffect(() => {
    if (selectedClipId) setRightTab("klip");
  }, [selectedClipId]);

  const leftTabs = (
    <Tabs value={leftTab} onValueChange={setLeftTab} className="flex h-full min-h-0 flex-col">
      <TabsList className="grid h-8 shrink-0 grid-cols-4 gap-1 rounded-lg border border-white/10 bg-black/30 p-0.5">
        <TabsTrigger value="media" className="gap-1 rounded-md px-1 text-[10px] data-[state=active]:bg-cyan-500/25 data-[state=active]:text-cyan-200">
          <Clapperboard className="h-3 w-3" /> Media
        </TabsTrigger>
        <TabsTrigger value="playlist" className="gap-1 rounded-md px-1 text-[10px] data-[state=active]:bg-fuchsia-500/25 data-[state=active]:text-fuchsia-200">
          <ListVideo className="h-3 w-3" /> Playlist
        </TabsTrigger>
        <TabsTrigger value="musik" className="gap-1 rounded-md px-1 text-[10px] data-[state=active]:bg-emerald-500/25 data-[state=active]:text-emerald-200">
          <Music className="h-3 w-3" /> Musik
        </TabsTrigger>
        <TabsTrigger value="cover" className="gap-1 rounded-md px-1 text-[10px] data-[state=active]:bg-violet-500/25 data-[state=active]:text-violet-200">
          <Wand2 className="h-3 w-3" /> Cover
        </TabsTrigger>
      </TabsList>
      <TabsContent value="media" className="mt-0 min-h-0 flex-1">
        <MediaPanel />
      </TabsContent>
      <TabsContent value="playlist" className="mt-0 min-h-0 flex-1">
        <PlaylistPanel />
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
      <TabsList className="grid h-8 shrink-0 grid-cols-4 gap-1 rounded-lg border border-white/10 bg-black/30 p-0.5">
        <TabsTrigger value="klip" className="gap-1 rounded-md px-1 text-[10px] data-[state=active]:bg-cyan-500/25 data-[state=active]:text-cyan-200">
          <SlidersHorizontal className="h-3 w-3" /> Klip
        </TabsTrigger>
        <TabsTrigger value="efek" className="gap-1 rounded-md px-1 text-[10px] data-[state=active]:bg-amber-500/25 data-[state=active]:text-amber-200">
          <Zap className="h-3 w-3" /> Efek
        </TabsTrigger>
        <TabsTrigger value="teks" className="gap-1 rounded-md px-1 text-[10px] data-[state=active]:bg-fuchsia-500/25 data-[state=active]:text-fuchsia-200">
          <Type className="h-3 w-3" /> Teks
        </TabsTrigger>
        <TabsTrigger value="export" className="gap-1 rounded-md px-1 text-[10px] data-[state=active]:bg-cyan-500/25 data-[state=active]:text-cyan-200">
          <Film className="h-3 w-3" /> Export
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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#05060e] text-gray-100">
      {/* header */}
      <header className="flex h-13 shrink-0 items-center gap-3 border-b border-cyan-400/15 bg-black/40 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-[0_0_16px_rgba(34,211,238,0.5)]">
            <Scissors className="h-4.5 w-4.5 text-black" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-black tracking-[0.2em] text-transparent [background:linear-gradient(90deg,#67e8f9,#e879f9)] [-webkit-background-clip:text] [background-clip:text]">
              NOVACUT
            </div>
            <div className="text-[8px] tracking-[0.3em] text-gray-500">FUTURISTIC VIDEO STUDIO</div>
          </div>
        </div>

        <input
          value={project.name}
          onChange={(e) => useEditor.getState().setProject({ name: e.target.value })}
          className="hidden w-48 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-200 focus:border-cyan-400/50 focus:outline-none md:block"
          aria-label="Nama proyek"
        />

        {/* pemilih rasio + kualitas */}
        <div className="hidden items-center gap-1.5 lg:flex">
          {RATIO_OPTIONS.map((r) => {
            const Icon = r.icon;
            const active = project.ratio === r.id;
            return (
              <button
                key={r.id}
                onClick={() => useEditor.getState().setRatio(r.id)}
                title={r.hint}
                aria-pressed={active}
                className={`flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-semibold transition ${
                  active
                    ? r.id === "9:16"
                      ? "border-fuchsia-300 bg-fuchsia-400/20 text-fuchsia-200 shadow-[0_0_10px_rgba(232,121,249,0.3)]"
                      : "border-cyan-300 bg-cyan-400/20 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                    : "border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {r.label}
              </button>
            );
          })}
          <span className="mx-1 h-4 w-px bg-white/10" />
          {QUALITY_OPTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => useEditor.getState().setQuality(q.id)}
              aria-pressed={project.quality === q.id}
              className={`rounded border px-1.5 py-0.5 font-mono text-[9px] transition ${
                project.quality === q.id ? "border-white/40 bg-white/10 text-gray-100" : "border-white/10 text-gray-500 hover:text-gray-300"
              }`}
            >
              {q.label}
            </button>
          ))}
          <span className="ml-1 font-mono text-[9px] text-gray-600">
            {project.width}×{project.height}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="hidden border-white/10 bg-white/5 font-mono text-[10px] text-gray-400 sm:inline-flex">
            {clips.length} klip · {fmtTime(duration)}
          </Badge>
          <Button
            size="sm"
            className="hidden h-8 gap-1.5 bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-[11px] font-bold hover:from-fuchsia-500 hover:to-cyan-400 md:flex"
            onClick={() => setRightTab("export")}
          >
            <Film className="h-3.5 w-3.5" /> Export &amp; Split
          </Button>
          {/* panel mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1 border-white/10 bg-white/5 text-[11px] lg:hidden">
                <Wrench className="h-3.5 w-3.5" /> Panel
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" aria-describedby={undefined} className="h-[85vh] border-white/10 bg-[#070812] p-2">
              <SheetHeader className="px-2 pb-1 pt-0">
                <SheetTitle className="font-display text-xs tracking-widest text-cyan-300">PANEL NOVACUT</SheetTitle>
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
        <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-[#070812] lg:block">{leftTabs}</aside>

        {/* tengah */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-[1.15] flex-col border-b border-white/10">
            <Preview />
          </div>
          <div className="h-[38%] min-h-[240px] shrink-0">
            <Timeline />
          </div>
        </main>

        {/* kanan */}
        <aside className="hidden w-[21rem] shrink-0 border-l border-white/10 bg-[#070812] xl:block">{rightTabs}</aside>
      </div>
    </div>
  );
}

