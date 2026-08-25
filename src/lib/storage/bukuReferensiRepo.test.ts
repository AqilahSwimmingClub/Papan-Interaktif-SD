import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import { RANTAI_REFERENSI } from '../referensi/strukturReferensi';
import {
  bacaRantaiReferensiTerisi,
  bacaRingkasanBukuReferensi,
  bacaStrukturKelasMapel,
  daftarBabBuku,
  daftarBukuReferensi,
  daftarTopikBab,
  simpanBabBuku,
  simpanBukuReferensi,
  simpanTopikBab,
} from './bukuReferensiRepo';
import { auditIntegritasKurikulum } from './kurikulumAdminRepo';

const BUKU = {
  id: 'BUKU-IPAS-4',
  tingkat_kelas: 4,
  mapel_kode: 'IPAS',
  judul: 'Buku IPAS Kelas 4',
  penulis: 'Tim Penulis',
  penerbit: 'Penerbit Sekolah',
  tahun: '2026',
  edisi: '1',
  isbn: '',
  utama: true,
  status: 'aktif' as const,
  ditambahkan_oleh: null,
  ditambahkan_pada: '2026-08-25T00:00:00.000Z',
};

describe('rantai Buku Referensi', () => {
  beforeEach(async () => {
    await resetPenyimpanan();
  });

  it('mulai kosong sebelum proses seed kurikulum dijalankan', async () => {
    expect(await daftarBukuReferensi()).toHaveLength(0);
    expect(await bacaRingkasanBukuReferensi()).toEqual({
      jumlahBuku: 0,
      jumlahBab: 0,
      jumlahTopik: 0,
      kelasTerisi: [],
      siapDipakai: false,
    });
  });

  it('menyimpan rantai buku → bab → topik dan membacanya kembali', async () => {
    await simpanBukuReferensi(BUKU);
    await simpanBabBuku({
      id: 'BAB-IPAS-1',
      buku_id: BUKU.id,
      nomor_tampil: 'Bab 1',
      judul_bab: 'Cahaya dan Sifatnya',
      halaman_awal: 1,
      halaman_akhir: 24,
      urutan: 1,
    });
    await simpanTopikBab({
      id: 'TOPIK-IPAS-1',
      bab_id: 'BAB-IPAS-1',
      nomor_tampil: '1.1',
      judul_topik: 'Cahaya merambat lurus',
      lingkup_materi: 'Percobaan cahaya menembus papan berlubang.',
      halaman_awal: 3,
      urutan: 1,
    });

    expect(await daftarBukuReferensi(4, 'IPAS')).toHaveLength(1);
    expect(await daftarBabBuku(BUKU.id)).toHaveLength(1);
    expect(await daftarTopikBab('BAB-IPAS-1')).toHaveLength(1);

    const struktur = await bacaStrukturKelasMapel(4, 'IPAS');
    expect(struktur.buku).toHaveLength(1);
    expect(struktur.bab[0]?.judul_bab).toBe('Cahaya dan Sifatnya');
    expect(struktur.topik[0]?.judul_topik).toBe('Cahaya merambat lurus');

    expect(await bacaRingkasanBukuReferensi()).toMatchObject({
      jumlahBuku: 1,
      jumlahBab: 1,
      jumlahTopik: 1,
      kelasTerisi: [4],
      siapDipakai: true,
    });
  });

  it('menolak bab dan topik yang tidak terikat induknya', async () => {
    await expect(
      simpanBabBuku({
        id: 'BAB-YATIM',
        buku_id: 'BUKU-TIDAK-ADA',
        nomor_tampil: 'Bab 1',
        judul_bab: 'Tanpa buku',
        halaman_awal: null,
        halaman_akhir: null,
        urutan: 1,
      }),
    ).rejects.toMatchObject({ kode: 'VALIDASI' });

    await expect(
      simpanTopikBab({
        id: 'TOPIK-YATIM',
        bab_id: 'BAB-TIDAK-ADA',
        nomor_tampil: '1.1',
        judul_topik: 'Tanpa bab',
        lingkup_materi: '',
        halaman_awal: null,
        urutan: 1,
      }),
    ).rejects.toMatchObject({ kode: 'VALIDASI' });
  });

  it('menolak buku tanpa judul atau di luar kelas 1–6', async () => {
    await expect(simpanBukuReferensi({ ...BUKU, judul: '   ' })).rejects.toMatchObject({
      kode: 'VALIDASI',
    });
    await expect(simpanBukuReferensi({ ...BUKU, tingkat_kelas: 9 })).rejects.toMatchObject({
      kode: 'VALIDASI',
    });
  });

  it('menandai simpul CP ke bawah masih menunggu buku sebelum seed dijalankan', async () => {
    const rantai = await bacaRantaiReferensiTerisi();
    expect(rantai.map((simpul) => simpul.kode)).toEqual(
      RANTAI_REFERENSI.map((simpul) => simpul.kode),
    );

    const cari = (kode: string) => rantai.find((simpul) => simpul.kode === kode);
    expect(cari('kelas')?.jumlah).toBe(6);
    expect(cari('mapel')?.jumlah).toBeGreaterThan(0);
    expect(cari('buku')?.jumlah).toBe(0);
    for (const kode of ['cp', 'tp', 'kuis', 'game', 'lkpd', 'bank-soal']) {
      expect(cari(kode)?.jumlah).toBe(0);
      expect(cari(kode)?.keadaan).toBe('menunggu_buku');
    }
    expect(cari('vlab')?.jumlah).toBeNull();
    expect(cari('vlab')?.keadaan).toBe('mandiri');
  });

  it('mengaudit master Kelas 1 dan Kelas 5 serta buku tambahan tanpa relasi putus', async () => {
    await simpanBukuReferensi(BUKU);
    const laporan = await auditIntegritasKurikulum();

    expect(laporan.masalah).toEqual([]);
    expect(laporan.jumlah).toMatchObject({ kelas: 6, buku: 19, bab: 33, topik: 115 });
    expect(laporan.jumlah.mapel).toBeGreaterThan(0);
  });
});
