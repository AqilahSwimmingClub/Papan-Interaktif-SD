import { useMemo, useState, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RUTE } from '../../routes/paths';
import './vlab.css';
import './vlab-kelas5.css';

export const VLAB_KELAS5_IPAS_BAB2 = [
  { kode:'energy-flow', nama:'Laboratorium Aliran Energi', ikon:'⚡', topik:'Transfer Energi Antarmakhluk Hidup', tujuan:'Mengamati energi yang tersedia pada setiap tingkat trofik.' },
  { kode:'ecosystem-builder', nama:'Bangun Ekosistemku', ikon:'🏗️', topik:'Ekosistem yang Harmonis', tujuan:'Menguji komponen yang diperlukan agar ekosistem sederhana dapat berjalan.' },
  { kode:'population-shock', nama:'Apa yang Terjadi Jika...?', ikon:'🧪', topik:'Ekosistem yang Harmonis', tujuan:'Mengamati dampak perubahan satu populasi terhadap organisme lain.' },
  { kode:'decomposer-lab', nama:'Laboratorium Pengurai', ikon:'🍄', topik:'Transfer Energi Antarmakhluk Hidup', tujuan:'Mengikuti proses penguraian dan kembalinya unsur hara ke lingkungan.' },
  { kode:'energy-pyramid', nama:'Piramida Energi', ikon:'🔺', topik:'Transfer Energi Antarmakhluk Hidup', tujuan:'Membandingkan energi relatif produsen dan konsumen pada beberapa tingkat.' },
] as const;

type LabKode = typeof VLAB_KELAS5_IPAS_BAB2[number]['kode'];

function EnergyFlow(){
  const [awal,setAwal]=useState(100); const tingkat=[['🌾 Produsen',1],['🦗 Konsumen I',.65],['🐸 Konsumen II',.4],['🐍 Konsumen III',.22],['🦅 Predator',.1]] as const;
  return <div className="vlab5-stage"><label>Energi awal produsen <input type="range" min="50" max="200" value={awal} onChange={e=>setAwal(Number(e.target.value))}/><b>{awal} unit</b></label><div className="vlab5-bars">{tingkat.map(([n,f])=><div key={n}><span>{n}</span><div><i style={{width:`${Math.round(f*100)}%`}} /></div><strong>{Math.round(awal*f)}</strong></div>)}</div><p className="vlab5-observe">Pengamatan: semakin tinggi tingkat trofik, energi yang tersedia pada model semakin sedikit.</p></div>;
}

function EcosystemBuilder(){
  const komponen=['☀️ Matahari','💧 Air','🌾 Produsen','🦗 Herbivor','🐸 Karnivor','🍄 Pengurai'] as const; const [pilih,setPilih]=useState<string[]>([]);
  const stabil=komponen.every(x=>pilih.includes(x)); function toggle(x:string){setPilih(pilih.includes(x)?pilih.filter(y=>y!==x):[...pilih,x]);}
  return <div className="vlab5-stage"><div className="vlab5-components">{komponen.map(x=><button key={x} className={pilih.includes(x)?'aktif':''} onClick={()=>toggle(x)}>{x}</button>)}</div><div className={`vlab5-habitat ${stabil?'hidup':''}`}>{pilih.length?pilih.join('  '):'Pilih komponen untuk mengisi habitat'}</div><p className="vlab5-observe">{stabil?'🏆 Ekosistem memiliki sumber energi, air, produsen, konsumen, dan pengurai.':'🔎 Tambahkan komponen sampai ekosistem memiliki bagian penting yang saling terhubung.'}</p></div>;
}

