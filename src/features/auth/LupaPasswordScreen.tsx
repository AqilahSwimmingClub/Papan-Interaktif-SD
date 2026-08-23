import { Link } from 'react-router-dom';
import logoTutWuri from '../../../assets/logo-tutwuri.png';
import { IdentitasPembuat } from '../../components/IdentitasPembuat';
import { RUTE } from '../../routes/paths';
import './setup-admin.css';
import './lupa-password.css';

/**
 * Lupa Password — tanpa surel (Tahap 11 §30).
 *
 * Aplikasi ini luring dan tanpa akun pusat, jadi tidak ada tautan atur ulang
 * lewat surel. Layar ini mengatakannya terus terang, bukan menjanjikan surel
 * yang tidak akan datang.
 */
export function LupaPasswordScreen() {
  return (
    <div className="setup" data-testid="layar-lupa-password">
      <div className="setup__kartu lupa__kartu">
        <div className="setup__cahaya" aria-hidden="true" />

        <header className="setup__kop">
          <img className="setup__logo" src={logoTutWuri} alt="Tut Wuri Handayani" />
          <div>
            <h1 className="setup__judul">LUPA PASSWORD</h1>
            <p className="setup__subjudul">
              Tidak ada pengaturan ulang lewat surel. Aplikasi ini berjalan luring dan tidak punya
              akun pusat.
            </p>
          </div>
        </header>

        <ol className="lupa__jalur">
          <li className="lupa__jalur-butir">
            <h2 className="lupa__jalur-judul">Sandi Guru — minta Admin perangkat</h2>
            <p className="lupa__jalur-teks">
              Admin mengatur ulang sandi Guru dari halaman Kelola Akun. Tidak ada data pembelajaran
              yang hilang.
            </p>
          </li>
          <li className="lupa__jalur-butir">
            <h2 className="lupa__jalur-judul">Sandi Admin — pulihkan berkas cadangan</h2>
            <p className="lupa__jalur-teks">
              Sandi Admin dipulihkan dengan memulihkan berkas cadangan perangkat ini lewat Backup &amp;
              Restore.
            </p>
          </li>
          <li className="lupa__jalur-butir lupa__jalur-butir--terakhir">
            <h2 className="lupa__jalur-judul">Bila keduanya tidak ada — setup ulang perangkat</h2>
            <p className="lupa__jalur-teks">
              Ini satu-satunya pilihan yang tersisa, dan konsekuensinya nyata: data pada perangkat
              ini hilang bila tidak ada cadangan. Hubungi Admin sekolah sebelum menempuhnya.
            </p>
          </li>
        </ol>

        <div className="setup__aksi">
          <Link className="tombol-utama setup__tombol lupa__tombol" to={RUTE.masuk}>
            KEMBALI KE LOGIN
          </Link>
        </div>

        <IdentitasPembuat />
      </div>
    </div>
  );
}
