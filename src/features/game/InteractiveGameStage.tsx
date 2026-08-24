import { useCallback, useEffect, useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import { definisiMekanikV2, normalisasiMekanikV2 } from '../../lib/gameMechanicsV2';
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

const unik = (daftar: string[]) => daftar.filter((item, posisi, semua) => item.trim() && semua.indexOf(item) === posisi);

function acak<T>(daftar: T[], benih: string): T[] {
  const nilai = (item: T) => [...`${String(item)}-${benih}`].reduce((jumlah, huruf) => jumlah + huruf.charCodeAt(0), 0) % 101;
  return [...daftar].sort((a, b) => nilai(a) - nilai(b) || String(a).localeCompare(String(b), 'id'));
}

function pecahUrutan(jawaban: string): string[] {
  return jawaban.split(/\s*(?:→|â†’|->)\s*/).filter(Boolean);
}

export function InteractiveGameStage({ butir, engine, mapelKode, mode, jumlahTim, onJawab }: Properti) {
  const mekanikMentah = butir.mekanik_anak ?? mekanikGameAnak(engine);
  const mekanik = normalisasiMekanikV2(mekanikMentah);
  const definisi = definisiMekanikV2(mekanik);
  const opsi = useMemo(() => unik(definisi.inti === 'urutkan' ? butir.pilihan : [butir.jawaban, ...butir.pilihan]).slice(0, 6), [butir.jawaban, butir.pilihan, definisi.inti]);
  const urutanBenar = useMemo(() => pecahUrutan(butir.jawaban), [butir.jawaban]);
  const [terpilih, setTerpilih] = useState('');
  const [urutan, setUrutan] = useState<string[]>([]);
  const [kartuTerbuka, setKartuTerbuka] = useState<string[]>([]);
  const [pasangan, setPasangan] = useState<number[]>([]);
  const [posisi, setPosisi] = useState({ x: 0, y: 0 });
  const [progres, setProgres] = useState(0);
  const [tim, setTim] = useState(0);
  const [wilayah, setWilayah] = useState<Record<number, number>>({});
  const [kata, setKata] = useState('');
  const [alat, setAlat] = useState<string[]>([]);
  const [variabel, setVariabel] = useState(45);
  const [berjalan, setBerjalan] = useState(false);
  const [sudahMengirim, setSudahMengirim] = useState(false);

  useEffect(() => {
    setTerpilih(''); setUrutan([]); setKartuTerbuka([]); setPasangan([]); setPosisi({ x: 0, y: 0 });
    setProgres(0); setTim(0); setWilayah({}); setKata(''); setAlat([]); setVariabel(45);
    setBerjalan(false); setSudahMengirim(false);
  }, [butir.id, jumlahTim]);

  const kirim = useCallback((jawaban: string, timJawab = tim) => {
    if (sudahMengirim) return;
    setSudahMengirim(true);
    onJawab(jawaban, timJawab);
  }, [onJawab, sudahMengirim, tim]);

  const naikkan = (item: string, target = 3, timJawab = tim) => {
    if (item !== butir.jawaban) { kirim(item, timJawab); return; }
    const baru = Math.min(target, progres + 1);
    setProgres(baru);
    if (baru >= target) kirim(item, timJawab);
  };

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
      if (a && b && a.pasangan === b.pasangan) setPasangan((lama) => lama.includes(a.pasangan) ? lama : [...lama, a.pasangan]);
      setKartuTerbuka([]);
    }, 360);
    return () => window.clearTimeout(id);
  }, [kartuMemory, kartuTerbuka]);

  useEffect(() => {
    if (definisi.inti === 'pasangan' && pasangan.length >= Math.min(4, opsi.length) && opsi.length) kirim(butir.jawaban);
  }, [butir.jawaban, definisi.inti, kirim, opsi.length, pasangan.length]);

  const kepala = <header className="dunia-game__kepala"><span>{definisi.ikon}</span><div><b>{definisi.nama}</b><small>{butir.narasi ?? 'Selesaikan misi visual untuk membuka level berikutnya.'}</small></div><div className="dunia-game__misi"><i style={{ width: `${Math.min(100, progres * 34)}%` }}/><span>{mode === 'individu' ? 'Misi individu' : `Misi ${jumlahTim} kelompok`}</span></div></header>;

  if (mekanik === 'kuis') return <section className="gameplay dunia-game dunia-game--kuis" aria-label="Mode Kuis">{kepala}<div className="gameplay__kartu-visual">{opsi.map((item, indeks) => <button key={item} type="button" onClick={() => kirim(item)}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div></section>;

  if (definisi.inti === 'jelajah') {
    const rintangan = new Set(mekanik === 'platform_challenge' ? [7, 11, 13, 17] : [6, 8, 13, 16, 18]);
    const sekarang = posisi.y * 5 + posisi.x;
    const bergerak = (dx: number, dy: number) => {
      const berikut = { x: Math.max(0, Math.min(4, posisi.x + dx)), y: Math.max(0, Math.min(4, posisi.y + dy)) };
      const petak = berikut.y * 5 + berikut.x;
      if (rintangan.has(petak)) { setProgres((lama) => Math.max(0, lama - 1)); return; }
      setPosisi(berikut); setProgres(Math.round((petak / 24) * 3));
      if (petak === 24) kirim(butir.jawaban);
    };
    return <section className={`gameplay dunia-game dunia-game--jelajah dunia-game--${mekanik}`} aria-label={definisi.nama}>{kepala}<div className="maze-adventure"><div className="maze-adventure__grid" data-position={sekarang}>{Array.from({ length: 25 }, (_, i) => <span key={i} className={i === sekarang ? 'pemain' : i === 24 ? 'tujuan' : rintangan.has(i) ? 'rintangan' : ''}>{i === sekarang ? (mekanik === 'racing' ? '🏎️' : mekanik === 'debugging_maze' ? '🤖' : '🧒') : i === 24 ? '🏆' : rintangan.has(i) ? (mekanik === 'platform_challenge' ? '☁️' : '🌵') : '·'}</span>)}</div><div className="gameplay__arah"><button aria-label="Atas" type="button" onClick={() => bergerak(0, -1)}>↑</button><button aria-label="Kiri" type="button" onClick={() => bergerak(-1, 0)}>←</button><button aria-label="Bawah" type="button" onClick={() => bergerak(0, 1)}>↓</button><button aria-label="Kanan" type="button" onClick={() => bergerak(1, 0)}>→</button></div></div></section>;
  }

  if (definisi.inti === 'sasaran') {
    const simbol = mekanik === 'balloon_pop' ? '🎈' : mekanik === 'fishing' ? '🐟' : mekanik === 'catch_game' ? '🌟' : '🎯';
    return <section className={`gameplay dunia-game dunia-game--sasaran dunia-game--${mekanik}`} aria-label={definisi.nama}>{kepala}<div className="arena-bergerak" data-hits={progres}>{opsi.map((item, indeks) => <button type="button" key={`${item}-${indeks}`} style={{ '--i': indeks } as CSSProperties} onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); naikkan(item); }} aria-label={`${simbol} ${item}`}><b>{simbol}</b><span>{item}</span></button>)}<span className="arena-bergerak__tokoh">{mekanik === 'fishing' ? '🎣' : '🧒'}</span></div><b className="gameplay__status">Tangkap 3 sasaran tepat · {progres}/3</b></section>;
  }

  if (definisi.inti === 'koleksi') return <section className={`gameplay dunia-game dunia-game--koleksi dunia-game--${mekanik}`} aria-label={definisi.nama}>{kepala}<div className="petualangan-grid">{Array.from({ length: 8 }, (_, indeks) => { const item = opsi[indeks % opsi.length]!; return <button type="button" key={indeks} onClick={() => naikkan(item)}><b>{mekanik === 'reading_detective' ? '🔎' : mekanik === 'object_hunt' ? '👀' : mekanik === 'escape_room' ? '🔐' : '🧰'}</b><span>{item}</span><i>{indeks < progres ? '✓' : '✦'}</i></button>; })}</div><div className="daya-game"><span style={{ width: `${progres * 34}%` }}/><b>{progres}/3 petunjuk ditemukan</b></div></section>;

  if (definisi.inti === 'pasangan') return <section className={`gameplay dunia-game dunia-game--memory dunia-game--${mekanik}`} aria-label={definisi.nama}>{kepala}<div className="memory-world">{kartuMemory.map((kartu) => { const terbuka = kartuTerbuka.includes(kartu.id) || pasangan.includes(kartu.pasangan); return <button type="button" key={kartu.id} className={terbuka ? 'terbuka' : ''} disabled={terbuka || kartuTerbuka.length >= 2} onClick={() => setKartuTerbuka((lama) => [...lama, kartu.id])}><span>{terbuka ? kartu.isi : '❓'}</span></button>; })}</div><p>Combo pasangan: <b>{pasangan.length}</b></p></section>;

  if (definisi.inti === 'pabrik') {
    const jatuhkan = (e: DragEvent<HTMLButtonElement>) => { e.preventDefault(); const item = e.dataTransfer.getData('text/plain') || terpilih; if (item) naikkan(item); };
    return <section className={`gameplay dunia-game dunia-game--factory dunia-game--${mekanik}`} aria-label={definisi.nama}>{kepala}<div className="konveyor">{opsi.map((item, indeks) => <button draggable type="button" key={item} className={terpilih === item ? 'aktif' : ''} onClick={() => setTerpilih(item)} onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}><b>{mekanik === 'classification_challenge' ? '🗂️' : '📦'}</b><span>{item}</span><i style={{ animationDelay: `${indeks * -.2}s` }}/></button>)}</div><button type="button" className="gerbang-factory" onClick={() => terpilih && naikkan(terpilih)} onDragOver={(e) => e.preventDefault()} onDrop={jatuhkan}><b>🏭</b><span>Gerbang misi</span><small>Seret paket atau pilih lalu sentuh gerbang · {progres}/3</small></button></section>;
  }

  if (definisi.inti === 'urutkan') {
    const simbol = mekanik === 'coding_quest' ? ['⬆️', '↪️', '➡️', '🔁'] : mekanik === 'rhythm_game' ? ['👏', '🥁', '🎵', '✨'] : mekanik === 'movement_pjok_challenge' ? ['🙆', '🏃', '🤸', '🧘'] : mekanik === 'art_puzzle' ? ['🎨', '🔺', '🟦', '🖼️'] : ['🧩', '🧱', '⚙️', '🏆'];
    const target = urutanBenar.length ? urutanBenar : opsi.slice(0, 4);
    const tambah = (item: string) => { if (urutan.filter((nilai) => nilai === item).length < target.filter((nilai) => nilai === item).length) setUrutan((lama) => [...lama, item]); };
    return <section className={`gameplay dunia-game dunia-game--urutkan dunia-game--${mekanik}`} aria-label={definisi.nama}>{kepala}<div className="keping-game">{opsi.map((item, indeks) => <button type="button" key={`${item}-${indeks}`} disabled={urutan.includes(item)} onClick={() => tambah(item)}><b>{simbol[indeks % simbol.length]}</b><span>{item}</span></button>)}</div><div className="jalur-keping">{urutan.map((item, indeks) => <button type="button" key={`${item}-${indeks}`} onClick={() => setUrutan((lama) => lama.filter((_, i) => i !== indeks))}><b>{indeks + 1}</b><span>{item}</span></button>)}{!urutan.length ? <p>Sentuh keping sesuai urutan misi.</p> : null}</div><button className="gameplay__aksi" type="button" disabled={urutan.length !== target.length} onClick={() => kirim(urutan.join(' → '))}>{mekanik === 'coding_quest' ? 'Jalankan robot' : mekanik === 'rhythm_game' ? 'Mainkan pola' : mekanik === 'movement_pjok_challenge' ? 'Selesaikan sirkuit' : 'Pasang keping'}</button></section>;
  }

  if (definisi.inti === 'strategi') {
    const klaim = (item: string, indeks: number) => {
      if (item !== butir.jawaban) { kirim(item, tim); return; }
      setWilayah((lama) => ({ ...lama, [indeks]: tim }));
      naikkan(item, 3, tim);
    };
    return <section className={`gameplay dunia-game dunia-game--strategi dunia-game--${mekanik}`} aria-label={definisi.nama}>{kepala}<div className="pilih-tim">{Array.from({ length: jumlahTim }, (_, i) => <button type="button" className={tim === i ? 'aktif' : ''} key={i} onClick={() => setTim(i)}>Tim {i + 1}</button>)}</div><div className="wilayah-grid">{Array.from({ length: 16 }, (_, i) => { const item = opsi[i % opsi.length]!; return <button type="button" key={i} className={wilayah[i] !== undefined ? `tim-${wilayah[i]}` : ''} onClick={() => klaim(item, i)}><b>{wilayah[i] === undefined ? definisi.ikon : wilayah[i]! + 1}</b><span>{item}</span></button>; })}</div><b className="gameplay__status">{mekanik === 'environment_rescue' ? 'Pulihkan 3 zona' : mekanik === 'city_builder_edu' ? 'Bangun 3 distrik' : 'Kuasai 3 petak'} · {progres}/3</b></section>;
  }

  if (definisi.inti === 'eksperimen') {
    const alatWajib = ['sumber', 'wadah', 'sensor'];
    const hasil = Math.round((variabel * (berjalan ? 1.4 : .4)) / 10);
    return <section className={`gameplay dunia-game dunia-game--lab dunia-game--${mekanik}`} aria-label={definisi.nama}>{kepala}<div className="lab-v2"><div className="lab-v2__scene" data-output={hasil}><div className={`lab-v2__reaksi ${berjalan ? 'aktif' : ''}`} style={{ '--reaksi': `${variabel}%` } as CSSProperties}>🧪<i>{hasil}</i></div><div className="lab-v2__meja">{alatWajib.map((item, indeks) => <button draggable type="button" key={item} className={alat.includes(item) ? 'aktif' : ''} onClick={() => setAlat((lama) => lama.includes(item) ? lama : [...lama, item])}><b>{['🔦', '🥣', '📟'][indeks]}</b><span>{item}</span></button>)}</div></div><div className="lab-v2__panel"><label>Variabel percobaan <b>{variabel}</b><input aria-label="Variabel percobaan" type="range" min="10" max="90" value={variabel} onChange={(e) => setVariabel(Number(e.target.value))}/></label><button type="button" disabled={alat.length < alatWajib.length} className={berjalan ? 'aktif' : ''} onClick={() => setBerjalan((nilai) => !nilai)}>{berjalan ? '⏸ Jeda proses' : '▶ Jalankan eksperimen'}</button><p>Output visual: <b>{hasil}</b> unit</p><div className="bahan-lab">{opsi.map((item, indeks) => <button type="button" key={item} disabled={!berjalan} onClick={() => kirim(item)}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div></div></div></section>;
  }

  if (definisi.inti === 'manipulatif') return <section className={`gameplay dunia-game dunia-game--number dunia-game--${mekanik}`} aria-label={definisi.nama}>{kepala}<div className="garis-angka">{opsi.map((item, indeks) => <button type="button" key={item} onClick={() => naikkan(item, 1)}><b>{item}</b><span>{indeks % 2 ? '🚀' : '⭐'}</span></button>)}</div><div className="manipulatif-angka" role="group" aria-label="Benda hitung">{Array.from({ length: Math.min(16, Number(butir.jawaban) || 8) }, (_, i) => <button type="button" key={i} className={i < progres ? 'aktif' : ''} onClick={() => setProgres((lama) => Math.min(3, lama + 1))}>●</button>)}</div></section>;

  if (definisi.inti === 'kata') {
    const target = butir.jawaban.replace(/[^a-z0-9]/gi, '').toLocaleUpperCase('id').slice(0, 12) || 'KATA';
    const bank = acak([...target, ...'CERIA'.slice(0, Math.max(0, 5 - target.length))], butir.id);
    return <section className="gameplay dunia-game dunia-game--word" aria-label={definisi.nama}>{kepala}<div className="kata-rahasia">{[...target].map((_, i) => <span key={i}>{kata[i] ?? '·'}</span>)}</div><div className="huruf-terbang">{bank.map((huruf, i) => <button type="button" key={`${huruf}-${i}`} onClick={() => { if (huruf !== target[kata.length]) { setKata(''); return; } const baru = kata + huruf; setKata(baru); setProgres(Math.ceil((baru.length / target.length) * 3)); if (baru === target) kirim(butir.jawaban); }}>{huruf}</button>)}</div><p>Kumpulkan huruf dari kiri ke kanan. Salah pilih mengulang kata.</p></section>;
  }

  return <section className="gameplay dunia-game dunia-game--story" aria-label={definisi.nama}>{kepala}<div className="cerita-visual"><div className="cerita-visual__gambar"><span>{ikonGameplay(mapelKode, 1)}</span><b>?</b><span>{ikonGameplay(mapelKode, 2)}</span></div><div className="cerita-visual__pilihan">{opsi.map((item, indeks) => <button type="button" key={item} onClick={() => kirim(item)}><b>{['💡', '🤝', '🧭', '🌟'][indeks % 4]}</b><span>{item}</span></button>)}</div></div><small>{mode === 'individu' ? 'Pilih tindakan untuk tokoh.' : 'Diskusikan pilihan, lalu sentuh keputusan kelompok.'}</small></section>;
}
