import { describe, expect, it } from 'vitest';
import { BAB_MASTER_KELAS1, BUKU_MASTER_KELAS1, TOPIK_MASTER_KELAS1 } from './kelas1MasterSeed';

describe('master referensi Kelas 1', () => {
  it('memiliki 11 buku aktif untuk mapel Kelas 1 yang dipakai', () => {
    expect(BUKU_MASTER_KELAS1).toHaveLength(11);
    expect(new Set(BUKU_MASTER_KELAS1.map((x) => x.id)).size).toBe(BUKU_MASTER_KELAS1.length);
    expect(BUKU_MASTER_KELAS1.every((x) => x.tingkat_kelas === 1 && x.status === 'aktif')).toBe(true);
  });

  it('tidak memasukkan IPAS, Bahasa Inggris, atau KKA ke Kelas 1', () => {
    const kode = new Set(BUKU_MASTER_KELAS1.map((x) => x.mapel_kode));
    expect(kode.has('IPAS')).toBe(false);
    expect(kode.has('BING')).toBe(false);
    expect(kode.has('KKA')).toBe(false);
  });

  it('memiliki 34 bab dan 51 topik terverifikasi tanpa ID ganda', () => {
    expect(BAB_MASTER_KELAS1).toHaveLength(34);
    expect(TOPIK_MASTER_KELAS1).toHaveLength(51);
    expect(new Set(BAB_MASTER_KELAS1.map((x) => x.id)).size).toBe(BAB_MASTER_KELAS1.length);
    expect(new Set(TOPIK_MASTER_KELAS1.map((x) => x.id)).size).toBe(TOPIK_MASTER_KELAS1.length);
  });

  it('tidak memiliki relasi buku → bab → topik yang putus', () => {
    const buku = new Set(BUKU_MASTER_KELAS1.map((x) => x.id));
    const bab = new Set(BAB_MASTER_KELAS1.map((x) => x.id));
    expect(BAB_MASTER_KELAS1.every((x) => buku.has(x.buku_id))).toBe(true);
    expect(TOPIK_MASTER_KELAS1.every((x) => bab.has(x.bab_id))).toBe(true);
  });

  it('mengunci struktur Matematika dan Bahasa Indonesia Kelas 1', () => {
    const mat = BUKU_MASTER_KELAS1.find((x) => x.mapel_kode === 'MAT');
    const bi = BUKU_MASTER_KELAS1.find((x) => x.mapel_kode === 'BI');
    expect(mat).toBeTruthy(); expect(bi).toBeTruthy();
    expect(BAB_MASTER_KELAS1.filter((x) => x.buku_id === mat?.id)).toHaveLength(8);
    expect(BAB_MASTER_KELAS1.filter((x) => x.buku_id === bi?.id)).toHaveLength(8);
    const babMat = new Set(BAB_MASTER_KELAS1.filter((x) => x.buku_id === mat?.id).map((x) => x.id));
    expect(TOPIK_MASTER_KELAS1.filter((x) => babMat.has(x.bab_id))).toHaveLength(25);
  });
});
