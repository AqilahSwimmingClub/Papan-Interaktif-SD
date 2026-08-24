import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import { pastikanKurikulumTersedia } from './kurikulumRepo';
import { petakanBabKeTp, simpanBabReferensi, simpanReferensi } from './referensiRepo';
import { cariReferenceTopic, daftarReferenceBook } from './referenceBookRepo';

describe('ReferenceBook adapter', () => {
  beforeEach(async () => { await resetPenyimpanan(); await pastikanKurikulumTersedia(); });

  it('membentuk relasi Buku → Bab → Topik → TP tanpa menyalin isi penuh', async () => {
    await simpanReferensi({ id: 'BOOK-TEST', jenis: 'buku_guru', judul: 'Buku Uji Metadata', mapel_kode: 'MAT', fase_kode: 'A', kelas_relevan: [1], penerbit: 'Penerbit Uji', tahun: '2026', versi: '1', url_sumber: 'https://example.invalid/buku', isbn: '', status: 'aktif', tanggal_diperbarui: '2026-08-24', lingkup_izin: 'metadata_saja', ditambahkan_oleh: 'TEST' });
    await simpanBabReferensi({ id: 'BOOK-TEST-BAB-1', referensi_id: 'BOOK-TEST', nomor_tampil: '1', judul_bab: 'Bab Bilangan', halaman_awal: 1, urutan: 1, ruang_lingkup: 'Metadata ringkas topik bilangan.' });
    await petakanBabKeTp({ referensi_bab_id: 'BOOK-TEST-BAB-1', tp_id: 'TP-MAT-1-1.1', kesesuaian: 'penuh', dipetakan_oleh: 'TEST', catatan: '' });
    const buku = (await daftarReferenceBook(1, 'MAT')).find((item) => item.id === 'BOOK-TEST');
    expect(buku?.chapters[0]?.topics[0]?.tpIds).toContain('TP-MAT-1-1.1');
    const relasi = await cariReferenceTopic('TP-MAT-1-1.1');
    expect(relasi.some((item) => item.book.id === 'BOOK-TEST' && item.chapter.id === 'BOOK-TEST-BAB-1')).toBe(true);
  });
});
