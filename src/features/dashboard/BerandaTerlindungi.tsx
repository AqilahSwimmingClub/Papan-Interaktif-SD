import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import { bacaRingkasanKurikulum, daftarKelas, type RingkasanKelas, type RingkasanKurikulum } from '../../lib/storage/kurikulumRepo';
import { bacaGuru } from '../../lib/storage/pelengkapRepo';
import { log } from '../../lib/errors/logger';
import { RUTE, ruteMapel } from '../../routes/paths';
import './beranda-terlindungi.css';

function sapaanSekarang(): string {
  const jam = new Date().getHours();
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 19) return 'Selamat sore';
  return 'Selamat malam';
}

function tanggalSekarang(): string {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}

const AKSI_GURU = [
  ['Papan Interaktif', 'Tulis, gambar, media, dan presentasi kelas.', RUTE.papan, '▣'],
  ['Kuis Langsung', 'Jalankan kuis individu atau antarkelompok.', RUTE.kuisLangsung, '⚡'],
  ['Alat Matematika', '21 manipulatif visual siap disentuh.', RUTE.alatMatematika, '∑'],
  ['Undian Nama', 'Undi siswa atau bentuk kelompok seimbang.', RUTE.undianNama, '🎯'],
  ['Timer', 'Countdown dan stopwatch untuk aktivitas kelas.', RUTE.timerKelas, '⏱'],
  ['Poin Kelompok', 'Kelola skor, riwayat, dan undo.', RUTE.poinKelompok, '★'],
  ['Game Edukasi', 'Game dinamis sesuai konteks TP aktif.', RUTE.game, '◆'],
  ['VLAB/Simulasi', 'Eksplorasi laboratorium virtual interaktif.', RUTE.vlab, '⚗'],
] as const;

export function BerandaTerlindungi() {
  const { akun, peran } = useAuth();
  const { konteks, pilihKelas } = useKurikulum();
  const [ringkasan, setRingkasan] = useState<RingkasanKurikulum | null>(null);
  const [kelas, setKelas] = useState<RingkasanKelas[]>([]);
  const [kelasGuru, setKelasGuru] = useState<number[]>([]);

  useEffect(() => {
    let aktif = true;
    void Promise.all([bacaRingkasanKurikulum(), daftarKelas(), akun ? bacaGuru(akun.id, akun) : undefined])
      .then(([dataRingkasan, daftar, guru]) => {
        if (!aktif) return;
        setRingkasan(dataRingkasan);
        setKelas(daftar);
        setKelasGuru(guru?.kelas_diampu ?? []);
        if (peran === 'guru' && !konteks.tingkat_kelas && guru?.kelas_diampu[0]) {
          const awal = daftar.find((item) => item.tingkat === guru.kelas_diampu[0]);
          if (awal) pilihKelas(awal.tingkat, awal.fase_kode);
        }
      }).catch((galat: unknown) => log.galat('Dashboard gagal dimuat.', galat));
    return () => { aktif = false; };
  }, [akun, konteks.tingkat_kelas, peran, pilihKelas]);

  const namaDepan = akun?.nama.trim().split(/\s+/)[0] || (peran === 'admin' ? 'Admin' : 'Guru');
  if (peran === 'admin') return <main className="dasbor-guru dasbor-v2" data-testid="beranda-terlindungi" data-dashboard-role="admin">
    <header className="dasbor-guru__kop"><div><p className="dasbor-guru__tanggal">{tanggalSekarang()}</p><h1>{sapaanSekarang()}, {namaDepan}</h1><p>Kelola akun guru dan identitas perangkat tanpa masuk ke ruang kerja pembelajaran.</p></div></header>
    <section className="dasbor-guru__statistik" aria-label="Ringkasan admin">
      <article className="kartu-statistik"><p>CP lokal</p><strong>{ringkasan?.jumlahCp ?? '—'}</strong><small>data read-only tetap utuh</small></article>
      <article className="kartu-statistik"><p>TP rekomendasi</p><strong>{ringkasan?.jumlahTp ?? '—'}</strong><small>tidak diubah dari dashboard</small></article>
      <article className="kartu-statistik"><p>Elemen</p><strong>{ringkasan?.jumlahElemen ?? '—'}</strong><small>relasi kurikulum lokal</small></article>
      <article className="kartu-statistik"><p>Status perangkat</p><strong>Offline</strong><small>penyimpanan lokal siap</small></article>
    </section>
    <section className="kisi-dashboard-v2" aria-label="Menu Admin">
      <Link to={RUTE.dataGuru}><span>👥</span><strong>Data Guru</strong><small>Tambah, edit, penugasan kelas, dan status akun.</small></Link>
      <Link to={RUTE.resetPasswordGuru}><span>🔑</span><strong>Reset Password Guru</strong><small>Pemulihan sandi oleh Admin perangkat.</small></Link>
      <Link to={RUTE.profilSekolah}><span>🏫</span><strong>Edit Profil Sekolah</strong><small>Identitas sekolah untuk kop dan tampilan.</small></Link>
      <Link to={RUTE.backup}><span>⇩</span><strong>Backup & Restore</strong><small>Cadangkan data lokal dengan aman.</small></Link>
    </section>
  </main>;

  const tersedia = kelasGuru.length ? kelas.filter((item) => kelasGuru.includes(item.tingkat)) : kelas;
  return <main className="dasbor-guru dasbor-v2" data-testid="beranda-terlindungi" data-dashboard-role="guru">
    <header className="dasbor-guru__kop"><div><p className="dasbor-guru__tanggal">{tanggalSekarang()}</p><h1>{sapaanSekarang()}, {namaDepan}</h1><p>Pilih kelas yang diampu, lalu gunakan alat mengajar tanpa koneksi internet.</p></div><Link className="tombol-guru tombol-guru--utama" to={RUTE.papan}>Buka Papan</Link></header>
    <section className="panel-guru panel-guru--kelas"><div className="panel-guru__kop"><div><p className="label-data">Kelas yang diampu</p><h2>Pilih kelas aktif</h2></div></div><div className="kisi-kelas-ringkas">{tersedia.map((item) => <Link className={`kartu-kelas-ringkas fase-${item.fase_kode.toLowerCase()}`} key={item.tingkat} to={ruteMapel(item.tingkat)} onClick={() => pilihKelas(item.tingkat, item.fase_kode)}><span>Fase {item.fase_kode}</span><strong>{item.tingkat}</strong><small>{item.jumlahTp} TP tersedia</small></Link>)}</div></section>
    <section className="kisi-dashboard-v2" aria-label="Alat mengajar">{AKSI_GURU.map(([label, deskripsi, tujuan, ikon]) => <Link key={label} to={tujuan}><span>{ikon}</span><strong>{label}</strong><small>{deskripsi}</small></Link>)}</section>
    <section className="kisi-dashboard-v2 kisi-dashboard-v2--dokumen" aria-label="Dokumen pembelajaran"><Link to={RUTE.generateLkpd}><span>✦</span><strong>Generate LKPD</strong><small>Memerlukan buku referensi yang dipilih.</small></Link><Link to={RUTE.bankSoal}><span>▤</span><strong>Generate Bank Soal</strong><small>Struktur siap; isi final menunggu referensi buku.</small></Link></section>
  </main>;
}
