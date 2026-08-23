import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { keAppError } from '../../lib/errors/AppError';
import { arsipkanTpSekolah, simpanTpSekolah } from '../../lib/storage/kurikulumAdminRepo';
import { bacaDetailMapelKelas, type DetailMapelKelas } from '../../lib/storage/kurikulumRepo';
import { ruteCpTp } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './kurikulum-admin.css';

export function KelolaTpSekolahScreen() {
  const { akun } = useAuth();
  const { konteks } = useKurikulum();
  const [detail, setDetail] = useState<DetailMapelKelas | null>(null);
  const [elemenId, setElemenId] = useState(konteks.elemen_id ?? '');
  const [kode, setKode] = useState('S-01');
  const [teks, setTeks] = useState('');
  const [semester, setSemester] = useState<1|2|'keduanya'>('keduanya');
  const [pesan, setPesan] = useState('');
  const muat = useCallback(async () => { if(!konteks.tingkat_kelas||!konteks.mapel_kode)return; const data=await bacaDetailMapelKelas(konteks.tingkat_kelas,konteks.mapel_kode);setDetail(data);setElemenId((lama)=>lama||data?.elemen.find((item)=>item.status==='aktif')?.id||''); }, [konteks.mapel_kode, konteks.tingkat_kelas]);
  useEffect(()=>{void muat();},[muat]);
  if(!konteks.tingkat_kelas||!konteks.mapel_kode) return <main className="halaman-kurikulum"><section className="keadaan-kosong keadaan-kosong--fitur"><h1>Pilih konteks kurikulum lebih dulu</h1><p>TP Sekolah/Guru harus menempel pada satu elemen dan kelas.</p><Link className="tombol-guru tombol-guru--utama" to="/kelas">Pilih Kelas</Link></section></main>;
  const elemen=detail?.elemen.find((item)=>item.id===elemenId);
  async function simpan(){if(!akun||!elemenId)return;try{await simpanTpSekolah({elemen_id:elemenId,tingkat_kelas:konteks.tingkat_kelas!,kode_tampil:kode,teks_tujuan:teks,semester,dibuat_oleh:akun.id});setTeks('');setPesan('TP Sekolah/Guru tersimpan.');await muat();}catch(galat){setPesan(keAppError(galat).message);}}
  async function arsip(id:string){try{await arsipkanTpSekolah(id);setPesan('TP diarsipkan; hasil belajar tetap tersimpan.');await muat();}catch(galat){setPesan(keAppError(galat).message);}}
  return <main className="halaman-kurikulum halaman-kelola-tp" data-testid="kelola-tp"><nav className="remah-kurikulum"><Link to={ruteCpTp(konteks.tingkat_kelas,konteks.mapel_kode)}>CP & TP</Link><span>/</span><strong>Kelola TP Sekolah/Guru</strong></nav><header className="kop-kurikulum"><div><p className="label-data">Satu-satunya TP yang dapat diedit</p><h1>Kelola TP Sekolah/Guru</h1><p>Kelas {konteks.tingkat_kelas} · {konteks.mapel_kode}</p></div></header><div className="tata-kelola-tp"><section><h2>Elemen dan TP</h2><select value={elemenId} onChange={(e)=>setElemenId(e.target.value)}>{detail?.elemen.filter((item)=>item.status==='aktif').map((item)=><option key={item.id} value={item.id}>{item.nama}</option>)}</select><div className="tp-terkunci"><h3>TP Rekomendasi · hanya-baca</h3>{elemen?.tpRekomendasi.map((item)=><article key={item.id}><code>{item.kode_tampil}</code><p>{item.teks_tujuan}</p><span>🔒 tidak dapat diedit</span></article>)}</div><div className="tp-sekolah-edit"><h3>TP Sekolah/Guru</h3>{elemen?.tpSekolah.length?elemen.tpSekolah.map((item)=><article key={item.id}><code>{item.kode_tampil}</code><p>{item.teks_tujuan}</p><button type="button" onClick={()=>void arsip(item.id)}>Arsipkan</button></article>):<p>Belum ada TP Sekolah/Guru pada elemen ini.</p>}</div></section><section className="form-tp-sekolah"><span className="badge-sekolah">Sekolah · dapat diedit</span><h2>Tambah TP</h2><label>Kode tampil<input value={kode} onChange={(e)=>setKode(e.target.value)} maxLength={20}/><small>Awalan S- wajib.</small></label><label>Kalimat tujuan pembelajaran<textarea value={teks} onChange={(e)=>setTeks(e.target.value)} maxLength={300}/><small>{teks.length}/300 karakter</small></label><label>Semester<select value={semester} onChange={(e)=>setSemester(e.target.value==='1'?1:e.target.value==='2'?2:'keduanya')}><option value="1">1</option><option value="2">2</option><option value="keduanya">Keduanya</option></select></label>{pesan?<p className="pelengkap-pesan">{pesan}</p>:null}<button className="tombol-guru tombol-guru--utama" type="button" onClick={()=>void simpan()}>Simpan TP</button></section></div></main>;
}
