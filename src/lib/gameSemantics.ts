import type { GameEngine, KodeFase, MekanikGameAnak, TagKompetensiGame } from './types';
import { GAME_ENGINE_FINAL } from './gameEngines';

const KUIS = new Set(['pilihan-ganda', 'benar-salah', 'kuis-cepat']);

export const MEKANIK_PER_ENGINE: Readonly<Record<string, MekanikGameAnak>> = {
  'pilihan-ganda': 'kuis', 'benar-salah': 'kuis', 'kuis-cepat': 'kuis',
  jodohkan: 'memory_world', 'drag-drop': 'sorting_factory', 'susun-urutan': 'puzzle_builder',
  'isi-rumpang': 'word_adventure', 'memory-card': 'memory_world', 'tebak-gambar': 'platform_jump',
  'tebak-kata': 'word_adventure', 'susun-kata': 'word_adventure', puzzle: 'puzzle_builder',
  'maze-labirin': 'maze_adventure', 'roda-tantangan': 'board_game', 'bingo-edukasi': 'bingo_classroom',
  'balap-soal': 'racing_game', 'battle-kelompok': 'monster_battle', 'siapa-cepat': 'balloon_pop',
  sorting: 'sorting_factory', klasifikasi: 'sorting_factory', timeline: 'puzzle_builder',
  simulasi: 'story_adventure', 'eksplorasi-gambar': 'treasure_hunt', 'matematika-cepat': 'whack_target',
  'soal-cerita-interaktif': 'escape_room', 'coding-blocks': 'coding_quest',
  'debugging-challenge': 'coding_quest', 'pattern-recognition': 'puzzle_builder',
  'peta-interaktif': 'territory_battle', 'kartu-peran': 'story_adventure',
  'garis-bilangan': 'number_adventure', 'pasar-pecahan': 'number_adventure',
  'bangun-geometri': 'tower_builder', 'laboratorium-ukur': 'science_lab',
  'misi-soal-cerita': 'number_adventure', 'perakit-kalimat': 'word_adventure',
  'detektif-bacaan': 'escape_room', 'rantai-kosakata': 'memory_world',
  'simak-dan-pilih': 'fishing_catch', 'panggung-argumen': 'monster_battle',
  'jaring-ekosistem': 'science_lab', 'uji-hipotesis': 'science_lab', 'roda-siklus': 'puzzle_builder',
  'misi-tubuh-sehat': 'science_lab', 'rantai-sebab-akibat': 'puzzle_builder',
  'vocabulary-quest': 'word_adventure', 'spelling-bee': 'word_adventure', 'dialogue-path': 'maze_adventure',
  'musyawarah-kelas': 'territory_battle', 'hak-dan-tanggung-jawab': 'sorting_factory',
  'kompas-nilai': 'story_adventure', 'rute-algoritma': 'coding_quest', 'mesin-data': 'sorting_factory',
  'dilema-ai': 'story_adventure', 'sirkuit-gerak': 'pjok_motion', 'pilih-gerak-aman': 'pjok_motion',
  'pola-irama': 'music_rhythm', 'galeri-warna-bentuk': 'art_stage',
  'panggung-ekspresi': 'art_stage', 'jejak-keteladanan': 'story_adventure',
};

const POLA_TAG: Array<[TagKompetensiGame, RegExp]> = [
  ['mengurutkan', /mengurut|urutan|tahap|runtut|sequence|alur|siklus/],
  ['mengklasifikasi', /mengklas|mengelompok|menggolong|membedakan|kategori|ciri/],
  ['mengidentifikasi', /mengidentifikasi|mengenali|menemukan|menunjukkan|menentukan|menyebut/],
  ['menganalisis', /menganalisis|menalar|menyimpulkan|mengevaluasi|memecahkan|hubungan|sebab/],
  ['menghitung', /menghitung|bilangan|operasi|pecahan|mengukur|jumlah|kali|bagi/],
  ['mencocokkan', /mencocok|memadankan|menghubungkan|pasangan|kesetaraan/],
  ['menyusun', /menyusun|membentuk|membuat|merancang|menciptakan|menulis/],
  ['mempraktikkan', /mempraktik|melakukan|menerapkan|menirukan|gerak|berdialog/],
  ['mengamati', /mengamati|mengeksplorasi|menguji|memprediksi|percobaan/],
  ['berkomunikasi', /menceritakan|menjelaskan|berpendapat|mempresentasikan|mengucapkan/],
];

