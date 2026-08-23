import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import {
  AMBANG_GAGAL,
  JEDA_DASAR_DETIK,
  JEDA_MAKSIMUM_DETIK,
  aturUlangSandiGuru,
  bacaTokenTersimpan,
  buatAdminPertama,
  jedaDetik,
  keluar,
  masuk,
  perangkatSudahPunyaAdmin,
  sesiSekarang,
} from './authService';
import { akunLewatUsername, semuaAkun, simpanAkun } from '../storage/akunRepo';
import { bacaSekolah, sekolahKosong, simpanSekolah } from '../storage/sekolahRepo';
import { hashSandi } from './sandi';
import { AppError } from '../errors/AppError';
import type { Akun } from '../types';

const ADMIN = {
  nama: 'Fahmi Djawas, S.Pd.',
  username: 'fahmi.djawas',
  password: 'SandiAdmin#2026',
  konfirmasi: 'SandiAdmin#2026',
};

async function buatGuru(username = 'bu.sri', sandi = 'SandiGuru#2026'): Promise<Akun> {
  const turunan = await hashSandi(sandi);
  const guru: Akun = {
    id: crypto.randomUUID(),
    nama: 'Sri Rahayu, S.Pd.',
    username,
    hash_sandi: turunan.hash,
    imbuhan: turunan.imbuhan,
    kdf_algoritma: turunan.algoritma,
    kdf_iterasi: turunan.iterasi,
    peran: 'guru',
    aktif: true,
    dibuat: new Date().toISOString(),
    terakhir_masuk: null,
    gagal_berurutan: 0,
    terkunci_sampai: null,
  };
  await simpanAkun(guru);
  return guru;
}

describe('setup admin pertama', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
  });

  it('hanya berjalan sekali per perangkat', async () => {
    expect(await perangkatSudahPunyaAdmin()).toBe(false);

    const admin = await buatAdminPertama(ADMIN);
    expect(admin.peran).toBe('admin');
    expect(await perangkatSudahPunyaAdmin()).toBe(true);

    await expect(buatAdminPertama({ ...ADMIN, username: 'admin.lain' })).rejects.toMatchObject({
      kode: 'ADMIN_SUDAH_ADA',
    });
    expect(await semuaAkun()).toHaveLength(1);
  });

  it('tidak menyimpan sandi sebagai teks terbuka', async () => {
    await buatAdminPertama(ADMIN);
    const tersimpan = await akunLewatUsername(ADMIN.username);

    expect(tersimpan).toBeDefined();
    expect(JSON.stringify(tersimpan)).not.toContain(ADMIN.password);
    expect(tersimpan?.hash_sandi).not.toBe(ADMIN.password);
    expect(tersimpan?.imbuhan).toBeTruthy();
    expect(tersimpan?.kdf_algoritma).toBe('PBKDF2-SHA256');
    expect(Object.keys(tersimpan ?? {})).not.toContain('password');
  });

  it('menolak konfirmasi yang tidak sama dan sandi terlalu pendek', async () => {
    await expect(
      buatAdminPertama({ ...ADMIN, konfirmasi: 'BedaSekali#1' }),
    ).rejects.toBeInstanceOf(AppError);
    await expect(
      buatAdminPertama({ ...ADMIN, password: 'pendek', konfirmasi: 'pendek' }),
    ).rejects.toBeInstanceOf(AppError);
    expect(await perangkatSudahPunyaAdmin()).toBe(false);
  });

  it('menyimpan identitas sekolah ke tabel sekolah', async () => {
    await buatAdminPertama(ADMIN);
    await simpanSekolah({ ...sekolahKosong(), nama: 'SDN Satria Jaya 01', npsn: '20218123' });

    expect((await bacaSekolah())?.nama).toBe('SDN Satria Jaya 01');
  });
});

