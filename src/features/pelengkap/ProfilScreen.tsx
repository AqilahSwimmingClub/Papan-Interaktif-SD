import { useEffect, useState } from 'react';
import { keAppError } from '../../lib/errors/AppError';
import { bacaGuru, simpanProfilSekolahGuru } from '../../lib/storage/pelengkapRepo';
import { bacaSekolah, sekolahKosong } from '../../lib/storage/sekolahRepo';
import type { Guru, Sekolah } from '../../lib/types';
import { useAuth } from '../../state/useAuth';
import { gantiSandiAkun } from '../../lib/auth/authService';
import './pelengkap.css';

export function ProfilScreen() {
  const { akun } = useAuth();
  const [sekolah, setSekolah] = useState<Sekolah>(sekolahKosong());
  const [guru, setGuru] = useState<Guru | null>(null);
  const [pesan, setPesan] = useState('');
  const [sandi, setSandi] = useState({ lama: '', baru: '', konfirmasi: '' });

  useEffect(() => {
    if (!akun) return;
    void Promise.all([bacaSekolah(), bacaGuru(akun.id, akun)]).then(([dataSekolah, dataGuru]) => {
      setSekolah(dataSekolah ?? sekolahKosong());
      setGuru(dataGuru ?? null);
    });
  }, [akun]);

  async function tanganiLogo(file: File | undefined) {
    if (!file) return;
    const pembaca = new FileReader();
    pembaca.onload = () => setSekolah((lama) => ({ ...lama, logo_berkas: String(pembaca.result) }));
    pembaca.readAsDataURL(file);
  }

  async function tanganiFoto(file: File | undefined) {
    if (!file || !guru) return;
    if (file.size > 2 * 1024 * 1024) { setPesan('Foto profil maksimal 2 MB.'); return; }
    const pembaca = new FileReader();
    pembaca.onload = () => setGuru((lama) => lama ? ({ ...lama, foto_data_url: String(pembaca.result) }) : lama);
    pembaca.readAsDataURL(file);
  }

  async function tanganiGantiSandi() {
    if (!akun) return;
    try { await gantiSandiAkun(akun, sandi.lama, sandi.baru, sandi.konfirmasi); setSandi({ lama: '', baru: '', konfirmasi: '' }); setPesan('Password berhasil diganti. Data pembelajaran tetap tersimpan.'); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  async function tanganiSimpan(peristiwa: React.FormEvent) {
    peristiwa.preventDefault();
    if (!guru) return;
    try { await simpanProfilSekolahGuru(sekolah, guru); setPesan('Profil sekolah dan guru tersimpan lokal.'); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  return (
    <main className="halaman-pelengkap" data-testid="layar-profil">
      <header className="pelengkap-kop"><div><p className="label-data">Pengaturan</p><h1>Profil Sekolah & Guru</h1><p>Identitas kop cetak dan Mode Kelas selalu dibaca dari profil ini, tidak dari kode.</p></div></header>
      <form className="form-profil" onSubmit={(e) => void tanganiSimpan(e)}>
        <section><h2>Identitas sekolah</h2><div className="unggah-logo"><span>{sekolah.logo_berkas ? <img src={sekolah.logo_berkas} alt="Logo sekolah" /> : 'Logo'}</span><label>Ganti logo<input type="file" accept="image/*" onChange={(e) => void tanganiLogo(e.target.files?.[0])} /></label></div><label>Nama sekolah<input value={sekolah.nama} onChange={(e) => setSekolah({ ...sekolah, nama: e.target.value })} /></label><label>NPSN<input value={sekolah.npsn} onChange={(e) => setSekolah({ ...sekolah, npsn: e.target.value })} /></label><label>Kepala sekolah<input value={sekolah.kepala_sekolah} onChange={(e) => setSekolah({ ...sekolah, kepala_sekolah: e.target.value })} /></label><label>Alamat untuk kop cetak<textarea value={sekolah.alamat} onChange={(e) => setSekolah({ ...sekolah, alamat: e.target.value })} /></label><label>Ukuran kertas bawaan<select value={sekolah.kertas_bawaan} onChange={(e) => setSekolah({ ...sekolah, kertas_bawaan: e.target.value as 'A4' | 'F4' })}><option>A4</option><option>F4</option></select></label></section>
        <section><h2>Guru aktif</h2>{guru ? <><div className="unggah-logo"><span>{guru.foto_data_url ? <img src={guru.foto_data_url} alt="Foto guru"/> : guru.nama.split(/\s+/).slice(0,2).map((x) => x[0]).join('').toUpperCase()}</span><label>Ganti foto<input type="file" accept="image/*" onChange={(e) => void tanganiFoto(e.target.files?.[0])}/></label></div><label>Nama guru<input value={guru.nama} onChange={(e) => setGuru({ ...guru, nama: e.target.value })} /></label><label>Peran<select value={guru.peran} onChange={(e) => setGuru({ ...guru, peran: e.target.value as Guru['peran'] })}><option value="guru">Guru</option><option value="operator">Operator</option><option value="kepala_sekolah">Kepala sekolah</option></select></label><label>Kelas diampu<div className="cek-kelas">{[1,2,3,4,5,6].map((nilai) => <span key={nilai}><input type="checkbox" checked={guru.kelas_diampu.includes(nilai)} onChange={(e) => setGuru({ ...guru, kelas_diampu: e.target.checked ? [...guru.kelas_diampu, nilai].sort() : guru.kelas_diampu.filter((x) => x !== nilai) })} /> Kelas {nilai}</span>)}</div></label><fieldset><legend>Ganti password</legend><label>Password lama<input type="password" autoComplete="current-password" value={sandi.lama} onChange={(e) => setSandi({...sandi, lama:e.target.value})}/></label><label>Password baru<input type="password" autoComplete="new-password" value={sandi.baru} onChange={(e) => setSandi({...sandi, baru:e.target.value})}/></label><label>Konfirmasi<input type="password" autoComplete="new-password" value={sandi.konfirmasi} onChange={(e) => setSandi({...sandi, konfirmasi:e.target.value})}/></label><button className="tombol-guru" type="button" onClick={() => void tanganiGantiSandi()}>Ganti Password</button></fieldset></> : <p>Memuat profil guru…</p>}</section>
        <footer>{pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : <span/>}<button className="tombol-guru tombol-guru--utama" type="submit">Simpan Profil</button></footer>
      </form>
    </main>
  );
}
