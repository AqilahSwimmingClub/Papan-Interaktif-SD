import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import { TOKO, VERSI_BASIS_DATA, bukaBasisData } from './db';
import { adaAdmin, akunLewatUsername, jumlahAkun, simpanAkun } from './akunRepo';
import { hapusSesi, hapusSesiKedaluwarsa, sesiLewatToken, simpanSesi } from './sesiRepo';
import { bacaSekolah, sekolahKosong, simpanSekolah } from './sekolahRepo';
import { idPerangkat } from './perangkatRepo';
import type { Akun } from '../types';

function akunContoh(sisipan: Partial<Akun> = {}): Akun {
  return {
    id: 'akun-uji',
    nama: 'Fahmi Djawas, S.Pd.',
    username: 'fahmi.djawas',
    hash_sandi: 'aGFzaA==',
    imbuhan: 'aW1idWhhbg==',
    kdf_algoritma: 'PBKDF2-SHA256',
    kdf_iterasi: 210000,
    peran: 'admin',
    aktif: true,
    dibuat: new Date().toISOString(),
    terakhir_masuk: null,
    gagal_berurutan: 0,
    terkunci_sampai: null,
    ...sisipan,
  };
}

describe('penyimpanan lokal offline-first', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
  });

  it('membuka basis data dengan toko Zona 6 dan konfigurasi sekolah', async () => {
    const db = await bukaBasisData();
    expect(db.version).toBe(VERSI_BASIS_DATA);
    expect([...db.objectStoreNames].sort()).toEqual(
      [TOKO.akun, TOKO.perangkat, TOKO.sekolah, TOKO.sesiLogin].sort(),
    );
  });

  it('menyimpan dan membaca akun lewat indeks username', async () => {
    expect(await jumlahAkun()).toBe(0);
    expect(await adaAdmin()).toBe(false);

    await simpanAkun(akunContoh());

    expect(await jumlahAkun()).toBe(1);
    expect(await adaAdmin()).toBe(true);
    const dibaca = await akunLewatUsername('Fahmi.Djawas');
    expect(dibaca?.id).toBe('akun-uji');
  });

  it('menyimpan, membaca, dan menghapus sesi login', async () => {
    const sesi = {
      token: 'token-uji',
      akun_id: 'akun-uji',
      dibuat: new Date().toISOString(),
      kedaluwarsa: new Date(Date.now() + 3_600_000).toISOString(),
      perangkat: 'perangkat-uji',
    };

    await simpanSesi(sesi);
    expect(await sesiLewatToken('token-uji')).toMatchObject({ akun_id: 'akun-uji' });

    await hapusSesi('token-uji');
    expect(await sesiLewatToken('token-uji')).toBeUndefined();
  });

  it('membersihkan sesi yang sudah kedaluwarsa saja', async () => {
    await simpanSesi({
      token: 'basi',
      akun_id: 'akun-uji',
      dibuat: new Date(Date.now() - 7_200_000).toISOString(),
      kedaluwarsa: new Date(Date.now() - 3_600_000).toISOString(),
      perangkat: 'perangkat-uji',
    });
    await simpanSesi({
      token: 'segar',
      akun_id: 'akun-uji',
      dibuat: new Date().toISOString(),
      kedaluwarsa: new Date(Date.now() + 3_600_000).toISOString(),
      perangkat: 'perangkat-uji',
    });

    expect(await hapusSesiKedaluwarsa()).toBe(1);
    expect(await sesiLewatToken('basi')).toBeUndefined();
    expect(await sesiLewatToken('segar')).toBeDefined();
  });

  it('menyimpan identitas sekolah pada tabel, bukan di kode', async () => {
    expect(await bacaSekolah()).toBeUndefined();

    await simpanSekolah({
      ...sekolahKosong(),
      nama: 'SDN Satria Jaya 01',
      npsn: '20218123',
    });

    const sekolah = await bacaSekolah();
    expect(sekolah?.nama).toBe('SDN Satria Jaya 01');
    expect(sekolah?.npsn).toBe('20218123');
  });

  it('memakai kembali id perangkat yang sama', async () => {
    const pertama = await idPerangkat();
    const kedua = await idPerangkat();
    expect(pertama).toBe(kedua);
    expect(pertama).toMatch(/^[0-9a-f-]{36}$/);
  });
});
