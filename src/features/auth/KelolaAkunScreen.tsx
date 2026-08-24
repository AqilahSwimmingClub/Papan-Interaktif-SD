import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../state/useAuth';
import type { Akun, Guru } from '../../lib/types';
import {
  aturUlangSandiGuru,
  buatAkunGuru,
  daftarAkunLokal,
  ubahAkunGuru,
  ubahStatusAkunGuru,
} from '../../lib/auth/authService';
import { keAppError } from '../../lib/errors/AppError';
import { getFaseByKelas, getMapelAktifByKelas } from '../../lib/kelasMapel';
import { bacaGuru } from '../../lib/storage/pelengkapRepo';
import { bacaExcelGuru, unduhTemplateGuru, type BarisGuruImpor } from '../../lib/guruImport';
import { RUTE } from '../../routes/paths';
import '../pelengkap/pelengkap.css';
import './kelola-akun.css';

interface FormGuru {
  nama: string;
  username: string;
  password: string;
  konfirmasi: string;
  kelas: number[];
  rombel: string;
  aktif: boolean;
  foto_data_url: string | null;
}

interface BarisGuru { akun: Akun; profil: Guru | null }

const FORM_AWAL: FormGuru = {
  nama: '', username: '', password: '', konfirmasi: '', kelas: [], rombel: 'A', aktif: true, foto_data_url: null,
};

async function fotoDataUrl(file: File | undefined): Promise<string | null> {
  if (!file) return null;
  if (!file.type.startsWith('image/')) throw new Error('Foto Guru harus berupa berkas gambar.');
  if (file.size > 2_000_000) throw new Error('Ukuran foto Guru maksimal 2 MB.');
  return new Promise((selesai, gagal) => {
    const pembaca = new FileReader();
    pembaca.onload = () => selesai(String(pembaca.result));
    pembaca.onerror = () => gagal(new Error('Foto Guru gagal dibaca.'));
    pembaca.readAsDataURL(file);
  });
}

