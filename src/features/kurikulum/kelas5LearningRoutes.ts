import { RUTE } from '../../routes/paths';

export type AksiPembelajaranKelas5 = readonly [label: string, rute: string];

const MASTER = new Set(['MAT', 'PP', 'BI', 'BING', 'KKA', 'RUPA']);

export function aksiPembelajaranKelas5(mapelKode: string): AksiPembelajaranKelas5[] {
  const kode = mapelKode.toUpperCase();
  if (kode === 'IPAS') {
    return [
      ['Game Edukasi', RUTE.game],
      ['VLAB', RUTE.vlab],
      ['Kuis', '/pembelajaran/kuis'],
      ['LKPD', '/pembelajaran/lkpd'],
      ['Bank Soal', '/pembelajaran/bank-soal'],
    ];
  }
  if (MASTER.has(kode)) return [['Buka Pembelajaran Kelas 5', `/kelas5/${kode}`]];
  return [];
}
