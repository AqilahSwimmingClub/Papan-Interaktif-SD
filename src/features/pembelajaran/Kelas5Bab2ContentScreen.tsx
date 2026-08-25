import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RUTE } from '../../routes/paths';
import './kelas5-bab2-content.css';

type Jenis = 'kuis' | 'lkpd' | 'bank-soal';

const TUJUAN_BAB2 = [
  'Menganalisis hubungan antarmakhluk hidup melalui rantai dan jaring-jaring makanan.',
  'Menjelaskan perpindahan energi antarmakhluk hidup dalam ekosistem.',
  'Menjelaskan peran aliran energi dalam menjaga keseimbangan ekosistem.',
] as const;

const KUIS = [
  { t:'Pada rantai padi → belalang → katak → ular, organisme yang berperan sebagai produsen adalah ...', o:['Padi','Belalang','Katak','Ular'], a:0 },
  { t:'Jika jumlah katak turun drastis, perubahan yang paling mungkin terjadi lebih dulu adalah ...', o:['Belalang meningkat','Padi meningkat cepat','Ular menjadi produsen','Matahari berkurang'], a:0 },
  { t:'Jaring-jaring makanan berbeda dari satu rantai makanan karena ...', o:['memuat beberapa hubungan makan yang saling terhubung','hanya memiliki satu produsen','tidak memiliki konsumen','tidak menunjukkan aliran energi'], a:0 },
  { t:'Pengurai penting bagi ekosistem karena ...', o:['mengembalikan unsur hara dari sisa makhluk hidup','membuat energi matahari','menghilangkan semua predator','menggantikan produsen'], a:0 },
  { t:'Tindakan yang paling mendukung keseimbangan ekosistem adalah ...', o:['menjaga habitat dan keanekaragaman organisme','menghilangkan satu jenis predator','membuang limbah ke sungai','mengurangi semua tumbuhan'], a:0 },
];

const PG = [
  ['Organisme yang membuat makanan sendiri disebut ...',['produsen','konsumen','predator','pengurai'],'produsen'],
  ['Urutan padi → belalang → katak menunjukkan ...',['rantai makanan','siklus air','perubahan wujud','daur batuan'],'rantai makanan'],
  ['Energi awal yang dimanfaatkan produsen berasal terutama dari ...',['Matahari','tanah','predator','pengurai'],'Matahari'],
  ['Kumpulan beberapa rantai makanan yang saling terhubung disebut ...',['jaring-jaring makanan','habitat tunggal','populasi','komunitas air'],'jaring-jaring makanan'],
  ['Jika produsen berkurang tajam, konsumen kemungkinan ...',['kekurangan sumber energi','bertambah tanpa batas','berubah menjadi produsen','tidak terpengaruh'],'kekurangan sumber energi'],
  ['Contoh pengurai adalah ...',['jamur','elang','katak','belalang'],'jamur'],
  ['Predator puncak pada contoh padi-belalang-katak-ular-elang adalah ...',['elang','padi','belalang','katak'],'elang'],
  ['Hubungan makan dan dimakan menunjukkan adanya perpindahan ...',['energi','warna','ukuran','tempat'],'energi'],
  ['Ekosistem lebih stabil ketika ...',['komponennya saling mendukung dan populasi relatif seimbang','semua predator dihilangkan','hanya ada satu spesies','pengurai tidak ada'],'komponennya saling mendukung dan populasi relatif seimbang'],
  ['Upaya menjaga ekosistem yang tepat adalah ...',['melindungi habitat','membuang limbah','membakar vegetasi','memburu semua predator'],'melindungi habitat'],
] as const;

const JODOH = [
  ['Produsen','membuat makanan sendiri'],['Konsumen I','memakan produsen'],['Konsumen II','memakan konsumen I'],['Predator','memburu organisme lain'],['Pengurai','menguraikan sisa makhluk hidup'],['Rantai makanan','jalur makan dan dimakan'],['Jaring-jaring makanan','gabungan beberapa rantai makanan'],['Matahari','sumber energi awal'],['Habitat','tempat hidup organisme'],['Keseimbangan ekosistem','kondisi hubungan komponen relatif stabil'],
] as const;

const ESAI = [
  'Jelaskan hubungan antara padi, belalang, katak, ular, dan elang dalam satu rantai makanan.',
  'Apa yang mungkin terjadi pada populasi belalang dan padi jika jumlah katak menurun? Jelaskan alasanmu.',
  'Jelaskan mengapa pengurai dibutuhkan dalam ekosistem.',
  'Buat satu contoh jaring-jaring makanan sederhana yang terdiri atas minimal lima organisme.',
  'Tuliskan dua tindakan manusia yang dapat membantu menjaga keseimbangan ekosistem di sekitar sekolah.',
] as const;

