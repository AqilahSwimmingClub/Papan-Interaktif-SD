import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../state/useAuth';
import type { Akun } from '../../lib/types';
import {
  aturUlangSandiGuru,
  buatAkunGuru,
  daftarAkunLokal,
  ubahStatusAkunGuru,
} from '../../lib/auth/authService';
import { keAppError } from '../../lib/errors/AppError';
import '../pelengkap/pelengkap.css';
import './kelola-akun.css';

const FORM_AWAL = { nama: '', username: '', password: '', konfirmasi: '' };

export function KelolaAkunScreen() {
  const { akun } = useAuth();
  const [daftar, setDaftar] = useState<Akun[]>([]);
  const [form, setForm] = useState(FORM_AWAL);
  const [resetId, setResetId] = useState<string | null>(null);
  const [sandiBaru, setSandiBaru] = useState('');
  const [pesan, setPesan] = useState('');

  async function muat() {
    if (akun) setDaftar(await daftarAkunLokal(akun));
  }

  useEffect(() => {
    void muat().catch((galat: unknown) => setPesan(keAppError(galat).message));
    // Akun aktif stabil selama layar ini terbuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [akun?.id]);

  async function tambah(peristiwa: FormEvent<HTMLFormElement>) {
    peristiwa.preventDefault();
    if (!akun) return;
    try {
      await buatAkunGuru(akun, form);
      setForm(FORM_AWAL);
      setPesan('Akun Guru tersimpan di perangkat ini.');
      await muat();
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }

  async function ubahAktif(guru: Akun) {
    if (!akun) return;
    try {
      await ubahStatusAkunGuru(akun, guru.id, !guru.aktif);
      setPesan(`Akun ${guru.nama} ${guru.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`);
      await muat();
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }

  async function resetSandi(guru: Akun) {
    if (!akun) return;
    try {
      await aturUlangSandiGuru(akun, guru.id, sandiBaru);
      setResetId(null);
      setSandiBaru('');
      setPesan(`Sandi ${guru.nama} sudah diperbarui.`);
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }

  const guru = daftar.filter((item) => item.peran === 'guru');

  return (
    <main className="halaman-pelengkap" data-testid="layar-kelola-akun">
      <header className="pelengkap-kop">
        <div>
          <p className="label-data">Hanya Admin perangkat</p>
          <h1>Kelola Akun</h1>
          <p>Akun tersimpan hanya di perangkat ini; tidak ada akun pusat atau pemulihan surel.</p>
        </div>
      </header>

      <div className="tata-akun">
        <form className="form-akun" onSubmit={(peristiwa) => void tambah(peristiwa)}>
          <h2>Tambah akun Guru</h2>
          <label>
            Nama Guru
            <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </label>
          <label>
            Username
            <input
              autoCapitalize="none"
              autoComplete="off"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <label>
            Konfirmasi Password
            <input
              type="password"
              autoComplete="new-password"
              value={form.konfirmasi}
              onChange={(e) => setForm({ ...form, konfirmasi: e.target.value })}
            />
          </label>
          <button className="tombol-guru tombol-guru--utama" type="submit">
            Simpan Akun Guru
          </button>
        </form>

        <section className="daftar-akun">
          <h2>Akun pada perangkat</h2>
          {guru.length ? (
            guru.map((item) => (
              <article key={item.id}>
                <header>
                  <div>
                    <strong>{item.nama}</strong>
                    <small>@{item.username} · {item.aktif ? 'Aktif' : 'Nonaktif'}</small>
                  </div>
                  <button className="tombol-guru" type="button" onClick={() => void ubahAktif(item)}>
                    {item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </header>
                {resetId === item.id ? (
                  <div className="reset-sandi">
                    <label>
                      Sandi baru
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={sandiBaru}
                        onChange={(e) => setSandiBaru(e.target.value)}
                      />
                    </label>
                    <button
                      className="tombol-guru tombol-guru--utama"
                      type="button"
                      onClick={() => void resetSandi(item)}
                    >
                      Simpan Sandi
                    </button>
                    <button className="tombol-guru" type="button" onClick={() => setResetId(null)}>
                      Batal
                    </button>
                  </div>
                ) : (
                  <button className="tautan-akun" type="button" onClick={() => setResetId(item.id)}>
                    Atur ulang sandi
                  </button>
                )}
              </article>
            ))
          ) : (
            <p>Belum ada akun Guru. Admin tetap dapat memakai seluruh fitur pembelajaran.</p>
          )}
        </section>
      </div>
      {pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : null}
    </main>
  );
}
