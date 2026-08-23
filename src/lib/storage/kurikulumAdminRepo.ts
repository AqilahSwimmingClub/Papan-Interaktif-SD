import { AppError } from '../errors/AppError';
import type {
  CapaianPembelajaran,
  DokumenKurikulum,
  ElemenKurikulum,
  Fase,
  IndeksPencarian,
  JenjangKelas,
  KonfigurasiKurikulumSekolah,
  MataPelajaran,
  Materi,
  PemetaanBabTp,
  ReferensiBab,
  ReferensiPembelajaran,
  TautanTp,
  TujuanPembelajaran,
} from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';
import { pastikanKurikulumTersedia } from './kurikulumRepo';

export interface LaporanIntegritasKurikulum {
  jumlah: {
    cp: number;
    elemen: number;
    tp: number;
    referensi: number;
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

/** Audit deterministik seluruh relasi seed. Tidak menambal data yang rusak. */
export async function auditIntegritasKurikulum(): Promise<LaporanIntegritasKurikulum> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [
      TOKO.fase,
      TOKO.jenjangKelas,
      TOKO.mataPelajaran,
      TOKO.dokumenKurikulum,
      TOKO.cp,
      TOKO.elemen,
      TOKO.tp,
      TOKO.referensi,
      TOKO.referensiBab,
      TOKO.pemetaanBabTp,
    ],
    'readonly',
    async (toko) => {
      const [fase, kelas, mapel, dokumen, cp, elemen, tp, referensi, bab, pemetaan] =
        await Promise.all([
          kueri.semua<Fase>(toko(TOKO.fase)),
          kueri.semua<JenjangKelas>(toko(TOKO.jenjangKelas)),
          kueri.semua<MataPelajaran>(toko(TOKO.mataPelajaran)),
          kueri.semua<DokumenKurikulum>(toko(TOKO.dokumenKurikulum)),
          kueri.semua<CapaianPembelajaran>(toko(TOKO.cp)),
          kueri.semua<ElemenKurikulum>(toko(TOKO.elemen)),
          kueri.semua<TujuanPembelajaran>(toko(TOKO.tp)),
          kueri.semua<ReferensiPembelajaran>(toko(TOKO.referensi)),
          kueri.semua<ReferensiBab>(toko(TOKO.referensiBab)),
          kueri.semua<PemetaanBabTp>(toko(TOKO.pemetaanBabTp)),
        ]);

      const masalah: string[] = [];
      const idFase = new Set(fase.map((baris) => baris.kode));
      const tingkatKelas = new Map(kelas.map((baris) => [baris.tingkat, baris]));
      const idMapel = new Set(mapel.map((baris) => baris.kode));
      const idDokumen = new Set(dokumen.map((baris) => baris.kode));
      const petaCp = new Map(cp.map((baris) => [baris.id, baris]));
      const petaElemen = new Map(elemen.map((baris) => [baris.id, baris]));
      const idTp = new Set(tp.map((baris) => baris.id));
      const idReferensi = new Set(referensi.map((baris) => baris.id));
      const idBab = new Set(bab.map((baris) => baris.id));

      for (const baris of kelas) {
        if (!idFase.has(baris.fase_kode)) masalah.push(`Kelas ${baris.tingkat} menunjuk fase hilang.`);
      }
      for (const baris of cp) {
        if (!idMapel.has(baris.mapel_kode)) masalah.push(`${baris.id} menunjuk mapel hilang.`);
        if (!idFase.has(baris.fase_kode)) masalah.push(`${baris.id} menunjuk fase hilang.`);
        if (!idDokumen.has(baris.dokumen_kode)) masalah.push(`${baris.id} menunjuk dokumen hilang.`);
        if (!baris.teks_capaian.trim()) masalah.push(`${baris.id} tidak memiliki teks CP.`);
      }
      for (const baris of elemen) {
        if (!petaCp.has(baris.cp_id)) masalah.push(`${baris.id} menunjuk CP hilang.`);
        if (baris.status === 'aktif' && !baris.teks_elemen.trim()) {
          masalah.push(`${baris.id} aktif tetapi teks elemennya kosong.`);
        }
      }
      for (const baris of tp) {
        const elemenTp = petaElemen.get(baris.elemen_id);
        const kelasTp = tingkatKelas.get(baris.tingkat_kelas);
        const cpTp = elemenTp ? petaCp.get(elemenTp.cp_id) : undefined;
        if (!elemenTp) masalah.push(`${baris.id} menunjuk elemen hilang.`);
        if (!kelasTp) masalah.push(`${baris.id} menunjuk kelas hilang.`);
        if (cpTp && kelasTp && cpTp.fase_kode !== kelasTp.fase_kode) {
          masalah.push(`${baris.id} menghubungkan kelas dan fase yang berbeda.`);
        }
        if (!baris.teks_tujuan.trim()) masalah.push(`${baris.id} memiliki teks TP kosong.`);
      }
      for (const baris of referensi) {
        if (baris.mapel_kode && !idMapel.has(baris.mapel_kode)) {
          masalah.push(`${baris.id} menunjuk mapel referensi hilang.`);
        }
      }
      for (const baris of bab) {
        if (!idReferensi.has(baris.referensi_id)) masalah.push(`${baris.id} menunjuk referensi hilang.`);
      }
      for (const baris of pemetaan) {
        if (!idBab.has(baris.referensi_bab_id)) {
          masalah.push(`Pemetaan ${baris.referensi_bab_id} menunjuk bab hilang.`);
        }
        if (!idTp.has(baris.tp_id)) masalah.push(`Pemetaan ${baris.tp_id} menunjuk TP hilang.`);
      }

      for (const kode of nilaiGanda(cp.map((baris) => `${baris.mapel_kode}|${baris.fase_kode}|${baris.versi}`))) {
        masalah.push(`CP teknis ganda: ${kode}.`);
      }
      for (const kode of nilaiGanda(elemen.map((baris) => `${baris.cp_id}|${baris.urutan}|${baris.nama}`))) {
        masalah.push(`Elemen teknis ganda: ${kode}.`);
      }
      for (const kode of nilaiGanda(tp.map((baris) => `${baris.elemen_id}|${baris.kode_tampil}`))) {
        masalah.push(`TP teknis ganda: ${kode}.`);
      }

      return {
        jumlah: { cp: cp.length, elemen: elemen.length, tp: tp.length, referensi: referensi.length },
        masalah,
      };
    },
  );
}

