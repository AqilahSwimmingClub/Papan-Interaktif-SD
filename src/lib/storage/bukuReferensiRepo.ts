import { AppError } from '../errors/AppError';
import {
  RANTAI_REFERENSI,
  ringkasStrukturReferensi,
  type SimpulReferensi,
} from '../referensi/strukturReferensi';
import type { BukuBab, BukuReferensi, BukuTopik } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';
import { pastikanKurikulumTersedia } from './kurikulumRepo';

/**
 * Repository rantai Buku Referensi.
 *
 * Toko `buku_referensi`, `buku_bab`, dan `buku_topik` sengaja dibiarkan kosong
 * sampai buku pelajaran resmi sekolah dimasukkan. Fungsi tulis di sini sudah
 * siap dipakai saat itu; sampai sekarang seluruh pembacaan mengembalikan
 * daftar kosong, dan tidak ada satu pun baris yang dibuat otomatis.
 */

export interface RingkasanBukuReferensi {
  jumlahBuku: number;
  jumlahBab: number;
  jumlahTopik: number;
  /** Kelas yang sudah memiliki minimal satu buku aktif. */
  kelasTerisi: number[];
  siapDipakai: boolean;
}

export interface StrukturKelasMapel {
  tingkat_kelas: number;
  mapel_kode: string;
  buku: BukuReferensi[];
  bab: BukuBab[];
  topik: BukuTopik[];
}

export async function daftarBukuReferensi(
  tingkat?: number,
  mapelKode?: string,
): Promise<BukuReferensi[]> {
  return jalankanTransaksi(TOKO.bukuReferensi, 'readonly', async (toko) => {
    const semua = await kueri.semua<BukuReferensi>(toko(TOKO.bukuReferensi));
    return semua
      .filter((buku) => buku.status === 'aktif')
      .filter((buku) => (tingkat ? buku.tingkat_kelas === tingkat : true))
      .filter((buku) => (mapelKode ? buku.mapel_kode === mapelKode : true))
      .sort((a, b) => Number(b.utama) - Number(a.utama) || a.judul.localeCompare(b.judul, 'id'));
  });
}

export async function daftarBabBuku(bukuId: string): Promise<BukuBab[]> {
  return jalankanTransaksi(TOKO.bukuBab, 'readonly', async (toko) => {
    const bab = await kueri.semuaLewatIndeks<BukuBab>(toko(TOKO.bukuBab), 'buku_id', bukuId);
    return bab.sort((a, b) => a.urutan - b.urutan);
  });
}

export async function daftarTopikBab(babId: string): Promise<BukuTopik[]> {
  return jalankanTransaksi(TOKO.bukuTopik, 'readonly', async (toko) => {
    const topik = await kueri.semuaLewatIndeks<BukuTopik>(toko(TOKO.bukuTopik), 'bab_id', babId);
    return topik.sort((a, b) => a.urutan - b.urutan);
  });
}

/** Membaca seluruh rantai buku → bab → topik untuk satu kelas dan mapel. */
export async function bacaStrukturKelasMapel(
  tingkat: number,
  mapelKode: string,
): Promise<StrukturKelasMapel> {
  const buku = await daftarBukuReferensi(tingkat, mapelKode);
  const idBuku = new Set(buku.map((item) => item.id));

  return jalankanTransaksi([TOKO.bukuBab, TOKO.bukuTopik], 'readonly', async (toko) => {
    const semuaBab = await kueri.semua<BukuBab>(toko(TOKO.bukuBab));
    const bab = semuaBab.filter((baris) => idBuku.has(baris.buku_id)).sort((a, b) => a.urutan - b.urutan);
    const idBab = new Set(bab.map((baris) => baris.id));
    const semuaTopik = await kueri.semua<BukuTopik>(toko(TOKO.bukuTopik));
    return {
      tingkat_kelas: tingkat,
      mapel_kode: mapelKode,
      buku,
      bab,
      topik: semuaTopik.filter((baris) => idBab.has(baris.bab_id)).sort((a, b) => a.urutan - b.urutan),
    };
  });
}

