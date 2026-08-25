import { useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RUTE } from '../../routes/paths';
import './game.css';

export const GAME_KELAS5_IPAS_BAB3 = [
  { kode:'magnet-sort', judul:'Magnet Sort', ikon:'🧲', topik:'Apa dan Untuk Apa Magnet Diciptakan?', tujuan:'Mengelompokkan benda berdasarkan responsnya terhadap magnet.', mekanik:'Sortir cepat' },
  { kode:'pole-duel', judul:'Pole Duel', ikon:'🧭', topik:'Apa dan Untuk Apa Magnet Diciptakan?', tujuan:'Menentukan tarik atau tolak berdasarkan kutub magnet yang berhadapan.', mekanik:'Prediksi kutub' },
  { kode:'circuit-builder', judul:'Circuit Builder', ikon:'💡', topik:'Bagaimana Cara Mendapatkan Energi Listrik?', tujuan:'Menyusun komponen rangkaian sederhana agar lampu menyala.', mekanik:'Bangun rangkaian' },
  { kode:'energy-source-rush', judul:'Energy Source Rush', ikon:'⚡', topik:'Bagaimana Cara Mendapatkan Energi Listrik?', tujuan:'Mencocokkan sumber energi dengan cara pemanfaatannya menjadi listrik.', mekanik:'Matching sumber' },
  { kode:'tech-mission', judul:'Technology Mission', ikon:'🤖', topik:'Teknologi untuk Kehidupan', tujuan:'Memilih teknologi yang paling sesuai untuk menyelesaikan masalah sehari-hari.', mekanik:'Misi keputusan' },
] as const;

type Kode = typeof GAME_KELAS5_IPAS_BAB3[number]['kode'];

function MagnetSort(){ const items=[['📎 Klip kertas',true],['🪵 Kayu',false],['🔩 Baut besi',true],['🧴 Plastik',false],['🪙 Besi',true]] as const; const [i,setI]=useState(0); const [skor,setSkor]=useState(0); const x=items[Math.min(i,items.length-1)]; return <section className="game5-arena"><h2>Apakah benda ini tertarik magnet?</h2>{i<items.length?<><div className="game5-target">{x[0]}</div><div className="game5-choice"><button onClick={()=>{if(x[1])setSkor(skor+100);setI(i+1)}}>🧲 Tertarik</button><button onClick={()=>{if(!x[1])setSkor(skor+100);setI(i+1)}}>✋ Tidak tertarik</button></div></>:<p className="game5-feedback">🏆 Selesai! Skor {skor}/{items.length*100}</p>}</section>; }

function PoleDuel(){ const ronde=[['N','N','Tolak'],['N','S','Tarik'],['S','S','Tolak'],['S','N','Tarik']] as const; const [i,setI]=useState(0); const [skor,setSkor]=useState(0); const r=ronde[Math.min(i,ronde.length-1)]; return <section className="game5-arena"><h2>Pole Duel</h2>{i<ronde.length?<><div className="game5-world">🧲 {r[0]} &nbsp;&nbsp; ⇄ &nbsp;&nbsp; {r[1]} 🧲</div><div className="game5-choice"><button onClick={()=>{if(r[2]==='Tarik')setSkor(skor+100);setI(i+1)}}>Tarik</button><button onClick={()=>{if(r[2]==='Tolak')setSkor(skor+100);setI(i+1)}}>Tolak</button></div></>:<p className="game5-feedback">🏆 Duel selesai. Skor {skor}/{ronde.length*100}</p>}</section>; }

function CircuitBuilder(){ const urutan=['🔋 Baterai','〰️ Kabel','💡 Lampu','🔘 Saklar tertutup']; const [n,setN]=useState(0); const opsi=['💡 Lampu','🔘 Saklar tertutup','🔋 Baterai','〰️ Kabel']; return <section className="game5-arena"><h2>Bangun rangkaian agar lampu menyala</h2><div className="game5-chain">{urutan.map((x,i)=><span key={x} className={i<n?'aktif':''}>{i<n?x:'❔'}</span>)}</div><div className="game5-choice game5-choice--text">{opsi.map(x=><button key={x} disabled={urutan.indexOf(x)<n} onClick={()=>{if(x===urutan[n])setN(n+1)}}>{x}</button>)}</div><p className="game5-feedback">{n===urutan.length?'💡 Lampu menyala! Rangkaian tertutup memberi jalur bagi arus listrik.':'Pilih komponen berikutnya.'}</p></section>; }

function EnergySourceRush(){ const ronde=[{q:'Panel surya',a:'☀️ Cahaya Matahari',opsi:['☀️ Cahaya Matahari','🌬️ Angin','💧 Aliran air']},{q:'Turbin angin',a:'🌬️ Angin',opsi:['🔥 Panas','🌬️ Angin','🌱 Tumbuhan']},{q:'PLTA',a:'💧 Aliran air',opsi:['💧 Aliran air','🪨 Batu','🌕 Cahaya bulan']}]; const [i,setI]=useState(0); const [skor,setSkor]=useState(0); const r=ronde[Math.min(i,ronde.length-1)]; return <section className="game5-arena"><h2>Energy Source Rush</h2>{i<ronde.length?<><div className="game5-target">{r.q}</div><div className="game5-choice game5-choice--text">{r.opsi.map(o=><button key={o} onClick={()=>{if(o===r.a)setSkor(skor+100);setI(i+1)}}>{o}</button>)}</div></>:<p className="game5-feedback">⚡ Selesai! Skor {skor}/{ronde.length*100}</p>}</section>; }

function TechnologyMission(){ const misi=useMemo(()=>[
  {q:'Sekolah ingin menyalakan lampu halaman dengan memanfaatkan cahaya matahari.',a:'Panel surya',opsi:['Panel surya','Kipas tangan','Cermin biasa']},
  {q:'Petani perlu memindahkan air ke lahan lebih tinggi.',a:'Pompa air',opsi:['Pompa air','Kompas','Kaca pembesar']},
  {q:'Keluarga ingin menyimpan makanan lebih lama dalam suhu dingin.',a:'Kulkas',opsi:['Kulkas','Bel sekolah','Senter']},
],[]); const [i,setI]=useState(0); const [skor,setSkor]=useState(0); const x=misi[Math.min(i,misi.length-1)]; return <section className="game5-arena"><h2>Technology Mission</h2>{i<misi.length?<><div className="game5-target">{x.q}</div><div className="game5-choice game5-choice--text">{x.opsi.map(o=><button key={o} onClick={()=>{if(o===x.a)setSkor(skor+100);setI(i+1)}}>{o}</button>)}</div></>:<p className="game5-feedback">🏆 Semua misi selesai. Skor {skor}/{misi.length*100}</p>}</section>; }

export function GameKelas5Bab3Screen(){ const { gameKode }=useParams(); const p=GAME_KELAS5_IPAS_BAB3.find(x=>x.kode===gameKode); if(!p)return <main className="game5-runner"><Link to={RUTE.game}>← Kembali</Link><h1>Game tidak ditemukan</h1></main>; const isi:Record<Kode,ReactNode>={'magnet-sort':<MagnetSort/>,'pole-duel':<PoleDuel/>,'circuit-builder':<CircuitBuilder/>,'energy-source-rush':<EnergySourceRush/>,'tech-mission':<TechnologyMission/>}; return <main className="game5-runner"><header className="game5-header"><Link to={RUTE.game}>←</Link><div><small>IPAS Kelas V · Bab 3 · {p.topik}</small><h1>{p.ikon} {p.judul}</h1><p>{p.tujuan}</p></div></header>{isi[p.kode]}</main>; }