function KuisLangsung(){
  const [i,setI]=useState(0); const [skor,setSkor]=useState(0); const [jawab,setJawab]=useState<number|null>(null); const selesai=i>=KUIS.length;
  if(selesai)return <section className="bab2-panel bab2-selesai"><span>🏆</span><h2>Kuis selesai</h2><strong>{skor}/{KUIS.length}</strong><button onClick={()=>{setI(0);setSkor(0);setJawab(null)}}>Ulangi kuis</button></section>;
  const q=KUIS[i];
  function pilih(n:number){if(jawab!==null)return;setJawab(n);if(n===q.a)setSkor(skor+1);}
  return <section className="bab2-panel"><div className="bab2-progress"><span style={{width:`${((i+1)/KUIS.length)*100}%`}} /></div><p className="bab2-kecil">Soal {i+1} dari {KUIS.length}</p><h2>{q.t}</h2><div className="bab2-opsi">{q.o.map((x,n)=><button key={x} className={jawab===n?(n===q.a?'benar':'salah'):''} onClick={()=>pilih(n)}>{String.fromCharCode(65+n)}. {x}</button>)}</div>{jawab!==null?<button className="bab2-next" onClick={()=>{setI(i+1);setJawab(null)}}>Lanjut →</button>:null}</section>;
}

function Lkpd(){return <section className="bab2-lkpd"><div className="bab2-lkpd__hero"><span>🌿</span><div><p>LKPD IPAS KELAS V</p><h2>Petualangan Harmoni Ekosistem</h2></div><span>🐸</span></div><div className="bab2-identitas"><label>Nama <input /></label><label>Kelompok <input /></label><label>Tanggal <input type="date" /></label></div><div className="bab2-misi hijau"><h3>🎮 Misi 1 · Rantai Energi</h3><p>Mainkan <b>Food Chain Adventure</b>. Setelah berhasil, gambar satu rantai makanan yang kamu temukan.</p><div className="bab2-gambar">☀️ → ______ → ______ → ______ → ______</div></div><div className="bab2-misi biru"><h3>🕸️ Misi 2 · Jaring-Jaring Makanan</h3><p>Mainkan <b>Food Web Builder</b>. Tuliskan minimal tiga hubungan organisme yang terbentuk.</p>{[1,2,3].map(n=><div key={n} className="bab2-garis">{n}. ______________________________________________</div>)}</div><div className="bab2-misi kuning"><h3>🔬 Misi 3 · Apa yang Terjadi Jika...?</h3><p>Di VLAB, hilangkan katak lalu jalankan beberapa hari. Catat perubahan populasi yang kamu lihat.</p><table><thead><tr><th>Yang diamati</th><th>Sebelum</th><th>Sesudah</th></tr></thead><tbody><tr><td>Belalang</td><td></td><td></td></tr><tr><td>Padi</td><td></td><td></td></tr><tr><td>Ular</td><td></td><td></td></tr></tbody></table></div><div className="bab2-misi merah"><h3>🌏 Misi 4 · Penjaga Ekosistem</h3><p>Tuliskan dua tindakan yang bisa dilakukan siswa untuk membantu menjaga ekosistem di sekitar sekolah.</p><div className="bab2-garis">1. ______________________________________________</div><div className="bab2-garis">2. ______________________________________________</div></div><button className="bab2-print" onClick={()=>window.print()}>🖨️ Cetak / Simpan PDF</button></section>}

function BankSoal(){const [kunci,setKunci]=useState(false);return <section className="bab2-bank"><div className="bab2-bank__aksi"><h2>Bank Soal · 25 butir</h2><div><button onClick={()=>setKunci(!kunci)}>{kunci?'Sembunyikan':'Tampilkan'} kunci</button><button onClick={()=>window.print()}>🖨️ Cetak / PDF</button></div></div><h3>A. Pilihan Ganda · 10 soal</h3>{PG.map((q,i)=><article key={i}><b>{i+1}. {q[0]}</b><div>{q[1].map((o,n)=><span key={o}>{String.fromCharCode(65+n)}. {o}</span>)}</div>{kunci?<em>Kunci: {q[2]}</em>:null}</article>)}<h3>B. Menjodohkan · 10 soal</h3><div className="bab2-match"><ol>{JODOH.map((x,i)=><li key={i}>{x[0]}</li>)}</ol><ol type="A">{[...JODOH].reverse().map((x,i)=><li key={i}>{x[1]}</li>)}</ol></div>{kunci?<div className="bab2-key">Kunci pasangan: {JODOH.map((x,i)=>`${i+1}=${x[1]}`).join(' • ')}</div>:null}<h3>C. Esai · 5 soal</h3><ol>{ESAI.map(x=><li key={x}>{x}<div className="bab2-garis"></div><div className="bab2-garis"></div></li>)}</ol></section>}

export function Kelas5Bab2ContentScreen(){const { jenis='' }=useParams(); const j=jenis as Jenis; const judul=j==='kuis'?'Kuis Langsung':j==='lkpd'?'LKPD':'Bank Soal';return <main className="bab2-page"><header className="bab2-head"><Link to={RUTE.dasbor}>←</Link><div><small>IPAS Kelas V · Buku Referensi · Bab 2</small><h1>{judul} · Harmoni dalam Ekosistem</h1><p>Konten percontohan dibangun dari lingkup Bab 2 dan tiga tujuan pembelajaran buku.</p></div></header><section className="bab2-tujuan"><h2>Tujuan pembelajaran</h2>{TUJUAN_BAB2.map((x,i)=><span key={x}>{i+1}. {x}</span>)}</section>{j==='kuis'?<KuisLangsung/>:j==='lkpd'?<Lkpd/>:<BankSoal/>}</main>}