export async function bacaRingkasanBukuReferensi(): Promise<RingkasanBukuReferensi> {
  return jalankanTransaksi(
    [TOKO.bukuReferensi, TOKO.bukuBab, TOKO.bukuTopik],
    'readonly',
    async (toko) => {
      const [buku, jumlahBab, jumlahTopik] = await Promise.all([
        kueri.semua<BukuReferensi>(toko(TOKO.bukuReferensi)),
        kueri.jumlah(toko(TOKO.bukuBab)),
        kueri.jumlah(toko(TOKO.bukuTopik)),
      ]);
      const aktif = buku.filter((baris) => baris.status === 'aktif');
      return {
        jumlahBuku: aktif.length,
        jumlahBab,
        jumlahTopik,
        kelasTerisi: [...new Set(aktif.map((baris) => baris.tingkat_kelas))].sort((a, b) => a - b),
        siapDipakai: aktif.length > 0 && jumlahBab > 0,
      };
    },
  );
}

/**
 * Rantai referensi beserta jumlah baris yang sudah terisi pada tiap simpul.
 * Simpul CP ke bawah tetap nol sampai buku dipetakan.
 */
export async function bacaRantaiReferensiTerisi(): Promise<
  Array<SimpulReferensi & { jumlah: number | null }>
> {
  const ringkasan = await bacaRingkasanBukuReferensi();
  const jumlahPerSimpul: Partial<Record<SimpulReferensi['kode'], number>> = {
    kelas: 6,
    buku: ringkasan.jumlahBuku,
    bab: ringkasan.jumlahBab,
    topik: ringkasan.jumlahTopik,
    cp: 0,
    tp: 0,
    kuis: 0,
    game: 0,
    lkpd: 0,
    'bank-soal': 0,
  };
  await pastikanKurikulumTersedia();
  const jumlahMapel = await jalankanTransaksi(TOKO.mataPelajaran, 'readonly', (toko) =>
    kueri.jumlah(toko(TOKO.mataPelajaran)),
  );
  jumlahPerSimpul.mapel = jumlahMapel;

  return RANTAI_REFERENSI.map((simpul) => ({
    ...simpul,
    jumlah: simpul.kode === 'vlab' ? null : (jumlahPerSimpul[simpul.kode] ?? 0),
  }));
}

export function ringkasStruktur() {
  return ringkasStrukturReferensi();
}

export async function simpanBukuReferensi(buku: BukuReferensi): Promise<void> {
  if (!buku.judul.trim()) throw new AppError('VALIDASI', 'Judul buku referensi wajib diisi.');
  if (buku.tingkat_kelas < 1 || buku.tingkat_kelas > 6) {
    throw new AppError('VALIDASI', 'Buku referensi harus terikat kelas 1 sampai 6.');
  }
  await jalankanTransaksi(TOKO.bukuReferensi, 'readwrite', async (toko) => {
    await kueri.simpan(toko(TOKO.bukuReferensi), { ...buku, judul: buku.judul.trim() });
  });
}

export async function simpanBabBuku(bab: BukuBab): Promise<void> {
  await jalankanTransaksi([TOKO.bukuReferensi, TOKO.bukuBab], 'readwrite', async (toko) => {
    const buku = await kueri.ambil<BukuReferensi>(toko(TOKO.bukuReferensi), bab.buku_id);
    if (!buku) throw new AppError('VALIDASI', 'Bab harus terikat pada buku referensi yang ada.');
    await kueri.simpan(toko(TOKO.bukuBab), bab);
  });
}

export async function simpanTopikBab(topik: BukuTopik): Promise<void> {
  await jalankanTransaksi([TOKO.bukuBab, TOKO.bukuTopik], 'readwrite', async (toko) => {
    const bab = await kueri.ambil<BukuBab>(toko(TOKO.bukuBab), topik.bab_id);
    if (!bab) throw new AppError('VALIDASI', 'Topik harus terikat pada bab buku yang ada.');
    await kueri.simpan(toko(TOKO.bukuTopik), topik);
  });
}
