import { AppError } from '../errors/AppError';
import type {
  BukuBab,
  BukuReferensi,
  BukuTopik,
  Fase,
  IndeksPencarian,
  JenjangKelas,
  KonfigurasiKurikulumSekolah,
  MataPelajaran,
  Materi,
  ReferensiBab,
  TautanTp,
  TujuanPembelajaran,
} from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';
import { pastikanKurikulumTersedia } from './kurikulumRepo';

export interface LaporanIntegritasKurikulum {
  jumlah: {
    kelas: number;
    mapel: number;
    buku: number;
    bab: number;
    topik: number;
  };
  masalah: string[];
}

function nilaiGanda(daftar: string[]): string[] {
  const terlihat = new Set<string>();
  const ganda = new Set<string>();
  for (const nilai of daftar) {
    if (terlihat.has(nilai)) ganda.add(nilai);
    terlihat.add(nilai);
  }
  return [...ganda];
}

/**
 * Audit deterministik struktur aktif: Kelas → Mata Pelajaran → Buku Referensi
 * → Bab → Topik. CP/TP lama tidak lagi ikut diaudit karena sudah dikeluarkan
 * dari alur aplikasi; tabelnya dibiarkan kosong sampai buku dimasukkan.
 */
export async function auditIntegritasKurikulum(): Promise<LaporanIntegritasKurikulum> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [
      TOKO.fase,
      TOKO.jenjangKelas,
      TOKO.mataPelajaran,
      TOKO.bukuReferensi,
      TOKO.bukuBab,
      TOKO.bukuTopik,
    ],
    'readonly',
    async (toko) => {
      const [fase, kelas, mapel, buku, bab, topik] = await Promise.all([
        kueri.semua<Fase>(toko(TOKO.fase)),
        kueri.semua<JenjangKelas>(toko(TOKO.jenjangKelas)),
        kueri.semua<MataPelajaran>(toko(TOKO.mataPelajaran)),
        kueri.semua<BukuReferensi>(toko(TOKO.bukuReferensi)),
        kueri.semua<BukuBab>(toko(TOKO.bukuBab)),
        kueri.semua<BukuTopik>(toko(TOKO.bukuTopik)),
      ]);

      const masalah: string[] = [];
      const idFase = new Set(fase.map((baris) => baris.kode));
      const tingkatKelas = new Set(kelas.map((baris) => baris.tingkat));
      const idMapel = new Set(mapel.map((baris) => baris.kode));
      const idBuku = new Set(buku.map((baris) => baris.id));
      const idBab = new Set(bab.map((baris) => baris.id));

      for (const baris of kelas) {
        if (!idFase.has(baris.fase_kode)) masalah.push(`Kelas ${baris.tingkat} menunjuk fase hilang.`);
      }
      for (const baris of mapel) {
        if (!baris.kelas_tersedia.length) masalah.push(`${baris.kode} tidak tersedia di kelas mana pun.`);
        if (baris.fase_tersedia.some((kode) => !idFase.has(kode))) {
          masalah.push(`${baris.kode} menunjuk fase hilang.`);
        }
      }
      for (const baris of buku) {
        if (!tingkatKelas.has(baris.tingkat_kelas)) masalah.push(`${baris.id} menunjuk kelas hilang.`);
        if (!idMapel.has(baris.mapel_kode)) masalah.push(`${baris.id} menunjuk mapel hilang.`);
        if (!baris.judul.trim()) masalah.push(`${baris.id} tidak memiliki judul buku.`);
      }
      for (const baris of bab) {
        if (!idBuku.has(baris.buku_id)) masalah.push(`${baris.id} menunjuk buku referensi hilang.`);
      }
      for (const baris of topik) {
        if (!idBab.has(baris.bab_id)) masalah.push(`${baris.id} menunjuk bab hilang.`);
      }
      for (const kode of nilaiGanda(
        buku.map((baris) => `${baris.tingkat_kelas}|${baris.mapel_kode}|${baris.judul}`),
      )) {
        masalah.push(`Buku referensi ganda: ${kode}.`);
      }

      return {
        jumlah: {
          kelas: kelas.length,
          mapel: mapel.length,
          buku: buku.filter((baris) => baris.status === 'aktif').length,
          bab: bab.length,
          topik: topik.length,
        },
        masalah,
      };
    },
  );
}

