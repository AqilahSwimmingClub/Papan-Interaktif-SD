import type { GameEngine, TipeGameplay } from './types';
export { mekanikGameAnak } from './gameSemantics';

const TIPE_PER_ENGINE: Record<string, TipeGameplay> = {
  'pilihan-ganda': 'kuis',
  'benar-salah': 'kuis',
  'kuis-cepat': 'kuis',
  jodohkan: 'matching',
  'drag-drop': 'drag_drop',
  'susun-urutan': 'sorting',
  'isi-rumpang': 'sentence_builder',
  'memory-card': 'memory',
  'tebak-gambar': 'image_guess',
  'tebak-kata': 'word_search',
  'susun-kata': 'sentence_builder',
  puzzle: 'puzzle',
  'maze-labirin': 'maze',
  'roda-tantangan': 'wheel',
  'bingo-edukasi': 'board',
  'balap-soal': 'race',
  'battle-kelompok': 'battle',
  'siapa-cepat': 'chase',
  sorting: 'sorting',
  klasifikasi: 'classification',
  timeline: 'timeline',
  simulasi: 'simulation',
  'eksplorasi-gambar': 'image_guess',
  'matematika-cepat': 'target',
  'soal-cerita-interaktif': 'board',
  'coding-blocks': 'coding',
  'debugging-challenge': 'coding',
  'pattern-recognition': 'puzzle',
  'peta-interaktif': 'map',
  'kartu-peran': 'simulation',
  'garis-bilangan': 'manipulative',
  'pasar-pecahan': 'manipulative',
  'bangun-geometri': 'image_puzzle',
  'laboratorium-ukur': 'experiment',
  'misi-soal-cerita': 'board',
  'perakit-kalimat': 'sentence_builder',
  'detektif-bacaan': 'drag_drop',
  'rantai-kosakata': 'matching',
  'simak-dan-pilih': 'catch',
  'panggung-argumen': 'battle',
  'jaring-ekosistem': 'matching',
  'uji-hipotesis': 'experiment',
  'roda-siklus': 'timeline',
  'misi-tubuh-sehat': 'classification',
  'rantai-sebab-akibat': 'timeline',
  'vocabulary-quest': 'matching',
  'spelling-bee': 'crossword',
  'dialogue-path': 'maze',
  'musyawarah-kelas': 'board',
  'hak-dan-tanggung-jawab': 'classification',
  'kompas-nilai': 'simulation',
  'rute-algoritma': 'coding',
  'mesin-data': 'classification',
  'dilema-ai': 'simulation',
  'sirkuit-gerak': 'movement',
  'pilih-gerak-aman': 'movement',
  'pola-irama': 'rhythm',
  'galeri-warna-bentuk': 'image_puzzle',
  'panggung-ekspresi': 'movement',
  'jejak-keteladanan': 'timeline',
};

export function tipeGameplayEngine(engine: Pick<GameEngine, 'kode'>): TipeGameplay {
  return TIPE_PER_ENGINE[engine.kode] ?? 'drag_drop';
}

export function engineAdalahKuis(engine: Pick<GameEngine, 'kode'>): boolean {
  return tipeGameplayEngine(engine) === 'kuis';
}

export function semuaPemetaanGameplay(): Readonly<Record<string, TipeGameplay>> {
  return TIPE_PER_ENGINE;
}

const IKON_MAPEL: Record<string, readonly string[]> = {
  MAT: ['🔢', '🧮', '📐', '🟦', '🟡'],
  BI: ['📖', '🔎', '🗂️', '✍️', '💬'],
  BING: ['🔤', '🎧', '💬', '🧩', '📚'],
  IPAS: ['🌱', '💧', '☀️', '🌍', '🔬'],
  PP: ['🤝', '⚖️', '🏫', '🇮🇩', '🗳️'],
  PJOK: ['🏃', '⚽', '🤸', '💪', '🧘'],
  KKA: ['🤖', '🧱', '💻', '🔁', '🛡️'],
  SMUS: ['🎵', '🥁', '🎹', '👏', '🎶'],
  RUPA: ['🎨', '🔺', '🟦', '🟡', '🖼️'],
  TARI: ['💃', '🕺', '↗️', '🔄', '✨'],
  TEATER: ['🎭', '🎬', '🙂', '😮', '👏'],
  PAI: ['🤲', '📖', '🕌', '💛', '🤝'],
  PAK: ['🙏', '📖', '⛪', '💛', '🤝'],
  PAKat: ['🙏', '📖', '⛪', '💛', '🤝'],
  PAH: ['🙏', '📖', '🪷', '💛', '🤝'],
  PAB: ['🙏', '📖', '☸️', '💛', '🤝'],
  PAKh: ['🙏', '📖', '☯️', '💛', '🤝'],
};

export function ikonGameplay(mapelKode: string, indeks = 0): string {
  const daftar = IKON_MAPEL[mapelKode] ?? ['⭐', '🧩', '🎯', '🚀', '💡'];
  return daftar[indeks % daftar.length]!;
}
