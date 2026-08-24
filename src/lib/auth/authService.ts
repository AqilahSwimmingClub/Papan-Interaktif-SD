import { AppError } from '../errors/AppError';
import { log } from '../errors/logger';
import type { Akun, Peran, SesiAktif, SesiLogin } from '../types';
import {
  adaAdmin,
  akunLewatId,
  akunLewatUsername,
  semuaAkun,
  normalkanUsername,
  simpanAkun,
} from '../storage/akunRepo';
import { hapusSesi, hapusSesiKedaluwarsa, sesiLewatToken, simpanSesi } from '../storage/sesiRepo';
import { idPerangkat } from '../storage/perangkatRepo';
import { hashSandi, periksaSandi, tokenAcak } from './sandi';
import { simpanAkunDanProfilGuru, ubahAkunDanProfilGuru } from '../storage/guruRepo';
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

export interface DataAkunGuru extends DataSetupAdmin {
  kelas?: number[];
  rombel?: string;
  aktif?: boolean;
  foto_data_url?: string | null;
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

function pastikanAdmin(akun: Akun): void {
  if (akun.peran !== 'admin') {
    throw new AppError('PERAN_TIDAK_SESUAI', 'Hanya Admin yang dapat mengelola akun Guru.');
  }
}

/** Membuat akun Guru lokal tanpa mengubah akun Admin pertama. */
export async function buatAkunGuru(akunAdmin: Akun, data: DataAkunGuru): Promise<Akun> {
  pastikanAdmin(akunAdmin);
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
  const guru: Akun = {
    id: crypto.randomUUID(),
    nama,
    username,
    hash_sandi: turunan.hash,
    imbuhan: turunan.imbuhan,
    kdf_algoritma: turunan.algoritma,
    kdf_iterasi: turunan.iterasi,
    peran: 'guru',
    aktif: data.aktif ?? true,
    dibuat: new Date().toISOString(),
    terakhir_masuk: null,
    gagal_berurutan: 0,
    terkunci_sampai: null,
  };
  await simpanAkunDanProfilGuru(guru, {
    kelas: data.kelas,
    rombel: data.rombel,
    foto_data_url: data.foto_data_url,
  });
  return guru;
}

export async function daftarAkunLokal(akunAdmin: Akun): Promise<Akun[]> {
  pastikanAdmin(akunAdmin);
  return (await semuaAkun()).sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
}

export async function ubahStatusAkunGuru(
  akunAdmin: Akun,
  akunGuruId: string,
  aktif: boolean,
): Promise<void> {
  pastikanAdmin(akunAdmin);
  const guru = await akunLewatId(akunGuruId);
  if (!guru || guru.peran !== 'guru') {
    throw new AppError('VALIDASI', 'Akun Guru tidak ditemukan.', { field: 'akun' });
  }
  await simpanAkun({ ...guru, aktif });
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
  pastikanAdmin(akunAdmin);
  const guru = await akunLewatId(akunGuruId);
  if (!guru || guru.peran !== 'guru') {
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

export async function ubahAkunGuru(
  akunAdmin: Akun,
  akunGuruId: string,
  perubahan: { nama: string; username: string; kelas?: number[]; rombel?: string; aktif?: boolean; foto_data_url?: string | null },
): Promise<Akun> {
  pastikanAdmin(akunAdmin);
  const guru = await akunLewatId(akunGuruId);
  if (!guru || guru.peran !== 'guru') throw new AppError('VALIDASI', 'Akun Guru tidak ditemukan.');
  const nama = validasiNama(perubahan.nama);
  const username = validasiUsername(perubahan.username);
  const pemilik = await akunLewatUsername(username);
  if (pemilik && pemilik.id !== guru.id) throw new AppError('USERNAME_DIPAKAI', 'Username itu sudah dipakai di perangkat ini.');
  const hasil = { ...guru, nama, username, aktif: perubahan.aktif ?? guru.aktif };
  await ubahAkunDanProfilGuru(hasil, perubahan);
  return hasil;
}

/** Ganti sandi akun aktif; sandi lama diverifikasi dan tidak pernah disimpan terbuka. */
export async function gantiSandiAkun(
  akunAktif: Akun,
  sandiLama: string,
  sandiBaru: string,
  konfirmasi: string,
): Promise<void> {
  const terbaru = await akunLewatId(akunAktif.id);
  if (!terbaru || !(await periksaSandi(sandiLama, terbaru.hash_sandi, terbaru.imbuhan, terbaru.kdf_iterasi))) {
    throw new AppError('KREDENSIAL_SALAH', 'Password lama tidak sesuai.');
  }
  const sandi = validasiSandi(sandiBaru);
  validasiKonfirmasi(sandi, konfirmasi);
  const turunan = await hashSandi(sandi);
  await simpanAkun({ ...terbaru, hash_sandi: turunan.hash, imbuhan: turunan.imbuhan,
    kdf_algoritma: turunan.algoritma, kdf_iterasi: turunan.iterasi,
    gagal_berurutan: 0, terkunci_sampai: null });
}
