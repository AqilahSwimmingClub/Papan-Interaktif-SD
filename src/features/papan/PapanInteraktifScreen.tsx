import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { daftarKelompokKelas, daftarSiswaKelas, pastikanKelasKerja, simpanSesiPapan } from '../../lib/storage/kelasRepo';
import type { HalamanPapan, Kelompok, ObjekPapan, Siswa } from '../../lib/types';
import { RUTE, rutePembelajaran } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './papan.css';

type AlatGambar = 'pena' | 'stabilo' | 'penghapus' | 'garis';
const WARNA = ['#15384f','#b14a2c','#0f6b4f','#1b5e8c','#7a3e9d','#f2b230','#ffffff','#111111'];
const ALAT_UTAMA = ['Pena','Stabilo','Penghapus','Warna','Teks','Bentuk','Gambar','Undo / Redo'];
const ALAT_LAIN = ['Garis','Penggaris','Busur derajat','Latar','PDF','Video & audio','Materi','Game','Sorot & zoom','Timer','Stopwatch','Undi nama','Bagi kelompok','Roda putar','Papan skor','Simpan sesi'];

function halamanBaru(indeks: number): HalamanPapan { return { id: `HALAMAN-${Date.now()}-${indeks}`, latar: 'kosong', objek: [] }; }

