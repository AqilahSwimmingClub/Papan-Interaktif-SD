import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RUTE } from '../../routes/paths';
import './game.css';

type GameKode = 'food-chain' | 'food-web' | 'eco-maze' | 'energy-runner' | 'eco-rescue';

export interface GameKelas5Profil {
  kode: GameKode;
  judul: string;
  bab: string;
  topik: string;
  ikon: string;
  tujuan: string;
  mekanik: string;
}

export const GAME_KELAS5_IPAS_BAB2: readonly GameKelas5Profil[] = [
  { kode:'food-chain', judul:'Food Chain Adventure', bab:'Bab 2 · Harmoni dalam Ekosistem', topik:'Memakan dan Dimakan', ikon:'🌾', tujuan:'Menyusun aliran energi dari sumber energi hingga predator.', mekanik:'Urutan sentuh' },
  { kode:'food-web', judul:'Food Web Builder', bab:'Bab 2 · Harmoni dalam Ekosistem', topik:'Transfer Energi Antarmakhluk Hidup', ikon:'🕸️', tujuan:'Membangun beberapa hubungan makan menjadi jaring-jaring makanan.', mekanik:'Hubungkan organisme' },
  { kode:'eco-maze', judul:'Eco Maze', bab:'Bab 2 · Harmoni dalam Ekosistem', topik:'Memakan dan Dimakan', ikon:'🐸', tujuan:'Menentukan jalur organisme menuju sumber makanan melalui habitat.', mekanik:'Maze / navigasi' },
  { kode:'energy-runner', judul:'Energy Runner', bab:'Bab 2 · Harmoni dalam Ekosistem', topik:'Transfer Energi Antarmakhluk Hidup', ikon:'⚡', tujuan:'Meneruskan aliran energi ke tingkat trofik berikutnya dengan combo.', mekanik:'Kecepatan & combo' },
  { kode:'eco-rescue', judul:'Eco Rescue', bab:'Bab 2 · Harmoni dalam Ekosistem', topik:'Ekosistem yang Harmonis', ikon:'🌍', tujuan:'Memulihkan keseimbangan ekosistem melalui keputusan berbasis hubungan populasi.', mekanik:'Simulasi keputusan' },
] as const;

const RANTAI_ENERGI = ['☀️ Matahari','🌾 Padi','🦗 Belalang','🐸 Katak','🐍 Ular','🦅 Elang'] as const;
const PILIHAN_RANTAI = ['🐍 Ular','🌾 Padi','☀️ Matahari','🦅 Elang','🐸 Katak','🦗 Belalang'] as const;
const ENERGY_RUNNER_CHAIN = ['🌾','🦗','🐸','🐍','🦅'] as const;

function FoodChainAdventure() {
  const [langkah,setLangkah] = useState(0);
  const [pesan,setPesan] = useState('Mulai dari sumber energi.');
  function pilih(item:string){
    if(item===RANTAI_ENERGI[langkah]){ const baru=langkah+1; setLangkah(baru); setPesan(baru===RANTAI_ENERGI.length?'🏆 Rantai energi lengkap!':'✅ Benar, lanjutkan aliran energi.'); }
    else setPesan('❌ Belum tepat. Pikirkan siapa memperoleh energi berikutnya.');
  }
  return <section className="game5-arena"><h2>Susun rantai energi</h2><div className="game5-chain">{RANTAI_ENERGI.map((x,i)=><span key={x} className={i<langkah?'aktif':''}>{i<langkah?x:'❔'}</span>)}</div><div className="game5-choice">{PILIHAN_RANTAI.map(x=><button key={x} disabled={RANTAI_ENERGI.indexOf(x)<langkah} onClick={()=>pilih(x)}>{x}</button>)}</div><p className="game5-feedback">{pesan}</p><strong>Skor {langkah*100}</strong></section>;
}

function FoodWebBuilder(){
  const organisme=['🌾 Padi','🦗 Belalang','🐸 Katak','🐍 Ular','🦅 Elang','🍄 Pengurai'];
  const valid=new Set(['🌾 Padi>🦗 Belalang','🦗 Belalang>🐸 Katak','🐸 Katak>🐍 Ular','🐍 Ular>🦅 Elang','🦅 Elang>🍄 Pengurai','🌾 Padi>🍄 Pengurai']);
  const [awal,setAwal]=useState(''); const [benar,setBenar]=useState<string[]>([]); const [pesan,setPesan]=useState('Pilih sumber energi lalu penerimanya.');
  function pilih(x:string){ if(!awal){setAwal(x);setPesan('Sekarang pilih organisme penerima energi.');return;} const k=`${awal}>${x}`; setAwal(''); if(valid.has(k)){if(!benar.includes(k))setBenar([...benar,k]);setPesan('✅ Hubungan benar ditambahkan.');}else setPesan('❌ Hubungan itu belum tepat.'); }
  return <section className="game5-arena"><h2>Bangun 5 hubungan jaring makanan</h2><div className="game5-choice">{organisme.map(x=><button key={x} className={awal===x?'dipilih':''} onClick={()=>pilih(x)}>{x}</button>)}</div><div className="game5-links">{benar.map(x=><span key={x}>{x.replace('>',' → ')}</span>)}</div><p className="game5-feedback">{benar.length>=5?'🏆 Jaring makanan berhasil dibangun!':pesan}</p><strong>{benar.length}/5 hubungan</strong></section>;
}

