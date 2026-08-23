import { describe, expect, it } from 'vitest';
import { keadaanSesi, sudahMasuk } from './keadaanSesi';
import type { Akun, SesiAktif } from '../types';

function sesiPalsu(peran: Akun['peran']): SesiAktif {
  return {
    akun: {
      id: 'akun-1',
      nama: 'Fahmi Djawas, S.Pd.',
      username: 'fahmi.djawas',
      hash_sandi: 'hash',
      imbuhan: 'imbuhan',
      kdf_algoritma: 'PBKDF2-SHA256',
      kdf_iterasi: 210000,
      peran,
      aktif: true,
      dibuat: new Date().toISOString(),
      terakhir_masuk: null,
      gagal_berurutan: 0,
      terkunci_sampai: null,
    },
    sesi: {
      token: 'token',
      akun_id: 'akun-1',
      dibuat: new Date().toISOString(),
      kedaluwarsa: new Date(Date.now() + 3_600_000).toISOString(),
      perangkat: 'perangkat-1',
    },
  };
}

describe('lima keadaan sesi', () => {
  it('belum_setup bila perangkat tidak punya Admin', () => {
    expect(keadaanSesi({ adaAdmin: false, sesi: null })).toBe('belum_setup');
  });

  it('belum_login bila akun ada tetapi sesi tidak', () => {
    expect(keadaanSesi({ adaAdmin: true, sesi: null })).toBe('belum_login');
  });

  it('login_admin dan login_guru dibedakan dari peran akun', () => {
    expect(keadaanSesi({ adaAdmin: true, sesi: sesiPalsu('admin') })).toBe('login_admin');
    expect(keadaanSesi({ adaAdmin: true, sesi: sesiPalsu('guru') })).toBe('login_guru');
  });

  it('logout adalah keadaan tersendiri tepat setelah token dibuang', () => {
    expect(keadaanSesi({ adaAdmin: true, sesi: null, baruKeluar: true })).toBe('logout');
  });

  it('hanya dua keadaan yang dianggap sudah masuk', () => {
    expect(sudahMasuk('login_admin')).toBe(true);
    expect(sudahMasuk('login_guru')).toBe(true);
    expect(sudahMasuk('belum_setup')).toBe(false);
    expect(sudahMasuk('belum_login')).toBe(false);
    expect(sudahMasuk('logout')).toBe(false);
  });
});
