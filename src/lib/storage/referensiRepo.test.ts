import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import { bacaDetailMapelKelas } from './kurikulumRepo';
import { daftarPemetaanReferensi, daftarReferensiLengkap, petakanBabKeTp, pilihReferensiSekolah, simpanBabReferensi, simpanReferensi } from './referensiRepo';

describe('multi-referensi Tahap 9', () => {
  beforeEach(async () => resetPenyimpanan());

  it('menyimpan metadata bab, relasi banyak-ke-banyak, dan pilihan utama sekolah', async () => {
    const detail = await bacaDetailMapelKelas(1, 'MAT');
    const tp = detail!.elemen.flatMap((item) => item.tpRekomendasi)[0]!;
    await simpanReferensi({ id: 'REF-UJI-MAT', jenis: 'buku_siswa', judul: 'Metadata Buku Uji', mapel_kode: 'MAT', fase_kode: 'A', kelas_relevan: [1, 2], penerbit: 'Penerbit Uji', tahun: '2026', versi: '1', url_sumber: '', isbn: '', status: 'aktif', tanggal_diperbarui: '', lingkup_izin: 'metadata_saja', ditambahkan_oleh: 'guru-uji' });
    await simpanBabReferensi({ id: 'BAB-UJI-1', referensi_id: 'REF-UJI-MAT', nomor_tampil: 'Bab 1', judul_bab: 'Metadata Bab Uji', halaman_awal: 1, urutan: 1, ruang_lingkup: 'Ringkasan ruang lingkup.' });
    await petakanBabKeTp({ referensi_bab_id: 'BAB-UJI-1', tp_id: tp.id, kesesuaian: 'penuh', dipetakan_oleh: 'guru-uji', catatan: '' });
    await pilihReferensiSekolah('REF-UJI-MAT', 1, true, 'guru-uji');
    expect(await daftarPemetaanReferensi('REF-UJI-MAT')).toHaveLength(1);
    const referensi = await daftarReferensiLengkap(1, 'MAT');
    expect(referensi.find((item) => item.id === 'REF-UJI-MAT')).toMatchObject({ jumlah_bab: 1, jumlah_tp: 1, pilihan: { utama: true } });
  });

  it('mencegah isi penuh pada sumber metadata-saja', async () => {
    await simpanReferensi({ id: 'REF-META', jenis: 'buku_lain', judul: 'Metadata', mapel_kode: 'MAT', fase_kode: 'A', kelas_relevan: [1], penerbit: '', tahun: '', versi: '', url_sumber: '', isbn: '', status: 'aktif', tanggal_diperbarui: '', lingkup_izin: 'metadata_saja', ditambahkan_oleh: null });
    await expect(simpanBabReferensi({ id: 'BAB-PANJANG', referensi_id: 'REF-META', nomor_tampil: '1', judul_bab: 'Bab', halaman_awal: null, urutan: 1, ruang_lingkup: 'x'.repeat(501) })).rejects.toThrow('maksimal 500');
  });
});
