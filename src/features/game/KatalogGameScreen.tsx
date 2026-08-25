import { Link } from 'react-router-dom';
import { PESAN_MENUNGGU_BUKU_GAME } from '../../lib/referensi/strukturReferensi';
import { RUTE } from '../../routes/paths';
import './game.css';

/**
 * Menu Game Edukasi.
 *
 * Katalog game lama beserta seluruh engine dan butir turunan TP lama sudah
 * dihapus. Layar ini sengaja tidak membuat konten apa pun sampai Buku
 * Referensi resmi sekolah dimasukkan.
 */
export function KatalogGameScreen() {
  return (
    <main className="halaman-kurikulum game-katalog" data-testid="katalog-game">
      <header className="kop-kurikulum game-katalog__kop">
        <div>
          <p className="label-data">Menunggu Buku Referensi</p>
          <h1>Game Edukasi</h1>
          <p>Game akan dibentuk mengikuti bab dan topik buku pelajaran resmi sekolah.</p>
        </div>
      </header>

      <section className="keadaan-kosong keadaan-kosong--fitur" data-testid="game-menunggu-buku">
        <span className="keadaan-kosong__ikon" aria-hidden="true">
          📕
        </span>
        <h2>{PESAN_MENUNGGU_BUKU_GAME}</h2>
        <p>
          Katalog game lama sudah dihapus seluruhnya. Tidak ada game yang dibuat lebih dulu agar
          isinya benar-benar mengikuti buku yang dipakai di kelas.
        </p>
        <div className="game-katalog__aksi">
          <Link className="tombol-guru tombol-guru--utama" to={RUTE.bukuReferensi}>
            Masukkan Buku Referensi
          </Link>
          <Link className="tombol-guru tombol-guru--terang" to={RUTE.vlab}>
            Buka VLAB / Simulasi
          </Link>
        </div>
      </section>

      <section className="game-catatan" aria-label="Yang sudah dapat dipakai">
        <h2>Sementara ini yang sudah dapat dipakai</h2>
        <ul>
          <li>
            <strong>VLAB / Simulasi</strong> — 13 laboratorium virtual dengan simulasi nyata,
            berjalan penuh tanpa menunggu buku.
          </li>
          <li>
            <strong>Papan Interaktif</strong> — alat tulis, alat matematika, undian, timer, dan
            poin kelompok.
          </li>
        </ul>
      </section>
    </main>
  );
}
