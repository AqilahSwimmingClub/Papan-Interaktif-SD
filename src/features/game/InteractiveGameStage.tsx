import { useCallback, useEffect, useMemo, useState, type DragEvent } from 'react';
import { ikonGameplay, tipeGameplayEngine } from '../../lib/gameplay';
import type { ButirGame, GameEngine, ModePermainanGame } from '../../lib/types';

interface Properti {
  butir: ButirGame;
  engine: GameEngine;
  mapelKode: string;
  mode: ModePermainanGame;
  jumlahTim: number;
  onJawab: (jawaban: string, tim: number) => void;
}

function tanpaDuplikat(daftar: string[]): string[] {
  return daftar.filter((item, posisi, semua) => item.trim() && semua.indexOf(item) === posisi);
}

function acak<T>(daftar: T[], benih: string): T[] {
  const angka = [...benih].reduce((jumlah, huruf) => jumlah + huruf.charCodeAt(0), 0);
  return [...daftar].sort((a, b) => `${String(a)}${angka}`.localeCompare(`${String(b)}${angka}`, 'id'));
}

export function InteractiveGameStage({ butir, engine, mapelKode, mode, jumlahTim, onJawab }: Properti) {
  const tipe = tipeGameplayEngine(engine);
  const opsi = useMemo(() => tanpaDuplikat(butir.pilihan).slice(0, 6), [butir.pilihan]);
  const [terpilih, setTerpilih] = useState('');
  const [urutan, setUrutan] = useState<string[]>([]);
  const [kartuTerbuka, setKartuTerbuka] = useState<string[]>([]);
  const [pasanganSelesai, setPasanganSelesai] = useState<number[]>([]);
  const [posisiMaze, setPosisiMaze] = useState({ x: 0, y: 0 });
  const [langkahPapan, setLangkahPapan] = useState(0);
  const [putaran, setPutaran] = useState(0);
  const [huruf, setHuruf] = useState('');
  const [tim, setTim] = useState(0);
  const [energiTim, setEnergiTim] = useState(() => Array.from({ length: jumlahTim }, () => 0));
  const [nilaiSimulasi, setNilaiSimulasi] = useState(40);
  const [sudahMengirim, setSudahMengirim] = useState(false);

  useEffect(() => {
    setTerpilih(''); setUrutan([]); setKartuTerbuka([]); setPasanganSelesai([]);
    setPosisiMaze({ x: 0, y: 0 }); setLangkahPapan(0); setPutaran(0); setHuruf('');
    setTim(0); setEnergiTim(Array.from({ length: jumlahTim }, () => 0)); setNilaiSimulasi(40); setSudahMengirim(false);
  }, [butir.id, jumlahTim]);

  const kirim = useCallback((nilai: string) => {
    if (sudahMengirim) return;
    setSudahMengirim(true);
    onJawab(nilai, tim);
  }, [onJawab, sudahMengirim, tim]);

  const kartuMemory = useMemo(() => acak(opiPasangan(opsi, mapelKode), butir.id), [butir.id, mapelKode, opsi]);

  useEffect(() => {
    if (kartuTerbuka.length !== 2) return;
    const [pertama, kedua] = kartuTerbuka;
    const a = kartuMemory.find((item) => item.id === pertama);
    const b = kartuMemory.find((item) => item.id === kedua);
    const waktu = window.setTimeout(() => {
      if (a && b && a.pasangan === b.pasangan) setPasanganSelesai((lama) => [...lama, a.pasangan]);
      setKartuTerbuka([]);
    }, 480);
    return () => window.clearTimeout(waktu);
  }, [kartuMemory, kartuTerbuka]);

  useEffect(() => {
    const jumlahPasangan = Math.min(4, opsi.length);
    if ((tipe === 'memory' || tipe === 'matching') && jumlahPasangan > 0 && pasanganSelesai.length >= jumlahPasangan) {
      kirim(butir.jawaban);
    }
  }, [butir.jawaban, kirim, opsi.length, pasanganSelesai.length, tipe]);
  function tambahUrutan(item: string) {
    if (!urutan.includes(item)) setUrutan((lama) => [...lama, item]);
  }
  function jatuhkan(peristiwa: DragEvent<HTMLButtonElement>) {
    peristiwa.preventDefault();
    const nilai = peristiwa.dataTransfer.getData('text/plain') || terpilih;
    if (nilai) kirim(nilai);
  }

  if (tipe === 'kuis') {
    return <section className="gameplay gameplay--kuis" aria-label="Mode kuis">
      <p className="gameplay__label">Mode Kuis dipilih</p>
      <div className="gameplay__kartu-visual">{opsi.map((item, indeks) => <button key={item} type="button" onClick={() => kirim(item)}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div>
    </section>;
  }

  if (tipe === 'drag_drop' || tipe === 'classification') {
    return <section className="gameplay gameplay--drag" aria-label="Permainan drag and drop">
      <div className="gameplay__objek">{opsi.map((item, indeks) => <button draggable type="button" key={item} className={terpilih === item ? 'aktif' : ''} onClick={() => setTerpilih(item)} onDragStart={(e) => e.dataTransfer.setData('text/plain', item)}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div>
      <button type="button" className="gameplay__zona" onClick={() => terpilih && kirim(terpilih)} onDragOver={(e) => e.preventDefault()} onDrop={jatuhkan}><span>＋</span><strong>{tipe === 'classification' ? 'Zona klasifikasi' : 'Papan bukti'}</strong><small>Seret ke sini atau pilih objek lalu sentuh zona</small></button>
    </section>;
  }

  if (tipe === 'memory' || tipe === 'matching') {
    return <section className="gameplay gameplay--memory" aria-label={tipe === 'memory' ? 'Permainan memory card' : 'Permainan matching'}>
      {kartuMemory.map((kartu) => {
        const terbuka = kartuTerbuka.includes(kartu.id) || pasanganSelesai.includes(kartu.pasangan);
        return <button type="button" key={kartu.id} className={terbuka ? 'terbuka' : ''} disabled={pasanganSelesai.includes(kartu.pasangan) || kartuTerbuka.includes(kartu.id) || kartuTerbuka.length >= 2} onClick={() => setKartuTerbuka((lama) => [...lama, kartu.id])}><span>{terbuka ? kartu.isi : '◆'}</span></button>;
      })}
    </section>;
  }

  if (['sorting', 'timeline', 'sentence_builder', 'coding', 'puzzle', 'image_puzzle'].includes(tipe)) {
    const label = tipe === 'coding' ? 'Blok program' : tipe === 'timeline' ? 'Jejak waktu' : tipe.includes('puzzle') ? 'Keping puzzle' : 'Kartu susun';
    return <section className={`gameplay gameplay--susun gameplay--${tipe}`} aria-label={label}>
      <div className="gameplay__rak">{opsi.filter((item) => !urutan.includes(item)).map((item, indeks) => <button type="button" key={item} onClick={() => tambahUrutan(item)}><b>{tipe === 'coding' ? ['↑', '↻', '→', '★'][indeks % 4] : ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div>
      <div className="gameplay__alur">{urutan.length ? urutan.map((item, indeks) => <button type="button" key={item} onClick={() => setUrutan((lama) => lama.filter((x) => x !== item))}><b>{indeks + 1}</b>{item}</button>) : <p>Sentuh kartu sesuai urutan. Sentuh lagi untuk membatalkan.</p>}</div>
      <button className="gameplay__aksi" type="button" disabled={urutan.length !== opsi.length} onClick={() => kirim(urutan.join(' → '))}>Jalankan susunan</button>
    </section>;
  }

  if (tipe === 'word_search' || tipe === 'crossword') {
    const target = butir.jawaban.toLocaleUpperCase('id');
    const kotak = [...target, ...'SEKOLAHCERIA'.slice(0, Math.max(0, 16 - target.length))];
    return <section className={`gameplay gameplay--kata gameplay--${tipe}`} aria-label={tipe === 'crossword' ? 'Teka teki silang' : 'Word search'}>
      <div className="gameplay__kata-target">{[...target].map((karakter, indeks) => <span key={`${karakter}-${indeks}`}>{huruf[indeks] ?? '·'}</span>)}</div>
      <div className="gameplay__huruf">{acak(kotak, butir.id).map((karakter, indeks) => <button type="button" key={`${karakter}-${indeks}`} onClick={() => {
        const berikut = target[huruf.length];
        if (karakter === berikut) {
          const baru = `${huruf}${karakter}`; setHuruf(baru); if (baru === target) kirim(butir.jawaban);
        } else setHuruf('');
      }}>{karakter}</button>)}</div>
      <small>Salah sentuh akan mengulang jalur huruf.</small>
    </section>;
  }

  if (tipe === 'maze' || tipe === 'map') {
    const tujuan = tipe === 'maze' ? 24 : Math.abs([...butir.jawaban].reduce((a, x) => a + x.charCodeAt(0), 0)) % 20 + 2;
    const posisi = posisiMaze.y * 5 + posisiMaze.x;
    if (tipe === 'map') return <section className="gameplay gameplay--peta" aria-label="Peta interaktif"><div className="gameplay__peta">{Array.from({ length: 25 }, (_, indeks) => <button type="button" key={indeks} className={indeks === tujuan ? 'tujuan' : ''} aria-label={`Titik peta ${indeks + 1}`} onClick={() => kirim(indeks === tujuan ? butir.jawaban : `titik-${indeks}`)}>{indeks === tujuan ? '★' : indeks % 4 === 0 ? '🌳' : '·'}</button>)}</div></section>;
    return <section className="gameplay gameplay--maze" aria-label="Labirin interaktif"><div className="gameplay__labirin">{Array.from({ length: 25 }, (_, indeks) => <span key={indeks} className={indeks === posisi ? 'pion' : indeks === tujuan ? 'tujuan' : ''}>{indeks === posisi ? '🚀' : indeks === tujuan ? '🏁' : '·'}</span>)}</div><div className="gameplay__arah"><button type="button" aria-label="Atas" onClick={() => setPosisiMaze((p) => ({ ...p, y: Math.max(0, p.y - 1) }))}>↑</button><button type="button" aria-label="Kiri" onClick={() => setPosisiMaze((p) => ({ ...p, x: Math.max(0, p.x - 1) }))}>←</button><button type="button" aria-label="Bawah" onClick={() => setPosisiMaze((p) => { const baru = { ...p, y: Math.min(4, p.y + 1) }; if (baru.x === 4 && baru.y === 4) kirim(butir.jawaban); return baru; })}>↓</button><button type="button" aria-label="Kanan" onClick={() => setPosisiMaze((p) => { const baru = { ...p, x: Math.min(4, p.x + 1) }; if (baru.x === 4 && baru.y === 4) kirim(butir.jawaban); return baru; })}>→</button></div></section>;
  }

  if (tipe === 'wheel' || tipe === 'board') {
    const papan = Array.from({ length: 12 }, (_, indeks) => indeks);
    return <section className={`gameplay gameplay--papan gameplay--${tipe}`} aria-label={tipe === 'wheel' ? 'Roda tantangan' : 'Board game'}>
      {tipe === 'wheel' ? <div className="gameplay__roda" style={{ transform: `rotate(${putaran * 137}deg)` }}><span>★</span><span>◆</span><span>●</span><span>▲</span></div> : <div className="gameplay__board">{papan.map((petak) => <span key={petak} className={petak === langkahPapan ? 'pion' : ''}>{petak === langkahPapan ? '🚀' : petak + 1}</span>)}</div>}
      <button className="gameplay__aksi" type="button" onClick={() => { if (tipe === 'wheel') { const baru = putaran + 1; setPutaran(baru); if (baru >= 3) kirim(butir.jawaban); } else { const baru = Math.min(11, langkahPapan + (langkahPapan % 3) + 1); setLangkahPapan(baru); if (baru >= 11) kirim(butir.jawaban); } }}>{tipe === 'wheel' ? `Putar roda (${Math.min(putaran, 3)}/3)` : 'Lempar dadu'}</button>
    </section>;
  }

  if (tipe === 'experiment' || tipe === 'simulation') {
    return <section className="gameplay gameplay--simulasi" aria-label={tipe === 'experiment' ? 'Eksperimen virtual' : 'Simulasi'}><div className="gameplay__meter"><span style={{ height: `${nilaiSimulasi}%` }} /></div><label>Pengendali virtual<input type="range" min="10" max="100" value={nilaiSimulasi} onChange={(e) => setNilaiSimulasi(Number(e.target.value))}/></label><div className="gameplay__kartu-visual">{opsi.map((item, indeks) => <button type="button" key={item} onClick={() => kirim(item)}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div></section>;
  }

  if (tipe === 'manipulative') {
    return <section className="gameplay gameplay--manipulatif" aria-label="Benda hitung manipulatif"><div>{Array.from({ length: Math.max(3, Math.min(12, nilaiSimulasi / 10)) }, (_, indeks) => <button type="button" key={indeks} onClick={() => setNilaiSimulasi((lama) => Math.max(10, lama - 10))}>{ikonGameplay(mapelKode, indeks)}</button>)}</div><input aria-label="Jumlah benda" type="range" min="10" max="100" step="10" value={nilaiSimulasi} onChange={(e) => setNilaiSimulasi(Number(e.target.value))}/><button className="gameplay__aksi" type="button" onClick={() => kirim(butir.jawaban)}>Kunci susunan benda</button></section>;
  }

  if (tipe === 'rhythm' || tipe === 'movement') {
    const target = opsi.slice(0, 4);
    return <section className={`gameplay gameplay--gerak gameplay--${tipe}`} aria-label={tipe === 'rhythm' ? 'Permainan ritme' : 'Permainan gerak'}><div className="gameplay__urutan-aksi">{target.map((item, indeks) => <button type="button" key={item} className={urutan.length === indeks ? 'aktif' : urutan.includes(item) ? 'selesai' : ''} onClick={() => { if (urutan.length !== indeks) return; const baru = [...urutan, item]; setUrutan(baru); if (baru.length === target.length) kirim(butir.jawaban); }}><b>{tipe === 'rhythm' ? ['👏', '🥁', '🎵', '✨'][indeks] : ['🙆', '🏃', '🤸', '🧘'][indeks]}</b><span>{item}</span></button>)}</div><p>{tipe === 'rhythm' ? 'Ketuk dari kiri ke kanan mengikuti denyut.' : 'Lakukan gerak, lalu sentuh kartu berikutnya.'}</p></section>;
  }

  if (tipe === 'battle' || tipe === 'race') {
    return <section className="gameplay gameplay--battle" aria-label="Battle kelompok"><div className="gameplay__tim">{energiTim.map((energi, indeks) => <button type="button" key={indeks} className={tim === indeks ? 'aktif' : ''} onClick={() => setTim(indeks)}><strong>Tim {indeks + 1}</strong><span style={{ width: `${energi}%` }}/></button>)}</div><div className="gameplay__target">{opsi.map((item, indeks) => <button type="button" key={item} onClick={() => { if (item === butir.jawaban) setEnergiTim((lama) => lama.map((nilai, i) => i === tim ? Math.min(100, nilai + 34) : nilai)); kirim(item); }}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div></section>;
  }

  return <section className={`gameplay gameplay--target gameplay--${tipe}`} aria-label="Permainan target visual"><div className="gameplay__arena">{opsi.map((item, indeks) => <button type="button" key={item} style={{ animationDelay: `${indeks * -0.37}s` }} onClick={() => kirim(item)}><b>{ikonGameplay(mapelKode, indeks)}</b><span>{item}</span></button>)}</div>{mode !== 'individu' ? <p>Sentuh target bergiliran bersama kelompok.</p> : null}</section>;
}

function opiPasangan(opsi: string[], mapelKode: string): Array<{ id: string; pasangan: number; isi: string }> {
  return opsi.slice(0, 4).flatMap((item, indeks) => [
    { id: `teks-${indeks}`, pasangan: indeks, isi: item },
    { id: `ikon-${indeks}`, pasangan: indeks, isi: ikonGameplay(mapelKode, indeks) },
  ]);
}
