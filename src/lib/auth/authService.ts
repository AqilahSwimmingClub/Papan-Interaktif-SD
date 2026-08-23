import { AppError } from '../errors/AppError';
import { log } from '../errors/logger';
import type { Akun, Peran, SesiAktif, SesiLogin } from '../types';
import {
  adaAdmin,
  akunLewatId,
  akunLewatUsername,
  normalkanUsername,
  simpanAkun,
} from '../storage/akunRepo';
import { hapusSesi, hapusSesiKedaluwarsa, sesiLewatToken, simpanSesi } from '../storage/sesiRepo';
import { idPerangkat } from '../storage/perangkatRepo';
import { hashSandi, periksaSandi, tokenAcak } from './sandi';
import {
  validasiKonfirmasi,
  validasiNama,
  validasiSandi,
  validasiUsername,
} from './validasi';

/** Kunci penanda token sesi pada perangkat ini. */
export const KUNCI_TOKEN = 'papan-interaktif-sd:token-sesi';

/** Umur sesi. Guru mengajar sehari penuh; token diperbarui saat masuk lagi. */
export const UMUR_SESI_JAM = 12;

/** Lima kegagalan berurutan memicu jeda yang menaik, mulai 30 detik. */
export const AMBANG_GAGAL = 5;
export const JEDA_DASAR_DETIK = 30;
export const JEDA_MAKSIMUM_DETIK = 300;

export interface DataSetupAdmin {
  nama: string;
  username: string;
  password: string;
  konfirmasi: string;
}

export interface DataMasuk {
  username: string;
  password: string;
  peran: Peran;
}

