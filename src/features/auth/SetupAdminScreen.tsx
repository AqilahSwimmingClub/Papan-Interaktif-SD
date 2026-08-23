import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import logoTutWuri from '../../../assets/logo-tutwuri.png';
import { IdentitasPembuat } from '../../components/IdentitasPembuat';
import { Isian } from './components/Isian';
import { KotakPesan } from './components/KotakPesan';
import { useAuth } from '../../state/useAuth';
import { keAppError } from '../../lib/errors/AppError';
import { kekuatanSandi } from '../../lib/auth/validasi';
import { simpanSekolah, sekolahKosong } from '../../lib/storage/sekolahRepo';
import { log } from '../../lib/errors/logger';
import { RUTE } from '../../routes/paths';
import './setup-admin.css';

type Langkah = 'akun' | 'sekolah';

/**
 * Layar 30 — Setup Admin pertama. Hanya berjalan sekali per perangkat.
 *
 * Langkah 1 akun Admin (wajib), langkah 2 identitas sekolah (opsional dan
 * dapat dilewati). Identitas sekolah tidak pernah ditulis di kode — nilainya
 * masuk ke tabel `sekolah` (MASTER SPECIFICATION FINAL §1 butir 9).
 */
export function SetupAdminScreen() {
  const { setupAdmin, selesaikanSetup } = useAuth();
  const navigate = useNavigate();

  const [langkah, setLangkah] = useState<Langkah>('akun');
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');

  const [namaSekolah, setNamaSekolah] = useState('');
  const [npsn, setNpsn] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kepalaSekolah, setKepalaSekolah] = useState('');

  const [galat, setGalat] = useState<string | null>(null);
  const [fieldGalat, setFieldGalat] = useState<string | undefined>(undefined);
  const [mengirim, setMengirim] = useState(false);

  const kekuatan = kekuatanSandi(password);
  const konfirmasiCocok = konfirmasi.length > 0 && konfirmasi === password;

  async function kirimAkun(peristiwa: FormEvent<HTMLFormElement>) {
    peristiwa.preventDefault();
    setGalat(null);
    setFieldGalat(undefined);
    setMengirim(true);
    try {
      await setupAdmin({ nama, username, password, konfirmasi });
      setLangkah('sekolah');
    } catch (mentah) {
      const kesalahan = keAppError(mentah);
      setGalat(kesalahan.message);
      setFieldGalat(kesalahan.field);
    } finally {
      setMengirim(false);
    }
  }

  async function kirimSekolah(peristiwa: FormEvent<HTMLFormElement>) {
    peristiwa.preventDefault();
    setGalat(null);
    setMengirim(true);
    try {
      await simpanSekolah({
        ...sekolahKosong(),
        nama: namaSekolah.trim(),
        npsn: npsn.trim(),
        alamat: alamat.trim(),
        kepala_sekolah: kepalaSekolah.trim(),
        kop_cetak: namaSekolah.trim(),
      });
      selesaikanSetup();
      navigate(RUTE.masuk, { replace: true });
    } catch (mentah) {
      const kesalahan = keAppError(mentah);
      log.galat('Identitas sekolah gagal disimpan.', kesalahan);
      setGalat(kesalahan.message);
    } finally {
      setMengirim(false);
    }
  }

  return (
    <div className="setup" data-testid="layar-setup-admin">
      <div className="setup__kartu">
        <div className="setup__cahaya" aria-hidden="true" />

        <header className="setup__kop">
          <img className="setup__logo" src={logoTutWuri} alt="Tut Wuri Handayani" />
          <div>
            <h1 className="setup__judul">SETUP PAPAN INTERAKTIF SD</h1>
            <p className="setup__subjudul">
              Perangkat ini belum memiliki Admin. Buat satu akun untuk memulai.
            </p>
          </div>
        </header>

        <div className="setup__langkah" aria-hidden="true">
          <span className="setup__batang setup__batang--aktif" />
          <span className={`setup__batang${langkah === 'sekolah' ? ' setup__batang--aktif' : ''}`} />
        </div>
        <div className="setup__label-langkah">
          <span className={langkah === 'akun' ? 'setup__label--aktif' : undefined}>
            1. Akun Admin
          </span>
          <span className={langkah === 'sekolah' ? 'setup__label--aktif' : undefined}>
            2. Identitas sekolah · opsional
          </span>
        </div>

        {langkah === 'akun' ? (
          <form className="setup__form" onSubmit={kirimAkun} noValidate>
            <div className="setup__kisi">
              <Isian
                label="Nama Admin"
                name="nama"
                autoComplete="name"
                value={nama}
                onChange={(peristiwa) => setNama(peristiwa.target.value)}
                galat={fieldGalat === 'nama' ? ' ' : undefined}
                required
              />
              <Isian
                label="Username"
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(peristiwa) => setUsername(peristiwa.target.value)}
                galat={fieldGalat === 'username' ? ' ' : undefined}
                required
              />
              <div className="setup__sandi">
                <Isian
                  label="Password"
                  name="password"
                  autoComplete="new-password"
                  bisaDilihat
                  value={password}
                  onChange={(peristiwa) => setPassword(peristiwa.target.value)}
                  galat={fieldGalat === 'password' ? ' ' : undefined}
                  required
                />
                <div className="setup__kekuatan" aria-live="polite">
                  <span className="setup__batang-kekuatan" data-terisi={kekuatan.skor >= 1} />
                  <span className="setup__batang-kekuatan" data-terisi={kekuatan.skor >= 2} />
                  <span className="setup__batang-kekuatan" data-terisi={kekuatan.skor >= 3} />
                  <span className="setup__batang-kekuatan" data-terisi={kekuatan.skor >= 4} />
                  <span className="setup__label-kekuatan">
                    {password.length > 0 ? kekuatan.label : ''}
                  </span>
                </div>
              </div>
              <Isian
                label="Konfirmasi Password"
                name="konfirmasi"
                autoComplete="new-password"
                bisaDilihat
                value={konfirmasi}
                onChange={(peristiwa) => setKonfirmasi(peristiwa.target.value)}
                galat={fieldGalat === 'konfirmasi' ? ' ' : undefined}
                bantuan={konfirmasiCocok ? '✓ Konfirmasi sudah sama.' : undefined}
                required
              />
            </div>

            <KotakPesan jenis="info" judul="Akun ini tersimpan hanya di perangkat ini">
              Tidak ada akun pusat dan tidak ada pengiriman ke luar. Bila sandi hilang, pemulihannya
              lewat berkas cadangan — bukan lewat surel. Catat sandi Anda di tempat aman.
            </KotakPesan>

            {galat ? <KotakPesan jenis="galat">{galat}</KotakPesan> : null}

            <div className="setup__aksi">
              <button type="submit" className="tombol-utama setup__tombol" disabled={mengirim}>
                {mengirim ? 'MENYIMPAN…' : 'LANJUT'}
              </button>
            </div>
          </form>
        ) : (
          <form className="setup__form" onSubmit={kirimSekolah} noValidate>
            <div className="setup__kisi">
              <Isian
                label="Nama Sekolah"
                name="nama-sekolah"
                value={namaSekolah}
                onChange={(peristiwa) => setNamaSekolah(peristiwa.target.value)}
              />
              <Isian
                label="NPSN"
                name="npsn"
                inputMode="numeric"
                value={npsn}
                onChange={(peristiwa) => setNpsn(peristiwa.target.value)}
              />
              <Isian
                label="Alamat"
                name="alamat"
                value={alamat}
                onChange={(peristiwa) => setAlamat(peristiwa.target.value)}
              />
              <Isian
                label="Kepala Sekolah"
                name="kepala-sekolah"
                value={kepalaSekolah}
                onChange={(peristiwa) => setKepalaSekolah(peristiwa.target.value)}
              />
            </div>

            <KotakPesan jenis="info" judul="Identitas sekolah dapat diisi belakangan">
              Nama sekolah, NPSN, alamat, logo, dan kepala sekolah dipakai kop cetak LKPD dan
              laporan. Semuanya dapat diubah kapan saja lewat Profil Sekolah.
            </KotakPesan>

            {galat ? <KotakPesan jenis="galat">{galat}</KotakPesan> : null}

            <div className="setup__aksi">
              <button type="submit" className="tombol-utama setup__tombol" disabled={mengirim}>
                {mengirim ? 'MENYIMPAN…' : 'SIMPAN & MASUK'}
              </button>
              <button
                type="button"
                className="tombol-sekunder"
                onClick={() => {
                  selesaikanSetup();
                  navigate(RUTE.masuk, { replace: true });
                }}
              >
                Lewati identitas sekolah
              </button>
            </div>
          </form>
        )}

        <IdentitasPembuat />
      </div>
    </div>
  );
}
