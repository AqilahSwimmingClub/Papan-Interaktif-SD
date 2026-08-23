import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../test/bantuan';
import { GAME_ENGINE_FINAL, nilaiJawabanGame, PROFIL_FASE_GAME, ringkasPermainan, saringEngineGame } from './gameEngines';
import { bacaDetailMapelKelas } from './storage/kurikulumRepo';
import { buatKatalogGameUntukTp, daftarEngineGame, hitungRelasiGame } from './storage/gameRepo';

describe('pustaka 30 game engine Tahap 7', () => {
  beforeEach(async () => resetPenyimpanan());

  it('mengunci 30 engine dan matriks fase A=22, B=27, C=30', () => {
    expect(GAME_ENGINE_FINAL).toHaveLength(30);
    expect(new Set(GAME_ENGINE_FINAL.map((item) => item.kode)).size).toBe(30);
    expect(GAME_ENGINE_FINAL.filter((item) => item.dukungan_fase.A !== 'tidak')).toHaveLength(22);
    expect(GAME_ENGINE_FINAL.filter((item) => item.dukungan_fase.B !== 'tidak')).toHaveLength(27);
    expect(GAME_ENGINE_FINAL.filter((item) => item.dukungan_fase.C !== 'tidak')).toHaveLength(30);
    expect(PROFIL_FASE_GAME.A).toMatchObject({ jumlah_pilihan: 2, bacakan_wajib: true, peringkat: 'tidak_ada' });
  });

  it('menyaring fase, mapel, kata kerja, dan konteks kelas tanpa hard-code konten mapel', () => {
    const hasil = saringEngineGame({ fase_kode: 'C', mapel_kode: 'KKA', teks_tp: 'Murid menyusun algoritma dan mengenali pola.' });
    expect(hasil.length).toBeGreaterThanOrEqual(6);
    expect(hasil.some((item) => item.kode === 'coding-blocks')).toBe(true);
    expect(hasil.every((item) => item.dukungan_fase.C !== 'tidak')).toBe(true);
    expect(saringEngineGame({ fase_kode: 'A', mapel_kode: 'PAKh', teks_tp: 'Murid mempraktikkan sikap.' }).some((item) => item.kode === 'kartu-peran')).toBe(true);
  });

  it('membentuk relasi CP → TP → materi → game dan engine hanya mengembalikan skor', async () => {
    const detail = await bacaDetailMapelKelas(1, 'MAT');
    const tp = detail?.elemen.flatMap((item) => item.tpRekomendasi)[0];
    expect(tp).toBeDefined();
    const katalog = await buatKatalogGameUntukTp(tp!.id);
    expect(katalog.length).toBeGreaterThanOrEqual(6);
    expect(katalog.every((item) => item.tp_id === tp!.id && item.cp_id === detail!.cp.id && item.mapel_kode === 'MAT')).toBe(true);
    expect(await daftarEngineGame()).toHaveLength(30);
    expect((await hitungRelasiGame(tp!.id)).jumlahGame).toBeGreaterThanOrEqual(6);

    const butir = katalog[0]!.butir[0]!;
    const jawaban = nilaiJawabanGame(butir, butir.jawaban);
    expect(ringkasPermainan([jawaban])).toMatchObject({ skor: 10, skor_maksimal: 10 });
  });
});
