import { AppError } from '../errors/AppError';
import type {
  CapaianPembelajaran,
  Asesmen,
  ElemenKurikulum,
  KonteksKurikulum,
  Lkpd,
  Materi,
  MataPelajaran,
  ReferensiBab,
  ReferensiPembelajaran,
  Soal,
  TautanTp,
  TujuanPembelajaran,
} from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';
import { pastikanKurikulumTersedia } from './kurikulumRepo';

export interface RantaiTpAktif {
  tp: TujuanPembelajaran;
  elemen: ElemenKurikulum;
  cp: CapaianPembelajaran;
  mapel: MataPelajaran;
  materi: Materi[];
}

/** Satu pembaca rantai dipakai materi, game, LKPD, soal, dan asesmen. */
export async function bacaRantaiTpAktif(tpId: string): Promise<RantaiTpAktif> {
  await pastikanKurikulumTersedia();
  return jalankanTransaksi(
    [TOKO.tp, TOKO.elemen, TOKO.cp, TOKO.mataPelajaran, TOKO.materi],
    'readonly',
    async (toko) => {
      const tp = await kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), tpId);
      if (!tp || tp.status !== 'aktif') throw new AppError('VALIDASI', 'TP aktif tidak ditemukan.');
      const elemen = await kueri.ambil<ElemenKurikulum>(toko(TOKO.elemen), tp.elemen_id);
      if (!elemen || elemen.status !== 'aktif') throw new AppError('VALIDASI', 'Elemen aktif tidak ditemukan.');
      const cp = await kueri.ambil<CapaianPembelajaran>(toko(TOKO.cp), elemen.cp_id);
      if (!cp) throw new AppError('VALIDASI', 'CP untuk TP ini tidak ditemukan.');
      const mapel = await kueri.ambil<MataPelajaran>(toko(TOKO.mataPelajaran), cp.mapel_kode);
      if (!mapel) throw new AppError('VALIDASI', 'Mata pelajaran untuk CP ini tidak ditemukan.');
      if (!mapel.kelas_tersedia.includes(tp.tingkat_kelas)) {
        throw new AppError('VALIDASI', 'Relasi kelas, fase, dan mata pelajaran tidak konsisten.');
      }
      const materi = await kueri.semuaLewatIndeks<Materi>(toko(TOKO.materi), 'tp_id', tp.id);
      return { tp, elemen, cp, mapel, materi };
    },
  );
}

export interface KonteksAiTerpercaya {
  kurikulum: KonteksKurikulum;
  cp: string;
  tp: string;
  referensi: Array<{
    id: string;
    judul: string;
    bab: string;
    lingkup_izin: ReferensiPembelajaran['lingkup_izin'];
  }>;
}

/** Data belum diverifikasi boleh tampil, tetapi tidak pernah menjadi sitasi AI. */
export async function bacaKonteksAiTerpercaya(
  tpId: string,
  referensiBabId?: string | null,
): Promise<KonteksAiTerpercaya> {
  const rantai = await bacaRantaiTpAktif(tpId);
  if (!rantai.cp.terverifikasi) {
    throw new AppError(
      'VALIDASI',
      'CP belum diverifikasi operator dan tidak boleh dipakai sebagai konteks atau sitasi AI.',
    );
  }

  const referensi = await jalankanTransaksi(
    [TOKO.referensi, TOKO.referensiBab, TOKO.pemetaanBabTp],
    'readonly',
    async (toko) => {
      const pemetaan = await kueri.semuaLewatIndeks<{ referensi_bab_id: string; tp_id: string }>(
        toko(TOKO.pemetaanBabTp),
        'tp_id',
        tpId,
      );
      const ids = referensiBabId
        ? pemetaan.filter((baris) => baris.referensi_bab_id === referensiBabId)
        : pemetaan;
      const hasil: KonteksAiTerpercaya['referensi'] = [];
      for (const baris of ids) {
        const bab = await kueri.ambil<ReferensiBab>(toko(TOKO.referensiBab), baris.referensi_bab_id);
        if (!bab) continue;
        const sumber = await kueri.ambil<ReferensiPembelajaran>(toko(TOKO.referensi), bab.referensi_id);
        if (!sumber || sumber.status !== 'aktif') continue;
        hasil.push({
          id: sumber.id,
          judul: sumber.judul,
          bab: `${bab.nomor_tampil} ${bab.judul_bab}`.trim(),
          lingkup_izin: sumber.lingkup_izin,
        });
      }
      return hasil;
    },
  );

  return {
    kurikulum: {
      tingkat_kelas: rantai.tp.tingkat_kelas,
      fase_kode: rantai.cp.fase_kode,
      mapel_kode: rantai.cp.mapel_kode,
      cabang_kode: rantai.cp.cabang_kode,
      agama_kode: rantai.cp.agama_kode,
      cp_id: rantai.cp.id,
      elemen_id: rantai.elemen.id,
      tp_id: rantai.tp.id,
      materi_id: rantai.materi[0]?.id ?? null,
      referensi_id: referensi[0]?.id ?? null,
      referensi_bab_id: referensiBabId ?? null,
    },
    cp: rantai.cp.teks_capaian,
    tp: rantai.tp.teks_tujuan,
    referensi,
  };
}

