import { ikonGameplay } from './gameplay';
import { pilihSkenarioGame } from './gameScenarioBank';
import { deteksiTagKompetensi, mekanikGameAnak } from './gameSemantics';
import type { ButirGame, GameEngine, MekanikGameAnak } from './types';

export interface KonteksKontenGame {
  tpId: string;
  tingkatKelas: number;
  mapelKode: string;
  mapelNama: string;
  teksCp: string;
  teksElemen: string;
  teksTp: string;
  materi: string[];
  tpSerumpun: string[];
}

function acakDeterministik<T>(daftar: T[], benih: number): T[] {
  return [...daftar].sort((a, b) => {
    const nilai = (item: T) => `${String(item)}-${benih}`.split('')
      .reduce((jumlah, huruf) => jumlah + huruf.charCodeAt(0), 0) % 97;
    return nilai(a) - nilai(b) || String(a).localeCompare(String(b), 'id');
  });
}

function labelMisi(mekanik: MekanikGameAnak, tujuan: string, ikon: string): string {
  const nama = mekanik.replaceAll('_', ' ');
  const tindakan: Partial<Record<MekanikGameAnak, string>> = {
    kuis: 'Selesaikan misi',
    maze_adventure: 'Jelajahi labirin',
    debugging_maze: 'Perbaiki rute robot',
    balloon_pop: 'Pecahkan balon sasaran',
    whack_target: 'Pukul target bergerak',
    treasure_hunt: 'Kumpulkan tiga kunci peti',
    escape_room: 'Buka tiga kunci ruang',
    object_hunt: 'Temukan tiga objek petunjuk',
    racing: 'Isi tenaga kendaraan',
    tower_builder: 'Bangun menara',
    territory_battle: 'Rebut wilayah untuk timmu',
    team_battle: 'Isi energi timmu',
    fishing: 'Tangkap ikan petunjuk',
    platform_challenge: 'Lompat di platform',
    sorting_factory: 'Arahkan paket ke gerbang',
    conveyor_challenge: 'Kendalikan konveyor',
    classification_challenge: 'Kelompokkan objek',
    puzzle_builder: 'Susun keping',
    timeline_adventure: 'Susun garis waktu',
    coding_quest: 'Susun blok perintah',
    rhythm_game: 'Ketuk urutan ritme',
    art_puzzle: 'Susun karya visual',
    movement_pjok_challenge: 'Selesaikan urutan gerak',
    memory_world: 'Temukan pasangan kartu',
    matching_world: 'Hubungkan pasangan',
    board_game: 'Gerakkan pion ke tujuan',
    map_exploration: 'Jelajahi titik pada peta',
    number_adventure: 'Gerakkan roket angka',
    math_manipulative_game: 'Susun objek berhitung',
    word_adventure: 'Kumpulkan huruf',
    reading_detective: 'Kumpulkan bukti bacaan',
    science_mission: 'Rakit lalu jalankan eksperimen',
    lab_challenge: 'Atur alat lalu jalankan uji',
    scenario_adventure: 'Bantu tokoh mengambil tindakan',
    environment_rescue: 'Pulihkan lingkungan',
    city_builder_edu: 'Bangun kota seimbang',
    resource_management_edu: 'Kelola sumber daya',
  };
  return `${ikon} ${tindakan[mekanik] ?? `Mainkan ${nama}`}: ${tujuan}.`;
}

function butirInteraktif(
  engine: GameEngine,
  konteks: KonteksKontenGame,
  indeks: number,
  pilihanMaks: number,
): ButirGame {
  const mekanik = mekanikGameAnak(engine);
  const tag = deteksiTagKompetensi(konteks.teksTp)[0];
  const skenario = pilihSkenarioGame(konteks.mapelKode, konteks.teksTp, konteks.tpId, indeks);
  const kandidat = [skenario.jawaban, ...skenario.pengalih].slice(0, Math.max(4, pilihanMaks));
  let pilihan = acakDeterministik(kandidat, indeks + engine.kode.length);
  let jawaban = skenario.jawaban;

  if (['puzzle_builder', 'timeline_adventure', 'builder', 'tower_builder', 'coding_quest', 'rhythm_game', 'art_puzzle', 'movement_pjok_challenge', 'music_rhythm', 'art_stage', 'pjok_motion'].includes(mekanik)) {
    const urutan = [...skenario.urutan];
    jawaban = urutan.join(' → ');
    pilihan = acakDeterministik(urutan, indeks + konteks.tpId.length + 3);
  } else if (mekanik === 'word_adventure') {
    jawaban = skenario.kata.replace(/[^a-z0-9]/gi, '').toLocaleUpperCase('id').slice(0, 12) || 'KATA';
    pilihan = [...jawaban];
  } else if (mekanik === 'number_adventure' || mekanik === 'math_manipulative_game') {
    const sasaran = skenario.angka?.jawaban ?? (konteks.tingkatKelas * 2 + indeks + 2);
    jawaban = String(sasaran);
    pilihan = (skenario.angka?.pilihan ?? [sasaran - 2, sasaran - 1, sasaran, sasaran + 2]).map(String);
  } else if (!pilihan.includes(jawaban)) {
    pilihan = [jawaban, ...pilihan].slice(0, Math.max(4, pilihanMaks));
  }

  return {
    id: `BUTIR-${konteks.tpId}-${engine.kode}-${indeks + 1}`,
    pertanyaan: labelMisi(mekanik, skenario.misi, ikonGameplay(konteks.mapelKode, indeks)),
    pilihan,
    jawaban,
    penjelasan: `[adegan-v2] Petualangan ${engine.nama} memakai adegan “${skenario.topik}” untuk melatih ${tag}; teks CP/TP tidak ditampilkan sebagai soal.`,
    sumber: konteks.materi.length ? 'materi' : 'tp',
    narasi: skenario.narasi,
    tag_kompetensi: tag,
    mekanik_anak: mekanik,
  };
}

/** Teks CP/TP hanya merutekan kompetensi, skenario, dan engine; tidak dijadikan isi soal. */
export function buatButirGameKontekstual(
  engine: GameEngine,
  konteks: KonteksKontenGame,
  jumlah: number,
  pilihanMaks: number,
): ButirGame[] {
  return Array.from({ length: jumlah }, (_, indeks) =>
    butirInteraktif(engine, konteks, indeks, pilihanMaks),
  );
}

export function alasanEngineGame(engine: GameEngine, teksTp: string): string {
  const teks = teksTp.toLocaleLowerCase('id');
  const cocok = engine.kata_kerja_tp.find((kata) => kata !== '*' && teks.includes(kata));
  return cocok
    ? `Gameplay ${engine.nama} melatih tindakan “${cocok}” melalui dunia ${mekanikGameAnak(engine).replaceAll('_', ' ')}.`
    : `Dunia game ${mekanikGameAnak(engine).replaceAll('_', ' ')} melatih ${engine.yang_diukur.toLocaleLowerCase('id')}.`;
}
