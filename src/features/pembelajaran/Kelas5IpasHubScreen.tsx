import { Link, useLocation } from 'react-router-dom';
import './kelas5-bab2-content.css';

type Jenis = 'kuis' | 'lkpd' | 'bank-soal';

export function Kelas5IpasHubScreen(){
  const path=useLocation().pathname;
  const jenis:Jenis=path.includes('bank-soal')?'bank-soal':path.includes('lkpd')?'lkpd':'kuis';
  const label=jenis==='kuis'?'Kuis Langsung':jenis==='lkpd'?'LKPD':'Bank Soal';
  return <main className="k5-content"><header className="k5-content__header"><div><small>IPAS Kelas V · Buku Referensi</small><h1>{label}</h1><p>Pilih bab yang sedang diajarkan. Guru Kelas V tidak perlu memilih kelas lagi.</p></div></header><section className="k5-lkpd-grid"><article><h3>🔦 Bab 1</h3><h2>Melihat karena Cahaya, Mendengar karena Bunyi</h2><p>Cahaya dan sifatnya · melihat karena cahaya · bunyi dan sifatnya · mendengar karena bunyi.</p><Link className="k5-primary" to={`/pembelajaran/${jenis}/kelas5-ipas-bab1`}>Buka {label} Bab 1 →</Link></article><article><h3>🌿 Bab 2</h3><h2>Harmoni dalam Ekosistem</h2><p>Memakan dan dimakan · transfer energi antarmakhluk hidup · ekosistem yang harmonis.</p><Link className="k5-primary" to={`/pembelajaran/${jenis}/kelas5-ipas-bab2`}>Buka {label} Bab 2 →</Link></article></section></main>;
}
