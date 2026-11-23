// NOVACUT Studio - 99 GAYA POSTER HOLLYWOOD (v1.0.31)
//
// Referensi gaya untuk mode cover "Poster Hollywood": setiap gaya adalah RESEP
// orisinal terinspirasi genre film Hollywood (grade warna, cahaya, vignette,
// grain, warna aksen furnitur, tagline & prompt AI) — BUKAN poster film
// berhak cipta. Gaya dipilih pengguna, atau "acak" secara deterministik
// per judul film (film yang sama selalu dapat gaya yang sama).

export interface PosterStyle {
  id: string; // "p1".."p99"
  nama: string;
  genre: string;
  /** ctx.filter — grade sinematik frame */
  filter: string;
  /** warna tint bayangan (multiply) */
  tint: string;
  tintA: number;
  /** warna cahaya sorot (screen) */
  glow: string;
  glowA: number;
  vignette: number; // 0..1
  grain: number; // 0..0.4
  scrim: number; // penggelapan bawah utk teks judul 0..1
  accent: string; // warna furnitur poster (garis MEMPERSEMBAHKAN & tagline)
  tagline: string;
  /** fragmen prompt utk mode "AI Sinematik" */
  ai: string;
}

interface FamParams {
  filter: string;
  tint: string;
  tintA: number;
  glow: string;
  glowA: number;
  vignette: number;
  grain: number;
  scrim: number;
  accent: string;
  genre: string;
}

const FAM: Record<string, FamParams> = {
  aksi: { genre: "Aksi", filter: "contrast(1.22) saturate(1.22) brightness(0.97)", tint: "#0d3a4d", tintA: 0.22, glow: "#ff9d3f", glowA: 0.13, vignette: 0.55, grain: 0.14, scrim: 0.55, accent: "#ffd166" },
  horor: { genre: "Horor", filter: "contrast(1.38) saturate(0.6) brightness(0.8)", tint: "#1a0d0d", tintA: 0.3, glow: "#8b0000", glowA: 0.1, vignette: 0.8, grain: 0.28, scrim: 0.62, accent: "#e0533f" },
  scifi: { genre: "Sci-Fi", filter: "contrast(1.28) saturate(1.45) brightness(0.92)", tint: "#0b1e3d", tintA: 0.26, glow: "#00e5ff", glowA: 0.16, vignette: 0.6, grain: 0.1, scrim: 0.5, accent: "#00e5ff" },
  noir: { genre: "Noir", filter: "contrast(1.42) saturate(0.08) brightness(0.92)", tint: "#101010", tintA: 0.25, glow: "#e8e8e8", glowA: 0.08, vignette: 0.75, grain: 0.3, scrim: 0.58, accent: "#d9d9d9" },
  epik: { genre: "Epik", filter: "contrast(1.2) saturate(1.1) brightness(0.98)", tint: "#3d2508", tintA: 0.24, glow: "#ffc65c", glowA: 0.16, vignette: 0.6, grain: 0.12, scrim: 0.55, accent: "#f2c14e" },
  romantis: { genre: "Romantis", filter: "contrast(1.08) saturate(1.18) brightness(1.04)", tint: "#3d0d2a", tintA: 0.18, glow: "#ff7eb6", glowA: 0.15, vignette: 0.45, grain: 0.08, scrim: 0.5, accent: "#ff9ecb" },
  komedi: { genre: "Komedi", filter: "contrast(1.1) saturate(1.5) brightness(1.06)", tint: "#2d0d3d", tintA: 0.12, glow: "#ffe14d", glowA: 0.14, vignette: 0.35, grain: 0.06, scrim: 0.45, accent: "#ffe14d" },
  thriller: { genre: "Thriller", filter: "contrast(1.3) saturate(0.85) brightness(0.88)", tint: "#0d2418", tintA: 0.3, glow: "#9ef01a", glowA: 0.08, vignette: 0.7, grain: 0.2, scrim: 0.6, accent: "#90e05a" },
  sepia: { genre: "Sejarah", filter: "contrast(1.18) saturate(0.7) sepia(0.32) brightness(0.98)", tint: "#2d1b08", tintA: 0.2, glow: "#ffd9a0", glowA: 0.12, vignette: 0.6, grain: 0.18, scrim: 0.55, accent: "#e0b070" },
  hero: { genre: "Superhero", filter: "contrast(1.25) saturate(1.4) brightness(1.0)", tint: "#1a0d3d", tintA: 0.2, glow: "#ff3d5a", glowA: 0.12, vignette: 0.5, grain: 0.1, scrim: 0.5, accent: "#ff3d5a" },
  drama: { genre: "Drama", filter: "contrast(1.12) saturate(0.95) brightness(0.95)", tint: "#12253d", tintA: 0.22, glow: "#c9d6ff", glowA: 0.08, vignette: 0.62, grain: 0.15, scrim: 0.58, accent: "#a9b8d4" },
  misteri: { genre: "Misteri", filter: "contrast(1.26) saturate(1.1) brightness(0.9)", tint: "#1a0d33", tintA: 0.28, glow: "#b388ff", glowA: 0.12, vignette: 0.72, grain: 0.16, scrim: 0.6, accent: "#b388ff" },
  petualangan: { genre: "Petualangan", filter: "contrast(1.2) saturate(1.3) brightness(0.95)", tint: "#0d2b12", tintA: 0.24, glow: "#ffb703", glowA: 0.12, vignette: 0.6, grain: 0.14, scrim: 0.55, accent: "#ffb703" },
  alam: { genre: "Dokumenter Alam", filter: "contrast(1.1) saturate(1.25) brightness(1.0)", tint: "#12331f", tintA: 0.15, glow: "#e9f5db", glowA: 0.08, vignette: 0.4, grain: 0.08, scrim: 0.48, accent: "#cdeac0" },
  angkasa: { genre: "Luar Angkasa", filter: "contrast(1.3) saturate(1.15) brightness(0.88)", tint: "#050816", tintA: 0.3, glow: "#7fd4ff", glowA: 0.14, vignette: 0.78, grain: 0.12, scrim: 0.62, accent: "#7fd4ff" },
};

