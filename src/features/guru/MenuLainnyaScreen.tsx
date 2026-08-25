import { Link } from 'react-router-dom';
import { RUTE } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import '../pelengkap/pelengkap.css';

const MENU = [
  ['Kelompok Siswa', RUTE.kelompok, 'Kelola kelompok tetap per semester.', false],
  ['Rekap CP/TP', RUTE.rekap, 'Lihat ketuntasan siswa per TP.', false],
  ['Media Pembelajaran', RUTE.media, 'Simpan gambar, video, audio, dan PDF.', false],
  ['Pencarian Global', RUTE.pencarian, 'Cari kurikulum dan data lokal.', false],
  ['VLAB / Simulasi', RUTE.vlab, 'Laboratorium virtual siap dipakai di kelas.', false],
  ['Buku Referensi', RUTE.bukuReferensi, 'Daftarkan buku pelajaran resmi sekolah.', false],
  ['Struktur Kurikulum', RUTE.strukturKurikulum, 'Status rantai isi dan audit relasi.', false],
  ['Profil Sekolah/Guru', RUTE.profil, 'Identitas dinamis untuk kop dan kelas.', false],
  ['Kelola Akun', RUTE.kelolaAkun, 'Tambah dan pulihkan akun Guru lokal.', true],
  ['Backup & Restore', RUTE.backup, 'Lindungi data kerja di perangkat.', false],
  ['Offline / PWA', RUTE.offline, 'Periksa kesiapan tanpa internet.', false],
  ['Mode Siswa', RUTE.modeSiswa, 'Gabung sesi dengan kode empat angka.', false],
  ['Tentang Aplikasi', RUTE.tentang, 'Identitas dan informasi aplikasi.', false],
] as const;

export function MenuLainnyaScreen() {
  const { peran } = useAuth();
  const tampil = MENU.filter(([, , , hanyaAdmin]) => !hanyaAdmin || peran === 'admin');
  return (
    <main className="halaman-pelengkap">
      <header className="pelengkap-kop">
        <div>
          <p className="label-data">Navigasi HP</p>
          <h1>Menu Lainnya</h1>
          <p>Seluruh layar pelengkap tetap dapat dijangkau tanpa sidebar.</p>
        </div>
      </header>
      <section className="kisi-kelompok">
        {tampil.map(([label, tujuan, keterangan]) => (
          <article key={tujuan}>
            <header>
              <span aria-hidden="true">→</span>
              <div>
                <h2>{label}</h2>
                <small>{keterangan}</small>
              </div>
            </header>
            <div style={{ padding: 14 }}>
              <Link className="tombol-guru" to={tujuan}>Buka</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