describe('login, sesi, dan logout', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
    await buatAdminPertama(ADMIN);
  });

  it('menerima kredensial benar dan membuka sesi lokal', async () => {
    const hasil = await masuk({
      username: ADMIN.username,
      password: ADMIN.password,
      peran: 'admin',
    });

    expect(hasil.akun.peran).toBe('admin');
    expect(hasil.sesi.token).toHaveLength(64);
    expect(bacaTokenTersimpan()).toBe(hasil.sesi.token);
    expect(await sesiSekarang()).toMatchObject({ akun: { username: ADMIN.username } });
  });

  it('menerima username tanpa memedulikan huruf besar-kecil', async () => {
    await expect(
      masuk({ username: 'Fahmi.Djawas', password: ADMIN.password, peran: 'admin' }),
    ).resolves.toBeDefined();
  });

  it('menolak sandi salah tanpa membuka sesi', async () => {
    await expect(
      masuk({ username: ADMIN.username, password: 'SandiSalah#1', peran: 'admin' }),
    ).rejects.toMatchObject({ kode: 'KREDENSIAL_SALAH' });
    expect(bacaTokenTersimpan()).toBeNull();
    expect(await sesiSekarang()).toBeNull();
  });

  it('menolak username yang tidak terdaftar dengan pesan yang sama', async () => {
    await expect(
      masuk({ username: 'tidak.ada', password: ADMIN.password, peran: 'admin' }),
    ).rejects.toMatchObject({ kode: 'KREDENSIAL_SALAH' });
  });

  it('menolak peran yang tidak cocok meski sandi benar', async () => {
    await expect(
      masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'guru' }),
    ).rejects.toMatchObject({ kode: 'PERAN_TIDAK_SESUAI' });
    expect(await sesiSekarang()).toBeNull();
  });

  it('membuka sesi Guru dengan peran guru', async () => {
    await buatGuru();
    const hasil = await masuk({ username: 'bu.sri', password: 'SandiGuru#2026', peran: 'guru' });
    expect(hasil.akun.peran).toBe('guru');
  });

  it('menolak akun yang dinonaktifkan', async () => {
    const guru = await buatGuru('guru.nonaktif');
    await simpanAkun({ ...guru, aktif: false });

    await expect(
      masuk({ username: 'guru.nonaktif', password: 'SandiGuru#2026', peran: 'guru' }),
    ).rejects.toMatchObject({ kode: 'AKUN_NONAKTIF' });
  });

  it('memberi jeda menaik setelah lima kegagalan berurutan', async () => {
    expect(jedaDetik(AMBANG_GAGAL - 1)).toBe(0);
    expect(jedaDetik(AMBANG_GAGAL)).toBe(JEDA_DASAR_DETIK);
    expect(jedaDetik(AMBANG_GAGAL + 1)).toBe(JEDA_DASAR_DETIK * 2);
    expect(jedaDetik(AMBANG_GAGAL + 20)).toBe(JEDA_MAKSIMUM_DETIK);

    for (let percobaan = 1; percobaan < AMBANG_GAGAL; percobaan += 1) {
      await expect(
        masuk({ username: ADMIN.username, password: 'salah', peran: 'admin' }),
      ).rejects.toMatchObject({ kode: 'KREDENSIAL_SALAH' });
    }

    await expect(
      masuk({ username: ADMIN.username, password: 'salah', peran: 'admin' }),
    ).rejects.toMatchObject({ kode: 'TERLALU_BANYAK_PERCOBAAN' });

    // Sandi benar pun ditolak selama jeda berlaku — bukan mengunci permanen.
    await expect(
      masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' }),
    ).rejects.toMatchObject({ kode: 'TERLALU_BANYAK_PERCOBAAN' });

    const akun = await akunLewatUsername(ADMIN.username);
    expect(akun?.gagal_berurutan).toBe(AMBANG_GAGAL);
    expect(akun?.terkunci_sampai).toBeTruthy();
  });

  it('mengulang hitungan gagal setelah berhasil masuk', async () => {
    await expect(
      masuk({ username: ADMIN.username, password: 'salah', peran: 'admin' }),
    ).rejects.toBeInstanceOf(AppError);
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });

    const akun = await akunLewatUsername(ADMIN.username);
    expect(akun?.gagal_berurutan).toBe(0);
    expect(akun?.terakhir_masuk).toBeTruthy();
  });

  it('logout membuang token sesi saja, tanpa menyentuh akun', async () => {
    await simpanSekolah({ ...sekolahKosong(), nama: 'SDN Satria Jaya 01' });
    await masuk({ username: ADMIN.username, password: ADMIN.password, peran: 'admin' });

    await keluar();

    expect(bacaTokenTersimpan()).toBeNull();
    expect(await sesiSekarang()).toBeNull();
    expect(await semuaAkun()).toHaveLength(1);
    expect((await bacaSekolah())?.nama).toBe('SDN Satria Jaya 01');
    expect(await perangkatSudahPunyaAdmin()).toBe(true);
  });

  it('menolak sesi yang sudah kedaluwarsa', async () => {
    const hasil = await masuk({
      username: ADMIN.username,
      password: ADMIN.password,
      peran: 'admin',
    });
    const { simpanSesi } = await import('../storage/sesiRepo');
    await simpanSesi({
      ...hasil.sesi,
      kedaluwarsa: new Date(Date.now() - 1_000).toISOString(),
    });

    expect(await sesiSekarang()).toBeNull();
    expect(bacaTokenTersimpan()).toBeNull();
  });
});

describe('pemulihan sandi tanpa surel', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
  });

  it('Admin dapat mengatur ulang sandi Guru', async () => {
    const admin = await buatAdminPertama(ADMIN);
    const guru = await buatGuru();

    await aturUlangSandiGuru(admin, guru.id, 'SandiBaru#2026');

    await expect(
      masuk({ username: guru.username, password: 'SandiBaru#2026', peran: 'guru' }),
    ).resolves.toBeDefined();
  });

  it('Guru tidak dapat mengatur ulang sandi akun lain', async () => {
    await buatAdminPertama(ADMIN);
    const guru = await buatGuru();

    await expect(aturUlangSandiGuru(guru, guru.id, 'SandiBaru#2026')).rejects.toMatchObject({
      kode: 'PERAN_TIDAK_SESUAI',
    });
  });
});