function EcoMaze(){
  const batu=new Set(['3,1','2,1','1,3','3,3']); const [pos,setPos]=useState<[number,number]>([4,0]); const [pesan,setPesan]=useState('Bantu katak mencapai belalang.');
  function gerak(dr:number,dc:number){const nr=pos[0]+dr,nc=pos[1]+dc;if(nr<0||nr>4||nc<0||nc>4||batu.has(`${nr},${nc}`)){setPesan('🪨 Jalan terhalang.');return;}setPos([nr,nc]);setPesan(nr===0&&nc===4?'🏆 Katak menemukan sumber makanan!':'Terus cari jalur melalui habitat.');}
  return <section className="game5-arena"><h2>Eco Maze</h2><div className="game5-maze">{Array.from({length:25},(_,i)=>{const r=Math.floor(i/5),c=i%5,k=`${r},${c}`;return <span key={k}>{pos[0]===r&&pos[1]===c?'🐸':r===0&&c===4?'🦗':batu.has(k)?'🪨':'🌿'}</span>})}</div><div className="game5-pad"><button onClick={()=>gerak(-1,0)}>⬆</button><div><button onClick={()=>gerak(0,-1)}>⬅</button><button onClick={()=>gerak(1,0)}>⬇</button><button onClick={()=>gerak(0,1)}>➡</button></div></div><p className="game5-feedback">{pesan}</p></section>;
}

function EnergyRunner(){
  const [i,setI]=useState(0); const [combo,setCombo]=useState(0); const [skor,setSkor]=useState(0); const [pesan,setPesan]=useState('Tangkap tingkat trofik berikutnya.');
  const opsi=useMemo(()=> i>=ENERGY_RUNNER_CHAIN.length?[]:[ENERGY_RUNNER_CHAIN[i],'🍄','💧','🪨'].sort(()=>Math.random()-.5),[i]);
  function pilih(x:string){if(x===ENERGY_RUNNER_CHAIN[i]){const c=combo+1;setCombo(c);setSkor(skor+100+c*20);setI(i+1);setPesan(i+1===ENERGY_RUNNER_CHAIN.length?'🏆 Aliran energi selesai!':'⚡ Combo lanjut!');}else{setCombo(0);setPesan('💥 Combo putus. Cari organisme target.');}}
  return <section className="game5-arena"><h2>Energy Runner</h2><div className="game5-target">Target {i<ENERGY_RUNNER_CHAIN.length?ENERGY_RUNNER_CHAIN[i]:'🏁'}</div><div className="game5-choice">{opsi.map(x=><button key={x} onClick={()=>pilih(x)}>{x}</button>)}</div><p className="game5-feedback">{pesan}</p><div className="game5-hud"><strong>Combo {combo}</strong><strong>Skor {skor}</strong></div></section>;
}

function EcoRescue(){
  const [stabil,setStabil]=useState(35); const [pesan,setPesan]=useState('Katak berkurang, belalang meningkat. Pilih tindakan.');
  function aksi(n:number){if(n===1){setStabil(100);setPesan('🏆 Habitat katak pulih, belalang lebih terkendali, tanaman membaik.');}else{setStabil(Math.max(10,stabil-20));setPesan('⚠️ Ekosistem makin tidak seimbang. Coba tindakan lain.');}}
  return <section className="game5-arena"><h2>Eco Rescue</h2><div className="game5-world">🌾 🌾 🦗 🦗 🦗 🐸 🐍 🦅</div><div className="game5-choice game5-choice--text"><button onClick={()=>aksi(1)}>🛡️ Lindungi habitat katak</button><button onClick={()=>aksi(2)}>🚫 Hilangkan semua elang</button><button onClick={()=>aksi(3)}>🔥 Kurangi tanaman</button><button onClick={()=>aksi(4)}>🗑️ Biarkan habitat tercemar</button></div><div className="game5-meter"><span style={{width:`${stabil}%`}} /></div><p className="game5-feedback">{pesan}</p></section>;
}

export function GameKelas5RunnerScreen(){
  const { gameKode }=useParams(); const profil=GAME_KELAS5_IPAS_BAB2.find(x=>x.kode===gameKode);
  if(!profil) return <main className="game5-runner"><Link to={RUTE.game}>← Kembali</Link><h1>Game tidak ditemukan</h1></main>;
  return <main className="game5-runner"><header className="game5-header"><Link to={RUTE.game}>←</Link><div><small>IPAS Kelas V · {profil.bab}</small><h1>{profil.ikon} {profil.judul}</h1><p>{profil.tujuan}</p></div></header>{profil.kode==='food-chain'?<FoodChainAdventure/>:profil.kode==='food-web'?<FoodWebBuilder/>:profil.kode==='eco-maze'?<EcoMaze/>:profil.kode==='energy-runner'?<EnergyRunner/>:<EcoRescue/>}</main>;
}