export interface MasukanTpSekolah {
  id?: string;
  elemen_id: string;
  tingkat_kelas: number;
  kode_tampil: string;
  teks_tujuan: string;
  semester: 1 | 2 | 'keduanya';
  dibuat_oleh: string;
}

/** Satu-satunya operasi tulis TP; TP rekomendasi selalu ditolak. */
export async function simpanTpSekolah(masukan: MasukanTpSekolah): Promise<TujuanPembelajaran> {
  await pastikanKurikulumTersedia();
  if (masukan.id) {
    const target = await jalankanTransaksi(TOKO.tp, 'readonly', (toko) =>
      kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), masukan.id!),
    );
    if (target?.sumber === 'rekomendasi') {
      throw new AppError('VALIDASI', 'TP Rekomendasi bersifat hanya-baca.');
    }
  }
  const kode = masukan.kode_tampil.trim();
  const teks = masukan.teks_tujuan.trim();
  if (!/^S-/i.test(kode)) {
    throw new AppError('VALIDASI', 'Kode TP Sekolah/Guru wajib berawalan S-.');
  }
  if (!teks || teks.length > 300) {
    throw new AppError('VALIDASI', 'Teks tujuan wajib 1–300 karakter.');
  }

  return jalankanTransaksi([TOKO.tp, TOKO.elemen, TOKO.cp, TOKO.jenjangKelas], 'readwrite', async (toko) => {
    const [elemen, kelas, lama, semuaElemenKelas] = await Promise.all([
      kueri.ambil<ElemenKurikulum>(toko(TOKO.elemen), masukan.elemen_id),
      kueri.ambil<JenjangKelas>(toko(TOKO.jenjangKelas), masukan.tingkat_kelas),
      masukan.id ? kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), masukan.id) : undefined,
      kueri.semuaLewatIndeks<TujuanPembelajaran>(
        toko(TOKO.tp),
        'elemen_kelas',
        [masukan.elemen_id, masukan.tingkat_kelas],
      ),
    ]);
    if (!elemen || !kelas) throw new AppError('VALIDASI', 'Elemen atau kelas tidak ditemukan.');
    if (lama?.sumber === 'rekomendasi') {
      throw new AppError('VALIDASI', 'TP Rekomendasi bersifat hanya-baca.');
    }
    const cp = await kueri.ambil<CapaianPembelajaran>(toko(TOKO.cp), elemen.cp_id);
    if (!cp || cp.fase_kode !== kelas.fase_kode) {
      throw new AppError('VALIDASI', 'Kelas harus berada pada fase yang sama dengan elemen.');
    }
    if (semuaElemenKelas.some((baris) => baris.id !== masukan.id && baris.kode_tampil.toLowerCase() === kode.toLowerCase())) {
      throw new AppError('VALIDASI', 'Kode TP sudah dipakai pada elemen ini.');
    }

    const tujuan: TujuanPembelajaran = {
      id: masukan.id ?? `TP-S-${crypto.randomUUID()}`,
      elemen_id: masukan.elemen_id,
      tingkat_kelas: masukan.tingkat_kelas,
      kode_tampil: kode,
      teks_tujuan: teks,
      sumber: 'sekolah',
      dibuat_oleh: masukan.dibuat_oleh,
      semester: masukan.semester,
      status: 'aktif',
      halaman_lampiran: null,
    };
    await kueri.simpan(toko(TOKO.tp), tujuan);
    return tujuan;
  });
}

export async function arsipkanTpSekolah(id: string): Promise<void> {
  await jalankanTransaksi(TOKO.tp, 'readwrite', async (toko) => {
    const lama = await kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), id);
    if (!lama) throw new AppError('VALIDASI', 'TP tidak ditemukan.');
    if (lama.sumber === 'rekomendasi') {
      throw new AppError('VALIDASI', 'TP Rekomendasi tidak dapat diubah atau dihapus.');
    }
    await kueri.simpan(toko(TOKO.tp), { ...lama, status: 'diarsipkan' });
  });
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

export async function daftarReferensiUntukKonteks(
  mapelKode: string,
  tingkat: number,
): Promise<ReferensiPembelajaran[]> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(TOKO.referensi, 'readonly', async (toko) => {
    const semua = await kueri.semua<ReferensiPembelajaran>(toko(TOKO.referensi));
    return semua
      .filter(
        (baris) =>
          baris.status === 'aktif' &&
          (!baris.mapel_kode || baris.mapel_kode === mapelKode) &&
          baris.kelas_relevan.includes(tingkat),
      )
      .sort((a, b) => a.judul.localeCompare(b.judul, 'id'));
  });
}
