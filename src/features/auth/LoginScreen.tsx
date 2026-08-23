import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import latarLogin from '../../../assets/login-bg.png';
import logoTutWuri from '../../../assets/logo-tutwuri.png';
import { IdentitasPembuat } from '../../components/IdentitasPembuat';
import { Isian } from './components/Isian';
import { PilihPeran } from './components/PilihPeran';
import { KotakPesan } from './components/KotakPesan';
import { useAuth } from '../../state/useAuth';
import { keAppError } from '../../lib/errors/AppError';
import type { Peran } from '../../lib/types';
import { RUTE } from '../../routes/paths';
import './masuk.css';

/**
 * Layar 29 — Login.
 *
 * Tata letak terkunci (Tahap 11 §29, 29b, 29c; M24). Seluruh aturan bidang
 * gambar dan pemisahan panel ada di masuk.css — komponen ini hanya menyusun
 * isinya, satu susunan untuk keenam titik henti.
 */
export function LoginScreen() {
  const { masuk, keadaan } = useAuth();
  const navigate = useNavigate();
  const lokasi = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [peran, setPeran] = useState<Peran>('admin');
  const [galat, setGalat] = useState<string | null>(null);
  const [fieldGalat, setFieldGalat] = useState<string | undefined>(undefined);
  const [mengirim, setMengirim] = useState(false);

  const tujuan = (lokasi.state as { dari?: string } | null)?.dari ?? RUTE.dasbor;

  async function kirim(peristiwa: FormEvent<HTMLFormElement>) {
    peristiwa.preventDefault();
    setGalat(null);
    setFieldGalat(undefined);
    setMengirim(true);
    try {
      await masuk({ username, password, peran });
      navigate(tujuan, { replace: true });
    } catch (mentah) {
      const kesalahan = keAppError(mentah);
      setGalat(kesalahan.message);
      setFieldGalat(kesalahan.field);
    } finally {
      setMengirim(false);
    }
  }

  return (
    <div className="masuk" data-testid="layar-login">
      <div className="masuk__visual">
        <img
          className="masuk__gambar"
          src={latarLogin}
          alt="Dua siswa SDN Satria Jaya 01 berdiri di depan papan nama sekolah"
        />
        <div className="masuk__gradien" aria-hidden="true" />
      </div>

      <div className="masuk__panel">
        <div className="masuk__isi">
          <div className="masuk__cahaya" aria-hidden="true" />

          <img className="masuk__logo" src={logoTutWuri} alt="Tut Wuri Handayani" />
          <h1 className="masuk__judul">PAPAN INTERAKTIF SD</h1>
          <span className="masuk__garis-emas" aria-hidden="true" />
          <p className="masuk__subjudul">
            Platform Pembelajaran Interaktif
            <br />
            Kurikulum Merdeka
          </p>

          <p className="masuk__kop">Masuk ke akun</p>

          <form className="masuk__form" onSubmit={kirim} noValidate>
            <div className="masuk__baris-kredensial">
              <Isian
                label="Username"
                name="username"
                placeholder="Username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(peristiwa) => setUsername(peristiwa.target.value)}
                galat={fieldGalat === 'username' ? ' ' : undefined}
                required
              />
              <Isian
                label="Password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                bisaDilihat
                value={password}
                onChange={(peristiwa) => setPassword(peristiwa.target.value)}
                galat={fieldGalat === 'password' ? ' ' : undefined}
                required
              />
            </div>

            <PilihPeran nilai={peran} onUbah={setPeran} />

            {keadaan === 'logout' && !galat ? (
              <KotakPesan jenis="berhasil">
                Anda sudah keluar. Data di perangkat ini tidak ada yang dihapus.
              </KotakPesan>
            ) : null}

            {galat ? <KotakPesan jenis="galat">{galat}</KotakPesan> : null}

            <button type="submit" className="tombol-utama" disabled={mengirim}>
              {mengirim ? 'MEMERIKSA…' : 'MASUK'}
            </button>

            <div className="masuk__lupa">
              <Link className="tautan-lembut" to={RUTE.lupaPassword}>
                Lupa Password
              </Link>
            </div>
          </form>

          <IdentitasPembuat />
        </div>
      </div>
    </div>
  );
}
