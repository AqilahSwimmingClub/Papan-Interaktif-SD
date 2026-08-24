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
  const misi: Record<MekanikGameAnak, string> = {
    kuis: `Selesaikan misi: ${tujuan}.`,
    maze_adventure: `Jelajahi labirin lalu ${tujuan}.`,
    balloon_pop: `Pecahkan balon yang tepat untuk ${tujuan}.`,
    whack_target: `Pukul target yang tepat untuk ${tujuan}.`,
    treasure_hunt: `Buka peti petunjuk dan ${tujuan}.`,
    racing_game: `Isi tenaga kendaraan dengan pilihan tepat: ${tujuan}.`,
    tower_builder: `Bangun menara sambil ${tujuan}.`,
    territory_battle: `Rebut petak untuk timmu: ${tujuan}.`,
    monster_battle: `Isi daya sahabat monster untuk ${tujuan}.`,
    fishing_catch: `Tangkap ikan yang membantu kamu ${tujuan}.`,
    platform_jump: `Lompat ke platform yang tepat untuk ${tujuan}.`,
    sorting_factory: `Arahkan paket yang tepat untuk ${tujuan}.`,
    puzzle_builder: `Susun keping sesuai urutan untuk ${tujuan}.`,
    memory_world: `Temukan pasangan kartu untuk ${tujuan}.`,
    board_game: `Bantu pion mencapai tujuan sambil ${tujuan}.`,
    bingo_classroom: `Tandai tiga petak tepat untuk ${tujuan}.`,
    escape_room: `Buka tiga kunci untuk ${tujuan}.`,
    number_adventure: `Gerakkan roket angka dan ${tujuan}.`,
    word_adventure: `Kumpulkan huruf untuk ${tujuan}.`,
    science_lab: `Nyalakan alat laboratorium lalu ${tujuan}.`,
    coding_quest: `Susun blok perintah untuk ${tujuan}.`,
    music_rhythm: `Ketuk keping nada untuk ${tujuan}.`,
    art_stage: `Susun keping panggung untuk ${tujuan}.`,
    pjok_motion: `Selesaikan urutan gerak untuk ${tujuan}.`,
    story_adventure: `Bantu tokoh dalam cerita untuk ${tujuan}.`,
  };
  return `${ikon} ${misi[mekanik]}`;
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

  if (['puzzle_builder', 'coding_quest', 'music_rhythm', 'art_stage', 'pjok_motion'].includes(mekanik)) {
    const urutan = [...skenario.urutan];
    jawaban = urutan.join(' → ');
    pilihan = acakDeterministik(urutan, indeks + konteks.tpId.length + 3);
  } else if (mekanik === 'word_adventure') {
    jawaban = skenario.kata.replace(/[^a-z0-9]/gi, '').toLocaleUpperCase('id').slice(0, 12) || 'KATA';
    pilihan = [...jawaban];
  } else if (mekanik === 'number_adventure') {
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
