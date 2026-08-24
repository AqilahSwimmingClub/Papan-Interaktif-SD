import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { keAppError } from '../../lib/errors/AppError';
import { bacaExcelSiswa, unduhTemplateSiswa, type BarisPratinjauSiswa } from '../../lib/studentImport';
import { daftarSiswaKelas, hapusSiswaKelas, imporSiswaKelas, pastikanKelasKerja, ubahSiswaKelas, type DataSiswaBaru } from '../../lib/storage/kelasRepo';
import { bacaGuru } from '../../lib/storage/pelengkapRepo';
import type { Kelas, Siswa } from '../../lib/types';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './pelengkap.css';

const FORM_AWAL: DataSiswaBaru = { nama: '', nis: '', nisn: '', jk: '', agama: '', tempat_tanggal_lahir: '', orang_tua: '', telepon: '', alamat: '' };

export function DataSiswaScreen() {
  const { akun } = useAuth();
  const { konteks, pilihKelas } = useKurikulum();
  const [tingkat, setTingkat] = useState(konteks.tingkat_kelas ?? 4);
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [form, setForm] = useState<DataSiswaBaru>(FORM_AWAL);
  const [pratinjau, setPratinjau] = useState<BarisPratinjauSiswa[]>([]);
  const [cari, setCari] = useState('');
  const [pesan, setPesan] = useState('');
  const [kelasDiampu, setKelasDiampu] = useState<number[]>([]);
  const [editId, setEditId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const muat = useCallback(async (kelasTingkat = tingkat) => {
    if (!akun) return;
    const profil = await bacaGuru(akun.id, akun);
    const diampu = profil?.kelas_diampu ?? [];
    const tingkatAktif = diampu.length && !diampu.includes(kelasTingkat) ? diampu[0]! : kelasTingkat;
    setKelasDiampu(diampu); setTingkat(tingkatAktif);
    const kelasAktif = await pastikanKelasKerja(tingkatAktif, akun.id);
    setKelas(kelasAktif); setSiswa(await daftarSiswaKelas(kelasAktif.id));
    pilihKelas(tingkatAktif, kelasAktif.fase_kode);
  }, [akun, pilihKelas, tingkat]);

  useEffect(() => { void muat().catch((galat: unknown) => setPesan(keAppError(galat).message)); }, [muat]);

  async function simpanManual(e: FormEvent) {
    e.preventDefault();
    if (!kelas) return;
    try { if (editId) await ubahSiswaKelas(kelas.id, editId, form); else await imporSiswaKelas(kelas.id, [form]); setForm(FORM_AWAL); setEditId(''); setPesan(editId ? 'Perubahan siswa tersimpan lokal.' : 'Data siswa tersimpan lokal.'); await muat(); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  function mulaiEdit(item: Siswa) { setEditId(item.id); setForm({ nama: item.nama, nis: item.nis, nisn: item.nisn, jk: item.jk, agama: item.agama, tempat_tanggal_lahir: item.tempat_tanggal_lahir, orang_tua: item.orang_tua, telepon: item.telepon, alamat: item.alamat }); }
  async function hapus(item: Siswa) { if (!kelas || !window.confirm(`Hapus ${item.nama} dari kelas ini? Data nilai terkait tidak dihapus otomatis.`)) return; try { await hapusSiswaKelas(kelas.id, item.id); setPesan('Siswa dihapus dari kelas.'); await muat(); } catch (galat) { setPesan(keAppError(galat).message); } }

  async function bacaFile(file: File | undefined) {
    if (!file) return;
    try { const hasil = await bacaExcelSiswa(await file.arrayBuffer()); setPratinjau(hasil); setPesan(`${hasil.length} baris dibaca; ${hasil.filter((item) => item.valid).length} siap diimpor.`); }
    catch (galat) { setPesan(keAppError(galat).message); }
    if (inputRef.current) inputRef.current.value = '';
  }

  async function impor() {
    if (!kelas) return;
    const valid = pratinjau.filter((item) => item.valid).map(({ baris: _baris, valid: _valid, masalah: _masalah, ...item }) => item);
    try { await imporSiswaKelas(kelas.id, valid); setPratinjau([]); setPesan(`${valid.length} siswa berhasil diimpor.`); await muat(); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  const tampil = useMemo(() => {
    const q = cari.trim().toLocaleLowerCase('id');
    return q ? siswa.filter((item) => [item.nama, item.nis, item.nisn, item.agama].some((nilai) => nilai?.toLocaleLowerCase('id').includes(q))) : siswa;
  }, [cari, siswa]);

  return <main className="halaman-pelengkap" data-testid="layar-data-siswa">
    <header className="pelengkap-kop"><div><p className="label-data">Kelas dan Data</p><h1>Data Siswa</h1><p>Data milik Guru aktif tersimpan lokal. Hanya nama yang wajib; kolom lain boleh kosong.</p></div><label className="pilih-kelas-ringkas">Kelas<select value={tingkat} onChange={(e) => { setTingkat(Number(e.target.value)); setPratinjau([]); }}>{(kelasDiampu.length ? kelasDiampu : [1,2,3,4,5,6]).map((item) => <option key={item} value={item}>Kelas {item}</option>)}</select></label></header>
    <section className="pelengkap-toolbar data-siswa-toolbar"><button type="button" onClick={() => void unduhTemplateSiswa()}>Unduh Template Excel</button><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => inputRef.current?.click()}>Impor Excel</button><input className="sr-only" ref={inputRef} type="file" accept=".xlsx,.xls" onChange={(e) => void bacaFile(e.target.files?.[0])}/><label>Cari<input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Nama, NIS, NISN, agama"/></label></section>
    {pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : null}
    {pratinjau.length ? <section className="kartu-backup"><h2>Pratinjau sebelum impor</h2><div className="tabel-data-wrap"><table><thead><tr><th>Baris</th><th>Nama</th><th>NIS/NISN</th><th>Status</th></tr></thead><tbody>{pratinjau.map((item) => <tr key={item.baris}><td>{item.baris}</td><td>{item.nama || '-'}</td><td>{item.nis || '-'} / {item.nisn || '-'}</td><td>{item.valid ? 'Siap' : item.masalah.join(' ')}</td></tr>)}</tbody></table></div><button className="tombol-guru tombol-guru--utama" disabled={!pratinjau.some((item) => item.valid)} type="button" onClick={() => void impor()}>Impor baris valid</button></section> : null}
    <div className="tata-data-siswa"><form className="form-profil form-siswa" onSubmit={(e) => void simpanManual(e)}><section><h2>{editId ? 'Edit data siswa' : 'Tambah satu siswa'}</h2><label>Nama *<input required value={form.nama} onChange={(e) => setForm({...form, nama:e.target.value})}/></label><div className="baris-form"><label>NIS<input value={form.nis} onChange={(e) => setForm({...form, nis:e.target.value})}/></label><label>NISN<input value={form.nisn} onChange={(e) => setForm({...form, nisn:e.target.value})}/></label><label>JK<select value={form.jk} onChange={(e) => setForm({...form, jk:e.target.value as DataSiswaBaru['jk']})}><option value="">Kosong</option><option value="L">L</option><option value="P">P</option></select></label></div><label>Agama<input value={form.agama} onChange={(e) => setForm({...form, agama:e.target.value})}/></label><label>Tempat/Tanggal Lahir<input value={form.tempat_tanggal_lahir} onChange={(e) => setForm({...form, tempat_tanggal_lahir:e.target.value})}/></label><label>Orang Tua<input value={form.orang_tua} onChange={(e) => setForm({...form, orang_tua:e.target.value})}/></label><label>Telepon<input value={form.telepon} onChange={(e) => setForm({...form, telepon:e.target.value})}/></label><label>Alamat<textarea value={form.alamat} onChange={(e) => setForm({...form, alamat:e.target.value})}/></label><button className="tombol-guru tombol-guru--utama" type="submit">{editId ? 'Simpan perubahan' : 'Simpan siswa'}</button>{editId ? <button type="button" onClick={() => { setEditId(''); setForm(FORM_AWAL); }}>Batal edit</button> : null}</section></form>
      <section className="daftar-siswa"><h2>{tampil.length} siswa Kelas {tingkat}</h2>{tampil.length ? <div className="tabel-data-wrap"><table><thead><tr><th>No</th><th>Nama</th><th>NIS</th><th>NISN</th><th>JK</th><th>Agama</th><th>Orang Tua</th><th>Aksi</th></tr></thead><tbody>{tampil.map((item) => <tr key={item.id}><td>{item.nomor_absen}</td><td><strong>{item.nama}</strong></td><td>{item.nis || '-'}</td><td>{item.nisn || '-'}</td><td>{item.jk || '-'}</td><td>{item.agama || '-'}</td><td>{item.orang_tua || '-'}</td><td><div className="aksi-siswa"><button type="button" onClick={() => mulaiEdit(item)}>Edit</button><button type="button" onClick={() => void hapus(item)}>Hapus</button></div></td></tr>)}</tbody></table></div> : <p>Belum ada siswa untuk Guru aktif pada kelas ini.</p>}</section></div>
  </main>;
}
