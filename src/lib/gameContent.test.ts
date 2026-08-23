import { describe, expect, it } from 'vitest';
import { DATA_KURIKULUM_FINAL } from './kurikulum/kurikulumSeed';
import { GAME_ENGINE_FINAL, saringEngineGame } from './gameEngines';
import { buatButirGameKontekstual } from './gameContent';

const engine = GAME_ENGINE_FINAL.find((item) => item.kode === 'pilihan-ganda')!;
const MAPEL = [
  ['MAT', 'Matematika'], ['BI', 'Bahasa Indonesia'], ['IPAS', 'IPAS'], ['PP', 'Pendidikan Pancasila'],
  ['PAI', 'Pendidikan Agama'], ['RUPA', 'Seni Rupa'], ['PJOK', 'PJOK'], ['KKA', 'Koding dan KA'],
] as const;

describe('konten game dinamis lintas mapel', () => {
  it.each(MAPEL)('membentuk butir kontekstual untuk %s tanpa hard-code engine per mapel', (kode, nama) => {
    const hasil = buatButirGameKontekstual(engine, {
      tpId: `TP-${kode}-UJI`, tingkatKelas: 5, mapelKode: kode, mapelNama: nama,
      teksCp: `Peserta didik memahami konsep ${nama} dalam kehidupan sehari-hari.`,
      teksElemen: `Elemen utama ${nama}.`, teksTp: `Murid mengidentifikasi dan menjelaskan konsep khas ${nama}.`,
      materi: [`Materi membahas penerapan konsep khas ${nama} secara aman dan bertanggung jawab.`],
      tpSerumpun: [`Murid membandingkan contoh lain pada ${nama}.`],
    }, 4, 4);
    expect(hasil).toHaveLength(4);
    expect(hasil.every((butir) => butir.pilihan.includes(butir.jawaban))).toBe(true);
    expect(hasil.some((butir) => butir.pertanyaan.toLocaleLowerCase('id').includes('khas'))).toBe(true);
  });

  it('mengubah pertanyaan dan jawaban saat TP berubah walau engine tetap sama', () => {
    const dasar = { tingkatKelas: 3, mapelKode: 'IPAS', mapelNama: 'IPAS', teksCp: 'Memahami lingkungan.', teksElemen: 'Makhluk hidup.', materi: [], tpSerumpun: [] };
    const satu = buatButirGameKontekstual(engine, { ...dasar, tpId: 'TP-IPAS-A', teksTp: 'Murid menjelaskan daur hidup kupu-kupu.' }, 2, 4);
    const dua = buatButirGameKontekstual(engine, { ...dasar, tpId: 'TP-IPAS-B', teksTp: 'Murid mengidentifikasi perubahan wujud air.' }, 2, 4);
    expect(satu[0]?.pertanyaan).not.toBe(dua[0]?.pertanyaan);
    expect(satu[0]?.jawaban).not.toBe(dua[0]?.jawaban);
  });

  it('menghasilkan konten valid bagi seluruh TP rekomendasi final yang memiliki engine relevan', () => {
    const elemen = new Map(DATA_KURIKULUM_FINAL.elemen.map((item) => [item.id, item]));
    const cp = new Map(DATA_KURIKULUM_FINAL.cp.map((item) => [item.id, item]));
    const mapel = new Map(DATA_KURIKULUM_FINAL.mataPelajaran.map((item) => [item.kode, item]));

    for (const tp of DATA_KURIKULUM_FINAL.tp) {
      const elemenAktif = elemen.get(tp.elemen_id)!;
      const cpAktif = cp.get(elemenAktif.cp_id)!;
      const mapelAktif = mapel.get(cpAktif.mapel_kode)!;
      const engineAktif = saringEngineGame({
        fase_kode: cpAktif.fase_kode,
        mapel_kode: cpAktif.mapel_kode,
        teks_tp: tp.teks_tujuan,
      })[0];
      expect(engineAktif, `engine untuk ${tp.id}`).toBeDefined();
      const hasil = buatButirGameKontekstual(engineAktif!, {
        tpId: tp.id,
        tingkatKelas: tp.tingkat_kelas,
        mapelKode: cpAktif.mapel_kode,
        mapelNama: mapelAktif.nama,
        teksCp: cpAktif.teks_capaian,
        teksElemen: elemenAktif.teks_elemen,
        teksTp: tp.teks_tujuan,
        materi: [],
        tpSerumpun: [],
      }, 3, 4);
      expect(hasil, tp.id).toHaveLength(3);
      expect(hasil.every((butir) => butir.pilihan.includes(butir.jawaban)), tp.id).toBe(true);
    }
  });
});
