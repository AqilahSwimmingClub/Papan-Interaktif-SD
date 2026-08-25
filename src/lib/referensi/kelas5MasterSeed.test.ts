import { describe, expect, it } from 'vitest';
import { BAB_MASTER_KELAS5, BUKU_MASTER_KELAS5, TOPIK_MASTER_KELAS5 } from './kelas5MasterSeed';
import { LINGKUP_KKA_KELAS5, LINGKUP_RUPA_KELAS5 } from './kelas5KkaRupaSupplement';

const MAPEL_BUKU = ['MAT','PP','IPAS','BI','BING','KKA','RUPA'] as const;
const MAPEL_BERBAB = ['MAT','PP','IPAS','BI','BING'] as const;

describe('master referensi Kelas 5', () => {
  it('memiliki satu buku aktif untuk seluruh mapel guru kelas yang sedang dijadikan percontohan', () => {
    expect(BUKU_MASTER_KELAS5).toHaveLength(7);
    expect(BUKU_MASTER_KELAS5.map((buku) => buku.mapel_kode)).toEqual(MAPEL_BUKU);
    expect(BUKU_MASTER_KELAS5.every((buku) => buku.tingkat_kelas === 5 && buku.status === 'aktif')).toBe(true);
  });

  it.each(MAPEL_BERBAB)('%s mempunyai bab dan setiap bab mempunyai topik', (kode) => {
    const buku = BUKU_MASTER_KELAS5.find((item) => item.mapel_kode === kode)!;
    const bab = BAB_MASTER_KELAS5.filter((item) => item.buku_id === buku.id);
    expect(bab.length).toBeGreaterThan(0);
    for (const item of bab) {
      expect(TOPIK_MASTER_KELAS5.filter((topik) => topik.bab_id === item.id).length).toBeGreaterThan(0);
    }
  });

  it('menyimpan KKA dan Seni Rupa sebagai lingkup materi terverifikasi, bukan bab yang dikarang', () => {
    expect(LINGKUP_KKA_KELAS5).toHaveLength(4);
    expect(LINGKUP_RUPA_KELAS5).toHaveLength(4);
    expect([...LINGKUP_KKA_KELAS5, ...LINGKUP_RUPA_KELAS5].every((item) => item.topik.length >= 4 && item.sumber.length > 20)).toBe(true);
  });
});