let counter = 0;
function p(fam: keyof typeof FAM, nama: string, tagline: string, ai: string): PosterStyle {
  counter += 1;
  return { id: `p${counter}`, nama, ...FAM[fam], tagline, ai };
}

export const POSTER_STYLES: PosterStyle[] = [
  // ===== AKSI (10) =====
  p("aksi", "Benteng Terakhir", "SATU ORANG. SATU PELUANG.", "explosive action blockbuster poster, fiery debris, lone hero silhouette"),
  p("aksi", "Jalur Merah", "WAKTU MENGKHIANATI SEMUA ORANG.", "high speed chase movie poster, sparks flying, red alarm lighting"),
  p("aksi", "Operasi Fajar", "MISI INI TIDAK PERNAH ADA.", "covert military operation at dawn, helicopters in smoke"),
  p("aksi", "Taring Baja", "KEKUATAN ADA HARGANYA.", "armored warrior poster, metal sparks, industrial arena"),
  p("aksi", "Kodam Hitam", "MEREKA DATANG TANPA SUARA.", "black ops night raid, muzzle flashes, tactical silhouettes"),
  p("aksi", "Badai Besi", "LANGIT AKAN JATUH.", "tank convoy in sandstorm, war machines rising from dust"),
  p("aksi", "Serangan Final", "HARI INI SEGALANYA BERAKHIR.", "final battle charge toward horizon, slow motion debris"),
  p("aksi", "Pemburu Bayaran", "TARUHANNYA: NYAWA.", "bounty hunter standoff, dusty street, guns drawn"),
  p("aksi", "Protokol Merah", "SISTEM SEDANG DIHAPUS.", "command center meltdown, holographic red alerts"),
  p("aksi", "Garuda Terbang", "LANGIT TAK PERNAH JADI BATAS.", "fighter jet dogfight above clouds, sun glare"),
  // ===== HOROR (8) =====
  p("horor", "Saat Lampu Padam", "JANGAN LIHAT KE BAWAH TEMPAT TIDUR.", "haunted bedroom, flickering light, horror movie poster"),
  p("horor", "Dengungan", "SUARA ITU MEMANGGIL NAMAMU.", "eerie fog corridor, flickering fluorescent light"),
  p("horor", "Rumah Kosong 13", "ADA YANG MENUNGGU DI DALAM.", "abandoned haunted house doorway under moonlight"),
  p("horor", "Jemari Dingin", "SENTUHANNYA BUKAN MANUSIA.", "pale hand reaching out from darkness, horror close-up"),
  p("horor", "Hutan Bisu", "JANGAN IKUTI SUARA ITU.", "dark misty forest, silhouettes between the trees"),
  p("horor", "Panggilan Jam 3:33", "ANGKA ITU JANGAN PERNAH DIJAWAB.", "old telephone ringing in a dark room"),
  p("horor", "Cermin Retak", "REFLEKSI ITU BUKAN KAMU.", "cracked mirror with distorted reflection"),
  p("horor", "Bawah Tanah", "MEREKA TIDAK SENDIRIAN DI SANA.", "flooded tunnel, flashlight beam cutting darkness"),
  // ===== SCI-FI (8) =====
  p("scifi", "Sirkuit Hampa", "INGATAN BISA DIBELI.", "cyberpunk neon street in rain, holograms, futuristic city"),
  p("scifi", "Nyawa Sintetis", "MESIN BELAJAR MENCINTAI.", "android awakening in a lab, glowing circuits"),
  p("scifi", "Zona Nol", "REALITAS SEDANG DIHAPUS.", "glitching city skyline, digital corruption"),
  p("scifi", "Orbit Terakhir", "BUMI HANYA TITIK KECIL.", "space station orbit view, blue earth glow"),
  p("scifi", "Prototipe-7", "DIA BUKAN ALAT. DIA BUKTI.", "mech prototype hangar, blue energy core"),
  p("scifi", "Kota Tanpa Matahari", "CAHAYA DIJUAL MAHAL.", "megacity under smog, glowing neon advertisements"),
  p("scifi", "Pengulangan", "HARI INI SUDAH PERNAH KAMU JALANI.", "time loop concept, mirrored city streets"),
  p("scifi", "Data Roh", "JIWA TERUNGKAP SEBAGAI KODE.", "digital soul visualization, cascading code rain"),
  // ===== NOIR (7) =====
  p("noir", "Kota Asap", "SEMUA ORANG BERBOHONG DI SINI.", "film noir detective, rain-soaked street, venetian blind shadows"),
  p("noir", "Perjanjian Tengah Malam", "TANDA TANGAN ITU MEMALING.", "noir silhouette under a streetlamp, cigarette smoke"),
  p("noir", "Jendela Lantai 4", "SEORANG SAKSI. SATU PELURU.", "noir apartment window, long shadows, city night"),
  p("noir", "Wajah Tanpa Nama", "NAMANYA TERHAPUS DARI SEJARAH.", "noir amnesia figure, newspaper backdrop"),
  p("noir", "Lorong Gaslampu", "KOTA INI MEMAKAN ANAK-ANAKNYA.", "gaslight alley, wet cobblestones, thick fog"),
  p("noir", "Perempuan Berjas Putih", "DIA DATANG DENGAN SATU KOPER.", "noir femme fatale in doorway backlight"),
  p("noir", "Saksi Bisu", "KAMU MELIHAT YANG TIDAK SEHARUSNYA.", "trench coat witness fading into urban shadows"),
  // ===== EPIK (8) =====
  p("epik", "Tahta & Abu", "KESERAKAHAN MENGHANCURKAN KERAJAAN.", "golden throne room, drifting embers, epic scale"),
  p("epik", "Pedang Fajar", "KEBANGKITAN DIMULAI DARI LUKA.", "warrior at sunrise battlefield, torn banner"),
  p("epik", "Rantai Raja", "DARAH MEMBAYAR DARAH.", "king in battle-worn golden armor, close-up"),
  p("epik", "Gerbang Dunia", "DI BALIK GUNUNG ADA DUNIA LAIN.", "monumental mountain gate at golden hour"),
  p("epik", "Legenda Samudra", "LAUT INGAT SETIAP NAMA.", "sailing ship in a storm under golden sky"),
  p("epik", "Api Suci", "SATU NYALA UNTUK SEMUA BANGSA.", "temple fire ritual, rising golden sparks"),
  p("epik", "Tanah Leluhur", "AKAR LEBIH DALAM DARI PEDANG.", "ancestral valley, tribe silhouettes, golden mist"),
  p("epik", "Mahkota Duri", "KEJAYAAN SELALU BERBATUH LUKA.", "crowned figure in ruins, single shaft of light"),
  // ===== ROMANTIS (7) =====
  p("romantis", "Surat yang Terlambat", "CINTA TIDAK MENGENAL WAKTU.", "handwritten letters by a rain-streaked window, warm bokeh"),
  p("romantis", "Kopi Jam Dua", "PERTEMUAN YANG SELALU DIULANG.", "couple at a cafe window, golden afternoon light"),
  p("romantis", "Jarak Dua Kota", "SATU LANGIT UNTUK DUA RINDU.", "train station farewell, soft hazy light"),
  p("romantis", "Musim Tanpamu", "HATI BELUM BERTEMU AKHIR.", "autumn park bench, falling leaves, muted warmth"),
  p("romantis", "Lagu Terakhir Kita", "PUTAR SEKALI LAGI.", "rooftop vinyl player under city night lights"),
  p("romantis", "Payung Warna Senja", "DUA ORANG, SATU LANGIT YANG JATUH.", "two umbrellas in rain, neon reflections on wet street"),
  p("romantis", "Tarian Penutup", "LANGKAH TERAKHIR UNTUK SELAMANYA.", "ballroom dance under chandelier bokeh"),
  // ===== KOMEDI (6) =====
  p("komedi", "Sial Berkumpul", "HARI TERBURUK SEUMUR HIDUP.", "colorful comedy chaos, exaggerated mess, bright palette"),
  p("komedi", "Bos Seumur Hidup", "ATASANNYA LEBIH PARAH DARI PRIBADINYA.", "office disaster, flying paper, vivid colors"),
  p("komedi", "Tetangga Gila", "SATU PAGAR, SERIBU DRAMA.", "suburban comedy chaos, wild sprinklers"),
  p("komedi", "Pernikahan Palsu", "JANJI PALSU, CINTA ASLI?", "wedding gone wrong, confetti disaster, bright tones"),
  p("komedi", "Kelas Malapetaka", "UJIAN INI TIDAK PERNAH DISIAPKAN.", "classroom chaos in vivid saturated colors"),
  p("komedi", "Liburan Salah Alamat", "TUJUAN BERUBAH, KELUARGA KACAU.", "tropical vacation disaster, sunshine chaos"),
  // ===== THRILLER (7) =====
  p("thriller", "Tanpa Jejak", "PEMBUNUHNYA TIDAK PERNAH BERLARI.", "forest crime scene, police tape, cold tint"),
  p("thriller", "Rapat Tengah Malam", "SEMUA DI RUANG ITU BISA MEMBUNUH.", "corporate boardroom at night, screens glowing"),
  p("thriller", "Pengakuan", "REKAMAN INI HARUS HILANG.", "interrogation room, single hanging lamp"),
  p("thriller", "Pengikut", "KAMU SUDAH LAMA DIPILIH.", "silhouette watching from behind wet glass"),
  p("thriller", "Berita Pagi", "HEADLINE HARI INI: KAMU.", "dark newsroom, monitors glow green"),
  p("thriller", "Luka Lama", "MASA LALU TIDAK PERNAH MATI.", "rainy parking garage, headlights cutting dark"),
  p("thriller", "Detik ke-9", "SERANGAN DALAM SEMBILAN DETIK.", "bomb countdown, red digits glowing in dark"),
  // ===== SEJARAH (6) =====
  p("sepia", "Kapal Terakhir", "SEJARAH DITULIS OLEH YANG SELAMAT.", "old ship deck, weathered crew, vast ocean, sepia"),
  p("sepia", "Kota Peninggalan", "BATU-BATU INI BISA BICARA.", "ancient ruins, explorers with torches, sepia"),
  p("sepia", "Perang Peradaban", "DUNIA BARU DIBAYAR DARAH LAMA.", "historic battlefield, torn flags, sepia tone"),
  p("sepia", "Surat Raja", "PERINTAH INI MENGGERAKKAN BENUA.", "royal decree with wax seal under candlelight"),
  p("sepia", "Kereta Utara", "SATU JALUR, SERIBU TAKDIR.", "vintage steam train journey, drifting smoke"),
  p("sepia", "Gudang Arsip", "BERKAS INI DISEGEL 100 TAHUN.", "archive vault, dusty ledgers, dim lamp"),
  // ===== SUPERHERO (6) =====
  p("hero", "Bayangan Topeng", "KEBERANIAN TUMBUH DI KEGELAPAN.", "caped hero silhouette on rooftop, city glow below"),
  p("hero", "Dua Dunia", "IDENTITAS ADALAH PENJARA.", "split lighting on dual identity, dramatic contrast"),
  p("hero", "Garasi Legenda", "SEBELUM DIA TERBANG, DIA JATUH.", "hero workshop, gadgets and tools, dramatic lamp"),
  p("hero", "Skandal Kota", "KOTA MENYUCI, KOTA MENGHAKIMI.", "hero statue over city plaza at night"),
  p("hero", "Rantai Baja", "KEKUATAN TANPA KENDALI ADALAH BENCANA.", "restrained energy, glowing chains straining"),
  p("hero", "Generasi Baru", "PELINDUNG LAMA SUDAH TIADA.", "team of young heroes, dramatic storm sky"),
  // ===== DRAMA (6) =====
  p("drama", "Rumah Kaca", "SEMUA MELIHAT, TIDAK ADA MENGERTI.", "glass house loneliness, cool blue tone"),
  p("drama", "Meja Panjang", "KELUARGA ADALAH MEJA YANG SAMA.", "family dinner, heavy silence, moody light"),
  p("drama", "Tawa Terakhir", "SEBELUM TAWA ITU PADAM.", "backstage dressing mirror, fading bulb lights"),
  p("drama", "Pulang Malam", "ADA YANG TIDAK KEMBALI SAMA.", "night bus window, reflection on tired face"),
  p("drama", "Kamar 204", "SEMUA CERITA BERMULA DI SINI.", "hotel room, curtain-filtered light, quiet stillness"),
  p("drama", "Ayah Kota", "KERJA TAK PERNAH SELESAI, CINTA JUGA.", "worker on dawn street, long shadow"),
  // ===== MISTERI (6) =====
  p("misteri", "Kotak yang Hilang", "ISINYA BUKAN UNTUK MANUSIA.", "mysterious artifact box, curling fog, purple haze"),
  p("misteri", "Peta Tak Bertepi", "TUJUANNYA BERUBAH SETIAP DIBACA.", "antique map under candlelight, strange compass"),
  p("misteri", "Menara Bisu", "SIAPA YANG TINGGAL DI ATAS?", "tower silhouette in purple mist"),
  p("misteri", "Undangan Tanpa Nama", "PESTA INI TAHU NAMAMU.", "black invitation card, moonlit hall"),
  p("misteri", "Gerbang Waktu", "PINTU ITU TIDAK PERNAH TERTUTUP.", "glowing portal at the end of a corridor"),
  p("misteri", "Catatan Bawah Tanah", "SEJARAH TERLARANG MASIH HIDUP.", "underground library, floating lantern light"),
  // ===== PETUALANGAN (7) =====
  p("petualangan", "Peta di Tengah Badai", "HUJAN TAK MENGHALANGI PEMBURU HARTA.", "storm-swept treasure map, determined explorers"),
  p("petualangan", "Jurang Pertama", "LOMPAT ATAU PULANG.", "cliff edge jump, vast canyon, dramatic sky"),
  p("petualangan", "Kuil Penjaga", "BAYANGAN ITU BERGERAK SENDIRI.", "jungle temple, torch beams through vines"),
  p("petualangan", "Sungai Tengkorak", "TIDAK ADA YANG KELUAR DUA KALI.", "raft on violent river rapids, spray and rocks"),
  p("petualangan", "Puncak Nol Derajat", "DINGIN MEMBALAS SETIAP LANGKAH.", "mountain expedition in blizzard wind"),
  p("petualangan", "Gua Kristal", "CAHAYA TUMBUH DARI BATU.", "crystal cave, glowing blue stones"),
  p("petualangan", "Kapal yang Tenggelam", "HARTA ITU MENUNGGU 200 TAHUN.", "underwater shipwreck, diver lights, sun rays"),
  // ===== DOKUMENTER ALAM (5) =====
  p("alam", "Tanah yang Tersisa", "ALAM TIDAK MENUNGGU PERSETUJUAN.", "savanna golden light, distant wildlife"),
  p("alam", "Laut Dalam", "90% DUNIA BELUM PERNAH TERLIHAT.", "deep ocean, whale silhouette, light shafts"),
  p("alam", "Sayap Pagi", "SETIAP FAJAR PUNYA PEMILIKNYA.", "birds taking flight at sunrise, misty wetlands"),
  p("alam", "Gurun Hidup", "PASIR JUGA BERNAPAS.", "desert dunes, heat haze, long shadows"),
  p("alam", "Hutan Vertikal", "DARI AKAR SAMPAI AWAN.", "rainforest canopy climbing into mist"),
  // ===== LUAR ANGKASA (2) =====
  p("angkasa", "Di Antara Bintang", "SINYAL DARI RUMAH, 40 TAHUN LAMBAT.", "lone astronaut against a nebula, deep space"),
  p("angkasa", "Stasiun Pemberontak", "ATURAN GRAVITASI ADALAH ATURAN MANUSIA.", "space station rebellion, zero gravity chaos"),
];

/** baris kredit atas poster (ala "MEMPERSEMBAHKAN" Hollywood) */
export const POSTER_ACADEMY_LINE = "NOVACUT PICTURES MEMPERSEMBAHKAN";
/** baris kredit bawah furnitur poster */
export const POSTER_BILLING_LINE = "SEBUAH PRODUKSI FILM NOVACUT STUDIO";

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Pilih gaya poster: id spesifik ("p12") atau "acak" — deterministik per judul
 * (film yang sama selalu dapat gaya yang sama, seperti aiRecommendTemplates). */
export function posterStyleById(idOrAcak: string | undefined, title: string): PosterStyle {
  if (idOrAcak && idOrAcak !== "acak") {
    const found = POSTER_STYLES.find((s) => s.id === idOrAcak);
    if (found) return found;
  }
  const idx = hashStr(title || "novacut") % POSTER_STYLES.length;
  return POSTER_STYLES[idx];
}
