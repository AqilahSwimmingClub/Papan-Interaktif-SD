import { describe, expect, it } from 'vitest';
import { aksiPembelajaranKelas5 } from './kelas5LearningRoutes';

describe('aksiPembelajaranKelas5', () => {
  it('memberi IPAS akses ke game, vlab, kuis, LKPD, dan bank soal', () => {
    expect(aksiPembelajaranKelas5('IPAS')).toEqual([
      ['Game Edukasi', '/game'],
      ['VLAB', '/vlab'],
      ['Kuis', '/pembelajaran/kuis'],
      ['LKPD', '/pembelajaran/lkpd'],
      ['Bank Soal', '/pembelajaran/bank-soal'],
    ]);
  });

  it.each(['MAT', 'PP', 'BI', 'BING', 'KKA', 'RUPA'])('%s memakai hub master mapel kelas 5', (kode) => {
    expect(aksiPembelajaranKelas5(kode)).toEqual([
      ['Buka Pembelajaran Kelas 5', `/kelas5/${kode}`],
    ]);
  });

  it('tidak membuat rute palsu untuk mapel yang belum punya konten kelas 5', () => {
    expect(aksiPembelajaranKelas5('PJOK')).toEqual([]);
  });
});
