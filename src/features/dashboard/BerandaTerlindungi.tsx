import { useState } from 'react';
import { useAuth } from '../../state/useAuth';
import { IdentitasPembuat } from '../../components/IdentitasPembuat';
import { log } from '../../lib/errors/logger';
import './beranda-terlindungi.css';

/**
 * TITIK SAMBUNG TAHAP 2 — bukan Dashboard.
 *
 * Tahap 1 hanya membutuhkan satu rute terlindungi untuk membuktikan penjagaan
 * sesi, peran, dan Logout benar-benar bekerja. Dashboard Guru beserta seluruh
 * kerangka halamannya dikerjakan pada tahap berikutnya (Tahap 2A layar 1) dan
 * akan menggantikan berkas ini. JANGAN membangun isi Dashboard di sini.
 */
export function BerandaTerlindungi() {
  const { akun, peran, keluar } = useAuth();
  const [sedangKeluar, setSedangKeluar] = useState(false);

  async function tanganiKeluar() {
    setSedangKeluar(true);
    try {
      await keluar();
    } catch (galat) {
      log.galat('Logout gagal diselesaikan.', galat);
    } finally {
      setSedangKeluar(false);
    }
  }

  return (
    <div className="beranda" data-testid="beranda-terlindungi">
      <header className="beranda__kop">
        <div>
          <p className="beranda__label">Sesi aktif</p>
          <h1 className="beranda__judul">{akun?.nama}</h1>
          <p className="beranda__peran">
            Masuk sebagai <strong>{peran === 'admin' ? 'Admin' : 'Guru'}</strong> ·{' '}
            {akun?.username}
          </p>
        </div>
        <button
          type="button"
          className="tombol-sekunder beranda__keluar"
          onClick={() => void tanganiKeluar()}
          disabled={sedangKeluar}
        >
          {sedangKeluar ? 'Keluar…' : 'Logout'}
        </button>
      </header>

      <section className="beranda__catatan">
        <h2 className="beranda__catatan-judul">Tahap 1 selesai — fondasi siap</h2>
        <p className="beranda__catatan-teks">
          Lapisan masuk aplikasi sudah berdiri: Opening, Setup Admin, Login, penjagaan rute, sesi
          lokal, dan Logout. Dashboard Guru, jalur kurikulum CP/TP, papan interaktif, game, Studio
          AI, materi, LKPD, soal, dan referensi buku dikerjakan pada tahap berikutnya.
        </p>
      </section>

      <IdentitasPembuat />
    </div>
  );
}
