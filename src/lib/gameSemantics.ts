import type { GameEngine, KodeFase, MekanikGameAnak, TagKompetensiGame } from './types';
import { GAME_ENGINE_FINAL } from './gameEngines';

const KUIS = new Set(['pilihan-ganda', 'benar-salah', 'kuis-cepat']);

export const MEKANIK_PER_ENGINE: Readonly<Record<string, MekanikGameAnak>> = {
  'pilihan-ganda': 'kuis', 'benar-salah': 'kuis', 'kuis-cepat': 'kuis',
  jodohkan: 'matching_world', 'drag-drop': 'classification_challenge', 'susun-urutan': 'timeline_adventure',
  'isi-rumpang': 'word_adventure', 'memory-card': 'memory_world', 'tebak-gambar': 'object_hunt',
  'tebak-kata': 'reading_detective', 'susun-kata': 'builder', puzzle: 'puzzle_builder',
  'maze-labirin': 'maze_adventure', 'roda-tantangan': 'board_game', 'bingo-edukasi': 'bingo_classroom',
  'balap-soal': 'racing', 'battle-kelompok': 'team_battle', 'siapa-cepat': 'balloon_pop',
  sorting: 'sorting_factory', klasifikasi: 'conveyor_challenge', timeline: 'timeline_adventure',
  simulasi: 'simulation_game', 'eksplorasi-gambar': 'treasure_hunt', 'matematika-cepat': 'whack_target',
  'soal-cerita-interaktif': 'escape_room', 'coding-blocks': 'coding_quest',
  'debugging-challenge': 'debugging_maze', 'pattern-recognition': 'math_manipulative_game',
  'peta-interaktif': 'map_exploration', 'kartu-peran': 'scenario_adventure',
  'garis-bilangan': 'number_adventure', 'pasar-pecahan': 'resource_management_edu',
  'bangun-geometri': 'tower_builder', 'laboratorium-ukur': 'lab_challenge',
  'misi-soal-cerita': 'math_manipulative_game', 'perakit-kalimat': 'builder',
  'detektif-bacaan': 'reading_detective', 'rantai-kosakata': 'matching_world',
  'simak-dan-pilih': 'fishing', 'panggung-argumen': 'team_battle',
  'jaring-ekosistem': 'environment_rescue', 'uji-hipotesis': 'science_mission', 'roda-siklus': 'timeline_adventure',
  'misi-tubuh-sehat': 'platform_challenge', 'rantai-sebab-akibat': 'puzzle_builder',
  'vocabulary-quest': 'adventure', 'spelling-bee': 'word_adventure', 'dialogue-path': 'maze_adventure',
  'musyawarah-kelas': 'territory_battle', 'hak-dan-tanggung-jawab': 'sorting_factory',
  'kompas-nilai': 'scenario_adventure', 'rute-algoritma': 'coding_quest', 'mesin-data': 'conveyor_challenge',
  'dilema-ai': 'simulation_game', 'sirkuit-gerak': 'movement_pjok_challenge', 'pilih-gerak-aman': 'catch_game',
  'pola-irama': 'rhythm_game', 'galeri-warna-bentuk': 'art_puzzle',
  'panggung-ekspresi': 'movement_pjok_challenge', 'jejak-keteladanan': 'scenario_adventure',
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
  mengurutkan: ['timeline_adventure', 'racing', 'puzzle_builder', 'coding_quest', 'board_game', 'treasure_hunt'],
  mengklasifikasi: ['sorting_factory', 'classification_challenge', 'conveyor_challenge', 'environment_rescue', 'catch_game', 'puzzle_builder'],
  mengidentifikasi: ['object_hunt', 'whack_target', 'balloon_pop', 'maze_adventure', 'fishing', 'treasure_hunt'],
  menganalisis: ['reading_detective', 'escape_room', 'territory_battle', 'scenario_adventure', 'team_battle', 'board_game'],
  menghitung: ['number_adventure', 'math_manipulative_game', 'racing', 'tower_builder', 'whack_target', 'board_game'],
  mencocokkan: ['matching_world', 'memory_world', 'puzzle_builder', 'fishing', 'whack_target', 'word_adventure'],
  menyusun: ['builder', 'tower_builder', 'puzzle_builder', 'word_adventure', 'coding_quest', 'art_puzzle'],
  mempraktikkan: ['movement_pjok_challenge', 'simulation_game', 'rhythm_game', 'art_puzzle', 'racing', 'platform_challenge'],
  mengamati: ['science_mission', 'lab_challenge', 'object_hunt', 'fishing', 'platform_challenge', 'escape_room'],
  berkomunikasi: ['scenario_adventure', 'word_adventure', 'team_battle', 'board_game', 'memory_world', 'treasure_hunt'],
};

const MEKANIK_MAPEL: Record<string, readonly MekanikGameAnak[]> = {
  MAT: ['number_adventure', 'math_manipulative_game', 'racing', 'tower_builder', 'whack_target', 'puzzle_builder', 'board_game'],
  BI: ['reading_detective', 'word_adventure', 'escape_room', 'maze_adventure', 'treasure_hunt', 'puzzle_builder'],
  BING: ['word_adventure', 'matching_world', 'maze_adventure', 'balloon_pop', 'catch_game', 'platform_challenge'],
  IPAS: ['science_mission', 'lab_challenge', 'environment_rescue', 'sorting_factory', 'fishing', 'treasure_hunt'],
  PP: ['scenario_adventure', 'territory_battle', 'board_game', 'city_builder_edu', 'memory_world', 'team_battle'],
  KKA: ['coding_quest', 'debugging_maze', 'maze_adventure', 'escape_room', 'puzzle_builder', 'conveyor_challenge'],
  PJOK: ['movement_pjok_challenge', 'racing', 'platform_challenge', 'whack_target', 'board_game', 'catch_game'],
  SMUS: ['rhythm_game', 'whack_target', 'memory_world', 'balloon_pop', 'board_game', 'builder'],
  RUPA: ['art_puzzle', 'puzzle_builder', 'classification_challenge', 'memory_world', 'object_hunt', 'builder'],
  TARI: ['movement_pjok_challenge', 'rhythm_game', 'art_puzzle', 'scenario_adventure', 'memory_world', 'board_game'],
  TEATER: ['scenario_adventure', 'art_puzzle', 'movement_pjok_challenge', 'rhythm_game', 'memory_world', 'board_game'],
  PAI: ['scenario_adventure', 'timeline_adventure', 'treasure_hunt', 'matching_world', 'board_game', 'territory_battle'],
  PAK: ['scenario_adventure', 'timeline_adventure', 'treasure_hunt', 'matching_world', 'board_game', 'territory_battle'],
  PAKat: ['scenario_adventure', 'timeline_adventure', 'treasure_hunt', 'matching_world', 'board_game', 'territory_battle'],
  PAH: ['scenario_adventure', 'timeline_adventure', 'treasure_hunt', 'matching_world', 'board_game', 'territory_battle'],
  PAB: ['scenario_adventure', 'timeline_adventure', 'treasure_hunt', 'matching_world', 'board_game', 'territory_battle'],
  PAKh: ['scenario_adventure', 'timeline_adventure', 'treasure_hunt', 'matching_world', 'board_game', 'territory_battle'],
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