function PopulationShock(){
  const [gangguan,setGangguan]=useState<'katak'|'padi'|'elang'>('katak'); const [hari,setHari]=useState(0);
  const data=useMemo(()=>{const h=Math.min(hari,5); if(gangguan==='katak') return {padi:Math.max(1,5-h),belalang:2+h,katak:0,ular:Math.max(1,4-Math.floor(h/2)),elang:2}; if(gangguan==='padi')return{padi:Math.max(0,5-h),belalang:Math.max(1,5-h),katak:Math.max(1,4-Math.floor(h/2)),ular:3,elang:2}; return{padi:5,belalang:3,katak:3,ular:2+h,elang:0};},[gangguan,hari]);
  return <div className="vlab5-stage"><div className="vlab5-controls"><button onClick={()=>{setGangguan('katak');setHari(0)}}>Katak hilang</button><button onClick={()=>{setGangguan('padi');setHari(0)}}>Padi berkurang</button><button onClick={()=>{setGangguan('elang');setHari(0)}}>Elang hilang</button><button className="utama" onClick={()=>setHari(Math.min(5,hari+1))}>▶ Hari berikutnya</button></div><div className="vlab5-pop"><span>🌾 ×{data.padi}</span><span>🦗 ×{data.belalang}</span><span>🐸 ×{data.katak}</span><span>🐍 ×{data.ular}</span><span>🦅 ×{data.elang}</span></div><p className="vlab5-observe">Hari {hari}: {gangguan==='katak'?'ketika katak hilang, belalang meningkat dan padi mendapat tekanan lebih besar.':gangguan==='padi'?'ketika produsen berkurang, sumber energi bagi konsumen ikut menurun.':'ketika predator puncak hilang, populasi ular pada model meningkat.'}</p></div>;
}

function DecomposerLab(){
  const [tahap,setTahap]=useState(0); const scene=tahap===0?'🍂 🪵':tahap===1?'🍂 🪵 + 🍄🍄':tahap===2?'🟤 ✨ + 🍄':'🌱 → 🌿 → 🌾';
  return <div className="vlab5-stage"><div className="vlab5-scene">{scene}</div><div className="vlab5-controls"><button disabled={tahap!==0} onClick={()=>setTahap(1)}>1. Tambahkan pengurai</button><button disabled={tahap!==1} onClick={()=>setTahap(2)}>2. Jalankan waktu</button><button disabled={tahap!==2} onClick={()=>setTahap(3)}>3. Tanam bibit</button><button onClick={()=>setTahap(0)}>Reset</button></div><p className="vlab5-observe">{['Sisa organik masih berada di lingkungan.','Pengurai mulai memecah sisa makhluk hidup.','Bahan organik terurai dan unsur hara kembali ke lingkungan.','Tumbuhan baru memanfaatkan unsur hara untuk tumbuh.'][tahap]}</p></div>;
}

function EnergyPyramid(){
  const [energi,setEnergi]=useState(1000); const tingkat=[['🦅 Predator',.1,38],['🐍 Konsumen III',.2,50],['🐸 Konsumen II',.4,64],['🦗 Konsumen I',.65,78],['🌾 Produsen',1,94]] as const;
  return <div className="vlab5-stage"><label>Energi produsen <input type="range" min="500" max="2000" step="100" value={energi} onChange={e=>setEnergi(Number(e.target.value))}/><b>{energi}</b></label><div className="vlab5-pyramid">{tingkat.map(([n,f,w])=><div key={n} style={{width:`${w}%`}}><span>{n}</span><strong>{Math.round(energi*f)} unit</strong></div>)}</div><p className="vlab5-observe">Bandingkan luas tingkat dan angka energi. Produsen menjadi dasar karena menyediakan energi bagi tingkat berikutnya.</p></div>;
}

export function VlabKelas5Bab2Screen(){
  const { labKode }=useParams(); const profil=VLAB_KELAS5_IPAS_BAB2.find(x=>x.kode===labKode);
  if(!profil)return <main className="halaman-vlab"><Link to={RUTE.vlab}>← Kembali</Link><h1>VLAB tidak ditemukan</h1></main>;
  const isi:Record<LabKode,ReactElement>={ 'energy-flow':<EnergyFlow/>, 'ecosystem-builder':<EcosystemBuilder/>, 'population-shock':<PopulationShock/>, 'decomposer-lab':<DecomposerLab/>, 'energy-pyramid':<EnergyPyramid/> };
  return <main className="vlab5-runner"><header><Link to={RUTE.vlab}>←</Link><div><small>IPAS Kelas V · Bab 2 · {profil.topik}</small><h1>{profil.ikon} {profil.nama}</h1><p>{profil.tujuan}</p></div></header>{isi[profil.kode]}</main>;
}