function penyimpananLokal(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function bacaTokenTersimpan(): string | null {
  return penyimpananLokal()?.getItem(KUNCI_TOKEN) ?? null;
}

function tulisTokenTersimpan(token: string | null): void {
  const simpanan = penyimpananLokal();
  if (!simpanan) return;
  if (token === null) simpanan.removeItem(KUNCI_TOKEN);
  else simpanan.setItem(KUNCI_TOKEN, token);
}

export async function perangkatSudahPunyaAdmin(): Promise<boolean> {
  return adaAdmin();
}

/** Jeda coba-coba dalam detik untuk jumlah kegagalan berurutan tertentu. */
export function jedaDetik(gagalBerurutan: number): number {
  if (gagalBerurutan < AMBANG_GAGAL) return 0;
  const kelipatan = 2 ** (gagalBerurutan - AMBANG_GAGAL);
  return Math.min(JEDA_DASAR_DETIK * kelipatan, JEDA_MAKSIMUM_DETIK);
}

/**
 * Setup Admin pertama — hanya berjalan bila perangkat belum punya Admin.
 * Sandi masuk sebagai hash berimbuhan; tidak ada kolom teks terbuka.
 */
export async function buatAdminPertama(data: DataSetupAdmin): Promise<Akun> {
  if (await adaAdmin()) {
    throw new AppError(
      'ADMIN_SUDAH_ADA',
      'Perangkat ini sudah memiliki Admin. Setup hanya dapat dijalankan sekali per perangkat.',
    );
  }

  const nama = validasiNama(data.nama);
  const username = validasiUsername(data.username);
  const sandi = validasiSandi(data.password);
  validasiKonfirmasi(sandi, data.konfirmasi);

  if (await akunLewatUsername(username)) {
    throw new AppError('USERNAME_DIPAKAI', 'Username itu sudah dipakai di perangkat ini.', {
      field: 'username',
    });
  }

  const turunan = await hashSandi(sandi);
  const akun: Akun = {
    id: crypto.randomUUID(),
    nama,
    username,
    hash_sandi: turunan.hash,
    imbuhan: turunan.imbuhan,
    kdf_algoritma: turunan.algoritma,
    kdf_iterasi: turunan.iterasi,
    peran: 'admin',
    aktif: true,
    dibuat: new Date().toISOString(),
    terakhir_masuk: null,
    gagal_berurutan: 0,
    terkunci_sampai: null,
  };

  await simpanAkun(akun);
  log.info('Akun Admin pertama dibuat pada perangkat ini.');
  return akun;
}

/**
 * Masuk. Peran yang dipilih di layar Login harus cocok dengan peran akun —
 * Admin dan Guru membuka hak berbeda, bukan fitur berbeda.
 */
export async function masuk(data: DataMasuk): Promise<SesiAktif> {
  const username = normalkanUsername(data.username);
  const akun = await akunLewatUsername(username);

  if (!akun) {
    throw new AppError('KREDENSIAL_SALAH', 'Username atau password salah.');
  }
  if (!akun.aktif) {
    throw new AppError('AKUN_NONAKTIF', 'Akun ini dinonaktifkan. Hubungi Admin perangkat.');
  }

  const sekarang = Date.now();
  if (akun.terkunci_sampai && new Date(akun.terkunci_sampai).getTime() > sekarang) {
    const sisa = Math.ceil((new Date(akun.terkunci_sampai).getTime() - sekarang) / 1000);
    throw new AppError(
      'TERLALU_BANYAK_PERCOBAAN',
      `Terlalu banyak percobaan. Coba lagi dalam ${sisa} detik.`,
      { detail: { sisaDetik: sisa } },
    );
  }

  const cocok = await periksaSandi(
    data.password,
    akun.hash_sandi,
    akun.imbuhan,
    akun.kdf_iterasi,
  );

  if (!cocok) {
    const gagal = akun.gagal_berurutan + 1;
    const jeda = jedaDetik(gagal);
    await simpanAkun({
      ...akun,
      gagal_berurutan: gagal,
      terkunci_sampai: jeda > 0 ? new Date(sekarang + jeda * 1000).toISOString() : null,
    });
    log.peringatan('Percobaan masuk gagal.', { username, gagalBerurutan: gagal });
    if (jeda > 0) {
      throw new AppError(
        'TERLALU_BANYAK_PERCOBAAN',
        `Terlalu banyak percobaan. Coba lagi dalam ${jeda} detik.`,
        { detail: { sisaDetik: jeda } },
      );
    }
    throw new AppError('KREDENSIAL_SALAH', 'Username atau password salah.');
  }

  if (akun.peran !== data.peran) {
    // Sandi benar, tetapi peran yang dipilih tidak cocok. Bukan kegagalan
    // kredensial, jadi tidak menambah hitungan coba-coba.
    throw new AppError(
      'PERAN_TIDAK_SESUAI',
      `Akun ini terdaftar sebagai ${akun.peran === 'admin' ? 'Admin' : 'Guru'}. Pilih peran yang sesuai.`,
      { field: 'peran' },
    );
  }

  const akunTerbarui: Akun = {
    ...akun,
    gagal_berurutan: 0,
    terkunci_sampai: null,
    terakhir_masuk: new Date(sekarang).toISOString(),
  };
  await simpanAkun(akunTerbarui);

  const sesi: SesiLogin = {
    token: tokenAcak(),
    akun_id: akun.id,
    dibuat: new Date(sekarang).toISOString(),
    kedaluwarsa: new Date(sekarang + UMUR_SESI_JAM * 3_600_000).toISOString(),
    perangkat: await idPerangkat(),
  };

  await simpanSesi(sesi);
  tulisTokenTersimpan(sesi.token);
  await hapusSesiKedaluwarsa();

  return { akun: akunTerbarui, sesi };
}

/**
 * Logout membuang token sesi saja. Akun, materi, LKPD, nilai, dan cadangan
 * tidak tersentuh (Tahap 11 §30).
 */
export async function keluar(): Promise<void> {
  const token = bacaTokenTersimpan();
  tulisTokenTersimpan(null);
  if (!token) return;
  try {
    await hapusSesi(token);
  } catch (galat) {
    log.galat('Token sesi gagal dihapus dari basis data.', galat);
  }
}

/** Sesi yang masih sah untuk perangkat ini, atau null. */
export async function sesiSekarang(): Promise<SesiAktif | null> {
  const token = bacaTokenTersimpan();
  if (!token) return null;

  const sesi = await sesiLewatToken(token);
  if (!sesi) {
    tulisTokenTersimpan(null);
    return null;
  }

  if (new Date(sesi.kedaluwarsa).getTime() <= Date.now()) {
    tulisTokenTersimpan(null);
    await hapusSesi(token);
    return null;
  }

  const akun = await akunLewatId(sesi.akun_id);
  if (!akun || !akun.aktif) {
    tulisTokenTersimpan(null);
    await hapusSesi(token);
    return null;
  }

  return { akun, sesi };
}

/**
 * Admin mengatur ulang sandi Guru dari Kelola Akun — satu-satunya jalur
 * pemulihan yang tersedia selain memulihkan berkas cadangan (Tahap 11 §30).
 */
export async function aturUlangSandiGuru(
  akunAdmin: Akun,
  akunGuruId: string,
  sandiBaru: string,
): Promise<void> {
  if (akunAdmin.peran !== 'admin') {
    throw new AppError('PERAN_TIDAK_SESUAI', 'Hanya Admin yang dapat mengatur ulang sandi Guru.');
  }
  const guru = await akunLewatId(akunGuruId);
  if (!guru) {
    throw new AppError('VALIDASI', 'Akun guru tidak ditemukan.', { field: 'akun' });
  }
  const sandi = validasiSandi(sandiBaru);
  const turunan = await hashSandi(sandi);
  await simpanAkun({
    ...guru,
    hash_sandi: turunan.hash,
    imbuhan: turunan.imbuhan,
    kdf_algoritma: turunan.algoritma,
    kdf_iterasi: turunan.iterasi,
    gagal_berurutan: 0,
    terkunci_sampai: null,
  });
}
