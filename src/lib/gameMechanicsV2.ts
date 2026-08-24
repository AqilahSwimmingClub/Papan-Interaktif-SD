import type { MekanikGameAnak } from './types';

export type IntiMekanikV2 =
  | 'jelajah'
  | 'sasaran'
  | 'koleksi'
  | 'pasangan'
  | 'urutkan'
  | 'pabrik'
  | 'strategi'
  | 'eksperimen'
  | 'manipulatif'
  | 'kata'
  | 'skenario';

export interface DefinisiMekanikV2 {
  kode: MekanikGameAnak;
  nama: string;
  inti: IntiMekanikV2;
  ikon: string;
  dualWindow: boolean;
}

/** 40 keluarga mekanik original yang dapat dipilih oleh pemetaan semantik TP. */
export const MEKANIK_GAME_V2: readonly DefinisiMekanikV2[] = [
  { kode: 'adventure', nama: 'Adventure', inti: 'jelajah', ikon: '🧭', dualWindow: false },
  { kode: 'maze_adventure', nama: 'Maze Adventure', inti: 'jelajah', ikon: '🌀', dualWindow: true },
  { kode: 'platform_challenge', nama: 'Platform Challenge', inti: 'jelajah', ikon: '☁️', dualWindow: true },
  { kode: 'racing', nama: 'Racing', inti: 'jelajah', ikon: '🏎️', dualWindow: true },
  { kode: 'catch_game', nama: 'Catch Game', inti: 'sasaran', ikon: '🧺', dualWindow: true },
  { kode: 'fishing', nama: 'Fishing', inti: 'sasaran', ikon: '🎣', dualWindow: true },
  { kode: 'balloon_pop', nama: 'Balloon Pop', inti: 'sasaran', ikon: '🎈', dualWindow: true },
  { kode: 'whack_target', nama: 'Whack Target', inti: 'sasaran', ikon: '🎯', dualWindow: true },
  { kode: 'treasure_hunt', nama: 'Treasure Hunt', inti: 'koleksi', ikon: '🧰', dualWindow: false },
  { kode: 'escape_room', nama: 'Escape Room', inti: 'koleksi', ikon: '🔐', dualWindow: false },
  { kode: 'puzzle_builder', nama: 'Puzzle Builder', inti: 'urutkan', ikon: '🧩', dualWindow: true },
  { kode: 'memory_world', nama: 'Memory World', inti: 'pasangan', ikon: '🃏', dualWindow: true },
  { kode: 'matching_world', nama: 'Matching World', inti: 'pasangan', ikon: '🔗', dualWindow: true },
  { kode: 'sorting_factory', nama: 'Sorting Factory', inti: 'pabrik', ikon: '🏭', dualWindow: true },
  { kode: 'conveyor_challenge', nama: 'Conveyor Challenge', inti: 'pabrik', ikon: '📦', dualWindow: true },
  { kode: 'builder', nama: 'Builder', inti: 'urutkan', ikon: '🛠️', dualWindow: true },
  { kode: 'tower_builder', nama: 'Tower Builder', inti: 'urutkan', ikon: '🏗️', dualWindow: true },
  { kode: 'territory_battle', nama: 'Territory Battle', inti: 'strategi', ikon: '🏳️', dualWindow: true },
  { kode: 'team_battle', nama: 'Team Battle', inti: 'strategi', ikon: '⚔️', dualWindow: true },
  { kode: 'board_game', nama: 'Board Game', inti: 'strategi', ikon: '🎲', dualWindow: true },
  { kode: 'map_exploration', nama: 'Map Exploration', inti: 'strategi', ikon: '🗺️', dualWindow: false },
  { kode: 'timeline_adventure', nama: 'Timeline Adventure', inti: 'urutkan', ikon: '🕰️', dualWindow: true },
  { kode: 'simulation_game', nama: 'Simulation Game', inti: 'eksperimen', ikon: '🎛️', dualWindow: false },
  { kode: 'resource_management_edu', nama: 'Resource Management EDU', inti: 'strategi', ikon: '🌾', dualWindow: false },
  { kode: 'science_mission', nama: 'Science Mission', inti: 'eksperimen', ikon: '🔬', dualWindow: false },
  { kode: 'math_manipulative_game', nama: 'Math Manipulative Game', inti: 'manipulatif', ikon: '🧮', dualWindow: true },
  { kode: 'number_adventure', nama: 'Number Adventure', inti: 'manipulatif', ikon: '🔢', dualWindow: true },
  { kode: 'word_adventure', nama: 'Word Adventure', inti: 'kata', ikon: '🔤', dualWindow: true },
  { kode: 'reading_detective', nama: 'Reading Detective', inti: 'koleksi', ikon: '🔎', dualWindow: false },
  { kode: 'coding_quest', nama: 'Coding Quest', inti: 'urutkan', ikon: '🤖', dualWindow: true },
  { kode: 'debugging_maze', nama: 'Debugging Maze', inti: 'jelajah', ikon: '🐞', dualWindow: true },
  { kode: 'rhythm_game', nama: 'Rhythm Game', inti: 'urutkan', ikon: '🥁', dualWindow: true },
  { kode: 'art_puzzle', nama: 'Art Puzzle', inti: 'urutkan', ikon: '🎨', dualWindow: true },
  { kode: 'movement_pjok_challenge', nama: 'Movement/PJOK Challenge', inti: 'urutkan', ikon: '🏃', dualWindow: true },
  { kode: 'scenario_adventure', nama: 'Scenario Adventure', inti: 'skenario', ikon: '🎭', dualWindow: false },
  { kode: 'environment_rescue', nama: 'Environment Rescue', inti: 'strategi', ikon: '🌍', dualWindow: true },
  { kode: 'city_builder_edu', nama: 'City Builder EDU', inti: 'strategi', ikon: '🏙️', dualWindow: true },
  { kode: 'lab_challenge', nama: 'Lab Challenge', inti: 'eksperimen', ikon: '🧪', dualWindow: false },
  { kode: 'object_hunt', nama: 'Object Hunt', inti: 'koleksi', ikon: '👀', dualWindow: true },
  { kode: 'classification_challenge', nama: 'Classification Challenge', inti: 'pabrik', ikon: '🗂️', dualWindow: true },
] as const;

const DEFINISI = new Map(MEKANIK_GAME_V2.map((item) => [item.kode, item]));

const ALIAS_LAMA: Partial<Record<MekanikGameAnak, MekanikGameAnak>> = {
  racing_game: 'racing',
  monster_battle: 'team_battle',
  fishing_catch: 'fishing',
  platform_jump: 'platform_challenge',
  bingo_classroom: 'board_game',
  science_lab: 'science_mission',
  music_rhythm: 'rhythm_game',
  art_stage: 'art_puzzle',
  pjok_motion: 'movement_pjok_challenge',
  story_adventure: 'scenario_adventure',
};

export function normalisasiMekanikV2(kode: MekanikGameAnak): MekanikGameAnak {
  return ALIAS_LAMA[kode] ?? kode;
}

export function definisiMekanikV2(kode: MekanikGameAnak): DefinisiMekanikV2 {
  const normal = normalisasiMekanikV2(kode);
  return DEFINISI.get(normal) ?? DEFINISI.get('treasure_hunt')!;
}

export function jumlahMekanikPlayableV2(): number {
  return MEKANIK_GAME_V2.length;
}