export async function simpanKonfigurasiKurikulum(
  konfigurasi: Omit<KonfigurasiKurikulumSekolah, 'id'>,
): Promise<void> {
  if (konfigurasi.mapel_kode === 'KKA' && konfigurasi.tingkat_kelas < 5) {
    throw new AppError(
      'VALIDASI',
      'Koding dan Kecerdasan Artifisial hanya dapat diaktifkan pada kelas 5–6 sesuai Permendikdasmen Nomor 13 Tahun 2025.',
    );
  }
  await pastikanKurikulumTersedia();
  await jalankanTransaksi([TOKO.konfigurasiKurikulumSekolah, TOKO.mataPelajaran], 'readwrite', async (toko) => {
    const mapel = await kueri.ambil<MataPelajaran>(toko(TOKO.mataPelajaran), konfigurasi.mapel_kode);
    if (!mapel) throw new AppError('VALIDASI', 'Mata pelajaran tidak ditemukan.');
    const nilai: KonfigurasiKurikulumSekolah = {
      ...konfigurasi,
      id: `${konfigurasi.sekolah_id}|${konfigurasi.tingkat_kelas}|${konfigurasi.mapel_kode}`,
    };
    await kueri.simpan(toko(TOKO.konfigurasiKurikulumSekolah), nilai);
  });
}

export async function simpanMateri(materi: Materi): Promise<void> {
  if (!materi.tp_id) throw new AppError('VALIDASI', 'Pilih TP sebelum menyimpan materi.');
  if (!materi.judul.trim()) throw new AppError('VALIDASI', 'Judul materi wajib diisi.');
  if (!materi.blok.length || materi.blok.every((blok) => !blok.isi.trim())) {
    throw new AppError('VALIDASI', 'Materi wajib memiliki sedikitnya satu blok berisi.');
  }
  await pastikanKurikulumTersedia();
  await jalankanTransaksi(
    [TOKO.tp, TOKO.materi, TOKO.tautanTp, TOKO.referensiBab, TOKO.indeksPencarian],
    'readwrite',
    async (toko) => {
      const tp = await kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), materi.tp_id);
      if (!tp || tp.status !== 'aktif') throw new AppError('VALIDASI', 'TP aktif tidak ditemukan.');
      if (materi.referensi_bab_id) {
        const bab = await kueri.ambil<ReferensiBab>(toko(TOKO.referensiBab), materi.referensi_bab_id);
        if (!bab) throw new AppError('VALIDASI', 'Bab referensi tidak ditemukan.');
      }
      await kueri.simpan(toko(TOKO.materi), { ...materi, judul: materi.judul.trim() });
      const tautan: TautanTp = {
        tp_id: materi.tp_id,
        jenis_isi: 'materi',
        isi_id: materi.id,
        peran: 'utama',
        dibuat_oleh_ai: materi.sumber === 'ai',
      };
      await kueri.simpan(toko(TOKO.tautanTp), tautan);
      const indeks: IndeksPencarian = {
        jenis_isi: 'materi',
        isi_id: materi.id,
        teks_terindeks: `${materi.judul} ${materi.blok.map((blok) => blok.isi).join(' ')}`.toLowerCase(),
        tp_id: materi.tp_id,
        kelas: tp.tingkat_kelas,
        diperbarui: materi.diperbarui,
      };
      await kueri.simpan(toko(TOKO.indeksPencarian), indeks);
    },
  );
}

export async function daftarMateriUntukTp(tpId: string): Promise<Materi[]> {
  return jalankanTransaksi(TOKO.materi, 'readonly', (toko) =>
    kueri.semuaLewatIndeks<Materi>(toko(TOKO.materi), 'tp_id', tpId),
  );
}
