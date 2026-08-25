import { Link, useParams } from 'react-router-dom';
import { BAB_MASTER_KELAS1, BUKU_MASTER_KELAS1, TOPIK_MASTER_KELAS1 } from '../../lib/referensi/kelas1MasterSeed';
import './kelas5-bab2-content.css';

const LABEL: Record<string,string> = {
  PAI:'Pendidikan Agama Islam', PAK:'Pendidikan Agama Kristen', PAKAT:'Pendidikan Agama Katolik',
  PAH:'Pendidikan Agama Hindu', PAB:'Pendidikan Agama Buddha', PAKH:'Pendidikan Agama Khonghucu',
  PP:'Pendidikan Pancasila', BI:'Bahasa Indonesia', MAT:'Matematika', PJOK:'PJOK', RUPA:'Seni Rupa',
};
const IKON: Record<string,string> = { PP:'🇮🇩',BI:'📖',MAT:'🔢',PJOK:'🏃',RUPA:'🎨' };

export function Kelas1MapelMasterScreen(){
  const {mapelKode=''}=useParams();
  const kode=mapelKode.toUpperCase();
  const buku=BUKU_MASTER_KELAS1.find(x=>x.mapel_kode.toUpperCase()===kode);
  if(!buku)return <main className="k5-content"><h1>Referensi Kelas 1 belum tersedia</h1></main>;
  const bab=BAB_MASTER_KELAS1.filter(x=>x.buku_id===buku.id);
  return <main className="k5-content">
    <header className="k5-content__header"><div><small>Kelas I · Fase A · visual, teks sedikit, satu langkah</small><h1>{IKON[kode]||'📘'} {LABEL[kode]||buku.mapel_kode}</h1><p>{buku.judul} · {buku.penerbit}</p></div></header>
    {bab.length?<section className="k5-lkpd-grid">{bab.map(item=>{const topik=TOPIK_MASTER_KELAS1.filter(t=>t.bab_id===item.id);return <article key={item.id}><h3>Bab {item.nomor_tampil} · {item.judul_bab}</h3><p>{topik.map(t=>t.judul_topik).join(' · ')}</p><Link className="k5-primary" to={`/kelas/1/mapel/${encodeURIComponent(buku.mapel_kode)}`}>Lihat struktur buku</Link></article>})}</section>:<section className="k5-content-card"><h2>Buku resmi sudah terdaftar</h2><p>Bab dan topik belum ditampilkan sampai sumber rinci buku selesai diverifikasi.</p></section>}
  </main>;
}
