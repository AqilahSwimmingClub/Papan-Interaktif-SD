import { beforeEach, describe, expect, it } from 'vitest';
import { resetPenyimpanan } from '../../test/bantuan';
import type { Materi, TautanTp, TujuanPembelajaran } from '../types';
import { bukaBasisData, jalankanTransaksi, kueri, TOKO, TOKO_PER_ZONA } from './db';
import {
  arsipkanTpSekolah,
  auditIntegritasKurikulum,
  simpanKonfigurasiKurikulum,
  simpanMateri,
  simpanTpSekolah,
} from './kurikulumAdminRepo';
import { bacaDetailMapelKelas, pastikanKurikulumTersedia } from './kurikulumRepo';
import { pastikanKelasKerja, simpanSesiPapan } from './kelasRepo';
import { buatCadangan, simpanMedia } from './pelengkapRepo';

describe('schema dan integritas kurikulum final Tahap 3–4', () => {
  beforeEach(async () => resetPenyimpanan());

  it('membentuk 38 tabel domain dalam enam zona tanpa membongkar penanda perangkat', async () => {
    const tabelDomain = Object.values(TOKO_PER_ZONA).flat();
    expect(tabelDomain).toHaveLength(38);
    expect(new Set(tabelDomain).size).toBe(38);
    const db = await bukaBasisData();
    expect([...db.objectStoreNames].sort()).toEqual([...tabelDomain, TOKO.perangkat].sort());
  });

  it('lolos audit seluruh CP, elemen, TP, dokumen, kelas/fase, dan referensi', async () => {
    expect(await auditIntegritasKurikulum()).toEqual({
      jumlah: { cp: 47, elemen: 221, tp: 212, referensi: 7 },
      masalah: [],
    });
  });

  it('menolak perubahan TP Rekomendasi dan menerima TP Sekolah/Guru yang valid', async () => {
    const detail = await bacaDetailMapelKelas(1, 'MAT');
    const elemen = detail?.elemen.find((item) => item.status === 'aktif');
    const rekomendasi = elemen?.tpRekomendasi[0];
    expect(elemen).toBeDefined();
    expect(rekomendasi).toBeDefined();
    await expect(
      simpanTpSekolah({
        id: rekomendasi?.id,
        elemen_id: elemen!.id,
        tingkat_kelas: 1,
        kode_tampil: rekomendasi!.kode_tampil,
        teks_tujuan: rekomendasi!.teks_tujuan,
        semester: 1,
        dibuat_oleh: 'guru-uji',
      }),
    ).rejects.toThrow('hanya-baca');

    const sekolah = await simpanTpSekolah({
      elemen_id: elemen!.id,
      tingkat_kelas: 1,
      kode_tampil: 'S-01',
      teks_tujuan: 'Menggunakan konsep pada konteks lokal sekolah.',
      semester: 'keduanya',
      dibuat_oleh: 'guru-uji',
    });
    expect(sekolah.sumber).toBe('sekolah');
    await arsipkanTpSekolah(sekolah.id);
    const tersimpan = await jalankanTransaksi(TOKO.tp, 'readonly', (toko) =>
      kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), sekolah.id),
    );
    expect(tersimpan?.status).toBe('diarsipkan');
  });

  it('menolak KKA pada kelas 1–4 di lapisan data', async () => {
    await expect(
      simpanKonfigurasiKurikulum({
        sekolah_id: 'sekolah-uji',
        tingkat_kelas: 4,
        mapel_kode: 'KKA',
        aktif: true,
        cabang_kode: null,
        nama_kustom: '',
        agama_kode: null,
      }),
    ).rejects.toThrow('kelas 5–6');
  });

  it('menyimpan materi dan relasinya melalui tautan_tp', async () => {
    await pastikanKurikulumTersedia();
    const tp = await jalankanTransaksi(TOKO.tp, 'readonly', async (toko) =>
      (await kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)))[0],
    );
    const materi: Materi = {
      id: 'MATERI-UJI',
      tp_id: tp!.id,
      judul: 'Materi uji relasi',
      blok: [{ id: 'BLOK-1', jenis: 'teks', isi: 'Isi lokal.', urutan: 1 }],
      sumber: 'guru',
      perkiraan_menit: 15,
      diperbarui: new Date().toISOString(),
      referensi_bab_id: null,
    };
    await simpanMateri(materi);
    const tautan = await jalankanTransaksi(TOKO.tautanTp, 'readonly', (toko) =>
      kueri.semuaLewatIndeks<TautanTp>(toko(TOKO.tautanTp), 'tp_id', tp!.id),
    );
    expect(tautan).toContainEqual({
      tp_id: tp!.id,
      jenis_isi: 'materi',
      isi_id: materi.id,
      peran: 'utama',
      dibuat_oleh_ai: false,
    });
  });

  it('menjaga relasi sesi kelas–TP dan membuat kode gabung empat angka yang unik', async () => {
    await pastikanKurikulumTersedia();
    const tpKelasSatu = await jalankanTransaksi(TOKO.tp, 'readonly', async (toko) =>
      (await kueri.semuaLewatIndeks<TujuanPembelajaran>(toko(TOKO.tp), 'tingkat_kelas', 1))[0],
    );
    const kelasSatu = await pastikanKelasKerja(1, 'guru-uji');
    const kelasDua = await pastikanKelasKerja(2, 'guru-uji');
    const dataSesi = {
      tp_id: tpKelasSatu!.id,
      guru_id: 'guru-uji',
      halaman_papan: [],
      skor_kelompok: [],
    };
    await expect(simpanSesiPapan({ ...dataSesi, kelas_id: kelasDua.id })).rejects.toThrow(
      'tingkat yang sama',
    );
    const sesi = await simpanSesiPapan({ ...dataSesi, kelas_id: kelasSatu.id });
    expect(sesi.kode_gabung).toMatch(/^\d{4}$/);
  });

  it('menyelesaikan paket cadangan berisi media tanpa menonaktifkan transaksi', async () => {
    await simpanMedia({
      jenis: 'gambar',
      nama_berkas: 'media-uji.png',
      ukuran_byte: 3,
      durasi: null,
      tersedia_offline: true,
      diunggah_oleh: 'guru-uji',
      tp_id: null,
      data_berkas: new Blob(['uji'], { type: 'image/png' }),
    });
    const paket = await buatCadangan();
    expect(paket.data[TOKO.media]).toHaveLength(1);
    expect((paket.data[TOKO.media]?.[0] as { data_berkas: unknown }).data_berkas).toBeDefined();
  });
});
