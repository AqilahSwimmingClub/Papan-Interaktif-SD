import { Link } from 'react-router-dom';
import { RUTE } from '../../routes/paths';
import '../pelengkap/pelengkap.css';

const MENU = [
  ['Kelompok Siswa', RUTE.kelompok, 'Kelola kelompok tetap per semester.'],
  ['Rekap CP/TP', RUTE.rekap, 'Lihat ketuntasan siswa per TP.'],
  ['Media Pembelajaran', RUTE.media, 'Simpan gambar, video, audio, dan PDF.'],
  ['Pencarian Global', RUTE.pencarian, 'Cari kurikulum dan data lokal.'],
  ['Basis Data CP & TP', RUTE.basisData, 'Audit seed dan jelajahi data final.'],
  ['Profil Sekolah/Guru', RUTE.profil, 'Identitas dinamis untuk kop dan kelas.'],
  ['Backup & Restore', RUTE.backup, 'Lindungi data kerja di perangkat.'],
  ['Offline / PWA', RUTE.offline, 'Periksa kesiapan tanpa internet.'],
  ['Mode Siswa', RUTE.modeSiswa, 'Gabung sesi dengan kode empat angka.'],
] as const;

export function MenuLainnyaScreen() {
  return <main className="halaman-pelengkap"><header className="pelengkap-kop"><div><p className="label-data">Navigasi HP</p><h1>Menu Lainnya</h1><p>Seluruh layar pelengkap tetap dapat dijangkau tanpa sidebar.</p></div></header><section className="kisi-kelompok">{MENU.map(([label,tujuan,keterangan])=><article key={tujuan}><header><span aria-hidden="true">→</span><div><h2>{label}</h2><small>{keterangan}</small></div></header><div style={{padding:14}}><Link className="tombol-guru" to={tujuan}>Buka</Link></div></article>)}</section></main>;
}
