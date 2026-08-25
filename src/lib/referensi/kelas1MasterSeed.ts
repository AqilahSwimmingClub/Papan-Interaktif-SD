import type { BukuBab, BukuReferensi, BukuTopik } from '../types';
import { TOKO, jalankanTransaksi, kueri } from '../storage/db';

const DITAMBAHKAN_PADA = '2026-08-25T00:00:00.000Z';

/**
 * Master referensi Kelas 1.
 *
 * Prinsip: hanya metadata yang sudah dapat diverifikasi dari katalog resmi SIBI
 * yang diisi. Kolom penulis/tahun/ISBN sengaja dibiarkan kosong bila metadata
 * buku siswa belum terverifikasi; jangan menebak hanya untuk melengkapi kolom.
 */
export const BUKU_MASTER_KELAS1: BukuReferensi[] = [
  {
    id: 'BUKU-K1-PAI-SIBI',
    tingkat_kelas: 1,
    mapel_kode: 'PAI',
    judul: 'Pendidikan Agama Islam dan Budi Pekerti untuk SD Kelas I',
    penulis: 'Muhammad Nurzakun; Joko Santoso',
    penerbit: 'Pusat Kurikulum dan Perbukuan',
    tahun: '',
    edisi: '1',
    isbn: '978-602-244-424-4',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-PAK-SIBI',
    tingkat_kelas: 1,
    mapel_kode: 'PAK',
    judul: 'Pendidikan Agama Kristen dan Budi Pekerti untuk SD Kelas I',
    penulis: 'Veronika Hematang',
    penerbit: 'Pusat Kurikulum dan Perbukuan',
    tahun: '',
    edisi: '1',
    isbn: '978-602-244-461-9',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-PAKAT-SIBI',
    tingkat_kelas: 1,
    mapel_kode: 'PAKat',
    judul: 'Pendidikan Agama Katolik dan Budi Pekerti untuk SD Kelas I',
    penulis: '',
    penerbit: 'Pusat Kurikulum dan Perbukuan',
    tahun: '',
    edisi: '1',
    isbn: '',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-PAH-SIBI',
    tingkat_kelas: 1,
    mapel_kode: 'PAH',
    judul: 'Pendidikan Agama Hindu dan Budi Pekerti untuk SD Kelas I',
    penulis: '',
    penerbit: 'Pusat Kurikulum dan Perbukuan',
    tahun: '',
    edisi: '1',
    isbn: '',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-PAB-SIBI',
    tingkat_kelas: 1,
    mapel_kode: 'PAB',
    judul: 'Pendidikan Agama Buddha dan Budi Pekerti untuk SD Kelas I',
    penulis: '',
    penerbit: 'Pusat Kurikulum dan Perbukuan',
    tahun: '',
    edisi: '1',
    isbn: '',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-PAKH-SIBI',
    tingkat_kelas: 1,
    mapel_kode: 'PAKh',
    judul: 'Pendidikan Agama Khonghucu dan Budi Pekerti untuk SD Kelas I',
    penulis: '',
    penerbit: 'Pusat Kurikulum dan Perbukuan',
    tahun: '',
    edisi: '1',
    isbn: '',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-PP-2023',
    tingkat_kelas: 1,
    mapel_kode: 'PP',
    judul: 'Pendidikan Pancasila untuk SD/MI Kelas I',
    penulis: 'Canny Ilmiati; Etika Indah Febriani; Elisa Seftriyana',
    penerbit: 'Pusat Perbukuan',
    tahun: '2023',
    edisi: '1',
    isbn: '978-623-194-615-7',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-BI-2024',
    tingkat_kelas: 1,
    mapel_kode: 'BI',
    judul: 'Bahasa Indonesia Aku Bisa! untuk SD/MI Kelas I (Edisi Revisi)',
    penulis: 'Sofie Dewayani',
    penerbit: 'Pusat Kurikulum dan Perbukuan',
    tahun: '2024',
    edisi: 'Revisi',
    isbn: '978-623-118-362-0',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-MAT-SIBI',
    tingkat_kelas: 1,
    mapel_kode: 'MAT',
    judul: 'Matematika untuk SD/MI Kelas I',
    penulis: 'Dara Retno Wulan; Rasfaniwaty',
    penerbit: 'Pusat Perbukuan',
    tahun: '',
    edisi: '1',
    isbn: '978-602-244-877-8',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-PJOK-SIBI',
    tingkat_kelas: 1,
    mapel_kode: 'PJOK',
    judul: 'Pendidikan Jasmani, Olahraga, dan Kesehatan untuk SD/MI Kelas I',
    penulis: 'Puji Rahayu; Umi Hariyani',
    penerbit: 'Pusat Kurikulum dan Perbukuan',
    tahun: '',
    edisi: '1',
    isbn: '978-623-388-543-0',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
  {
    id: 'BUKU-K1-RUPA-REV',
    tingkat_kelas: 1,
    mapel_kode: 'RUPA',
    judul: 'Panduan Guru Seni Rupa untuk SD/MI Kelas I (Edisi Revisi)',
    penulis: 'Rizki Raindriati',
    penerbit: 'Pusat Kurikulum dan Perbukuan',
    tahun: '',
    edisi: 'Revisi',
    isbn: '978-623-118-516-7',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: DITAMBAHKAN_PADA,
  },
];

export const BAB_MASTER_KELAS1: BukuBab[] = [];
export const TOPIK_MASTER_KELAS1: BukuTopik[] = [];

export async function semaiReferensiMasterKelas1(): Promise<void> {
  await jalankanTransaksi(
    [TOKO.bukuReferensi, TOKO.bukuBab, TOKO.bukuTopik],
    'readwrite',
    async (toko) => {
      for (const buku of BUKU_MASTER_KELAS1) {
        if (!(await kueri.ambil<BukuReferensi>(toko(TOKO.bukuReferensi), buku.id))) {
          await kueri.simpan(toko(TOKO.bukuReferensi), buku);
        }
      }
      for (const bab of BAB_MASTER_KELAS1) {
        if (!(await kueri.ambil<BukuBab>(toko(TOKO.bukuBab), bab.id))) {
          await kueri.simpan(toko(TOKO.bukuBab), bab);
        }
      }
      for (const topik of TOPIK_MASTER_KELAS1) {
        if (!(await kueri.ambil<BukuTopik>(toko(TOKO.bukuTopik), topik.id))) {
          await kueri.simpan(toko(TOKO.bukuTopik), topik);
        }
      }
    },
  );
}
