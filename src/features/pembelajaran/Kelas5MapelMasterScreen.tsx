import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BAB_MASTER_KELAS5, BUKU_MASTER_KELAS5, TOPIK_MASTER_KELAS5 } from '../../lib/referensi/kelas5MasterSeed';
import { LINGKUP_KKA_RUPA_KELAS5 } from '../../lib/referensi/kelas5KkaRupaSupplement';
import { Kelas5GenericInteraktif } from './kelas5GenericInteraktif';
import { Kelas5KkaRupaInteraktif } from './Kelas5KkaRupaInteraktif';
import './kelas5-bab2-content.css';

type Mode='hub'|'game'|'vlab'|'kuis'|'lkpd'|'bank-soal';
type MapelGenerik='MAT'|'PP'|'BI'|'BING';
type MapelKhusus='KKA'|'RUPA';

const LABEL:Record<string,string>={MAT:'Matematika',PP:'Pendidikan Pancasila',BI:'Bahasa Indonesia',BING:'Bahasa Inggris',KKA:'Koding dan Kecerdasan Artifisial',RUPA:'Seni Rupa'};
const IKON:Record<string,string>={MAT:'🔢',PP:'🇮🇩',BI:'📖',BING:'🌏',KKA:'💻',RUPA:'🎨'};
const MAPEL_GENERIK=new Set<MapelGenerik>(['MAT','PP','BI','BING']);
const MODE_VALID=new Set<Mode>(['hub','game','vlab','kuis','lkpd','bank-soal']);

function sumberData(mapel:string,babNo:string){
  const buku=BUKU_MASTER_KELAS5.find(x=>x.mapel_kode===mapel);
  const ekstra=LINGKUP_KKA_RUPA_KELAS5.filter(x=>x.mapel===mapel);
  if(ekstra.length){
    const nomor=decodeURIComponent(babNo).toLowerCase();
    const item=ekstra.find(x=>x.nomor.toLowerCase()===nomor||x.id===babNo);
    return {buku,bab:item?{id:item.id,nomor_tampil:item.nomor,judul_bab:item.judul}:undefined,topik:item?.topik||[],sumber:item?.sumber||''};
  }
  const bab=buku?BAB_MASTER_KELAS5.filter(x=>x.buku_id===buku.id).find(x=>String(x.nomor_tampil).toLowerCase()===babNo.toLowerCase()||String(x.id).endsWith(`-${babNo}`)):undefined;
  return {buku,bab,topik:bab?TOPIK_MASTER_KELAS5.filter(x=>x.bab_id===bab.id).map(x=>x.judul_topik):[],sumber:buku?.judul||''};
}

function Kuis({mapel,topik}:{mapel:string;topik:string[]}){
  const [i,setI]=useState(0);
  const [jawaban,setJawaban]=useState('');
  const [selesai,setSelesai]=useState(0);
  const fokus=topik[i%Math.max(1,topik.length)]||'materi pada bab ini';
  const petunjuk=mapel==='KKA'?'Jelaskan konsep, langkah, atau penerapan yang aman dan logis berdasarkan sumber belajar.':mapel==='RUPA'?'Identifikasi unsur/prinsip rupa lalu jelaskan pilihan visualmu berdasarkan sumber belajar.':mapel==='MAT'?'Tuliskan strategi dan proses, bukan hanya hasil akhir.':mapel==='PP'?'Berikan alasan dan contoh tindakan yang sesuai dengan topik.':mapel==='BI'?'Gunakan bukti/kata kunci dari materi untuk mendukung jawaban.':'Answer with words or a short sentence related to the unit.';
  const kirim=()=>{if(jawaban.trim().length<3)return;setSelesai(x=>x+1);setI(x=>x+1);setJawaban('');};
  return <section className="k5-content-card"><p className="k5-kicker">Kuis {LABEL[mapel]} · Soal {i+1}</p><h2>{fokus}</h2><p>{petunjuk}</p><textarea rows={4} value={jawaban} onChange={e=>setJawaban(e.target.value)} placeholder="Tulis jawaban berdasarkan buku/materi…"/><div className="k5-options"><button disabled={jawaban.trim().length<3} onClick={kirim}>✓ Simpan jawaban & lanjut</button><button onClick={()=>{setI(x=>x+1);setJawaban('')}}>Lewati</button></div><div className="k5-score">Terjawab {selesai} · cek bersama guru/buku referensi</div></section>;
}

