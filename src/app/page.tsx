"use client";

import dynamic from "next/dynamic";

const EditorShell = dynamic(() => import("@/components/editor/EditorShell").then((m) => m.EditorShell), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#05060e]">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      <div className="font-display text-sm tracking-[0.3em] text-cyan-300">MEMUAT NOVACUT STUDIO...</div>
    </div>
  ),
});

export default function Page() {
  return <EditorShell />;
}
