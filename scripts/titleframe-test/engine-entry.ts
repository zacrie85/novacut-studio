// Uji jalur render ASLI: drawTextOverlay dari engine.ts (dipakai semua mesin)
import { drawTextOverlay } from "../../src/lib/editor/engine";
(window as unknown as Record<string, unknown>).NovaDraw = { drawTextOverlay };
