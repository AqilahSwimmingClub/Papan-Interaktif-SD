import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { daftarKelompokKelas, daftarSiswaKelas, pastikanKelasKerja, simpanSesiPapan } from '../../lib/storage/kelasRepo';
import { simpanMedia } from '../../lib/storage/pelengkapRepo';
import type { HalamanPapan, Kelompok, MediaPembelajaran, ObjekPapan, Siswa } from '../../lib/types';
import { RUTE, rutePembelajaran } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './papan.css';
import './papan-objek.css';

type AlatGambar = 'pena' | 'stabilo' | 'penghapus' | 'garis';
type JenisVisual = 'penggaris' | 'segitiga' | 'busur' | 'media';
interface DataVisual { jenis: JenisVisual; x: number; y: number; lebar: number; tinggi: number; rotasi: number; mediaId?: string; mediaJenis?: MediaPembelajaran['jenis']; nama?: string }
interface SeretVisual { id: string; pointerId: number; mulaiX: number; mulaiY: number; awalX: number; awalY: number; lebar: number; tinggi: number }

const WARNA = ['#15384f','#b14a2c','#0f6b4f','#1b5e8c','#7a3e9d','#f2b230','#ffffff','#111111'];
const ALAT_UTAMA = ['Pena','Stabilo','Penghapus','Warna','Teks','Bentuk','Gambar','Undo / Redo'];
const ALAT_LAIN = ['Garis','Penggaris','Segitiga siku-siku','Busur derajat','Latar','PDF','Video & audio','Materi','Game','Sorot & zoom','Timer','Stopwatch','Undi nama','Bagi kelompok','Roda putar','Papan skor','Simpan sesi'];

