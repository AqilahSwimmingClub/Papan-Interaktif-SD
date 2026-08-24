import { useCallback, useEffect, useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import { mekanikGameAnak } from '../../lib/gameSemantics';
import { ikonGameplay } from '../../lib/gameplay';
import type { ButirGame, GameEngine, ModePermainanGame } from '../../lib/types';

interface Properti {
  butir: ButirGame;
  engine: GameEngine;
  mapelKode: string;
  mode: ModePermainanGame;
  jumlahTim: number;
  onJawab: (jawaban: string, tim: number) => void;
}

function unik(daftar: string[]): string[] {
  return daftar.filter((item, posisi, semua) => item.trim() && semua.indexOf(item) === posisi);
}

function acak<T>(daftar: T[], benih: string): T[] {
  const nilai = (item: T) => [...`${String(item)}-${benih}`].reduce((jumlah, huruf) => jumlah + huruf.charCodeAt(0), 0) % 101;
  return [...daftar].sort((a, b) => nilai(a) - nilai(b) || String(a).localeCompare(String(b), 'id'));
}

function namaMekanik(kode: string): string {
  return kode.replaceAll('_', ' ').replace(/\b\w/g, (huruf) => huruf.toUpperCase());
}

export function InteractiveGameStage({ butir, engine, mapelKode, mode, jumlahTim, onJawab }: Properti) {
  const mekanik = butir.mekanik_anak ?? mekanikGameAnak(engine);
  const opsi = useMemo(() => unik(butir.pilihan).slice(0, 6), [butir.pilihan]);
  const urutanBenar = useMemo(() => butir.jawaban.split(' → ').filter(Boolean), [butir.jawaban]);
  const [terpilih, setTerpilih] = useState('');
  const [urutan, setUrutan] = useState<string[]>([]);
  const [kartuTerbuka, setKartuTerbuka] = useState<string[]>([]);
  const [pasangan, setPasangan] = useState<number[]>([]);
  const [posisi, setPosisi] = useState({ x: 0, y: 0 });
  const [langkah, setLangkah] = useState(0);
  const [daya, setDaya] = useState(0);
  const [kata, setKata] = useState('');
  const [tim, setTim] = useState(0);
  const [wilayah, setWilayah] = useState<Record<number, number>>({});
  const [petakBingo, setPetakBingo] = useState<number[]>([]);
  const [nilaiLab, setNilaiLab] = useState(45);
  const [labSiap, setLabSiap] = useState(false);
  const [sudahMengirim, setSudahMengirim] = useState(false);

  useEffect(() => {
    setTerpilih(''); setUrutan([]); setKartuTerbuka([]); setPasangan([]); setPosisi({ x: 0, y: 0 });
    setLangkah(0); setDaya(0); setKata(''); setTim(0); setWilayah({}); setPetakBingo([]);
    setNilaiLab(45); setLabSiap(false); setSudahMengirim(false);
  }, [butir.id, jumlahTim]);

  const kirim = useCallback((jawaban: string, timJawab = tim) => {
    if (sudahMengirim) return;
    setSudahMengirim(true);
    onJawab(jawaban, timJawab);
  }, [onJawab, sudahMengirim, tim]);

  const kartuMemory = useMemo(() => acak(opsi.slice(0, 4).flatMap((item, indeks) => [
    { id: `kata-${indeks}`, pasangan: indeks, isi: item },
    { id: `ikon-${indeks}`, pasangan: indeks, isi: ikonGameplay(mapelKode, indeks) },
  ]), butir.id), [butir.id, mapelKode, opsi]);

  useEffect(() => {
    if (kartuTerbuka.length !== 2) return;
    const [idA, idB] = kartuTerbuka;
    const a = kartuMemory.find((item) => item.id === idA);
    const b = kartuMemory.find((item) => item.id === idB);
    const id = window.setTimeout(() => {
      if (a && b && a.pasangan === b.pasangan) setPasangan((lama) => [...lama, a.pasangan]);
      setKartuTerbuka([]);
    }, 420);
    return () => window.clearTimeout(id);
  }, [kartuMemory, kartuTerbuka]);

  useEffect(() => {
    if (mekanik === 'memory_world' && pasangan.length >= Math.min(4, opsi.length) && opsi.length) kirim(butir.jawaban);
  }, [butir.jawaban, kirim, mekanik, opsi.length, pasangan.length]);

  function aksiDaya(item: string, target = 100) {
    if (item !== butir.jawaban) { kirim(item); return; }
    const baru = Math.min(target, daya + 34);
    setDaya(baru);
    if (baru >= target) kirim(item);
  }

  function tambahUrutan(item: string) {
    if (urutan.filter((nilai) => nilai === item).length < urutanBenar.filter((nilai) => nilai === item).length) setUrutan((lama) => [...lama, item]);
  }

  function jatuhkan(e: DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain') || terpilih;
    if (item) kirim(item);
  }

  const label = namaMekanik(mekanik);
  const kepala = <header className="dunia-game__kepala"><span>{ikonGameplay(mapelKode, 0)}</span><div><b>{label}</b><small>{butir.narasi ?? 'Selesaikan misi visual untuk membuka level berikutnya.'}</small></div></header>;

  if (mekanik === 'kuis') return <section className="gameplay dunia-game dunia-game--kuis" aria-label="Mode Kuis">{kepala}<div className="gameplay__kartu-visual">{opsi.map((item, indeks) => <button key={item} type="button" onClick={() => kirim(item)}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div></section>;

  if (mekanik === 'maze_adventure') {
    const rintangan = new Set([6, 8, 13, 16, 18]);
    const sekarang = posisi.y * 5 + posisi.x;
    const bergerak = (dx: number, dy: number) => {
      const berikut = { x: Math.max(0, Math.min(4, posisi.x + dx)), y: Math.max(0, Math.min(4, posisi.y + dy)) };
      const petak = berikut.y * 5 + berikut.x;
      if (rintangan.has(petak)) return;
      setPosisi(berikut); if (petak === 24) kirim(butir.jawaban);
    };
    return <section className="gameplay dunia-game dunia-game--maze" aria-label="Maze Adventure">{kepala}<div className="maze-adventure"><div className="maze-adventure__grid">{Array.from({ length: 25 }, (_, i) => <span key={i} className={i === sekarang ? 'pemain' : i === 24 ? 'tujuan' : rintangan.has(i) ? 'rintangan' : ''}>{i === sekarang ? '🧒' : i === 24 ? '🏆' : rintangan.has(i) ? '🌵' : '·'}</span>)}</div><div className="gameplay__arah"><button aria-label="Atas" type="button" onClick={() => bergerak(0, -1)}>↑</button><button aria-label="Kiri" type="button" onClick={() => bergerak(-1, 0)}>←</button><button aria-label="Bawah" type="button" onClick={() => bergerak(0, 1)}>↓</button><button aria-label="Kanan" type="button" onClick={() => bergerak(1, 0)}>→</button></div></div></section>;
  }

  if (['balloon_pop', 'whack_target', 'fishing_catch', 'platform_jump'].includes(mekanik)) {
    const simbol = mekanik === 'balloon_pop' ? '🎈' : mekanik === 'whack_target' ? '🎯' : mekanik === 'fishing_catch' ? '🐟' : '☁️';
    const aria = mekanik === 'balloon_pop' ? 'Balloon Pop' : mekanik === 'whack_target' ? 'Whack Target' : mekanik === 'fishing_catch' ? 'Fishing Catch' : 'Platform Jump Challenge';
    return <section className={`gameplay dunia-game dunia-game--${mekanik}`} aria-label={aria}>{kepala}<div className="arena-bergerak">{opsi.map((item, indeks) => <button type="button" key={item} style={{ '--i': indeks } as CSSProperties} onClick={() => kirim(item)}><b>{simbol}</b><span>{item}</span></button>)}<span className="arena-bergerak__tokoh">🧒</span></div></section>;
  }

  if (mekanik === 'treasure_hunt' || mekanik === 'escape_room') {
    const simbol = mekanik === 'treasure_hunt' ? '🧰' : '🔐';
    return <section className={`gameplay dunia-game dunia-game--${mekanik}`} aria-label={mekanik === 'treasure_hunt' ? 'Treasure Hunt' : 'Escape Room'}>{kepala}<div className="petualangan-grid">{Array.from({ length: 8 }, (_, indeks) => { const item = opsi[indeks % opsi.length]!; return <button type="button" key={indeks} onClick={() => aksiDaya(item)}><b>{simbol}</b><span>{item}</span><i>{daya >= (indeks % 3 + 1) * 34 ? '✓' : '✦'}</i></button>; })}</div><div className="daya-game"><span style={{ width: `${daya}%` }}/><b>{mekanik === 'treasure_hunt' ? 'Peta harta' : 'Kunci pintu'} {daya}%</b></div></section>;
  }

  if (mekanik === 'racing_game' || mekanik === 'tower_builder' || mekanik === 'monster_battle') {
    const judul = mekanik === 'racing_game' ? 'Racing Game' : mekanik === 'tower_builder' ? 'Tower Builder' : 'Monster Friend Battle';
    return <section className={`gameplay dunia-game dunia-game--${mekanik}`} aria-label={judul}>{kepala}<div className="progres-dunia">{mekanik === 'racing_game' ? <div className="lintasan"><span style={{ left: `calc(${daya}% - 24px)` }}>🏎️</span><b>🏁</b></div> : mekanik === 'tower_builder' ? <div className="menara">{Array.from({ length: Math.ceil(daya / 25) }, (_, i) => <span key={i}>🧱</span>)}</div> : <div className="monster-baik"><span>🐲</span><div><i style={{ width: `${daya}%` }}/></div><b>{daya < 100 ? 'Butuh energi persahabatan' : 'Sahabat monster gembira!'}</b></div>}<div className="power-pilihan">{opsi.map((item, indeks) => <button type="button" key={item} onClick={() => aksiDaya(item)}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div></div></section>;
  }

  if (mekanik === 'territory_battle') return <section className="gameplay dunia-game dunia-game--territory" aria-label="Territory Battle">{kepala}<div className="pilih-tim">{Array.from({ length: jumlahTim }, (_, i) => <button type="button" className={tim === i ? 'aktif' : ''} key={i} onClick={() => setTim(i)}>Tim {i + 1}</button>)}</div><div className="wilayah-grid">{Array.from({ length: 16 }, (_, i) => { const item = opsi[i % opsi.length]!; return <button type="button" key={i} className={wilayah[i] !== undefined ? `tim-${wilayah[i]}` : ''} onClick={() => { setWilayah((lama) => ({ ...lama, [i]: tim })); kirim(item, tim); }}><b>{wilayah[i] === undefined ? '◇' : wilayah[i]! + 1}</b><span>{item}</span></button>; })}</div></section>;

  if (mekanik === 'sorting_factory') return <section className="gameplay dunia-game dunia-game--factory" aria-label="Sorting Factory">{kepala}<div className="konveyor">{opsi.map((item, indeks) => <button draggable type="button" key={item} className={terpilih === item ? 'aktif' : ''} onClick={() => setTerpilih(item)} onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}><b>📦</b><span>{item}</span><i style={{ animationDelay: `${indeks * -.2}s` }}/></button>)}</div><button type="button" className="gerbang-factory" onClick={() => terpilih && kirim(terpilih)} onDragOver={(e) => e.preventDefault()} onDrop={jatuhkan}><b>🏭</b><span>Gerbang misi</span><small>Seret paket atau pilih lalu sentuh gerbang</small></button></section>;

  if (mekanik === 'memory_world') return <section className="gameplay dunia-game dunia-game--memory" aria-label="Memory World">{kepala}<div className="memory-world">{kartuMemory.map((kartu) => { const terbuka = kartuTerbuka.includes(kartu.id) || pasangan.includes(kartu.pasangan); return <button type="button" key={kartu.id} className={terbuka ? 'terbuka' : ''} disabled={terbuka || kartuTerbuka.length >= 2} onClick={() => setKartuTerbuka((lama) => [...lama, kartu.id])}><span>{terbuka ? kartu.isi : '❓'}</span></button>; })}</div><p>Combo pasangan: <b>{pasangan.length}</b></p></section>;

  if (['puzzle_builder', 'coding_quest', 'music_rhythm', 'art_stage', 'pjok_motion'].includes(mekanik)) {
    const simbol = mekanik === 'coding_quest' ? ['⬆️', '↪️', '➡️', '🔁'] : mekanik === 'music_rhythm' ? ['👏', '🥁', '🎵', '✨'] : mekanik === 'pjok_motion' ? ['🙆', '🏃', '🤸', '🧘'] : mekanik === 'art_stage' ? ['🎨', '🔺', '🟦', '🎭'] : ['🧩', '🌟', '🖼️', '🏆'];
    return <section className={`gameplay dunia-game dunia-game--${mekanik}`} aria-label={label}>{kepala}<div className="keping-game">{opsi.map((item, indeks) => <button type="button" key={`${item}-${indeks}`} disabled={urutan.includes(item)} onClick={() => tambahUrutan(item)}><b>{simbol[indeks % simbol.length]}</b><span>{item}</span></button>)}</div><div className="jalur-keping">{urutan.map((item, indeks) => <button type="button" key={`${item}-${indeks}`} onClick={() => setUrutan((lama) => lama.filter((_, i) => i !== indeks))}><b>{indeks + 1}</b><span>{item}</span></button>)}{!urutan.length ? <p>Sentuh keping sesuai urutan misi.</p> : null}</div><button className="gameplay__aksi" type="button" disabled={urutan.length !== urutanBenar.length} onClick={() => kirim(urutan.join(' → '))}>{mekanik === 'coding_quest' ? 'Jalankan robot' : mekanik === 'music_rhythm' ? 'Mainkan pola' : mekanik === 'pjok_motion' ? 'Selesaikan sirkuit' : 'Pasang keping'}</button></section>;
  }

  if (mekanik === 'word_adventure') {
    const target = butir.jawaban.toLocaleUpperCase('id');
    const bank = acak([...target, ...'CERIA'.slice(0, Math.max(0, 5 - target.length))], butir.id);
    return <section className="gameplay dunia-game dunia-game--word" aria-label="Word Adventure">{kepala}<div className="kata-rahasia">{[...target].map((_, i) => <span key={i}>{kata[i] ?? '·'}</span>)}</div><div className="huruf-terbang">{bank.map((huruf, i) => <button type="button" key={`${huruf}-${i}`} onClick={() => { if (huruf !== target[kata.length]) { setKata(''); return; } const baru = kata + huruf; setKata(baru); if (baru === target) kirim(butir.jawaban); }}>{huruf}</button>)}</div><p>Kumpulkan huruf dari kiri ke kanan. Salah pilih mengulang kata.</p></section>;
  }

  if (mekanik === 'number_adventure') return <section className="gameplay dunia-game dunia-game--number" aria-label="Number Adventure">{kepala}<div className="garis-angka">{opsi.map((item, indeks) => <button type="button" key={item} onClick={() => kirim(item)}><b>{item}</b><span>{indeks % 2 ? '🚀' : '⭐'}</span></button>)}</div><div className="manipulatif-angka">{Array.from({ length: Math.min(12, Number(butir.jawaban) || 6) }, (_, i) => <span key={i}>●</span>)}</div></section>;

  if (mekanik === 'science_lab') return <section className="gameplay dunia-game dunia-game--lab" aria-label="Science Lab">{kepala}<div className="alat-lab"><span className={labSiap ? 'aktif' : ''} style={{ '--cairan': `${nilaiLab}%` } as CSSProperties}>🧪</span><label>Atur bahan<input aria-label="Takaran bahan" type="range" min="10" max="90" value={nilaiLab} onChange={(e) => setNilaiLab(Number(e.target.value))}/></label><button type="button" onClick={() => setLabSiap(true)}>Nyalakan alat</button></div><div className="bahan-lab">{opsi.map((item, indeks) => <button type="button" key={item} disabled={!labSiap} onClick={() => kirim(item)}><b>{['🌱', '💧', '☀️', '🔬'][indeks % 4]}</b><span>{item}</span></button>)}</div></section>;

  if (mekanik === 'board_game') return <section className="gameplay dunia-game dunia-game--board" aria-label="Board Game">{kepala}<div className="papan-petualangan">{Array.from({ length: 12 }, (_, i) => <span key={i} className={i === langkah ? 'pion' : ''}>{i === langkah ? '🧒' : i === 11 ? '🏆' : i + 1}</span>)}</div><div className="power-pilihan">{opsi.map((item, indeks) => <button type="button" key={item} onClick={() => { if (item !== butir.jawaban) { kirim(item); return; } const baru = Math.min(11, langkah + 4); setLangkah(baru); if (baru === 11) kirim(item); }}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div></section>;

  if (mekanik === 'bingo_classroom') return <section className="gameplay dunia-game dunia-game--bingo" aria-label="Bingo Classroom">{kepala}<div className="kartu-bingo">{Array.from({ length: 9 }, (_, i) => { const item = i % 3 === 0 ? butir.jawaban : opsi[i % opsi.length]!; const aktif = petakBingo.includes(i); return <button type="button" key={i} className={aktif ? 'aktif' : ''} onClick={() => { if (item !== butir.jawaban) { kirim(item); return; } const baru = [...petakBingo, i]; setPetakBingo(baru); if (baru.length >= 3) kirim(item); }}>{aktif ? '⭐' : item}</button>; })}</div><b>{petakBingo.length}/3 petak satu garis</b></section>;

  return <section className="gameplay dunia-game dunia-game--story" aria-label="Story Adventure">{kepala}<div className="cerita-visual"><div className="cerita-visual__gambar"><span>{ikonGameplay(mapelKode, 1)}</span><b>?</b><span>{ikonGameplay(mapelKode, 2)}</span></div><div className="cerita-visual__pilihan">{opsi.map((item, indeks) => <button type="button" key={item} onClick={() => kirim(item)}><b>{['💡', '🤝', '🧭', '🌟'][indeks % 4]}</b><span>{item}</span></button>)}</div></div><small>{mode === 'individu' ? 'Pilih tindakan untuk tokoh.' : 'Diskusikan pilihan, lalu sentuh keputusan kelompok.'}</small></section>;
}
