import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RUTE } from '../../routes/paths';
import './kelas5-bab2-content.css';

type Jenis = 'kuis' | 'lkpd' | 'bank-soal';

const TUJUAN_BAB1 = [
  'Menjelaskan sifat-sifat cahaya melalui pengamatan dan percobaan sederhana.',
  'Menjelaskan hubungan cahaya dengan proses melihat.',
  'Menjelaskan sifat-sifat bunyi melalui pengamatan dan percobaan sederhana.',
  'Menjelaskan hubungan bunyi dengan proses mendengar.',
] as const;

const KUIS = [
  { q:'Ketika tiga lubang pada papan tidak segaris, cahaya dari senter tidak sampai ke layar. Hal ini menunjukkan bahwa cahaya...', opsi:['merambat lurus','selalu berbelok','tidak dapat menembus udara','hanya bergerak ke atas'], a:0 },
  { q:'Kita dapat melihat buku karena cahaya...', opsi:['dipantulkan buku menuju mata','berasal dari mata menuju buku','menghilang saat mengenai buku','berubah menjadi bunyi'], a:0 },
  { q:'Bunyi pada gitar muncul ketika...', opsi:['senarnya bergetar','gitar terkena cahaya','udara berhenti bergerak','senarnya tidak bergerak'], a:0 },
  { q:'Bunyi percakapan sampai ke telinga terutama melalui...', opsi:['udara','bayangan','cahaya','warna'], a:0 },
  { q:'Pada cermin datar, arah cahaya dapat berubah karena...', opsi:['pemantulan','penguraian makanan','penguapan','pengendapan'], a:0 },
];

const PG = [
  'Cahaya dari senter menuju layar melalui tiga papan berlubang. Agar cahaya sampai ke layar, lubang harus...',
  'Benda opak adalah benda yang...',
  'Contoh peristiwa pemantulan cahaya adalah...',
  'Bagian proses melihat yang terjadi setelah benda terkena cahaya adalah...',
  'Sumber bunyi pada drum adalah...',
  'Jika sumber bunyi bergetar lebih kuat, perubahan yang dapat diamati adalah...',
  'Medium yang dapat merambatkan bunyi pada percakapan sehari-hari adalah...',
  'Mengapa kita tidak dapat melihat benda di ruang benar-benar gelap?',
  'Mengapa telinga menerima bunyi dari sumber yang bergetar?',
  'Percobaan paling tepat untuk mengamati cahaya merambat lurus menggunakan...',
];
const JODOH = [
  ['Cermin','Memantulkan cahaya'],['Kaca bening','Meneruskan banyak cahaya'],['Kayu','Menghalangi cahaya'],['Senar gitar','Sumber getaran'],['Udara','Medium perambatan bunyi'],['Mata','Menerima cahaya'],['Telinga','Menerima gelombang bunyi'],['Senter','Sumber cahaya'],['Bayangan','Terbentuk ketika cahaya terhalang'],['Gendang telinga','Bergetar saat menerima bunyi'],
];
const ESAI = [
  'Jelaskan dengan contoh bagaimana kamu membuktikan bahwa cahaya merambat lurus.',
  'Jelaskan mengapa kita dapat melihat sebuah benda ketika ada cahaya.',
  'Jelaskan hubungan getaran dengan bunyi menggunakan satu contoh di sekitar.',
  'Bandingkan perambatan cahaya dan bunyi berdasarkan percobaan yang dapat dilakukan di kelas.',
  'Buat urutan sederhana perjalanan bunyi dari sumber sampai akhirnya kita dapat mendengar.',
];

function Kuis(){ const [i,setI]=useState(0); const [skor,setSkor]=useState(0); const [jawab,setJawab]=useState<number|null>(null); const selesai=i>=KUIS.length; if(selesai)return <section className="k5-content-card"><h2>Hasil Kuis Bab 1</h2><div className="k5-score">{skor}/{KUIS.length*100}</div><button onClick={()=>{setI(0);setSkor(0);setJawab(null)}}>Ulangi kuis</button></section>; const x=KUIS[i]; return <section className="k5-content-card"><p className="k5-kicker">Soal {i+1} dari {KUIS.length}</p><h2>{x.q}</h2><div className="k5-options">{x.opsi.map((o,n)=><button key={o} className={jawab===n?'dipilih':''} onClick={()=>setJawab(n)}>{String.fromCharCode(65+n)}. {o}</button>)}</div><button className="k5-primary" disabled={jawab===null} onClick={()=>{if(jawab===x.a)setSkor(skor+100);setJawab(null);setI(i+1)}}>Jawab & lanjut</button></section> }