const MEKANIK_TAG: Record<TagKompetensiGame, readonly MekanikGameAnak[]> = {
  mengurutkan: ['maze_adventure', 'racing_game', 'puzzle_builder', 'coding_quest', 'board_game', 'treasure_hunt'],
  mengklasifikasi: ['sorting_factory', 'fishing_catch', 'balloon_pop', 'science_lab', 'territory_battle', 'puzzle_builder'],
  mengidentifikasi: ['treasure_hunt', 'whack_target', 'balloon_pop', 'maze_adventure', 'fishing_catch', 'bingo_classroom'],
  menganalisis: ['escape_room', 'treasure_hunt', 'territory_battle', 'story_adventure', 'monster_battle', 'board_game'],
  menghitung: ['number_adventure', 'racing_game', 'tower_builder', 'whack_target', 'board_game', 'balloon_pop'],
  mencocokkan: ['memory_world', 'puzzle_builder', 'fishing_catch', 'bingo_classroom', 'whack_target', 'word_adventure'],
  menyusun: ['tower_builder', 'puzzle_builder', 'word_adventure', 'coding_quest', 'art_stage', 'board_game'],
  mempraktikkan: ['pjok_motion', 'story_adventure', 'music_rhythm', 'art_stage', 'racing_game', 'platform_jump'],
  mengamati: ['science_lab', 'treasure_hunt', 'fishing_catch', 'platform_jump', 'escape_room', 'balloon_pop'],
  berkomunikasi: ['story_adventure', 'word_adventure', 'monster_battle', 'board_game', 'memory_world', 'treasure_hunt'],
};

const MEKANIK_MAPEL: Record<string, readonly MekanikGameAnak[]> = {
  MAT: ['number_adventure', 'racing_game', 'tower_builder', 'whack_target', 'puzzle_builder', 'board_game', 'bingo_classroom'],
  BI: ['word_adventure', 'escape_room', 'maze_adventure', 'treasure_hunt', 'puzzle_builder', 'memory_world'],
  BING: ['word_adventure', 'memory_world', 'maze_adventure', 'balloon_pop', 'bingo_classroom', 'platform_jump'],
  IPAS: ['science_lab', 'sorting_factory', 'fishing_catch', 'treasure_hunt', 'puzzle_builder', 'escape_room'],
  PP: ['story_adventure', 'territory_battle', 'board_game', 'treasure_hunt', 'memory_world', 'tower_builder'],
  KKA: ['coding_quest', 'maze_adventure', 'escape_room', 'puzzle_builder', 'sorting_factory', 'platform_jump'],
  PJOK: ['pjok_motion', 'racing_game', 'platform_jump', 'whack_target', 'board_game', 'balloon_pop'],
  SMUS: ['music_rhythm', 'whack_target', 'memory_world', 'balloon_pop', 'board_game', 'tower_builder'],
  RUPA: ['art_stage', 'puzzle_builder', 'sorting_factory', 'memory_world', 'treasure_hunt', 'tower_builder'],
  TARI: ['art_stage', 'pjok_motion', 'music_rhythm', 'story_adventure', 'memory_world', 'board_game'],
  TEATER: ['art_stage', 'story_adventure', 'pjok_motion', 'music_rhythm', 'memory_world', 'board_game'],
  PAI: ['story_adventure', 'puzzle_builder', 'treasure_hunt', 'memory_world', 'board_game', 'territory_battle'],
  PAK: ['story_adventure', 'puzzle_builder', 'treasure_hunt', 'memory_world', 'board_game', 'territory_battle'],
  PAKat: ['story_adventure', 'puzzle_builder', 'treasure_hunt', 'memory_world', 'board_game', 'territory_battle'],
  PAH: ['story_adventure', 'puzzle_builder', 'treasure_hunt', 'memory_world', 'board_game', 'territory_battle'],
  PAB: ['story_adventure', 'puzzle_builder', 'treasure_hunt', 'memory_world', 'board_game', 'territory_battle'],
  PAKh: ['story_adventure', 'puzzle_builder', 'treasure_hunt', 'memory_world', 'board_game', 'territory_battle'],
};

