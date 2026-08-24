import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useKurikulum } from '../../state/useKurikulum';
import { RUTE } from '../../routes/paths';
import './dual-window.css';

interface Pemain { skor: number; waktu: number; target: number; selesai: boolean }
const AWAL: Pemain = { skor: 0, waktu: 60, target: 0, selesai: false };

function Arena({ nama, pemain, onHit, onReset }: { nama: string; pemain: Pemain; onHit: (pointerId: number, benar: boolean) => void; onReset: () => void }) {
  return <section className="dual-arena" aria-label={`Arena ${nama}`}><header><strong>{nama}</strong><span>Skor {pemain.skor}</span><b>{pemain.waktu}s</b></header><div className="dual-arena__lapangan" data-target={pemain.target}>{Array.from({ length: 6 }, (_, i) => <button type="button" key={i} className={i === pemain.target ? 'target' : ''} onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); onHit(e.pointerId, i === pemain.target); }} aria-label={i === pemain.target ? 'Target benar' : 'Pengalih'}><span>{i === pemain.target ? '★' : '●'}</span></button>)}</div><footer><span>{pemain.selesai ? 'Selesai' : 'Sentuh bintang, hindari pengalih.'}</span><button type="button" onClick={onReset}>Reset arena</button></footer></section>;
}

export function DualWindowScreen() {
  const { konteks } = useKurikulum();
  const [a, setA] = useState<Pemain>({ ...AWAL });
  const [b, setB] = useState<Pemain>({ ...AWAL, target: 5 });
  const pointerAktif = useRef(new Map<number, 'A' | 'B'>());
  useEffect(() => { const id = window.setInterval(() => { setA((x) => x.selesai ? x : { ...x, waktu: Math.max(0, x.waktu - 1), selesai: x.waktu <= 1 }); setB((x) => x.selesai ? x : { ...x, waktu: Math.max(0, x.waktu - 1), selesai: x.waktu <= 1 }); }, 1000); return () => clearInterval(id); }, []);
  function pukul(sisi: 'A' | 'B', pointerId: number, benar: boolean) { pointerAktif.current.set(pointerId, sisi); const set = sisi === 'A' ? setA : setB; set((lama) => lama.selesai ? lama : { ...lama, skor: Math.max(0, lama.skor + (benar ? 10 : -2)), target: benar ? Math.floor(Math.random() * 6) : lama.target }); }
  const sumberSiap = Boolean(konteks.tp_id && konteks.referensi_bab_id);
  return <main className="dual-window" data-testid="dual-window"><header><div><p>Game Edukasi</p><h1>Dual Window</h1><span>Dua arena independen, dua skor, dua timer, dan pointer multi-touch terpisah.</span></div><button type="button" onClick={() => void document.documentElement.requestFullscreen?.()}>⛶ Layar penuh</button></header>{!sumberSiap ? <aside><strong>Mode demonstrasi engine</strong><span>Pilih buku, Bab/Topik, dan TP untuk mengisi misi kurikuler final. Engine pointer independen tetap dapat diuji.</span><Link to={RUTE.game}>Kembali ke katalog</Link></aside> : null}<div className="dual-window__panggung"><Arena nama="Pemain A" pemain={a} onHit={(id, benar) => pukul('A', id, benar)} onReset={() => setA({ ...AWAL })} /><Arena nama="Pemain B" pemain={b} onHit={(id, benar) => pukul('B', id, benar)} onReset={() => setB({ ...AWAL, target: 5 })} /></div></main>;
}
