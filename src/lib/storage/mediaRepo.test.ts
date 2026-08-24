import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import { daftarMedia, hapusMedia, simpanMedia } from './pelengkapRepo';

describe('media pembelajaran lokal', () => {
  beforeEach(async () => resetPenyimpanan());
  it('menyimpan Blob offline lalu menghapus media dan indeksnya', async () => {
    const blob = new Blob(['gambar-uji'], { type: 'image/png' });
    const item = await simpanMedia({ jenis: 'gambar', nama_berkas: 'contoh.png', ukuran_byte: blob.size, durasi: null, tersedia_offline: true, diunggah_oleh: 'AKUN-UJI', tp_id: 'TP-UJI', data_berkas: blob });
    expect(await daftarMedia()).toEqual([expect.objectContaining({ id: item.id, nama_berkas: 'contoh.png', tersedia_offline: true })]);
    await hapusMedia(item.id);
    expect(await daftarMedia()).toEqual([]);
  });
});