export function KelolaAkunScreen() {
  const { akun } = useAuth();
  const { pathname } = useLocation();
  const modeReset = pathname === RUTE.resetPasswordGuru;
  const [daftar, setDaftar] = useState<BarisGuru[]>([]);
  const [form, setForm] = useState<FormGuru>(FORM_AWAL);
  const [editId, setEditId] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [sandiBaru, setSandiBaru] = useState('');
  const [pesan, setPesan] = useState('');
  const [imporGuru, setImporGuru] = useState<BarisGuruImpor[]>([]);
  const inputGuruRef = useRef<HTMLInputElement>(null);

  async function muat() {
    if (!akun) return;
    const semua = (await daftarAkunLokal(akun)).filter((item) => item.peran === 'guru');
    setDaftar(await Promise.all(semua.map(async (item) => ({ akun: item, profil: (await bacaGuru(item.id, item)) ?? null }))));
  }

  useEffect(() => {
    setPesan(''); setResetId(null); setSandiBaru('');
    void muat().catch((galat: unknown) => setPesan(keAppError(galat).message));
    // Akun aktif stabil selama layar ini terbuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [akun?.id, pathname]);

  const mapelOtomatis = useMemo(() => {
    const hasil = new Map<string, string>();
    form.kelas.forEach((kelas) => getMapelAktifByKelas(kelas).forEach((mapel) => hasil.set(mapel.kode, mapel.nama)));
    return [...hasil.values()];
  }, [form.kelas]);

  function ubahKelas(kelas: number, aktif: boolean) {
    setForm((lama) => ({ ...lama, kelas: aktif ? [...lama.kelas, kelas].sort((a, b) => a - b) : lama.kelas.filter((item) => item !== kelas) }));
  }

  async function simpan(peristiwa: FormEvent<HTMLFormElement>) {
    peristiwa.preventDefault();
    if (!akun) return;
    setPesan('');
    try {
      if (!form.kelas.length) throw new Error('Pilih sedikitnya satu kelas yang diampu.');
      if (editId) {
        await ubahAkunGuru(akun, editId, {
          nama: form.nama, username: form.username, kelas: form.kelas,
          rombel: form.rombel, aktif: form.aktif, foto_data_url: form.foto_data_url,
        });
        setPesan('Data Guru diperbarui dan tetap memakai akun login yang sama.');
      } else {
        await buatAkunGuru(akun, form);
        setPesan('Akun dan profil Guru tersimpan permanen di perangkat ini.');
      }
      setForm(FORM_AWAL); setEditId(null); await muat();
    } catch (galat) { setPesan(keAppError(galat).message); }
  }

  function mulaiEdit(item: BarisGuru) {
    setEditId(item.akun.id); setPesan('');
    setForm({
      nama: item.akun.nama, username: item.akun.username, password: '', konfirmasi: '',
      kelas: item.profil?.kelas_diampu ?? [], rombel: item.profil?.rombel ?? 'A',
      aktif: item.akun.aktif, foto_data_url: item.profil?.foto_data_url ?? null,
    });
  }

  async function bacaFoto(file: File | undefined) {
    try { const foto = await fotoDataUrl(file); setForm((lama) => ({ ...lama, foto_data_url: foto })); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  async function ubahAktif(item: Akun) {
    if (!akun) return;
    try { await ubahStatusAkunGuru(akun, item.id, !item.aktif); setPesan(`Akun ${item.nama} ${item.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`); await muat(); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  async function resetSandi(item: Akun) {
    if (!akun) return;
    try { await aturUlangSandiGuru(akun, item.id, sandiBaru); setResetId(null); setSandiBaru(''); setPesan(`Password ${item.nama} sudah diperbarui tanpa menghapus data Guru.`); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  async function bacaImpor(file: File | undefined) {
    if (!file) return;
    try { const baris = await bacaExcelGuru(await file.arrayBuffer()); setImporGuru(baris); setPesan(`${baris.filter((item) => item.valid).length} akun Guru siap diimpor.`); }
    catch (galat) { setPesan(keAppError(galat).message); }
    if (inputGuruRef.current) inputGuruRef.current.value = '';
  }

  async function jalankanImpor() {
    if (!akun) return;
    try {
      let jumlah = 0;
      for (const baris of imporGuru.filter((item) => item.valid)) {
        const sandiSementara = crypto.randomUUID();
        await buatAkunGuru(akun, {
          nama: baris.nama, username: baris.username, password: sandiSementara,
          konfirmasi: sandiSementara, kelas: baris.kelas, rombel: baris.rombel, aktif: false,
        });
        jumlah += 1;
      }
      setImporGuru([]); setPesan(`${jumlah} akun diimpor nonaktif. Reset password lalu aktifkan akun.`); await muat();
    } catch (galat) { setPesan(keAppError(galat).message); await muat(); }
  }

  return <main className="halaman-pelengkap halaman-data-guru" data-testid="layar-kelola-akun">
    <header className="pelengkap-kop"><div><p className="label-data">Hanya Admin perangkat</p><h1>{modeReset ? 'Reset Password Guru' : 'Data Guru'}</h1><p>{modeReset ? 'Credential diperbarui tanpa menghapus profil, siswa, kelompok, atau aktivitas.' : 'Akun login dan profil Guru memakai satu penyimpanan IndexedDB yang sama.'}</p></div></header>

    <div className={`tata-akun${modeReset ? ' tata-akun--reset' : ''}`}>
      {!modeReset ? <form className="form-akun" onSubmit={(e) => void simpan(e)}>
        <h2>{editId ? 'Edit Guru' : 'Tambah Guru'}</h2>
        <label>Nama Guru<input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}/></label>
        <label>Username<input required autoCapitalize="none" autoComplete="off" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}/></label>
        {!editId ? <><label>Password awal<input required type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/></label><label>Konfirmasi Password<input required type="password" autoComplete="new-password" value={form.konfirmasi} onChange={(e) => setForm({ ...form, konfirmasi: e.target.value })}/></label></> : null}
        <fieldset className="pilih-kelas-guru"><legend>Kelas yang diampu</legend>{[1,2,3,4,5,6].map((kelas) => <label key={kelas}><input type="checkbox" checked={form.kelas.includes(kelas)} onChange={(e) => ubahKelas(kelas, e.target.checked)}/><span>Kelas {kelas}<small>Fase {getFaseByKelas(kelas)}</small></span></label>)}</fieldset>
        <label>Rombel<input value={form.rombel} maxLength={20} placeholder="A" onChange={(e) => setForm({ ...form, rombel: e.target.value })}/></label>
        <label>Status<select value={form.aktif ? 'aktif' : 'nonaktif'} onChange={(e) => setForm({ ...form, aktif: e.target.value === 'aktif' })}><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option></select></label>
        <label>Foto opsional<input type="file" accept="image/*" onChange={(e) => void bacaFoto(e.target.files?.[0])}/></label>
        {mapelOtomatis.length ? <aside className="mapel-otomatis"><strong>Mapel otomatis</strong><p>{mapelOtomatis.join(' · ')}</p></aside> : null}
        <div className="form-akun__aksi"><button className="tombol-guru tombol-guru--utama" type="submit">{editId ? 'Simpan Perubahan' : 'Simpan Guru'}</button>{editId ? <button className="tombol-guru" type="button" onClick={() => { setEditId(null); setForm(FORM_AWAL); setPesan(''); }}>Batal</button> : null}</div>
      </form> : null}

      <section className="daftar-akun"><h2>Akun Guru pada perangkat</h2>{daftar.length ? daftar.map(({ akun: item, profil }) => <article key={item.id}><header><div><strong>{item.nama}</strong><small>@{item.username} · {item.aktif ? 'Aktif' : 'Nonaktif'}</small></div>{!modeReset ? <button className="tombol-guru" type="button" onClick={() => void ubahAktif(item)}>{item.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button> : null}</header><p className="guru-penugasan">{profil?.kelas_diampu.length ? profil.kelas_diampu.map((kelas) => `Kelas ${kelas} (Fase ${getFaseByKelas(kelas)})`).join(', ') : 'Belum ada kelas'} · Rombel {profil?.rombel ?? 'A'}</p>{resetId === item.id ? <div className="reset-sandi"><label>Password baru<input type="password" autoComplete="new-password" value={sandiBaru} onChange={(e) => setSandiBaru(e.target.value)}/></label><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => void resetSandi(item)}>Simpan Password</button><button className="tombol-guru" type="button" onClick={() => { setResetId(null); setSandiBaru(''); setPesan(''); }}>Batal</button></div> : <div className="aksi-akun-guru"><button className="tautan-akun" type="button" onClick={() => { setResetId(item.id); setPesan(''); }}>Reset password</button>{!modeReset ? <button className="tautan-akun" type="button" onClick={() => mulaiEdit({ akun: item, profil })}>Edit Guru</button> : null}</div>}</article>) : <p>Belum ada akun Guru pada perangkat ini.</p>}</section>
    </div>

    {!modeReset ? <section className="kartu-backup impor-guru"><p className="label-data">Impor Guru</p><h2>Template dan pratinjau Excel</h2><p>Kolom: Nama, Username, Kelas, Rombel, Status. Mapel dan fase ditentukan otomatis dari kelas.</p><div><button type="button" onClick={() => void unduhTemplateGuru()}>Unduh Template</button><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => inputGuruRef.current?.click()}>Pilih Excel</button><input className="sr-only" ref={inputGuruRef} type="file" accept=".xlsx,.xls" onChange={(e) => void bacaImpor(e.target.files?.[0])}/></div>{imporGuru.length ? <><div className="tabel-data-wrap"><table><thead><tr><th>Baris</th><th>Nama</th><th>Username</th><th>Kelas/Rombel</th><th>Status</th></tr></thead><tbody>{imporGuru.map((item) => <tr key={item.baris}><td>{item.baris}</td><td>{item.nama}</td><td>{item.username}</td><td>{item.kelas.join(', ') || '-'} / {item.rombel}</td><td>{item.valid ? 'Siap' : item.masalah.join(' ')}</td></tr>)}</tbody></table></div><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => void jalankanImpor()}>Impor akun valid</button></> : null}</section> : null}
    {pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : null}
  </main>;
}
