// NOVACUT Studio - Type definitions

export type TrackKind = "video" | "image" | "text" | "audio";
export type MediaType = "video" | "audio" | "image";
export type ClipKind = "video" | "image" | "text" | "audio";

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  duration: number; // detik; image = 0 (tak terbatas)
  width: number;
  height: number;
  thumb?: string; // data URL
  musicId?: string; // untuk aset dari pustaka musik
}

export interface Track {
  id: string;
  kind: TrackKind;
  name: string;
  muted: boolean;
  hidden: boolean;
}

export type TextPos = "top" | "center" | "bottom";
export type TextBg = "none" | "bar" | "box" | "gradient";

export interface TextData {
  content: string;
  sub?: string;
  size: number; // relatif tinggi canvas (mis. 0.08 = 8% tinggi)
  color: string;
  font: string; // font id
  anim: string; // text anim id
  pos: TextPos;
  bg: TextBg;
  stroke: boolean;
}

export interface TransitionSpec {
  type: string;
  duration: number;
}

export interface Clip {
  id: string;
  trackId: string;
  kind: ClipKind;
  assetId?: string;
  start: number; // posisi di timeline (detik)
  duration: number; // durasi di timeline (detik, sudah termasuk speed & loop)
  inPoint: number; // titik awal pada sumber (detik sumber)
  speed: number; // 0.25 - 4
  loopCount: number; // 1 = sekali; >1 = ulang potongan
  volume: number; // 0 - 2
  fadeIn: number; // detik
  fadeOut: number; // detik
  transition?: TransitionSpec; // transisi masuk (di awal klip)
  effects: string[]; // id efek klip
  text?: TextData;
  label?: string;
  zoom: number; // 1 - 5 (1 = ukuran asli / utuh tanpa potong; >1 = perbesaran manual, penting untuk rasio 9:16)
  panX: number; // -1..1 geser horizontal (kanan = gambar ke kanan)
  panY: number; // -1..1 geser vertikal (bawah = gambar ke bawah)
}

export interface TextsConfig {
  title: string;
  description: string;
  labelStyle: "Part" | "Episode" | "Bagian" | "Eps" | "EP";
  parts: number;
}

export interface CoverConfig {
  frameAssetId?: string; // video sumber
  frameTime: number; // detik frame yang dipakai
  templateId: string; // "layout--palette"
  duration: number; // 2 - 5 detik saat export & split
  useAI: boolean;
  mode: "auto" | "manual"; // auto = ambil adegan dari video; manual = gambar unggahan pengguna
  manualAssetId?: string; // asset gambar unggahan (PNG/JPG)
  manualPlain?: boolean; // mode manual: gambar apa adanya tanpa teks template
  /** Latar cover mode otomatis: "adegan" = gambar dari adegan video; "hitam" = hitam polos */
  bgStyle: "adegan" | "hitam";
  /** Penyebaran latar saat export & split: "sama" = 1 latar untuk semua bagian; "beda" = tiap bagian adegan berbeda */
  bgScope: "sama" | "beda";
  coverAssetId?: string; // hasil render cover (image asset)
  previewUrl?: string;
}

/** Setelan khusus export langsung dari Playlist (tanpa timeline) */
export interface PlaylistExportConfig {
  /** judul otomatis diambil dari nama video tiap batch */
  autoTitle: boolean;
  /** judul manual bila autoTitle dimatikan */
  titleCustom: string;
  /** deskripsi yang tampil di bawah judul pada layar cover */
  description: string;
  /** gaya teks part: Part / Episode / Bagian / Eps / EP */
  labelStyle: TextsConfig["labelStyle"];
  /** tampilkan layar judul (cover) di awal setiap hasil */
  showTitleScreen: boolean;
  /** tampilkan teks part otomatis di setiap hasil split */
  showPartText: boolean;
  /** tampilkan judul overlay selama video berjalan */
  titleDuringVideo: boolean;
}

export interface ExportSettings {
  mode: "single" | "split";
  splitBy: "count" | "duration";
  parts: number;
  partSeconds: number;
  includeCover: boolean;
  coverDuration: number;
  autoPartText: boolean;
  showTitleText: boolean;
  /** Folder tujuan hasil render (path absolut, mode desktop). "" = folder unduhan bawaan */
  exportDir: string;
}

export interface ExportResult {
  id: string;
  name: string;
  url: string;
  size: number;
  part: number;
  total: number;
  duration: number;
  /** Path file di disk bila otomatis tersimpan ke folder pilihan (desktop) */
  savedPath?: string;
}

export interface ExportState {
  running: boolean;
  label: string;
  progress: number; // 0..1
  results: ExportResult[];
  batchTotal: number;
  batchIndex: number;
}

export type Ratio = "16:9" | "9:16";

export interface ProjectMeta {
  name: string;
  width: number;
  height: number;
  ratio: Ratio; // arah video: lanskap 16:9 atau vertikal 9:16
  quality: 720 | 1080; // sisi dasar resolusi
}
