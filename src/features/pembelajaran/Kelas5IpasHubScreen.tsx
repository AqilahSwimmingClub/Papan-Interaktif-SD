import { Link, useLocation } from 'react-router-dom';
import './kelas5-bab2-content.css';

type Jenis = 'kuis' | 'lkpd' | 'bank-soal';

const BAB = [
  { nomor:1, ikon:'🔦', judul:'Melihat karena Cahaya, Mendengar karena Bunyi', ringkas:'Cahaya dan sifatnya · melihat karena cahaya · bunyi dan sifatnya · mendengar karena bunyi.' },
  { nomor:2, ikon:'🌿', judul:'Harmoni dalam Ekosistem', ringkas:'Memakan dan dimakan · transfer energi antarmakhluk hidup · ekosistem yang harmonis.' },
  { nomor:3, ikon:'🧲', judul:'Magnet, Listrik, dan Teknologi untuk Kehidupan', ringkas:'Magnet · energi listrik · rangkaian sederhana · pemanfaatan teknologi.' },
] as const;

export function Kelas5IpasHubScreen(){
  const path=useLocation().pathname;
  const jenis:Jenis=path.includes('bank-soal')?'bank-soal':path.includes('lkpd')?'lkpd':'kuis';
  const label=jenis==='kuis'?'Kuis Langsung':jenis==='lkpd'?'LKPD':'Bank Soal';
  return <main className="k5-content"><header className="k5-content__header"><div><small>IPAS Kelas V · Buku Referensi</small><h1>{label}</h1><p>Pilih bab yang sedang diajarkan. Guru Kelas V tidak perlu memilih kelas lagi.</p></div></header><section className="k5-lkpd-grid">{BAB.map(b=><article key={b.nomor}><h3>{b.ikon} Bab {b.nomor}</h3><h2>{b.judul}</h2><p>{b.ringkas}</p><Link className="k5-primary" to={`/pembelajaran/${jenis}/kelas5-ipas-bab${b.nomor}`}>Buka {label} Bab {b.nomor} →</Link></article>)}</section></main>;
}
