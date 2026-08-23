import { Link, useParams } from 'react-router-dom';
import { RUTE } from '../../routes/paths';
import '../kurikulum/kurikulum.css';

const NAMA_FITUR: Record<string, string> = {
  'rencana-mingguan': 'Rencana Mingguan',
  'atur-jadwal': 'Atur Jadwal',
  pencarian: 'Pencarian Global',
  'pembuat-lkpd': 'Pembuat LKPD',
  'pembuat-soal': 'Pembuat Soal',
  'game-generator': 'Game Generator',
  'studio-ai': 'Studio AI',
  'data-siswa': 'Data Siswa',
  penilaian: 'Penilaian',
  leaderboard: 'Leaderboard',
  perpustakaan: 'Perpustakaan',
  pengaturan: 'Pengaturan',
  'pengaturan-kurikulum': 'Pengaturan Kurikulum',
  'kelola-tp-sekolah': 'Kelola TP Sekolah/Guru',
  lainnya: 'Menu Lainnya',
};

export function FiturMenyusulScreen() {
  const { fitur = '' } = useParams();
  const judul = NAMA_FITUR[fitur] ?? 'Fitur Lanjutan';
  return (
    <main className="halaman-kurikulum halaman-fitur-menyusul">
      <p className="label-data">Di luar cakupan Tahap 2</p>
      <h1>{judul}</h1>
      <section className="keadaan-kosong keadaan-kosong--fitur">
        <span className="keadaan-kosong__ikon" aria-hidden="true">
          …
        </span>
        <h2>Navigasi siap, fitur belum diimplementasikan</h2>
        <p>
          Halaman ini menjadi tujuan navigasi yang stabil tanpa mengerjakan modul tahap berikutnya.
        </p>
        <Link className="tombol-guru tombol-guru--utama" to={RUTE.dasbor}>
          Kembali ke Dasbor
        </Link>
      </section>
    </main>
  );
}
