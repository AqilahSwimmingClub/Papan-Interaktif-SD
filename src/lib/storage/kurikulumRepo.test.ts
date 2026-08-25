import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import type { CapaianPembelajaran, ElemenKurikulum, TujuanPembelajaran } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';
import { simpanBabBuku, simpanBukuReferensi, simpanTopikBab } from './bukuReferensiRepo';
import {
  bacaRingkasanKurikulum,
  daftarKelas,
  daftarMapelUntukKelas,
  pastikanKurikulumTersedia,
} from './kurikulumRepo';

async function daftarkanBukuUji() {
  await simpanBukuReferensi({
    id: 'BUKU-UJI-1',
    tingkat_kelas: 1,
    mapel_kode: 'MAT',
    judul: 'Buku Matematika Kelas 1',
    penulis: '',
    penerbit: 'Penerbit Uji',
    tahun: '2026',
    edisi: '',
    isbn: '',
    utama: true,
    status: 'aktif',
    ditambahkan_oleh: null,
    ditambahkan_pada: new Date().toISOString(),
  });
  await simpanBabBuku({
    id: 'BAB-UJI-1',
    buku_id: 'BUKU-UJI-1',
    nomor_tampil: 'Bab 1',
    judul_bab: 'Bilangan sampai 20',
    halaman_awal: 1,
    halaman_akhir: 18,
    urutan: 1,
  });
  await simpanTopikBab({
    id: 'TOPIK-UJI-1',
    bab_id: 'BAB-UJI-1',
    nomor_tampil: '1.1',
    judul_topik: 'Membilang sampai 20',
    lingkup_materi: 'Membilang, membaca, dan menulis lambang bilangan.',
    halaman_awal: 2,
    urutan: 1,
  });
}

describe('struktur kurikulum tanpa CP/TP lama', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
  });

  it('tidak menyemai satu pun CP, elemen, TP, atau referensi lama', async () => {
    await pastikanKurikulumTersedia();
    const [cp, elemen, tp, referensi] = await jalankanTransaksi(
      [TOKO.cp, TOKO.elemen, TOKO.tp, TOKO.referensi],
      'readonly',
      async (toko) =>
        [
          await kueri.semua<CapaianPembelajaran>(toko(TOKO.cp)),
          await kueri.semua<ElemenKurikulum>(toko(TOKO.elemen)),
          await kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)),
          await kueri.semua<unknown>(toko(TOKO.referensi)),
        ] as const,
    );

    expect(cp).toHaveLength(0);
    expect(elemen).toHaveLength(0);
    expect(tp).toHaveLength(0);
    expect(referensi).toHaveLength(0);
  });

  it('menyemai kelas, mata pelajaran, dan buku master Kelas 5', async () => {
    expect(await bacaRingkasanKurikulum()).toEqual({
      jumlahKelas: 6,
      jumlahMapel: 17,
      jumlahBuku: 7,
      jumlahBab: 33,
      jumlahTopik: 115,
    });
  });

  it('menyemai secara idempoten dan menghitung buku per kelas, bukan TP', async () => {
    await pastikanKurikulumTersedia();
    await pastikanKurikulumTersedia();

    const sebelum = await daftarKelas();
    expect(sebelum).toHaveLength(6);
    expect(sebelum.map((kelas) => kelas.jumlahBuku)).toEqual([0, 0, 0, 0, 7, 0]);
    expect(sebelum.every((kelas) => kelas.jumlahPilihanMapel > 0)).toBe(true);

    await daftarkanBukuUji();
    const sesudah = await daftarKelas();
    expect(sesudah[0]?.jumlahBuku).toBe(1);
    expect(sesudah[1]?.jumlahBuku).toBe(0);
    expect(sesudah[4]?.jumlahBuku).toBe(7);
  });

  it('menghitung buku, bab, dan topik per mata pelajaran', async () => {
    await daftarkanBukuUji();
    const mapel = await daftarMapelUntukKelas(1);
    const matematika = mapel.find((item) => item.kode === 'MAT');
    const bahasa = mapel.find((item) => item.kode === 'BI');

    expect(matematika).toMatchObject({ jumlahBuku: 1, jumlahBab: 1, jumlahTopik: 1 });
    expect(bahasa).toMatchObject({ jumlahBuku: 0, jumlahBab: 0, jumlahTopik: 0 });
  });

  it('mencerminkan buku terdaftar pada ringkasan kurikulum', async () => {
    await daftarkanBukuUji();
    expect(await bacaRingkasanKurikulum()).toMatchObject({
      jumlahBuku: 8,
      jumlahBab: 34,
      jumlahTopik: 116,
    });
  });
});