export async function simpanLkpdTertaut(lkpd: Lkpd): Promise<void> {
  await bacaRantaiTpAktif(lkpd.tp_id);
  if (lkpd.prompt_ai_id) await bacaKonteksAiTerpercaya(lkpd.tp_id, lkpd.referensi_bab_id);
  if (!lkpd.judul.trim() || !lkpd.blok.length) throw new AppError('VALIDASI', 'Judul dan isi LKPD wajib diisi.');
  await jalankanTransaksi([TOKO.lkpd, TOKO.tautanTp, TOKO.referensiBab], 'readwrite', async (toko) => {
    if (lkpd.referensi_bab_id && !await kueri.ambil<ReferensiBab>(toko(TOKO.referensiBab), lkpd.referensi_bab_id)) {
      throw new AppError('VALIDASI', 'Bab referensi LKPD tidak ditemukan.');
    }
    await kueri.simpan(toko(TOKO.lkpd), { ...lkpd, judul: lkpd.judul.trim() });
    await kueri.simpan(toko(TOKO.tautanTp), {
      tp_id: lkpd.tp_id, jenis_isi: 'lkpd', isi_id: lkpd.id, peran: 'utama', dibuat_oleh_ai: Boolean(lkpd.prompt_ai_id),
    } satisfies TautanTp);
  });
}

export async function simpanSoalTertaut(soal: Soal): Promise<void> {
  await bacaRantaiTpAktif(soal.tp_id);
  if (soal.prompt_ai_id) await bacaKonteksAiTerpercaya(soal.tp_id, soal.referensi_bab_id);
  if (!soal.teks.trim() || !soal.kunci.trim()) throw new AppError('VALIDASI', 'Teks dan kunci soal wajib diisi.');
  await jalankanTransaksi([TOKO.soal, TOKO.tautanTp, TOKO.referensiBab], 'readwrite', async (toko) => {
    if (soal.referensi_bab_id && !await kueri.ambil<ReferensiBab>(toko(TOKO.referensiBab), soal.referensi_bab_id)) {
      throw new AppError('VALIDASI', 'Bab referensi soal tidak ditemukan.');
    }
    await kueri.simpan(toko(TOKO.soal), soal);
    await kueri.simpan(toko(TOKO.tautanTp), {
      tp_id: soal.tp_id, jenis_isi: 'soal', isi_id: soal.id, peran: 'utama', dibuat_oleh_ai: Boolean(soal.prompt_ai_id),
    } satisfies TautanTp);
  });
}

export async function simpanAsesmenTertaut(asesmen: Asesmen): Promise<void> {
  await bacaRantaiTpAktif(asesmen.tp_id);
  if (!asesmen.soal_id.length || asesmen.jumlah_butir !== asesmen.soal_id.length) {
    throw new AppError('VALIDASI', 'Jumlah soal asesmen tidak konsisten.');
  }
  await jalankanTransaksi([TOKO.asesmen, TOKO.soal, TOKO.tautanTp, TOKO.referensiBab], 'readwrite', async (toko) => {
    for (const soalId of asesmen.soal_id) {
      const soal = await kueri.ambil<Soal>(toko(TOKO.soal), soalId);
      if (!soal || soal.tp_id !== asesmen.tp_id || soal.status_persetujuan !== 'disetujui') {
        throw new AppError('VALIDASI', 'Semua soal asesmen harus disetujui dan memakai TP aktif yang sama.');
      }
    }
    if (asesmen.referensi_bab_id && !await kueri.ambil<ReferensiBab>(toko(TOKO.referensiBab), asesmen.referensi_bab_id)) {
      throw new AppError('VALIDASI', 'Bab referensi asesmen tidak ditemukan.');
    }
    await kueri.simpan(toko(TOKO.asesmen), asesmen);
    await kueri.simpan(toko(TOKO.tautanTp), {
      tp_id: asesmen.tp_id, jenis_isi: 'asesmen', isi_id: asesmen.id, peran: 'utama', dibuat_oleh_ai: false,
    } satisfies TautanTp);
  });
}
