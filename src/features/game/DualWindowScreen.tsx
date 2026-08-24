import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useKurikulum } from '../../state/useKurikulum';
import { RUTE } from '../../routes/paths';
import './dual-window.css';

type MekanikDual = 'race' | 'sorting' | 'matching' | 'catch' | 'math' | 'coding' | 'puzzle';
interface Pemain { skor: number; waktu: number; target: number; selesai: boolean; progres: number; combo: number }
const AWAL: Pemain = { skor: 0, waktu: 60, target: 0, selesai: false, progres: 0, combo: 0 };
const SIMBOL: Record<MekanikDual, string> = { race: '🏎️', sorting: '📦', matching: '🔗', catch: '⭐', math: '🔢', coding: '🤖', puzzle: '🧩' };

function Arena({ nama, pemain, mekanik, onHit, onReset }: { nama: string; pemain: Pemain; mekanik: MekanikDual; onHit: (pointerId: number, benar: boolean) => void; onReset: () => void }) {
  return <section className="dual-arena" aria-label={`Arena ${nama}`} data-mechanic={mekanik}>
    <header><strong>{nama}</strong><span>Skor {pemain.skor}</span><span>Combo {pemain.combo}</span><b>{pemain.waktu}s</b></header>
    <div className="dual-arena__progres"><i style={{ width: `${pemain.progres}%` }}/></div>
    <div className="dual-arena__lapangan" data-target={pemain.target}>{Array.from({ length: 6 }, (_, i) => <button type="button" key={i} className={i === pemain.target ? 'target' : ''} onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); onHit(e.pointerId, i === pemain.target); }} aria-label={i === pemain.target ? 'Target benar' : 'Pengalih'}><span>{i === pemain.target ? SIMBOL[mekanik] : '●'}</span></button>)}</div>
    <footer><span>{pemain.selesai ? 'Level selesai' : `Mainkan ${mekanik} sampai progress penuh.`}</span><button type="button" onClick={onReset}>Reset arena</button></footer>
  </section>;
}

export function DualWindowScreen() {
  const { konteks } = useKurikulum();
  const [a, setA] = useState<Pemain>({ ...AWAL });
  const [b, setB] = useState<Pemain>({ ...AWAL, target: 5 });
  const [mekanik, setMekanik] = useState<MekanikDual>('catch');
  const pointerAktif = useRef(new Map<number, 'A' | 'B'>());
  useEffect(() => { const id = window.setInterval(() => { setA((x) => x.selesai ? x : { ...x, waktu: Math.max(0, x.waktu - 1), selesai: x.waktu <= 1 }); setB((x) => x.selesai ? x : { ...x, waktu: Math.max(0, x.waktu - 1), selesai: x.waktu <= 1 }); }, 1000); return () => clearInterval(id); }, []);
  function pukul(sisi: 'A' | 'B', pointerId: number, benar: boolean) {
    pointerAktif.current.set(pointerId, sisi);
    const set = sisi === 'A' ? setA : setB;
    set((lama) => {
      if (lama.selesai) return lama;
      const progres = Math.min(100, lama.progres + (benar ? 20 : 0));
      return { ...lama, skor: Math.max(0, lama.skor + (benar ? 10 + lama.combo : -2)), combo: benar ? lama.combo + 1 : 0, progres, selesai: progres >= 100, target: benar ? Math.floor(Math.random() * 6) : lama.target };
    });
  }
  const sumberSiap = Boolean(konteks.tp_id && konteks.referensi_bab_id);
  return <main className="dual-window" data-testid="dual-window">
    <header><div><p>Game Edukasi V2</p><h1>Dual Window</h1><span>Dua arena independen, dua skor, dua timer, dan pointer multi-touch terpisah.</span></div><button type="button" onClick={() => void document.documentElement.requestFullscreen?.()}>⛶ Layar penuh</button></header>
    <aside><label>Mekanik duel<select aria-label="Mekanik Dual Window" value={mekanik} onChange={(e) => { setMekanik(e.target.value as MekanikDual); setA({ ...AWAL }); setB({ ...AWAL, target: 5 }); }}>{Object.keys(SIMBOL).map((item) => <option key={item} value={item}>{SIMBOL[item as MekanikDual]} {item}</option>)}</select></label>{!sumberSiap ? <><strong>Mode demonstrasi engine</strong><span>Pilih buku, Bab/Topik, dan TP untuk mengisi misi kurikuler final. Engine pointer independen tetap dapat diuji.</span></> : <span>Konten aktif mengikuti TP dan referensi yang dipilih.</span>}<Link to={RUTE.game}>Kembali ke katalog</Link></aside>
    <div className="dual-window__panggung"><Arena nama="Pemain A" pemain={a} mekanik={mekanik} onHit={(id, benar) => pukul('A', id, benar)} onReset={() => setA({ ...AWAL })}/><Arena nama="Pemain B" pemain={b} mekanik={mekanik} onHit={(id, benar) => pukul('B', id, benar)} onReset={() => setB({ ...AWAL, target: 5 })}/></div>
  </main>;
}