function Lkpd({mapel,judul,topik}:{mapel:string;judul:string;topik:string[]}){
  const daftar=topik.length?topik:[judul];
  return <section className="k5-worksheet"><div className="k5-worksheet__banner">{IKON[mapel]} ✨ LKPD {LABEL[mapel]?.toUpperCase()} KELAS V ✨</div><h2>{judul}</h2><p>LKPD mengikuti topik pada buku referensi. Gunakan ruang kerja untuk mencatat proses, contoh, gambar/sketsa, dan kesimpulan.</p><div className="k5-identitas"><span>Nama: ____________________</span><span>Kelompok: __________</span><span>Tanggal: __________</span></div><div className="k5-lkpd-grid">{Array.from({length:5},(_,i)=>{const t=daftar[i%daftar.length]!;return <article key={`${t}-${i}`}><h3>{IKON[mapel]} Aktivitas {i+1}</h3><strong>{t}</strong><p>{mapel==='KKA'?'Pecahkan misi secara runtut, tuliskan langkah/aturan, lalu refleksikan hasilnya.':mapel==='RUPA'?'Buat sketsa/eksperimen visual, tentukan unsur rupa yang dipakai, lalu ceritakan prosesnya.':mapel==='MAT'?'Tuliskan strategi, proses hitung/manipulatif, lalu simpulkan.':mapel==='PP'?'Tuliskan contoh sikap/tindakan, alasan, dan dampaknya.':mapel==='BI'?'Catat kata kunci, gagasan, bukti dari teks, dan contoh kalimatmu.':'Write key words, one useful sentence, and a short meaning/context note.'}</p><p>__________________________________________________</p><p>__________________________________________________</p><p>__________________________________________________</p></article>})}</div><button className="k5-print" onClick={()=>window.print()}>🖨️ Cetak / Simpan PDF</button></section>;
}

function Bank({mapel,judul,topik}:{mapel:string;judul:string;topik:string[]}){
  const fokus=topik.length?topik:[judul];
  const pemahaman=Array.from({length:10},(_,i)=>({topik:fokus[i%fokus.length]!,nomor:i+1}));
  const penerapan=Array.from({length:10},(_,i)=>({topik:fokus[(i+1)%fokus.length]!,nomor:i+11}));
  const analisis=Array.from({length:5},(_,i)=>({topik:fokus[(i+2)%fokus.length]!,nomor:i+21}));
  return <section className="k5-bank"><h2>Bank Soal · {LABEL[mapel]} · {judul}</h2><p>25 soal berbasis topik buku: 10 pemahaman · 10 penerapan · 5 analisis/refleksi. Jawaban diverifikasi menggunakan buku referensi/guru, sehingga aplikasi tidak mengarang kunci jawaban.</p><h3>A. Pemahaman</h3><ol>{pemahaman.map(x=><li key={x.nomor}><b>{x.topik}</b> — Tuliskan hal penting yang kamu pahami dari topik ini berdasarkan materi yang dipelajari.<div>________________________________________</div></li>)}</ol><h3>B. Penerapan</h3><ol start={11}>{penerapan.map(x=><li key={x.nomor}>Berikan contoh, strategi, atau penerapan dari <b>{x.topik}</b> yang sesuai dengan pembelajaran.<div>________________________________________</div></li>)}</ol><h3>C. Analisis / Refleksi</h3><ol start={21}>{analisis.map(x=><li key={x.nomor}>Jelaskan hubungan <b>{x.topik}</b> dengan situasi, karya, teks, atau masalah yang pernah kamu temui. Sertakan alasan.<div>________________________________________</div><div>________________________________________</div></li>)}</ol><button className="k5-print" onClick={()=>window.print()}>🖨️ Cetak / Simpan PDF</button></section>;
}

