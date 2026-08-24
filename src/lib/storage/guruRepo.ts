import { AppError } from '../errors/AppError';
import { getMapelOtomatisUntukKelas } from '../kelasMapel';
import type { Akun, Guru } from '../types';
import { ID_SEKOLAH_TUNGGAL } from './sekolahRepo';
import { TOKO, jalankanTransaksi, kueri } from './db';

export interface PenugasanGuruOtomatis {
  kelas?: number[];
  rombel?: string;
  foto_data_url?: string | null;
}

function normalkanKelas(kelas: number[] = []): number[] {
  const hasil = [...new Set(kelas)].filter((item) => Number.isInteger(item) && item >= 1 && item <= 6).sort((a, b) => a - b);
  if (kelas.length && hasil.length !== kelas.length) throw new AppError('VALIDASI', 'Kelas Guru harus berada pada rentang 1 sampai 6.');
  return hasil;
}

function normalkanRombel(rombel = 'A'): string {
  const hasil = rombel.trim().toLocaleUpperCase('id') || 'A';
  if (!/^[A-Z0-9 -]{1,20}$/.test(hasil)) throw new AppError('VALIDASI', 'Rombel hanya boleh berisi huruf, angka, spasi, atau tanda hubung.');
  return hasil;
}

export function buatProfilGuru(akun: Akun, penugasan: PenugasanGuruOtomatis = {}): Guru {
  const kelas = normalkanKelas(penugasan.kelas);
  return {
    id: akun.id,
    sekolah_id: ID_SEKOLAH_TUNGGAL,
    nama: akun.nama,
    peran: akun.peran === 'admin' ? 'operator' : 'guru',
    kelas_diampu: kelas,
    mapel_diampu: getMapelOtomatisUntukKelas(kelas),
    rombel: normalkanRombel(penugasan.rombel),
    cabang_seni: ['RUPA', 'SMUS', 'TARI', 'TEATER'],
    foto_data_url: penugasan.foto_data_url ?? null,
  };
}

/** Akun login dan profil Guru disimpan atomik dalam satu transaksi IndexedDB. */
export async function simpanAkunDanProfilGuru(
  akun: Akun,
  penugasan: PenugasanGuruOtomatis = {},
): Promise<Guru> {
  const profil = buatProfilGuru(akun, penugasan);
  await jalankanTransaksi([TOKO.akun, TOKO.guru], 'readwrite', async (toko) => {
    await kueri.simpan(toko(TOKO.akun), akun);
    await kueri.simpan(toko(TOKO.guru), profil);
  });
  return profil;
}

/** Edit identitas/penugasan memperbarui akun dan profil yang sama, tanpa membuat akun baru. */
export async function ubahAkunDanProfilGuru(
  akun: Akun,
  perubahan: PenugasanGuruOtomatis = {},
): Promise<Guru> {
  return jalankanTransaksi([TOKO.akun, TOKO.guru], 'readwrite', async (toko) => {
    const lama = await kueri.ambil<Guru>(toko(TOKO.guru), akun.id);
    const kelas = perubahan.kelas === undefined ? (lama?.kelas_diampu ?? []) : normalkanKelas(perubahan.kelas);
    const profil: Guru = {
      ...(lama ?? buatProfilGuru(akun)),
      id: akun.id,
      sekolah_id: ID_SEKOLAH_TUNGGAL,
      nama: akun.nama,
      kelas_diampu: kelas,
      mapel_diampu: getMapelOtomatisUntukKelas(kelas),
      rombel: perubahan.rombel === undefined ? (lama?.rombel ?? 'A') : normalkanRombel(perubahan.rombel),
      foto_data_url: perubahan.foto_data_url === undefined ? (lama?.foto_data_url ?? null) : perubahan.foto_data_url,
    };
    await kueri.simpan(toko(TOKO.akun), akun);
    await kueri.simpan(toko(TOKO.guru), profil);
    return profil;
  });
}

