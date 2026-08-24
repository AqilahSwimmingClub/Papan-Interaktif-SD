import { AppError } from '../errors/AppError';
import type { HasilBelajar, Kelas, Kelompok, Siswa, TujuanPembelajaran } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';

export interface MasukanPenilaian {
  kelasId: string;
  tpId: string;
  dinilaiOleh: string;
  jenis: HasilBelajar['jenis_aktivitas'];
  siswaId?: string;
  kelompokId?: string;
  skor: number;
  skorMaksimal: number;
  tanggal: string;
  isiId?: string;
  sesiId?: string;
}

function status(skor: number, maksimal: number): HasilBelajar['ketuntasan'] {
  const rasio = maksimal ? skor / maksimal : 0;
  return rasio >= 0.75 ? 'tuntas' : rasio >= 0.5 ? 'berkembang' : 'perlu_bimbingan';
}

/** Penilaian kelompok disinkronkan menjadi hasil setiap anggota agar rekap individu tetap utuh. */
export async function simpanPenilaian(masukan: MasukanPenilaian): Promise<HasilBelajar[]> {
  if (!masukan.tpId) throw new AppError('VALIDASI', 'TP wajib dipilih sebelum memberi penilaian.');
  if (!Number.isFinite(masukan.skor) || !Number.isFinite(masukan.skorMaksimal) || masukan.skorMaksimal <= 0 || masukan.skor < 0 || masukan.skor > masukan.skorMaksimal) {
    throw new AppError('VALIDASI', 'Skor penilaian tidak valid.');
  }
  return jalankanTransaksi([TOKO.tp, TOKO.kelas, TOKO.siswa, TOKO.kelompok, TOKO.hasil], 'readwrite', async (toko) => {
    const [tp, kelas] = await Promise.all([kueri.ambil<TujuanPembelajaran>(toko(TOKO.tp), masukan.tpId), kueri.ambil<Kelas>(toko(TOKO.kelas), masukan.kelasId)]);
    if (!tp || !kelas || tp.tingkat_kelas !== kelas.tingkat) throw new AppError('VALIDASI', 'TP penilaian tidak sesuai dengan kelas aktif.');
    const semuaSiswa = await kueri.semuaLewatIndeks<Siswa>(toko(TOKO.siswa), 'kelas_id', masukan.kelasId);
    const sasaran = masukan.kelompokId
      ? semuaSiswa.filter((item) => (item.kelompok_ids ?? (item.kelompok_id ? [item.kelompok_id] : [])).includes(masukan.kelompokId!))
      : semuaSiswa.filter((item) => item.id === masukan.siswaId);
    if (!sasaran.length) throw new AppError('VALIDASI', 'Siswa atau anggota kelompok belum dipilih.');
    const waktu = new Date(`${masukan.tanggal}T12:00:00`).toISOString();
    const hasil = sasaran.map((siswa): HasilBelajar => ({
      id: `HASIL-${crypto.randomUUID()}`, siswa_id: siswa.id, tp_id: masukan.tpId,
      sesi_id: masukan.sesiId ?? `NILAI-${masukan.tanggal}`, jenis_aktivitas: masukan.jenis,
      isi_id: masukan.isiId ?? 'PENILAIAN-MANUAL', skor: masukan.skor,
      skor_maksimal: masukan.skorMaksimal, ketuntasan: status(masukan.skor, masukan.skorMaksimal),
      waktu, tanggal_kegiatan: masukan.tanggal, dinilai_oleh: masukan.dinilaiOleh,
      kelompok_id: masukan.kelompokId ?? null,
    }));
    for (const baris of hasil) await kueri.simpan(toko(TOKO.hasil), baris);
    if (masukan.kelompokId) {
      const kelompok = await kueri.ambil<Kelompok>(toko(TOKO.kelompok), masukan.kelompokId);
      if (kelompok) await kueri.simpan(toko(TOKO.kelompok), { ...kelompok, poin_total: kelompok.poin_total + Math.round(masukan.skor) });
    }
    return hasil;
  });
}

export async function daftarHasilKelas(kelasId: string): Promise<HasilBelajar[]> {
  return jalankanTransaksi([TOKO.siswa, TOKO.hasil], 'readonly', async (toko) => {
    const siswa = await kueri.semuaLewatIndeks<Siswa>(toko(TOKO.siswa), 'kelas_id', kelasId);
    const id = new Set(siswa.map((item) => item.id));
    return (await kueri.semua<HasilBelajar>(toko(TOKO.hasil))).filter((item) => id.has(item.siswa_id)).sort((a, b) => b.waktu.localeCompare(a.waktu));
  });
}
