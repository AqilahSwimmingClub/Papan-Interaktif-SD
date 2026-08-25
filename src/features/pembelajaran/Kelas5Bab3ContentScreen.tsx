import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RUTE } from '../../routes/paths';
import './kelas5-bab2-content.css';

type Jenis = 'kuis' | 'lkpd' | 'bank-soal';

const FOKUS = [
  'Mengenali sifat magnet dan kegunaannya melalui pengamatan sederhana.',
  'Menjelaskan rangkaian listrik sederhana serta beberapa sumber energi listrik.',
  'Menghubungkan pemanfaatan listrik dan teknologi dengan kebutuhan kehidupan sehari-hari.',
] as const;

const KUIS=[
 {q:'Jika kutub N didekatkan dengan kutub N magnet lain, yang terjadi adalah...',o:['tolak-menolak','tarik-menarik','tidak ada gaya','magnet berubah menjadi listrik'],a:0},
 {q:'Lampu pada rangkaian sederhana menyala ketika...',o:['rangkaian tertutup','kabel diputus','saklar terbuka','baterai dilepas'],a:0},
 {q:'Benda yang paling mungkin tertarik magnet adalah...',o:['klip besi','kayu','karet','plastik'],a:0},
 {q:'Panel surya memanfaatkan energi dari...',o:['cahaya Matahari','bunyi','bayangan','tanah'],a:0},
 {q:'Kipas listrik mengubah energi listrik terutama menjadi...',o:['energi gerak','energi kimia','energi gravitasi','energi magnet permanen'],a:0},
];
const PG=[
 'Kutub magnet yang berbeda jika didekatkan akan...','Contoh benda yang dapat tertarik magnet adalah...','Magnet digunakan pada kompas karena...','Komponen yang menyediakan energi pada rangkaian sederhana adalah...','Agar lampu menyala, rangkaian harus...','Bahan yang dapat menghantarkan listrik pada model sederhana disebut...','Panel surya mengubah energi cahaya menjadi...','Turbin angin memanfaatkan energi dari...','Contoh alat yang mengubah listrik menjadi gerak adalah...','Pemanfaatan teknologi yang tepat sebaiknya mempertimbangkan...',
];
const JODOH=[['Magnet','menarik bahan tertentu'],['Kutub sama','tolak-menolak'],['Kutub berbeda','tarik-menarik'],['Baterai','sumber energi rangkaian'],['Saklar','membuka atau menutup rangkaian'],['Kabel','jalur penghantar'],['Lampu','listrik menjadi cahaya'],['Kipas','listrik menjadi gerak'],['Panel surya','cahaya menjadi listrik'],['Teknologi','alat atau cara untuk membantu kebutuhan manusia']];
const ESAI=['Jelaskan perbedaan interaksi kutub magnet yang sama dan berbeda.','Gambar dan jelaskan rangkaian sederhana yang dapat menyalakan lampu.','Sebutkan dua sumber energi yang dapat dimanfaatkan untuk menghasilkan listrik.','Jelaskan satu contoh perubahan energi listrik pada alat di rumah atau sekolah.','Berikan satu contoh teknologi yang membantu kehidupan sehari-hari dan jelaskan manfaatnya.'];

function Kuis(){const [i,setI]=useState(0);const [skor,setSkor]=useState(0);const x=KUIS[Math.min(i,KUIS.length-1)];if(i>=KUIS.length)return <section className="k5-content-card"><h2>Kuis selesai</h2><div className="k5-score">{skor}/{KUIS.length*100}</div><button onClick={()=>{setI(0);setSkor(0)}}>Ulangi</button></section>;return <section className="k5-content-card"><p className="k5-kicker">Soal {i+1}/{KUIS.length}</p><h2>{x.q}</h2><div className="k5-options">{x.o.map((o,n)=><button key={o} onClick={()=>{if(n===x.a)setSkor(skor+100);setI(i+1)}}>{String.fromCharCode(65+n)}. {o}</button>)}</div></section>}
function Lkpd(){return <section className="k5-worksheet"><div className="k5-worksheet__banner">🧲 ⚡ LKPD IPAS KELAS V 💡 🤖</div><h2>Bab 3 — Magnet, Listrik, dan Teknologi untuk Kehidupan</h2><div className="k5-identitas"><span>Nama: ____________________</span><span>Kelompok: __________</span><span>Tanggal: __________</span></div><div className="k5-lkpd-grid"><article><h3>🧲 Misi 1 · Uji Magnet</h3><p>Uji beberapa benda aman di kelas dengan magnet guru. Catat hasilnya.</p><table><tbody><tr><th>Benda</th><th>Tertarik / tidak</th></tr><tr><td>__________</td><td>__________</td></tr><tr><td>__________</td><td>__________</td></tr><tr><td>__________</td><td>__________</td></tr></tbody></table></article><article><h3>💡 Misi 2 · Rangkaian</h3><p>Gunakan VLAB Circuit Test. Bandingkan saklar terbuka dan tertutup.</p><p>Saklar terbuka: __________________________</p><p>Saklar tertutup: _________________________</p></article><article><h3>⚡ Misi 3 · Perubahan Energi</h3><p>Pilih tiga alat listrik dan tuliskan perubahan energi yang terjadi.</p><p>1. __________ → __________</p><p>2. __________ → __________</p><p>3. __________ → __________</p></article><article><h3>🤖 Refleksi Teknologi</h3><p>Teknologi apa yang paling membantu kegiatan belajar? Mengapa?</p><p>__________________________________________________</p><p>__________________________________________________</p></article></div><button className="k5-print" onClick={()=>window.print()}>🖨️ Cetak / Simpan PDF</button></section>}
function Bank(){return <section className="k5-bank"><h2>Bank Soal IPAS Kelas V · Bab 3</h2><p>10 pilihan ganda · 10 menjodohkan · 5 esai</p><h3>A. Pilihan Ganda</h3><ol>{PG.map((q,i)=><li key={q}><b>{q}</b><div className="k5-lines">A. __________ &nbsp; B. __________ &nbsp; C. __________ &nbsp; D. __________</div><small>Tingkat: {i<4?'Mudah':i<8?'Sedang':'Sulit'}</small></li>)}</ol><h3>B. Menjodohkan</h3><div className="k5-match">{JODOH.map(([a,b],i)=><div key={a}><b>{i+1}. {a}</b><span>↔</span><span>{b}</span></div>)}</div><h3>C. Esai</h3><ol>{ESAI.map(q=><li key={q}>{q}<div className="k5-answer-lines">____________________________________________________<br/>____________________________________________________</div></li>)}</ol><button className="k5-print" onClick={()=>window.print()}>🖨️ Cetak / Simpan PDF</button></section>}

export function Kelas5Bab3ContentScreen(){const path=useLocation().pathname;const jenis:Jenis=path.includes('bank-soal')?'bank-soal':path.includes('lkpd')?'lkpd':'kuis';return <main className="k5-content"><header className="k5-content__header"><Link to={RUTE.dasbor}>←</Link><div><small>IPAS Kelas V · Buku Referensi · Bab 3</small><h1>{jenis==='kuis'?'⚡ Kuis Langsung':jenis==='lkpd'?'🎨 LKPD Interaktif':'📚 Bank Soal'}</h1><p>Magnet, Listrik, dan Teknologi untuk Kehidupan</p></div></header><aside className="k5-tujuan"><b>Fokus belajar Bab 3</b>{FOKUS.map(x=><span key={x}>• {x}</span>)}</aside>{jenis==='kuis'?<Kuis/>:jenis==='lkpd'?<Lkpd/>:<Bank/>}</main>}