export function Kelas5MapelMasterScreen(){
  const {mapelKode='',babNo='',mode='hub'}=useParams();
  const mapel=mapelKode.toUpperCase();
  const modeAktif=MODE_VALID.has(mode as Mode)?mode as Mode:'hub';
  const d=useMemo(()=>sumberData(mapel,babNo),[mapel,babNo]);
  const buku=BUKU_MASTER_KELAS5.find(x=>x.mapel_kode===mapel);
  const ekstra=LINGKUP_KKA_RUPA_KELAS5.filter(x=>x.mapel===mapel);
  const list=ekstra.length?ekstra.map(x=>({id:x.id,nomor_tampil:x.nomor,judul_bab:x.judul,topik:x.topik,sumber:x.sumber})):(buku?BAB_MASTER_KELAS5.filter(x=>x.buku_id===buku.id).map(x=>({id:x.id,nomor_tampil:String(x.nomor_tampil),judul_bab:x.judul_bab,topik:TOPIK_MASTER_KELAS5.filter(t=>t.bab_id===x.id).map(t=>t.judul_topik),sumber:buku.judul})):[]);
  if(!buku)return <main className="k5-content"><h1>Referensi mapel belum tersedia</h1></main>;
  if(modeAktif==='hub'||!babNo)return <main className="k5-content"><header className="k5-content__header"><div><small>Kelas V · Referensi Pembelajaran</small><h1>{IKON[mapel]} {LABEL[mapel]}</h1><p>{buku.judul} · {buku.penerbit}</p></div></header><section className="k5-lkpd-grid">{list.map(b=><article key={b.id}><h3>{b.nomor_tampil} · {b.judul_bab}</h3><p>{b.topik.join(' · ')}</p><small>Sumber: {b.sumber}</small><div className="k5-options">{(['game','vlab','kuis','lkpd','bank-soal'] as const).map(m=><Link key={m} className="k5-primary" to={`/kelas5/${mapel}/${encodeURIComponent(b.nomor_tampil)}/${m}`}>{m==='vlab'?'VLAB / Simulasi':m==='bank-soal'?'Bank Soal':m[0]!.toUpperCase()+m.slice(1)}</Link>)}</div></article>)}</section></main>;
  if(!d.bab)return <main className="k5-content"><h1>Materi tidak ditemukan</h1></main>;

  let isi;
  if((mapel==='KKA'||mapel==='RUPA')&&(modeAktif==='game'||modeAktif==='vlab')) isi=<Kelas5KkaRupaInteraktif mapel={mapel as MapelKhusus} topik={d.topik} mode={modeAktif}/>;
  else if(MAPEL_GENERIK.has(mapel as MapelGenerik)&&(modeAktif==='game'||modeAktif==='vlab')) isi=<Kelas5GenericInteraktif mapel={mapel as MapelGenerik} judul={d.bab.judul_bab} topik={d.topik} mode={modeAktif}/>;
  else if(modeAktif==='kuis') isi=<Kuis mapel={mapel} topik={d.topik}/>;
  else if(modeAktif==='lkpd') isi=<Lkpd mapel={mapel} judul={d.bab.judul_bab} topik={d.topik}/>;
  else if(modeAktif==='bank-soal') isi=<Bank mapel={mapel} judul={d.bab.judul_bab} topik={d.topik}/>;
  else isi=<section className="k5-content-card"><h2>Mode pembelajaran tidak tersedia</h2></section>;

  return <main className="k5-content"><header className="k5-content__header"><Link to={`/kelas5/${mapel}`}>←</Link><div><small>{LABEL[mapel]} Kelas V</small><h1>{d.bab.nomor_tampil} · {d.bab.judul_bab}</h1><p>{d.sumber}</p></div></header>{isi}</main>;
}
