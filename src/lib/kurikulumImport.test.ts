import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../test/bantuan';
import { buatPratinjauImpor, imporPratinjauKurikulum, parseCsv, ubahVerifikasiBaris } from './kurikulumImport';
import { bacaKonteksAiTerpercaya, bacaRantaiTpAktif } from './storage/isiRepo';
import { jalankanTransaksi, kueri, TOKO } from './storage/db';

const PAKET_VALID = {
  versi_impor: '1.0-uji',
  dokumen: [{ kode: 'DOK-UJI', judul: 'Dokumen Uji', versi: '1', status_verifikasi: 'belum' }],
  mata_pelajaran: [],
  cp: [{ id: 'CP-UJI', mapel_kode: 'MAT', fase_kode: 'A', teks_capaian: 'Teks CP dari sumber uji.', dokumen_kode: 'DOK-UJI' }],
  elemen: [{ id: 'ELM-UJI', cp_id: 'CP-UJI', nama: 'Elemen Uji', teks_elemen: 'Teks elemen uji.', urutan: 1 }],
  tp_rekomendasi: [{ kode_tampil: 'TP-UJI-1', elemen_id: 'ELM-UJI', tingkat_kelas: 1, teks_tujuan: 'Tujuan uji dari sumber.', semester: 1 }],
  referensi: [], referensi_bab: [], materi: [{ id: 'MAT-UJI', tp_kode: 'TP-UJI-1', judul: 'Materi Uji', blok_isi: 'Isi uji', perkiraan_menit: 10, sumber: 'bawaan' }], pemetaan_bab_tp: [],
};

describe('kontrak impor data Tahap 10', () => {
  beforeEach(async () => resetPenyimpanan());

  it('mem-parse CSV berkutip dan baris baru', () => {
    expect(parseCsv('id,judul\r\n1,"Judul, satu"\r\n2,"Dua\nbaris"')).toEqual([
      { id: '1', judul: 'Judul, satu' }, { id: '2', judul: 'Dua\nbaris' },
    ]);
  });

  it('menguji impor valid dan membiarkan CP belum terverifikasi di luar konteks AI', async () => {
    let preview = await buatPratinjauImpor([{ nama: 'paket.json', isi: JSON.stringify(PAKET_VALID) }]);
    expect(preview.jumlahDitolak).toBe(0);
    const cpBaris = preview.baris.find((item) => item.bagian === 'cp')!;
    preview = ubahVerifikasiBaris(preview, cpBaris.id, false);
    expect((await imporPratinjauKurikulum(preview)).jumlahTersimpan).toBe(5);
    expect((await bacaRantaiTpAktif('TP-UJI-1')).materi[0]?.id).toBe('MAT-UJI');
    await expect(bacaKonteksAiTerpercaya('TP-UJI-1')).rejects.toThrow('belum diverifikasi');
  });

  it('menolak schema, duplikat, KKA A/B, IPAS A, kode S-, dan relasi putus per baris', async () => {
    const paket = {
      versi_impor: '1', dokumen: [], mata_pelajaran: [],
      cp: [
        { id: 'CP-X', mapel_kode: 'KKA', fase_kode: 'A', teks_capaian: '', dokumen_kode: '' },
        { id: 'CP-X', mapel_kode: 'IPAS', fase_kode: 'A', teks_capaian: 'x', dokumen_kode: 'hilang' },
      ],
      elemen: [], tp_rekomendasi: [{ kode_tampil: 'S-01', elemen_id: 'hilang', tingkat_kelas: 9, teks_tujuan: '' }],
      referensi: [], referensi_bab: [], materi: [], pemetaan_bab_tp: [{ referensi_bab_id: 'hilang', tp_kode: 'hilang' }],
    };
    const preview = await buatPratinjauImpor([{ nama: 'invalid.json', isi: JSON.stringify(paket) }]);
    expect(preview.jumlahDitolak).toBe(4);
    expect(preview.baris.flatMap((item) => item.masalah).join(' ')).toMatch(/KKA|IPAS|Duplikat|S-|TP tidak dikenal/);
  });

  it('membatalkan seluruh transaksi bila pekerjaan gagal setelah penulisan pertama', async () => {
    await expect(jalankanTransaksi(TOKO.dokumenKurikulum, 'readwrite', async (toko) => {
      await kueri.simpan(toko(TOKO.dokumenKurikulum), { kode: 'ROLLBACK-UJI', judul: 'Tidak boleh tertinggal' });
      throw new Error('gagal disengaja');
    })).rejects.toThrow('gagal disengaja');
    const tertinggal = await jalankanTransaksi(TOKO.dokumenKurikulum, 'readonly', (toko) => kueri.ambil(toko(TOKO.dokumenKurikulum), 'ROLLBACK-UJI'));
    expect(tertinggal).toBeUndefined();
  });
});
