import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../test/bantuan';
import {
  aturUlangSandiGuru,
  buatAdminPertama,
  buatAkunGuru,
  keluar,
  masuk,
  ubahAkunGuru,
  ubahStatusAkunGuru,
} from './auth/authService';
import { getFaseByKelas, getKodeMapelAktifByKelas } from './kelasMapel';
import { akunLewatUsername } from './storage/akunRepo';
import { tutupBasisData } from './storage/db';
import { bacaGuru } from './storage/pelengkapRepo';
import { daftarSiswaKelas, imporSiswaKelas, pastikanKelasKerja } from './storage/kelasRepo';
import { daftarMapelUntukKelas } from './storage/kurikulumRepo';

const ADMIN = { nama: 'Admin Sekolah', username: 'admin.final', password: 'SandiAdmin#2026', konfirmasi: 'SandiAdmin#2026' };

describe('fix final akun dan profil Guru', () => {
  beforeEach(async () => resetPenyimpanan());

  it('menyimpan akun dan profil Guru permanen, lalu Guru aktif dapat login ke akunnya sendiri', async () => {
    const admin = await buatAdminPertama(ADMIN);
    const guru = await buatAkunGuru(admin, {
      nama: 'Guru Kelas Lima', username: 'guru.kelas5', password: 'SandiGuru#2026', konfirmasi: 'SandiGuru#2026',
      kelas: [5], rombel: 'B', aktif: true,
    });
    await tutupBasisData();
    expect(await akunLewatUsername('guru.kelas5')).toMatchObject({ id: guru.id, aktif: true, peran: 'guru' });
    expect(await bacaGuru(guru.id)).toMatchObject({ id: guru.id, kelas_diampu: [5], rombel: 'B' });
    await masuk({ username: 'guru.kelas5', password: 'SandiGuru#2026', peran: 'guru' });
    await keluar();
  });

  it('menolak Guru nonaktif dengan pesan jelas dan edit tidak membuat akun duplikat', async () => {
    const admin = await buatAdminPertama(ADMIN);
    const guru = await buatAkunGuru(admin, { nama: 'Guru A', username: 'guru.a', password: 'SandiGuru#2026', konfirmasi: 'SandiGuru#2026', kelas: [2] });
    await ubahAkunGuru(admin, guru.id, { nama: 'Guru A Diperbarui', username: 'guru.a.baru', kelas: [2], rombel: 'A' });
    expect(await akunLewatUsername('guru.a')).toBeUndefined();
    expect(await akunLewatUsername('guru.a.baru')).toMatchObject({ id: guru.id });
    await ubahStatusAkunGuru(admin, guru.id, false);
    await expect(masuk({ username: 'guru.a.baru', password: 'SandiGuru#2026', peran: 'guru' })).rejects.toMatchObject({ kode: 'AKUN_NONAKTIF', message: expect.stringContaining('dinonaktifkan') });
  });

  it('reset password mengganti credential tanpa menghapus profil, siswa, atau scope rombel', async () => {
    const admin = await buatAdminPertama(ADMIN);
    const guru = await buatAkunGuru(admin, { nama: 'Guru Data', username: 'guru.data', password: 'PasswordLama#1', konfirmasi: 'PasswordLama#1', kelas: [4], rombel: 'C' });
    const kelas = await pastikanKelasKerja(4, guru.id);
    await imporSiswaKelas(kelas.id, [{ nama: 'Siswa Tetap' }]);
    await aturUlangSandiGuru(admin, guru.id, 'PasswordBaru#2');
    await expect(masuk({ username: guru.username, password: 'PasswordLama#1', peran: 'guru' })).rejects.toMatchObject({ kode: 'KREDENSIAL_SALAH' });
    await expect(masuk({ username: guru.username, password: 'PasswordBaru#2', peran: 'guru' })).resolves.toBeDefined();
    expect(await bacaGuru(guru.id)).toMatchObject({ kelas_diampu: [4], rombel: 'C' });
    expect((await daftarSiswaKelas(kelas.id)).map((item) => item.nama)).toEqual(['Siswa Tetap']);
  });

  it('memisahkan data dengan scope guru + kelas/rombel + tahun ajaran', async () => {
    const kelasA = await pastikanKelasKerja(3, 'guru-sama', 'A');
    const kelasB = await pastikanKelasKerja(3, 'guru-sama', 'B');
    expect(kelasA.id).not.toBe(kelasB.id);
    await imporSiswaKelas(kelasA.id, [{ nama: 'Siswa Rombel A' }]);
    expect(await daftarSiswaKelas(kelasB.id)).toEqual([]);
  });
});

describe('source of truth kelas, fase, dan mapel otomatis', () => {
  it.each([
    [1, 'A', ['PADB','PP','BI','MAT','PJOK','SENI','BING','BSUN']],
    [2, 'A', ['PADB','PP','BI','MAT','PJOK','SENI','BING','BSUN']],
    [3, 'B', ['PADB','PP','BI','MAT','IPAS','PJOK','SENI','BING','BSUN']],
    [4, 'B', ['PADB','PP','BI','MAT','IPAS','PJOK','SENI','BING','BSUN']],
    [5, 'C', ['PADB','PP','BI','MAT','IPAS','PJOK','SENI','BING','BSUN','KKA']],
    [6, 'C', ['PADB','PP','BI','MAT','IPAS','PJOK','SENI','BING','BSUN','KKA']],
  ] as const)('Kelas %i memakai Fase %s dan mapel final sekolah', (kelas, fase, mapel) => {
    expect(getFaseByKelas(kelas)).toBe(fase);
    expect(getKodeMapelAktifByKelas(kelas)).toEqual(mapel);
  });

  it('query kurikulum menampilkan Inggris dan Sunda sesuai kelas tanpa meloloskan IPAS/Koding lintas fase', async () => {
    await resetPenyimpanan();
    const kelas1 = await daftarMapelUntukKelas(1);
    const kelas3 = await daftarMapelUntukKelas(3);
    const kelas5 = await daftarMapelUntukKelas(5);
    expect(kelas1.map((item) => item.kode)).toEqual(expect.arrayContaining(['BING', 'BSUN']));
    expect(kelas1.map((item) => item.kode)).not.toEqual(expect.arrayContaining(['IPAS', 'KKA']));
    expect(kelas3.map((item) => item.kode)).toEqual(expect.arrayContaining(['IPAS', 'BING', 'BSUN']));
    expect(kelas3.map((item) => item.kode)).not.toContain('KKA');
    expect(kelas5.map((item) => item.kode)).toEqual(expect.arrayContaining(['IPAS', 'BING', 'BSUN', 'KKA']));
    expect(kelas1.find((item) => item.kode === 'BSUN')?.nama).toBe('Bahasa Sunda');
  });
});
