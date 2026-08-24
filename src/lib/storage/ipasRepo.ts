import { AppError } from '../errors/AppError';
import { BAB_IPAS_KELAS_5, cariTopikIpas5, type GameIpas, type TopikIpas, type VlabIpas } from '../ipasKelas5';
import type { ButirGame, GamePembelajaran, HasilBelajar, Kelompok, Siswa } from '../types';
import { TOKO, jalankanTransaksi, kueri } from './db';
import { simpanGame } from './gameRepo';
import { bacaRantaiTpAktif } from './isiRepo';

const acak = <T,>(daftar: T[], putar: number): T[] => daftar.map((_, i) => daftar[(i + putar) % daftar.length]!);

export function buatButirGameIpas(topik: TopikIpas, game: GameIpas): ButirGame[] {
  const susun = game.mekanik === 'puzzle_builder' || game.mekanik === 'coding_quest' || game.mekanik === 'music_rhythm';
  return Array.from({ length: 5 }, (_, indeks) => {
    const jawaban = susun ? topik.tantangan.urutan.join(' → ') : topik.tantangan.jawaban;
    const pilihan = susun
      ? acak(topik.tantangan.urutan, (indeks + 1) % topik.tantangan.urutan.length)
      : acak([topik.tantangan.jawaban, ...topik.tantangan.pengalih], indeks % 4);
    const pembuka = ['Jelajahi arena', 'Temukan petunjuk', 'Uji strategimu', 'Buka gerbang', 'Selesaikan level'][indeks];
    return {
      id: `${game.id}-misi-${indeks + 1}`,
      pertanyaan: `${pembuka}: ${topik.tantangan.misi}`,
      pilihan,
      jawaban,
      penjelasan: `Gunakan bukti dari adegan ${topik.nama}; teks CP/TP tidak dijadikan soal.`,
      sumber: 'materi',
      narasi: topik.tantangan.narasi,
      tag_kompetensi: susun ? 'mengurutkan' : game.mekanik === 'sorting_factory' ? 'mengklasifikasi' : 'mengamati',
      mekanik_anak: game.mekanik,
    };
  });
}

export async function pastikanGameIpasTopik(topikId: string, tpId: string): Promise<GamePembelajaran[]> {
  const topik = cariTopikIpas5(topikId);
  if (!topik) throw new AppError('VALIDASI', 'Topik IPAS Kelas V tidak ditemukan.');
  if (!topik.tpIds.includes(tpId)) throw new AppError('VALIDASI', 'Topik ini tidak relevan dengan TP aktif.');
  const rantai = await bacaRantaiTpAktif(tpId);
  if (rantai.tp.tingkat_kelas !== 5 || rantai.cp.mapel_kode !== 'IPAS' || rantai.cp.fase_kode !== 'C') {
    throw new AppError('VALIDASI', 'GIM EDU ini khusus konteks IPAS Kelas V.');
  }
  const hasil: GamePembelajaran[] = [];
  for (const item of topik.game) {
    const butir = buatButirGameIpas(topik, item);
    const game: GamePembelajaran = {
      id: `IPAS5-${tpId}-${item.id}`,
      tp_id: tpId,
      tingkat_kelas: 5,
      fase_kode: 'C',
      mapel_kode: 'IPAS',
      cp_id: rantai.cp.id,
      materi_id: rantai.materi[0]?.id ?? null,
      engine_kode: item.engineKode,
      judul: item.nama,
      tingkat_kesulitan: item.level,
      mode_permainan: item.mode,
      durasi_menit: 8,
      jumlah_butir: butir.length,
      detik_per_butir: 30,
      butir,
      prompt_ai_id: null,
      status_persetujuan: 'disetujui',
      jumlah_dimainkan: 0,
      referensi_bab_id: null,
    };
    await simpanGame(game);
    hasil.push(game);
  }
  return hasil;
}

export interface MasukanHasilVlab {
  tpId: string;
  cpId: string;
  kelasId: string;
  siswaId?: string;
  kelompokId?: string;
  sesiId: string;
  dinilaiOleh: string;
  topik: TopikIpas;
  vlab: VlabIpas;
  variabel: Record<string, string | number | boolean>;
  observasi: string;
  kesimpulan: string;
}

/** Hasil VLAB menggunakan toko hasil yang sama agar backup, rekap, dan data anggota kelompok tetap utuh. */
export async function simpanHasilVlab(masukan: MasukanHasilVlab): Promise<HasilBelajar[]> {
  if (!masukan.topik.tpIds.includes(masukan.tpId)) throw new AppError('VALIDASI', 'VLAB tidak sesuai dengan TP aktif.');
  if (!masukan.observasi.trim() || !masukan.kesimpulan.trim()) throw new AppError('VALIDASI', 'Catatan hasil dan kesimpulan wajib diisi.');
  const bab = BAB_IPAS_KELAS_5.find((item) => item.topik.some((topik) => topik.id === masukan.topik.id));
  if (!bab) throw new AppError('VALIDASI', 'Bab VLAB tidak ditemukan.');
  return jalankanTransaksi([TOKO.hasil, TOKO.siswa, TOKO.kelompok], 'readwrite', async (toko) => {
    const semuaSiswa = await kueri.semuaLewatIndeks<Siswa>(toko(TOKO.siswa), 'kelas_id', masukan.kelasId);
    const sasaran = masukan.kelompokId
      ? semuaSiswa.filter((item) => (item.kelompok_ids ?? (item.kelompok_id ? [item.kelompok_id] : [])).includes(masukan.kelompokId!))
      : semuaSiswa.filter((item) => item.id === masukan.siswaId);
    if (!sasaran.length) throw new AppError('VALIDASI', 'Pilih siswa atau kelompok yang menjalankan VLAB.');
    const waktu = new Date().toISOString();
    const hasil = sasaran.map((siswa): HasilBelajar => ({
      id: `HASIL-VLAB-${crypto.randomUUID()}`,
      siswa_id: siswa.id,
      tp_id: masukan.tpId,
      sesi_id: masukan.sesiId,
      jenis_aktivitas: 'vlab',
      isi_id: masukan.vlab.id,
      skor: 0,
      skor_maksimal: 0,
      ketuntasan: 'tuntas',
      waktu,
      tanggal_kegiatan: waktu.slice(0, 10),
      dinilai_oleh: masukan.dinilaiOleh,
      kelompok_id: masukan.kelompokId ?? null,
      metadata_vlab: {
        cp_id: masukan.cpId,
        bab_id: bab.id,
        bab_judul: bab.nama,
        topik_id: masukan.topik.id,
        topik_judul: masukan.topik.nama,
        vlab_id: masukan.vlab.id,
        vlab_nama: masukan.vlab.nama,
        variabel: masukan.variabel,
        observasi: masukan.observasi.trim(),
        kesimpulan: masukan.kesimpulan.trim(),
        status: 'selesai',
      },
    }));
    for (const item of hasil) await kueri.simpan(toko(TOKO.hasil), item);
    if (masukan.kelompokId) {
      const kelompok = await kueri.ambil<Kelompok>(toko(TOKO.kelompok), masukan.kelompokId);
      if (!kelompok) throw new AppError('VALIDASI', 'Kelompok VLAB tidak ditemukan.');
    }
    return hasil;
  });
}
