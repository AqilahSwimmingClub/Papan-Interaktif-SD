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
    id: 'BUKU-UJI-1', tingkat_kelas: 1, mapel_kode: 'MAT', judul: 'Buku Matematika Kelas 1',
    penulis: '', penerbit: 'Penerbit Uji', tahun: '2026', edisi: '', isbn: '', utama: true,
    status: 'aktif', ditambahkan_oleh: null, ditambahkan_pada: new Date().toISOString(),
  });
  await simpanBabBuku({
    id: 'BAB-UJI-1', buku_id: 'BUKU-UJI-1', nomor_tampil: 'Bab 1', judul_bab: 'Bilangan sampai 20',
    halaman_awal: 1, halaman_akhir: 18, urutan: 1,
  });
  await simpanTopikBab({
    id: 'TOPIK-UJI-1', bab_id: 'BAB-UJI-1', nomor_tampil: '1.1', judul_topik: 'Membilang sampai 20',
    lingkup_materi: 'Membilang, membaca, dan menulis lambang bilangan.', halaman_awal: 2, urutan: 1,
  });
}

describe('struktur kurikulum tanpa CP/TP lama', () => {
  beforeEach(async () => { await resetPenyimpanan(); });

  it('tidak menyemai satu pun CP, elemen, TP, atau referensi lama', async () => {
    await pastikanKurikulumTersedia();
    const [cp, elemen, tp, referensi] = await jalankanTransaksi(
      [TOKO.cp, TOKO.elemen, TOKO.tp, TOKO.referensi], 'readonly', async (toko) => [
        await kueri.semua<CapaianPembelajaran>(toko(TOKO.cp)),
        await kueri.semua<ElemenKurikulum>(toko(TOKO.elemen)),
        await kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)),
        await kueri.semua<unknown>(toko(TOKO.referensi)),
      ] as const,
    );
    expect(cp).toHaveLength(0); expect(elemen).toHaveLength(0); expect(tp).toHaveLength(0); expect(referensi).toHaveLength(0);
  });

  it('menyemai kelas, mata pelajaran, serta master Kelas 1 dan Kelas 5', async () => {
    expect(await bacaRingkasanKurikulum()).toMatchObject({
      jumlahKelas: 6, jumlahMapel: 17, jumlahBuku: 18, jumlahBab: 67, jumlahTopik: 166,
    });
  });

  it('memberi Kelas 1 buku untuk seluruh mapel yang relevan tanpa IPAS, BING, atau KKA', async () => {
    const mapel = await daftarMapelUntukKelas(1);
    const kode = new Map(mapel.map((item) => [item.kode, item]));
    for (const wajib of ['PAI','PAK','PAKat','PAH','PAB','PAKh','PP','BI','MAT','PJOK','RUPA']) {
      expect(kode.get(wajib)?.jumlahBuku).toBeGreaterThan(0);
    }
    expect(kode.has('IPAS')).toBe(false); expect(kode.has('BING')).toBe(false); expect(kode.has('KKA')).toBe(false);
  });

  it('menyemai secara idempoten dan menghitung buku per kelas, bukan TP', async () => {
    await pastikanKurikulumTersedia(); await pastikanKurikulumTersedia();
    const sebelum = await daftarKelas();
    expect(sebelum).toHaveLength(6);
    expect(sebelum.map((kelas) => kelas.jumlahBuku)).toEqual([11,0,0,0,7,0]);
    expect(sebelum.every((kelas) => kelas.jumlahPilihanMapel > 0)).toBe(true);
    await daftarkanBukuUji();
    const sesudah = await daftarKelas();
    expect(sesudah[0]?.jumlahBuku).toBe(12); expect(sesudah[1]?.jumlahBuku).toBe(0); expect(sesudah[4]?.jumlahBuku).toBe(7);
  });

  it('menghitung buku, bab, dan topik per mata pelajaran', async () => {
    await pastikanKurikulumTersedia();
    const mapel = await daftarMapelUntukKelas(1);
    expect(mapel.find((item) => item.kode === 'MAT')).toMatchObject({ jumlahBuku: 1, jumlahBab: 8, jumlahTopik: 25 });
    expect(mapel.find((item) => item.kode === 'BI')).toMatchObject({ jumlahBuku: 1, jumlahBab: 8, jumlahTopik: 8 });
    expect(mapel.find((item) => item.kode === 'PP')).toMatchObject({ jumlahBuku: 1, jumlahBab: 4, jumlahTopik: 4 });
    expect(mapel.find((item) => item.kode === 'PAI')).toMatchObject({ jumlahBuku: 1, jumlahBab: 10, jumlahTopik: 10 });
    expect(mapel.find((item) => item.kode === 'RUPA')).toMatchObject({ jumlahBuku: 1, jumlahBab: 4, jumlahTopik: 4 });
  });

  it('mencerminkan buku terdaftar pada ringkasan kurikulum', async () => {
    await daftarkanBukuUji();
    expect(await bacaRingkasanKurikulum()).toMatchObject({ jumlahBuku: 19, jumlahBab: 68, jumlahTopik: 167 });
  });
});
