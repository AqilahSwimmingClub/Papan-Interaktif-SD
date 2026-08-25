import { Link, useParams } from 'react-router-dom';
import { useKurikulum } from '../../state/useKurikulum';
import { RUTE, ruteStrukturMapel } from '../../routes/paths';
import '../kurikulum/kurikulum.css';

const LABEL_FITUR: Record<string, string> = {
  materi: 'Materi Pembelajaran',
  game: 'Game Edukasi',
  vlab: 'VLAB / Simulasi',
  kuis: 'Kuis',
  lkpd: 'LKPD',
  'bank-soal': 'Bank Soal',
  papan: 'Papan Interaktif',
};

export function FiturPembelajaranScreen() {
  const { jenis = '' } = useParams();
  const { konteks } = useKurikulum();
  const judul = LABEL_FITUR[jenis] ?? 'Fitur Pembelajaran';
  const konteksLengkap =
    konteks.tingkat_kelas && konteks.mapel_kode && (jenis === 'papan' || konteks.tp_id);

  return (
    <main className="halaman-kurikulum halaman-fitur-menyusul">
      <p className="label-data">Navigasi pembelajaran</p>
      <h1>{judul}</h1>
      {konteksLengkap ? (
        <div className="konteks-terpilih">
          <span>Kelas {konteks.tingkat_kelas}</span>
          <span>Fase {konteks.fase_kode}</span>
          <span>{konteks.mapel_kode}</span>
          {konteks.tp_id ? <span>{konteks.tp_id}</span> : null}
        </div>
      ) : null}
      <section className="keadaan-kosong keadaan-kosong--fitur">
        <span className="keadaan-kosong__ikon" aria-hidden="true">
          {konteksLengkap ? '✓' : '→'}
        </span>
        <h2>{konteksLengkap ? 'Konteks kurikulum siap' : 'Pilih konteks kurikulum lebih dulu'}</h2>
        <p>
          {konteksLengkap
            ? 'Rute dan konteks lokal sudah tersambung. Isi fitur ini akan dibentuk dari Buku Referensi resmi sekolah.'
            : 'Pilih kelas dan mata pelajaran agar fitur pembelajaran menerima konteks yang tepat.'}
        </p>
        {konteks.tingkat_kelas && konteks.mapel_kode ? (
          <Link
            className="tombol-guru tombol-guru--utama"
            to={ruteStrukturMapel(konteks.tingkat_kelas, konteks.mapel_kode)}
          >
            Kembali ke struktur mapel
          </Link>
        ) : (
          <Link className="tombol-guru tombol-guru--utama" to={RUTE.kelas}>
            Pilih Kelas
          </Link>
        )}
      </section>
    </main>
  );
}
