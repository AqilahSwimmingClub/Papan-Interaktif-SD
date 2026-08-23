import logoBekasi from '../../../assets/logo-bekasi.png';
import logoTutWuri from '../../../assets/logo-tutwuri.png';
import { IdentitasPembuat } from '../../components/IdentitasPembuat';
import './pelengkap.css';

export function TentangAplikasiScreen() {
  return (
    <main className="halaman-pelengkap" data-testid="layar-tentang">
      <header className="pelengkap-kop">
        <div>
          <p className="label-data">Tentang Aplikasi</p>
          <h1>Papan Interaktif SD</h1>
          <p>Platform pembelajaran interaktif local-first untuk kelas 1–6.</p>
        </div>
      </header>
      <section className="tentang-aplikasi">
        <div className="tentang-aplikasi__logo">
          <img src={logoTutWuri} alt="Tut Wuri Handayani" />
          <img src={logoBekasi} alt="Kabupaten Bekasi" />
        </div>
        <h2>Platform Pembelajaran Interaktif · Kurikulum Merdeka</h2>
        <p>
          Materi, papan, game, data kelas, hasil belajar, dan kurikulum tersimpan pada perangkat
          agar kegiatan mengajar utama tetap dapat berjalan tanpa internet.
        </p>
        <IdentitasPembuat ukuran="besar" />
      </section>
    </main>
  );
}