function normalisasi(teks: string): string {
  return teks.toLocaleLowerCase('id').normalize('NFKD').replace(/[^a-z0-9\s]/g, ' ');
}

export function mekanikGameAnak(engine: Pick<GameEngine, 'kode'>): MekanikGameAnak {
  return MEKANIK_PER_ENGINE[engine.kode] ?? 'treasure_hunt';
}

export function deteksiTagKompetensi(teksTp: string): TagKompetensiGame[] {
  const teks = normalisasi(teksTp);
  const hasil = POLA_TAG.filter(([, pola]) => pola.test(teks)).map(([tag]) => tag);
  return hasil.length ? hasil : ['mengidentifikasi'];
}

export function mekanikCocokUntukTp(teksTp: string, mapelKode: string): MekanikGameAnak[] {
  const tag = deteksiTagKompetensi(teksTp);
  return [...tag.flatMap((item) => MEKANIK_TAG[item]), ...(MEKANIK_MAPEL[mapelKode] ?? [])]
    .filter((item, indeks, semua) => item !== 'kuis' && semua.indexOf(item) === indeks);
}

export function pilihEngineSemantik(
  masukan: { teksTp: string; mapelKode: string; faseKode: KodeFase },
  minimum = 6,
  daftar: readonly GameEngine[] = GAME_ENGINE_FINAL,
): GameEngine[] {
  const mekanikPrioritas = mekanikCocokUntukTp(masukan.teksTp, masukan.mapelKode);
  const posisi = new Map(mekanikPrioritas.map((item, indeks) => [item, indeks]));
  const kata = normalisasi(masukan.teksTp);
  const kandidat = daftar.filter((item) => !KUIS.has(item.kode) && item.dukungan_fase[masukan.faseKode] !== 'tidak')
    .sort((a, b) => {
      const mekanikA = posisi.get(mekanikGameAnak(a)) ?? 999;
      const mekanikB = posisi.get(mekanikGameAnak(b)) ?? 999;
      const mapelA = a.mapel_cocok.includes(masukan.mapelKode) || a.mapel_cocok.includes('*') ? 0 : 1;
      const mapelB = b.mapel_cocok.includes(masukan.mapelKode) || b.mapel_cocok.includes('*') ? 0 : 1;
      const kataA = a.kata_kerja_tp.some((item) => item !== '*' && kata.includes(normalisasi(item))) ? 0 : 1;
      const kataB = b.kata_kerja_tp.some((item) => item !== '*' && kata.includes(normalisasi(item))) ? 0 : 1;
      return mekanikA - mekanikB || kataA - kataB || mapelA - mapelB || a.nama.localeCompare(b.nama, 'id');
    });
  const hasil: GameEngine[] = [];
  const dipakai = new Set<MekanikGameAnak>();
  for (const item of kandidat) {
    const mekanik = mekanikGameAnak(item);
    if (!dipakai.has(mekanik)) { hasil.push(item); dipakai.add(mekanik); }
    if (hasil.length >= Math.max(minimum, 8)) break;
  }
  for (const item of kandidat) {
    if (!hasil.includes(item)) hasil.push(item);
    if (hasil.length >= Math.max(minimum, 8)) break;
  }
  return hasil;
}