export function PapanInteraktifScreen() {
  const { akun } = useAuth();
  const { konteks } = useKurikulum();
  const [halaman, setHalaman] = useState<HalamanPapan[]>(() => [1,2,3,4].map(halamanBaru));
  const [indeksAktif, setIndeksAktif] = useState(0);
  const [alat, setAlat] = useState<AlatGambar>('pena');
  const [warna, setWarna] = useState(WARNA[0]!);
  const [tebal, setTebal] = useState(6);
  const [laci, setLaci] = useState(false);
  const [sedangGambar, setSedangGambar] = useState(false);
  const [jalur, setJalur] = useState('');
  const [riwayat, setRiwayat] = useState<Record<string, ObjekPapan[][]>>({});
  const [ulang, setUlang] = useState<Record<string, ObjekPapan[][]>>({});
  const [teks, setTeks] = useState('');
  const [panel, setPanel] = useState('');
  const [sorot, setSorot] = useState(false);
  const [detikTimer, setDetikTimer] = useState(300);
  const [timerJalan, setTimerJalan] = useState(false);
  const [detikStopwatch, setDetikStopwatch] = useState(0);
  const [stopwatchJalan, setStopwatchJalan] = useState(false);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelompok, setKelompok] = useState<Array<Kelompok & { anggota: Siswa[] }>>([]);
  const [pilihanNama, setPilihanNama] = useState('');
  const [skor, setSkor] = useState<Record<string, number>>({});
  const [pesan, setPesan] = useState('');
  const [kelasAktifId, setKelasAktifId] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const inputMediaRef = useRef<HTMLInputElement>(null);
  const aktif = halaman[indeksAktif]!;

  useEffect(() => {
    if (!akun || !konteks.tingkat_kelas) return;
    void pastikanKelasKerja(konteks.tingkat_kelas, akun.id).then(async (kelas) => {
      setKelasAktifId(kelas.id);
      const [daftarSiswa, daftarKelompok] = await Promise.all([daftarSiswaKelas(kelas.id), daftarKelompokKelas(kelas.id)]);
      setSiswa(daftarSiswa); setKelompok(daftarKelompok); setSkor(Object.fromEntries(daftarKelompok.map((item) => [item.id,item.poin_total])));
    });
  }, [akun, konteks.tingkat_kelas]);

  useEffect(() => {
    if (!timerJalan && !stopwatchJalan) return;
    const id = window.setInterval(() => {
      if (timerJalan) setDetikTimer((nilai) => { if (nilai <= 1) { setTimerJalan(false); return 0; } return nilai - 1; });
      if (stopwatchJalan) setDetikStopwatch((nilai) => nilai + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [stopwatchJalan, timerJalan]);

  function koordinat(peristiwa: ReactPointerEvent<SVGSVGElement>) {
    const kotak = svgRef.current?.getBoundingClientRect();
    if (!kotak) return { x: 0, y: 0 };
    return { x: ((peristiwa.clientX-kotak.left)/kotak.width)*1200, y: ((peristiwa.clientY-kotak.top)/kotak.height)*700 };
  }
  function komit(objekBaru: ObjekPapan[]) {
    setRiwayat((lama) => ({ ...lama, [aktif.id]: [...(lama[aktif.id] ?? []), aktif.objek].slice(-50) }));
    setUlang((lama) => ({ ...lama, [aktif.id]: [] }));
    setHalaman((lama) => lama.map((item,index) => index===indeksAktif ? {...item,objek:objekBaru}:item));
  }
  function mulai(peristiwa: ReactPointerEvent<SVGSVGElement>) {
    if (alat === 'penghapus') { komit(aktif.objek.slice(0,-1)); return; }
    const titik=koordinat(peristiwa); setSedangGambar(true); setJalur(`M ${titik.x.toFixed(1)} ${titik.y.toFixed(1)}`); svgRef.current?.setPointerCapture(peristiwa.pointerId);
  }
  function gerak(peristiwa: ReactPointerEvent<SVGSVGElement>) { if (!sedangGambar || alat === 'garis') return; const titik=koordinat(peristiwa); setJalur((lama)=>`${lama} L ${titik.x.toFixed(1)} ${titik.y.toFixed(1)}`); }
  function selesai(peristiwa: ReactPointerEvent<SVGSVGElement>) {
    if (!sedangGambar) return; const titik=koordinat(peristiwa); const data=alat==='garis'?`${jalur} L ${titik.x.toFixed(1)} ${titik.y.toFixed(1)}`:jalur; setSedangGambar(false); setJalur('');
    komit([...aktif.objek,{id:crypto.randomUUID(),jenis:'goresan',data,warna,ukuran:alat==='stabilo'?Math.max(16,tebal*3):tebal}]);
  }
  function undo() { const daftar=riwayat[aktif.id]??[]; const sebelumnya=daftar.at(-1); if (!sebelumnya) return; setUlang((lama)=>({...lama,[aktif.id]:[...(lama[aktif.id]??[]),aktif.objek]})); setRiwayat((lama)=>({...lama,[aktif.id]:daftar.slice(0,-1)})); setHalaman((lama)=>lama.map((item,index)=>index===indeksAktif?{...item,objek:sebelumnya}:item)); }
  function redo() { const daftar=ulang[aktif.id]??[]; const berikut=daftar.at(-1); if(!berikut)return; setRiwayat((lama)=>({...lama,[aktif.id]:[...(lama[aktif.id]??[]),aktif.objek].slice(-50)}));setUlang((lama)=>({...lama,[aktif.id]:daftar.slice(0,-1)}));setHalaman((lama)=>lama.map((item,index)=>index===indeksAktif?{...item,objek:berikut}:item)); }
  function tambahTeks() { if(!teks.trim())return;komit([...aktif.objek,{id:crypto.randomUUID(),jenis:'teks',data:teks.trim(),warna,ukuran:48}]);setTeks('');setPanel(''); }
  function bentuk() { komit([...aktif.objek,{id:crypto.randomUUID(),jenis:'bentuk',data:'M 360 220 H 840 V 480 H 360 Z',warna,ukuran:tebal}]); }
  function pilihAcak() { if(!siswa.length){setPilihanNama('Belum ada siswa');return;} setPilihanNama(siswa[Math.floor(Math.random()*siswa.length)]?.nama??''); }
  async function simpan() { if(!akun||!konteks.tp_id||!kelasAktifId){setPesan('Pilih kelas dan TP sebelum menyimpan sesi.');return;} const sesi=await simpanSesiPapan({tp_id:konteks.tp_id,kelas_id:kelasAktifId,guru_id:akun.id,halaman_papan:halaman,skor_kelompok:Object.entries(skor).map(([kelompok_id,nilai])=>({kelompok_id,skor:nilai}))});setPesan(`Sesi tersimpan offline · kode gabung ${sesi.kode_gabung}`); }
  function alatUtama(label:string){ if(label==='Pena')setAlat('pena');else if(label==='Stabilo')setAlat('stabilo');else if(label==='Penghapus')setAlat('penghapus');else if(label==='Warna')setWarna(WARNA[(WARNA.indexOf(warna)+1)%WARNA.length]!);else if(label==='Teks')setPanel('teks');else if(label==='Bentuk')bentuk();else if(label==='Gambar')inputMediaRef.current?.click();else undo(); }
  function alatLain(label:string){ setPanel(label); if(label==='Garis')setAlat('garis'); if(label==='Latar'){const daftar=['kosong','petak','garis','titik'] as const;setHalaman((lama)=>lama.map((item,index)=>index===indeksAktif?{...item,latar:daftar[(daftar.indexOf(item.latar)+1)%daftar.length]!}:item));} if(label==='Sorot & zoom')setSorot((nilai)=>!nilai); if(label==='Timer')setTimerJalan((nilai)=>!nilai); if(label==='Stopwatch')setStopwatchJalan((nilai)=>!nilai); if(label==='Undi nama'||label==='Roda putar')pilihAcak(); if(label==='Simpan sesi')void simpan(); if(label==='PDF'||label==='Video & audio')inputMediaRef.current?.click(); }
  const formatWaktu=(nilai:number)=>`${String(Math.floor(nilai/60)).padStart(2,'0')}:${String(nilai%60).padStart(2,'0')}`;

  return <main className={`papan-interaktif ${sorot?'papan-interaktif--sorot':''}`} data-testid="papan-interaktif"><section className="papan-hp-pesan"><div><span>□</span><h1>Papan penuh tersedia di tablet, desktop, dan papan interaktif</h1><p>HP mendukung tinjau materi dan anotasi ringan. Lanjutkan pada layar yang lebih besar untuk 24 alat lengkap.</p><Link to={rutePembelajaran('materi')}>Tinjau Materi</Link></div></section><div className="papan-lengkap"><header className="papan-kop"><Link to={RUTE.dasbor}>←</Link><div><strong>Papan Interaktif</strong><span>{konteks.tingkat_kelas?`Kelas ${konteks.tingkat_kelas} · ${konteks.mapel_kode??'Papan kosong'}`:'Papan kosong'}{konteks.tp_id?` · ${konteks.tp_id}`:''}</span></div>{timerJalan||detikTimer!==300?<button type="button" onClick={()=>setTimerJalan((x)=>!x)}>⏲ {formatWaktu(detikTimer)}</button>:null}{stopwatchJalan||detikStopwatch?<button type="button" onClick={()=>setStopwatchJalan((x)=>!x)}>⏱ {formatWaktu(detikStopwatch)}</button>:null}<button type="button" onClick={()=>void document.documentElement.requestFullscreen?.()}>⛶</button></header><nav className="papan-toolbar" aria-label="Delapan alat utama">{ALAT_UTAMA.map((label,index)=><button type="button" key={label} className={(label.toLowerCase().startsWith(alat)||label==='Warna')?'aktif':''} onClick={()=>alatUtama(label)}><span style={label==='Warna'?{background:warna}:undefined}>{['✎','▱','⌫','●','T','◇','▧','↶'][index]}</span><small>{label}</small></button>)}<button type="button" className="alat-lainnya" onClick={()=>setLaci((nilai)=>!nilai)}><span>•••</span><small>Alat lainnya</small></button></nav>{laci?<aside className="laci-alat"><header><h2>Alat lainnya</h2><button type="button" onClick={()=>setLaci(false)}>Tutup</button></header><div>{ALAT_LAIN.map((label)=><button type="button" key={label} onClick={()=>alatLain(label)}>{label}</button>)}</div></aside>:null}<section className="kanvas-papan"><svg ref={svgRef} viewBox="0 0 1200 700" className={`latar-${aktif.latar}`} onPointerDown={mulai} onPointerMove={gerak} onPointerUp={selesai} onPointerCancel={selesai} aria-label="Kanvas papan tulis">{aktif.objek.map((objek)=>objek.jenis==='teks'?<text key={objek.id} x="600" y="350" textAnchor="middle" fill={objek.warna} fontSize={objek.ukuran}>{objek.data}</text>:<path key={objek.id} d={objek.data} fill="none" stroke={objek.warna} strokeWidth={objek.ukuran} strokeLinecap="round" strokeLinejoin="round" opacity={objek.ukuran>=16?.45:1}/>)}{jalur?<path d={jalur} fill="none" stroke={warna} strokeWidth={alat==='stabilo'?Math.max(16,tebal*3):tebal} strokeLinecap="round" opacity={alat==='stabilo'?.45:1}/>:null}</svg>{sorot?<div className="sorot-papan"/>:null}</section><footer className="papan-halaman"><div>{halaman.map((item,index)=><button type="button" key={item.id} className={index===indeksAktif?'aktif':''} onClick={()=>setIndeksAktif(index)}>Halaman {index+1}</button>)}<button type="button" onClick={()=>{setHalaman((lama)=>[...lama,halamanBaru(lama.length+1)]);setIndeksAktif(halaman.length);}}>+ Tambah</button></div><label>Ukuran pena<select value={tebal} onChange={(e)=>setTebal(Number(e.target.value))}>{[2,6,12,24].map((nilai)=><option key={nilai} value={nilai}>{nilai}px</option>)}</select></label><button type="button" onClick={redo}>Redo</button></footer>{panel?<aside className="panel-alat-aktif"><button className="tutup-panel" type="button" onClick={()=>setPanel('')}>×</button><h2>{panel}</h2>{panel==='teks'?<div><input value={teks} onChange={(e)=>setTeks(e.target.value)} placeholder="Teks pada papan"/><button type="button" onClick={tambahTeks}>Tambahkan</button></div>:panel==='Papan skor'?<div className="skor-papan">{kelompok.length?kelompok.map((grup)=><p key={grup.id}><span>{grup.nama}</span><button type="button" onClick={()=>setSkor((lama)=>({...lama,[grup.id]:(lama[grup.id]??0)-10}))}>−</button><strong>{skor[grup.id]??0}</strong><button type="button" onClick={()=>setSkor((lama)=>({...lama,[grup.id]:(lama[grup.id]??0)+10}))}>+</button></p>):<p>Buat kelompok siswa lebih dulu.</p>}</div>:panel==='Materi'?<Link to={rutePembelajaran('materi')}>Buka materi TP aktif</Link>:panel==='Game'?<Link to={rutePembelajaran('game')}>Buka katalog game TP aktif</Link>:panel==='Undi nama'||panel==='Roda putar'?<p className="nama-terpilih">{pilihanNama||'Tekan alat sekali lagi untuk mengundi'}</p>:panel==='Bagi kelompok'?<p>{kelompok.length?`${kelompok.length} kelompok tetap siap dipakai.`:'Kelompok belum dibuat pada Kelas ini.'}</p>:panel==='Timer'?<div><input type="number" min="1" max="60" value={Math.ceil(detikTimer/60)} onChange={(e)=>setDetikTimer(Number(e.target.value)*60)}/><button type="button" onClick={()=>setTimerJalan((x)=>!x)}>{timerJalan?'Jeda':'Mulai'}</button></div>:panel==='Stopwatch'?<div><strong>{formatWaktu(detikStopwatch)}</strong><button type="button" onClick={()=>setStopwatchJalan((x)=>!x)}>{stopwatchJalan?'Jeda':'Mulai'}</button><button type="button" onClick={()=>setDetikStopwatch(0)}>Ulang</button></div>:<p>Alat {panel.toLowerCase()} aktif pada papan. Semua perubahan tetap berada di perangkat ini.</p>}</aside>:null}{pesan?<p className="papan-pesan" role="status">{pesan}</p>:null}<input ref={inputMediaRef} className="sr-only" type="file" accept="image/*,video/*,audio/*,.pdf" onChange={(e)=>{const file=e.target.files?.[0];if(file){setTeks(`[${file.name}]`);setPanel('teks');}e.target.value='';}}/></div></main>;
}