function Lkpd(){ return <section className="k5-worksheet"><div className="k5-worksheet__banner">🔦 👁️  LKPD IPAS KELAS V  🔊 👂</div><h2>Bab 1 — Melihat karena Cahaya, Mendengar karena Bunyi</h2><div className="k5-identitas"><span>Nama: ____________________</span><span>Kelompok: __________</span><span>Tanggal: __________</span></div><div className="k5-lkpd-grid"><article><h3>🔦 Aktivitas 1 · Jalur Cahaya</h3><p>Susun tiga kertas berlubang di depan senter. Ubah posisi satu lubang lalu amati layar.</p><table><tbody><tr><th>Kondisi lubang</th><th>Cahaya sampai layar?</th></tr><tr><td>Segaris</td><td>__________</td></tr><tr><td>Tidak segaris</td><td>__________</td></tr></tbody></table><p>Kesimpulan: ____________________________________</p></article><article><h3>🪞 Aktivitas 2 · Pantulan</h3><p>Arahkan cahaya ke cermin dan amati perubahan arah berkas.</p><p>Yang saya amati: ____________________________________</p><p>Kesimpulan: _______________________________________</p></article><article><h3>🔊 Aktivitas 3 · Getaran dan Bunyi</h3><p>Amati karet gelang yang dipetik atau benda lain yang aman untuk menunjukkan getaran.</p><p>Apa yang bergerak? _________________________________</p><p>Apa yang terdengar? ________________________________</p></article><article><h3>👂 Refleksi</h3><p>1. Apa hubungan cahaya dengan melihat?</p><p>__________________________________________________</p><p>2. Apa hubungan getaran dengan bunyi?</p><p>__________________________________________________</p></article></div><button className="k5-print" onClick={()=>window.print()}>🖨️ Cetak / Simpan PDF</button></section> }

function BankSoal(){ return <section className="k5-bank"><h2>Bank Soal IPAS Kelas V · Bab 1</h2><p>10 pilihan ganda · 10 menjodohkan · 5 esai</p><h3>A. Pilihan Ganda</h3><ol>{PG.map((q,i)=><li key={q}><b>{q}</b><div className="k5-lines">A. __________ &nbsp; B. __________ &nbsp; C. __________ &nbsp; D. __________</div><small>Tingkat: {i<4?'Mudah':i<8?'Sedang':'Sulit'}</small></li>)}</ol><h3>B. Menjodohkan</h3><div className="k5-match">{JODOH.map(([a,b],i)=><div key={a}><b>{i+1}. {a}</b><span>↔</span><span>{b}</span></div>)}</div><h3>C. Esai</h3><ol>{ESAI.map(q=><li key={q}>{q}<div className="k5-answer-lines">____________________________________________________<br/>____________________________________________________</div></li>)}</ol><button className="k5-print" onClick={()=>window.print()}>🖨️ Cetak / Simpan PDF</button></section> }

export function Kelas5Bab1ContentScreen(){ const path=useLocation().pathname; const jenis:Jenis=path.includes('bank-soal')?'bank-soal':path.includes('lkpd')?'lkpd':'kuis'; return <main className="k5-content"><header className="k5-content__header"><Link to={RUTE.dasbor}>←</Link><div><small>IPAS Kelas V · Buku Referensi · Bab 1</small><h1>{jenis==='kuis'?'⚡ Kuis Langsung':jenis==='lkpd'?'🎨 LKPD Interaktif':'📚 Bank Soal'}</h1><p>Melihat karena Cahaya, Mendengar karena Bunyi</p></div></header><aside className="k5-tujuan"><b>Tujuan pembelajaran Bab 1</b>{TUJUAN_BAB1.map(x=><span key={x}>• {x}</span>)}</aside>{jenis==='kuis'?<Kuis/>:jenis==='lkpd'?<Lkpd/>:<BankSoal/>}</main> }
