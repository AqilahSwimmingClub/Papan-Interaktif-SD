import { useEffect, useState } from 'react';
import { useAuth } from '../../state/useAuth';
import { gantiSandiAkun } from '../../lib/auth/authService';
import { keAppError } from '../../lib/errors/AppError';
import { bacaGuru, simpanProfilSekolahGuru } from '../../lib/storage/pelengkapRepo';
import { bacaSekolah, sekolahKosong, simpanSekolah } from '../../lib/storage/sekolahRepo';
import type { Guru, Sekolah } from '../../lib/types';
import './pelengkap.css';

export function GantiPasswordScreen() {
  const { akun } = useAuth();
  const [data, setData] = useState({ lama: '', baru: '', konfirmasi: '' });
  const [pesan, setPesan] = useState('');
  async function simpan(e: React.FormEvent) { e.preventDefault(); if (!akun) return; try { await gantiSandiAkun(akun, data.lama, data.baru, data.konfirmasi); setData({ lama: '', baru: '', konfirmasi: '' }); setPesan('Password berhasil diganti. Data lokal tetap tersimpan.'); } catch (galat) { setPesan(keAppError(galat).message); } }
  return <main className="halaman-pelengkap"><header className="pelengkap-kop"><div><p className="label-data">Settings</p><h1>Ganti Password</h1><p>Gunakan password lama untuk menjaga akun lokal tetap aman.</p></div></header><form className="form-profil form-profil--tunggal" onSubmit={(e) => void simpan(e)}><section><label>Password lama<input type="password" autoComplete="current-password" value={data.lama} onChange={(e) => setData({ ...data, lama: e.target.value })} /></label><label>Password baru<input type="password" autoComplete="new-password" value={data.baru} onChange={(e) => setData({ ...data, baru: e.target.value })} /></label><label>Konfirmasi password<input type="password" autoComplete="new-password" value={data.konfirmasi} onChange={(e) => setData({ ...data, konfirmasi: e.target.value })} /></label><button className="tombol-guru tombol-guru--utama" type="submit">Ganti Password</button>{pesan ? <p role="status">{pesan}</p> : null}</section></form></main>;
}

export function GantiProfilScreen({ admin = false }: { admin?: boolean }) {
  const { akun } = useAuth();
  const [guru, setGuru] = useState<Guru | null>(null);
  const [sekolah, setSekolah] = useState<Sekolah>(sekolahKosong());
  const [pesan, setPesan] = useState('');
  useEffect(() => { if (!akun) return; void Promise.all([bacaGuru(akun.id, akun), bacaSekolah()]).then(([profil, identitas]) => { setGuru(profil ?? null); setSekolah(identitas ?? sekolahKosong()); }); }, [akun]);
  async function foto(file?: File) { if (!file || !guru) return; if (file.size > 2 * 1024 * 1024) { setPesan('Foto maksimal 2 MB.'); return; } const reader = new FileReader(); reader.onload = () => setGuru((lama) => lama ? { ...lama, foto_data_url: String(reader.result) } : lama); reader.readAsDataURL(file); }
  async function simpan(e: React.FormEvent) { e.preventDefault(); if (!guru) return; try { await simpanProfilSekolahGuru(sekolah, guru); setPesan('Profil tersimpan lokal.'); } catch (galat) { setPesan(keAppError(galat).message); } }
  return <main className="halaman-pelengkap"><header className="pelengkap-kop"><div><p className="label-data">Settings</p><h1>{admin ? 'Ganti Profil Admin' : 'Ganti Profil'}</h1><p>Profil tampilan terpisah dari data kelas dan kurikulum.</p></div></header><form className="form-profil form-profil--tunggal" onSubmit={(e) => void simpan(e)}><section>{guru ? <><div className="unggah-logo"><span>{guru.foto_data_url ? <img src={guru.foto_data_url} alt="Foto profil" /> : guru.nama.slice(0, 2).toUpperCase()}</span><label>Ganti foto<input type="file" accept="image/*" onChange={(e) => void foto(e.target.files?.[0])} /></label></div><label>Nama tampilan<input value={guru.nama} onChange={(e) => setGuru({ ...guru, nama: e.target.value })} /></label>{!admin ? <label>Kelas diampu<input value={guru.kelas_diampu.map((x) => `Kelas ${x}`).join(', ') || 'Belum ditugaskan Admin'} readOnly /></label> : null}<button className="tombol-guru tombol-guru--utama" type="submit">Simpan Profil</button></> : <p>Memuat profil…</p>}{pesan ? <p role="status">{pesan}</p> : null}</section></form></main>;
}

export function ProfilSekolahScreen() {
  const [sekolah, setSekolah] = useState<Sekolah>(sekolahKosong());
  const [pesan, setPesan] = useState('');
  useEffect(() => { void bacaSekolah().then((hasil) => setSekolah(hasil ?? sekolahKosong())); }, []);
  async function logo(file?: File) { if (!file) return; const reader = new FileReader(); reader.onload = () => setSekolah((lama) => ({ ...lama, logo_berkas: String(reader.result) })); reader.readAsDataURL(file); }
  async function simpan(e: React.FormEvent) { e.preventDefault(); await simpanSekolah(sekolah); setPesan('Profil sekolah tersimpan lokal.'); }
  return <main className="halaman-pelengkap"><header className="pelengkap-kop"><div><p className="label-data">Admin</p><h1>Edit Profil Sekolah</h1><p>Identitas dipakai pada kop cetak dan layar kelas.</p></div></header><form className="form-profil form-profil--tunggal" onSubmit={(e) => void simpan(e)}><section><div className="unggah-logo"><span>{sekolah.logo_berkas ? <img src={sekolah.logo_berkas} alt="Logo sekolah" /> : 'Logo'}</span><label>Ganti logo<input type="file" accept="image/*" onChange={(e) => void logo(e.target.files?.[0])} /></label></div><label>Nama sekolah<input required value={sekolah.nama} onChange={(e) => setSekolah({ ...sekolah, nama: e.target.value })} /></label><label>NPSN<input value={sekolah.npsn} onChange={(e) => setSekolah({ ...sekolah, npsn: e.target.value })} /></label><label>Kepala sekolah<input value={sekolah.kepala_sekolah} onChange={(e) => setSekolah({ ...sekolah, kepala_sekolah: e.target.value })} /></label><label>Alamat<textarea value={sekolah.alamat} onChange={(e) => setSekolah({ ...sekolah, alamat: e.target.value })} /></label><button className="tombol-guru tombol-guru--utama" type="submit">Simpan Profil Sekolah</button>{pesan ? <p role="status">{pesan}</p> : null}</section></form></main>;
}