function halamanBaru(indeks: number): HalamanPapan { return { id: `HALAMAN-${Date.now()}-${indeks}`, latar: 'kosong', objek: [] }; }
function visual(objek: ObjekPapan): DataVisual | null { try { return JSON.parse(objek.data) as DataVisual; } catch { return null; } }
function jenisMedia(file: File): MediaPembelajaran['jenis'] { if (file.type.startsWith('image/')) return 'gambar'; if (file.type.startsWith('video/')) return 'video'; if (file.type.startsWith('audio/')) return 'audio'; if (file.type === 'application/pdf') return 'pdf'; return 'dokumen'; }

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
  const [objekTerpilih, setObjekTerpilih] = useState('');
  const [urlMedia, setUrlMedia] = useState<Record<string, string>>({});
  const urlMediaRef = useRef<Record<string, string>>({});
  const svgRef = useRef<SVGSVGElement>(null);
  const kanvasRef = useRef<HTMLElement>(null);
  const inputMediaRef = useRef<HTMLInputElement>(null);
  const seretRef = useRef<SeretVisual | null>(null);
  const aktif = halaman[indeksAktif]!;

  useEffect(() => {
    if (!akun || !konteks.tingkat_kelas) return;
    void pastikanKelasKerja(konteks.tingkat_kelas, akun.id).then(async (kelas) => {
      setKelasAktifId(kelas.id);
      const [daftarSiswa, daftarKelompok] = await Promise.all([daftarSiswaKelas(kelas.id), daftarKelompokKelas(kelas.id)]);
      setSiswa(daftarSiswa); setKelompok(daftarKelompok); setSkor(Object.fromEntries(daftarKelompok.map((item) => [item.id,item.poin_total])));
    });
  }, [akun, konteks.tingkat_kelas]);

  useEffect(() => { urlMediaRef.current = urlMedia; }, [urlMedia]);
  useEffect(() => () => {
    if (typeof URL.revokeObjectURL === 'function') {
      Object.values(urlMediaRef.current).forEach((url) => URL.revokeObjectURL(url));
    }
  }, []);
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
  function simpanRiwayat() { setRiwayat((lama) => ({ ...lama, [aktif.id]: [...(lama[aktif.id] ?? []), aktif.objek].slice(-50) })); setUlang((lama) => ({ ...lama, [aktif.id]: [] })); }
  function komit(objekBaru: ObjekPapan[]) { simpanRiwayat(); setHalaman((lama) => lama.map((item,index) => index===indeksAktif ? {...item,objek:objekBaru}:item)); }
  function mulai(peristiwa: ReactPointerEvent<SVGSVGElement>) {
    setObjekTerpilih('');
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
  function tambahVisual(jenis: JenisVisual, tambahan: Partial<DataVisual> = {}) {
    const data: DataVisual = { jenis, x: 600, y: 350, lebar: jenis === 'segitiga' ? 260 : jenis === 'busur' ? 300 : 420, tinggi: jenis === 'segitiga' ? 230 : jenis === 'busur' ? 170 : 90, rotasi: 0, ...tambahan };
    const objek: ObjekPapan = { id: crypto.randomUUID(), jenis: jenis === 'media' ? 'media' : 'alat_ukur', data: JSON.stringify(data), warna: '#efb534', ukuran: 1 };
    komit([...aktif.objek, objek]); setObjekTerpilih(objek.id); setLaci(false); setPanel('');
  }
  function ubahVisual(id: string, pembaruan: Partial<DataVisual>) { setHalaman((lama) => lama.map((item,index) => index===indeksAktif ? {...item,objek:item.objek.map((objek) => { const data=visual(objek); return objek.id===id&&data?{...objek,data:JSON.stringify({...data,...pembaruan})}:objek; })}:item)); }
  function mulaiSeret(peristiwa: ReactPointerEvent<HTMLDivElement>, objek: ObjekPapan) { const data=visual(objek); if(!data)return; peristiwa.stopPropagation();peristiwa.currentTarget.setPointerCapture(peristiwa.pointerId);simpanRiwayat();setObjekTerpilih(objek.id);seretRef.current={id:objek.id,pointerId:peristiwa.pointerId,mulaiX:peristiwa.clientX,mulaiY:peristiwa.clientY,awalX:data.x,awalY:data.y,lebar:data.lebar,tinggi:data.tinggi}; }
  function geser(peristiwa: ReactPointerEvent<HTMLDivElement>) { const seret=seretRef.current;const kotak=kanvasRef.current?.getBoundingClientRect();if(!seret||!kotak||seret.pointerId!==peristiwa.pointerId)return;const xBaru=seret.awalX+((peristiwa.clientX-seret.mulaiX)/kotak.width)*1200;const yBaru=seret.awalY+((peristiwa.clientY-seret.mulaiY)/kotak.height)*700;const batasX=Math.min(600,seret.lebar/2);const batasAtas=Math.min(700-seret.tinggi/2,seret.tinggi/2+150);const batasBawah=Math.max(batasAtas,700-seret.tinggi/2);ubahVisual(seret.id,{x:Math.max(batasX,Math.min(1200-batasX,xBaru)),y:Math.max(batasAtas,Math.min(batasBawah,yBaru))}); }
  function selesaiSeret(peristiwa: ReactPointerEvent<HTMLDivElement>) { if(seretRef.current?.pointerId===peristiwa.pointerId)seretRef.current=null; }
  function pilihAcak() { if(!siswa.length){setPilihanNama('Belum ada siswa');return;} setPilihanNama(siswa[Math.floor(Math.random()*siswa.length)]?.nama??''); }
  async function simpan() { if(!akun||!konteks.tp_id||!kelasAktifId){setPesan('Pilih kelas dan TP sebelum menyimpan sesi.');return;} const sesi=await simpanSesiPapan({tp_id:konteks.tp_id,kelas_id:kelasAktifId,guru_id:akun.id,halaman_papan:halaman,skor_kelompok:Object.entries(skor).map(([kelompok_id,nilai])=>({kelompok_id,skor:nilai}))});setPesan(`Sesi tersimpan offline · kode gabung ${sesi.kode_gabung}`); }
  async function unggahMedia(file: File | undefined) { if(!file||!akun)return;try{const jenis=jenisMedia(file);const tersimpan=await simpanMedia({jenis,nama_berkas:file.name,ukuran_byte:file.size,durasi:null,tersedia_offline:true,diunggah_oleh:akun.id,tp_id:konteks.tp_id,data_berkas:file});const url=typeof URL.createObjectURL==='function'?URL.createObjectURL(file):'';setUrlMedia((lama)=>({...lama,[tersimpan.id]:url}));tambahVisual('media',{mediaId:tersimpan.id,mediaJenis:jenis,nama:file.name,lebar:jenis==='audio'?420:480,tinggi:jenis==='audio'?100:300});setPesan(`${file.name} tampil di papan dan tersimpan offline.`);}catch(galat){setPesan(galat instanceof Error?galat.message:'Media gagal dimuat.');} }
  function alatUtama(label:string){ if(label==='Pena')setAlat('pena');else if(label==='Stabilo')setAlat('stabilo');else if(label==='Penghapus')setAlat('penghapus');else if(label==='Warna')setWarna(WARNA[(WARNA.indexOf(warna)+1)%WARNA.length]!);else if(label==='Teks')setPanel('teks');else if(label==='Bentuk')bentuk();else if(label==='Gambar')inputMediaRef.current?.click();else undo(); }
  function alatLain(label:string){ if(label==='Garis'){setAlat('garis');setLaci(false);return;} if(label==='Penggaris'){tambahVisual('penggaris');return;} if(label==='Segitiga siku-siku'){tambahVisual('segitiga');return;} if(label==='Busur derajat'){tambahVisual('busur');return;} setPanel(label);if(label==='Latar'){const daftar=['kosong','petak','garis','titik'] as const;setHalaman((lama)=>lama.map((item,index)=>index===indeksAktif?{...item,latar:daftar[(daftar.indexOf(item.latar)+1)%daftar.length]!}:item));}if(label==='Sorot & zoom')setSorot((nilai)=>!nilai);if(label==='Timer')setTimerJalan((nilai)=>!nilai);if(label==='Stopwatch')setStopwatchJalan((nilai)=>!nilai);if(label==='Undi nama'||label==='Roda putar')pilihAcak();if(label==='Simpan sesi')void simpan();if(label==='PDF'||label==='Video & audio')inputMediaRef.current?.click(); }
  const formatWaktu=(nilai:number)=>`${String(Math.floor(nilai/60)).padStart(2,'0')}:${String(nilai%60).padStart(2,'0')}`;

  return <main className={`papan-interaktif ${sorot?'papan-interaktif--sorot':''}`} data-testid="papan-interaktif"><section className="papan-hp-pesan"><div><span>□</span><h1>Papan penuh tersedia dalam landscape</h1><p>Putar HP ke landscape untuk membuka kanvas dan semua alat.</p><Link to={rutePembelajaran('materi')}>Tinjau Materi</Link></div></section><div className="papan-lengkap"><header className="papan-kop"><Link to={RUTE.dasbor}>←</Link><div><strong>Papan Interaktif</strong><span>{konteks.tingkat_kelas?`Kelas ${konteks.tingkat_kelas} · ${konteks.mapel_kode??'Papan kosong'}`:'Papan kosong'}{konteks.tp_id?` · ${konteks.tp_id}`:''}</span></div>{timerJalan||detikTimer!==300?<button type="button" onClick={()=>setTimerJalan((x)=>!x)}>⏲ {formatWaktu(detikTimer)}</button>:null}{stopwatchJalan||detikStopwatch?<button type="button" onClick={()=>setStopwatchJalan((x)=>!x)}>⏱ {formatWaktu(detikStopwatch)}</button>:null}<button type="button" onClick={()=>void document.documentElement.requestFullscreen?.()}>⛶</button></header><nav className="papan-toolbar" aria-label="Delapan alat utama">{ALAT_UTAMA.map((label,index)=><button type="button" key={label} className={(label.toLowerCase().startsWith(alat)||label==='Warna')?'aktif':''} onClick={()=>alatUtama(label)}><span style={label==='Warna'?{background:warna}:undefined}>{['✎','▱','⌫','●','T','◇','▧','↶'][index]}</span><small>{label}</small></button>)}<button type="button" className="alat-lainnya" onClick={()=>setLaci((nilai)=>!nilai)}><span>•••</span><small>Alat lainnya</small></button></nav>{laci?<aside className="laci-alat"><header><h2>Alat lainnya</h2><button type="button" onClick={()=>setLaci(false)}>Tutup</button></header><div>{ALAT_LAIN.map((label)=><button type="button" key={label} onClick={()=>alatLain(label)}>{label}</button>)}</div></aside>:null}<section ref={kanvasRef} className="kanvas-papan" onPointerDown={()=>setObjekTerpilih('')}><svg ref={svgRef} viewBox="0 0 1200 700" className={`latar-${aktif.latar}`} onPointerDown={mulai} onPointerMove={gerak} onPointerUp={selesai} onPointerCancel={selesai} aria-label="Kanvas papan tulis">{aktif.objek.map((objek)=>objek.jenis==='teks'?<text key={objek.id} x="600" y="350" textAnchor="middle" fill={objek.warna} fontSize={objek.ukuran}>{objek.data}</text>:objek.jenis==='goresan'||objek.jenis==='bentuk'?<path key={objek.id} d={objek.data} fill="none" stroke={objek.warna} strokeWidth={objek.ukuran} strokeLinecap="round" strokeLinejoin="round" opacity={objek.ukuran>=16?.45:1}/>:null)}{jalur?<path d={jalur} fill="none" stroke={warna} strokeWidth={alat==='stabilo'?Math.max(16,tebal*3):tebal} strokeLinecap="round" opacity={alat==='stabilo'?.45:1}/>:null}</svg><div className="lapisan-objek-papan">{aktif.objek.filter((objek)=>objek.jenis==='alat_ukur'||objek.jenis==='media').map((objek)=>{const data=visual(objek);if(!data)return null;const style={left:`${(data.x/1200)*100}%`,top:`${(data.y/700)*100}%`,width:`${(data.lebar/1200)*100}%`,height:`${(data.tinggi/700)*100}%`,transform:`translate(-50%,-50%) rotate(${data.rotasi}deg)`} as CSSProperties;const url=data.mediaId?urlMedia[data.mediaId]:'';return <div key={objek.id} className={`objek-visual objek-visual--${data.jenis} ${objekTerpilih===objek.id?'terpilih':''}`} style={style} onPointerDown={(e)=>mulaiSeret(e,objek)} onPointerMove={geser} onPointerUp={selesaiSeret} onPointerCancel={selesaiSeret}>{data.jenis==='penggaris'?<div className="bentuk-penggaris"><span>0</span>{Array.from({length:20},(_,i)=><i key={i}/>) }<span>20 cm</span></div>:data.jenis==='segitiga'?<div className="bentuk-segitiga"/>:data.jenis==='busur'?<div className="bentuk-busur"><span>0°</span><b>90°</b><span>180°</span></div>:data.mediaJenis==='gambar'&&url?<img src={url} alt={data.nama??'Gambar papan'}/>:data.mediaJenis==='video'&&url?<video src={url} controls playsInline onPointerDown={(e)=>e.stopPropagation()}/>:data.mediaJenis==='audio'&&url?<audio src={url} controls onPointerDown={(e)=>e.stopPropagation()}/>:data.mediaJenis==='pdf'&&url?<iframe src={`${url}#toolbar=0`} title={data.nama??'PDF papan'} onPointerDown={(e)=>e.stopPropagation()}/>:<span className="media-tidak-tersedia">{data.nama??'Media tidak tersedia'}</span>}{objekTerpilih===objek.id?<div className="kontrol-objek" onPointerDown={(e)=>e.stopPropagation()}><button type="button" onClick={()=>ubahVisual(objek.id,{rotasi:data.rotasi-15})}>↶</button><button type="button" onClick={()=>ubahVisual(objek.id,{rotasi:data.rotasi+15})}>↷</button><button type="button" onClick={()=>ubahVisual(objek.id,{lebar:Math.max(140,data.lebar*.85),tinggi:Math.max(70,data.tinggi*.85)})}>−</button><button type="button" onClick={()=>ubahVisual(objek.id,{lebar:Math.min(900,data.lebar*1.15),tinggi:Math.min(600,data.tinggi*1.15)})}>+</button><button type="button" onClick={()=>ubahVisual(objek.id,{x:600,y:350,rotasi:0})}>Reset</button><button type="button" onClick={()=>komit(aktif.objek.filter((item)=>item.id!==objek.id))}>Hapus</button></div>:null}</div>;})}</div>{sorot?<div className="sorot-papan"/>:null}</section><footer className="papan-halaman"><div>{halaman.map((item,index)=><button type="button" key={item.id} className={index===indeksAktif?'aktif':''} onClick={()=>setIndeksAktif(index)}>Halaman {index+1}</button>)}<button type="button" onClick={()=>{setHalaman((lama)=>[...lama,halamanBaru(lama.length+1)]);setIndeksAktif(halaman.length);}}>+ Tambah</button></div><label>Ukuran pena<select value={tebal} onChange={(e)=>setTebal(Number(e.target.value))}>{[2,6,12,24].map((nilai)=><option key={nilai} value={nilai}>{nilai}px</option>)}</select></label><button type="button" onClick={redo}>Redo</button></footer>{panel?<aside className="panel-alat-aktif"><button className="tutup-panel" type="button" onClick={()=>setPanel('')}>×</button><h2>{panel}</h2>{panel==='teks'?<div><input value={teks} onChange={(e)=>setTeks(e.target.value)} placeholder="Teks pada papan"/><button type="button" onClick={tambahTeks}>Tambahkan</button></div>:panel==='Papan skor'?<div className="skor-papan">{kelompok.length?kelompok.map((grup)=><p key={grup.id}><span>{grup.nama}</span><button type="button" onClick={()=>setSkor((lama)=>({...lama,[grup.id]:(lama[grup.id]??0)-10}))}>−</button><strong>{skor[grup.id]??0}</strong><button type="button" onClick={()=>setSkor((lama)=>({...lama,[grup.id]:(lama[grup.id]??0)+10}))}>+</button></p>):<p>Buat kelompok siswa lebih dulu.</p>}</div>:panel==='Materi'?<Link to={rutePembelajaran('materi')}>Buka materi TP aktif</Link>:panel==='Game'?<Link to={rutePembelajaran('game')}>Buka katalog game TP aktif</Link>:panel==='Undi nama'||panel==='Roda putar'?<p className="nama-terpilih">{pilihanNama||'Tekan alat sekali lagi untuk mengundi'}</p>:panel==='Bagi kelompok'?<p>{kelompok.length?`${kelompok.length} kelompok tetap siap dipakai.`:'Kelompok belum dibuat pada Kelas ini.'}</p>:panel==='Timer'?<div><input type="number" min="1" max="60" value={Math.ceil(detikTimer/60)} onChange={(e)=>setDetikTimer(Number(e.target.value)*60)}/><button type="button" onClick={()=>setTimerJalan((x)=>!x)}>{timerJalan?'Jeda':'Mulai'}</button></div>:panel==='Stopwatch'?<div><strong>{formatWaktu(detikStopwatch)}</strong><button type="button" onClick={()=>setStopwatchJalan((x)=>!x)}>{stopwatchJalan?'Jeda':'Mulai'}</button><button type="button" onClick={()=>setDetikStopwatch(0)}>Ulang</button></div>:<p>Alat {panel.toLowerCase()} aktif pada papan. Semua perubahan tetap berada di perangkat ini.</p>}</aside>:null}{pesan?<p className="papan-pesan" role="status">{pesan}</p>:null}<input ref={inputMediaRef} className="sr-only" type="file" accept="image/*,video/*,audio/*,.pdf" onChange={(e)=>{void unggahMedia(e.target.files?.[0]);e.target.value='';}}/></div></main>;
}
