import { useMemo, useState } from 'react';

type MapelInteraktif = 'MAT' | 'PP' | 'BI' | 'BING';
type ModeInteraktif = 'game' | 'vlab';

interface AktivitasProfil {
  kode: string;
  nama: string;
  mekanik: string;
  ikon: string;
}

interface ProfilMapel {
  game: AktivitasProfil[];
  lab: AktivitasProfil[];
}

export const PROFIL_INTERAKTIF_KELAS5: Record<MapelInteraktif, ProfilMapel> = {
  MAT: {
    game: [
      { kode:'target-angka', nama:'Target Angka', mekanik:'Target nilai', ikon:'🎯' },
      { kode:'susun-konsep', nama:'Susun Konsep', mekanik:'Urutan sentuh', ikon:'🧩' },
      { kode:'hitung-kilat', nama:'Hitung Kilat', mekanik:'Kecepatan ronde', ikon:'⚡' },
      { kode:'pola-detektif', nama:'Detektif Pola', mekanik:'Pilih pola', ikon:'🔎' },
      { kode:'math-boss', nama:'Math Boss', mekanik:'Misi berantai', ikon:'🏆' },
    ],
    lab: [
      { kode:'number-line', nama:'Lab Garis Bilangan', mekanik:'Geser posisi', ikon:'📏' },
      { kode:'fraction-bars', nama:'Lab Pecahan', mekanik:'Batang pecahan', ikon:'🍫' },
      { kode:'shape-measure', nama:'Lab Ukur Bangun', mekanik:'Ubah ukuran', ikon:'📐' },
      { kode:'angle-lab', nama:'Lab Sudut', mekanik:'Putar sudut', ikon:'📐' },
      { kode:'data-lab', nama:'Lab Data', mekanik:'Ubah diagram', ikon:'📊' },
    ],
  },
  PP: {
    game: [
      { kode:'pilih-sikap', nama:'Pilih Sikap', mekanik:'Keputusan situasi', ikon:'⚖️' },
      { kode:'misi-musyawarah', nama:'Misi Musyawarah', mekanik:'Urutan kesepakatan', ikon:'🤝' },
      { kode:'jelajah-pancasila', nama:'Jelajah Pancasila', mekanik:'Peta topik', ikon:'🇮🇩' },
      { kode:'pasang-nilai', nama:'Pasangkan Nilai', mekanik:'Cocokkan kartu', ikon:'🧩' },
      { kode:'warga-teladan', nama:'Warga Teladan', mekanik:'Misi refleksi', ikon:'🏆' },
    ],
    lab: [
      { kode:'decision-lab', nama:'Simulator Keputusan', mekanik:'Bandingkan pilihan', ikon:'⚖️' },
      { kode:'musyawarah-lab', nama:'Simulator Musyawarah', mekanik:'Atur dukungan', ikon:'🗳️' },
      { kode:'culture-lab', nama:'Studio Keragaman', mekanik:'Kelompokkan contoh', ikon:'🎭' },
      { kode:'gotong-lab', nama:'Simulator Gotong Royong', mekanik:'Bagi peran', ikon:'🤝' },
      { kode:'reflection-lab', nama:'Lab Refleksi Warga', mekanik:'Catat pengamatan', ikon:'📝' },
    ],
  },
  BI: {
    game: [
      { kode:'susun-kalimat', nama:'Susun Kalimat', mekanik:'Urutan kata', ikon:'📝' },
      { kode:'detektif-teks', nama:'Detektif Teks', mekanik:'Cari kata kunci', ikon:'🔎' },
      { kode:'jelajah-kosakata', nama:'Jelajah Kosakata', mekanik:'Kartu kata', ikon:'📚' },
      { kode:'tebak-makna', nama:'Tebak Makna', mekanik:'Pilih konteks', ikon:'🎭' },
      { kode:'editor-cilik', nama:'Editor Cilik', mekanik:'Perbaiki teks', ikon:'🏆' },
    ],
    lab: [
      { kode:'keyword-lab', nama:'Lab Kata Kunci', mekanik:'Sorot kata', ikon:'🔦' },
      { kode:'sentence-lab', nama:'Lab Kalimat', mekanik:'Susun bagian', ikon:'🧱' },
      { kode:'paragraph-lab', nama:'Lab Paragraf', mekanik:'Atur urutan', ikon:'📄' },
      { kode:'editing-lab', nama:'Lab Penyuntingan', mekanik:'Bandingkan versi', ikon:'✏️' },
      { kode:'response-lab', nama:'Lab Tanggapan', mekanik:'Tulis respons', ikon:'💬' },
    ],
  },
  BING: {
    game: [
      { kode:'word-match', nama:'Word Match', mekanik:'Match words', ikon:'🔤' },
      { kode:'speak-choose', nama:'Speak & Choose', mekanik:'Choose expression', ikon:'🗣️' },
      { kode:'sentence-builder', nama:'Sentence Builder', mekanik:'Order words', ikon:'🧩' },
      { kode:'english-quest', nama:'English Quest', mekanik:'Topic mission', ikon:'🗺️' },
      { kode:'vocab-rush', nama:'Vocabulary Rush', mekanik:'Fast cards', ikon:'🏆' },
    ],
    lab: [
      { kode:'word-order-lab', nama:'Word Order Lab', mekanik:'Reorder tokens', ikon:'🔀' },
      { kode:'expression-lab', nama:'Expression Lab', mekanik:'Switch expression', ikon:'💬' },
      { kode:'direction-lab', nama:'Direction Lab', mekanik:'Move on grid', ikon:'🧭' },
      { kode:'weather-lab', nama:'Weather Language Lab', mekanik:'Adjust condition', ikon:'🌦️' },
      { kode:'response-lab', nama:'Mini Dialogue Lab', mekanik:'Write response', ikon:'🗣️' },
    ],
  },
};

const LABEL: Record<MapelInteraktif,string> = {
  MAT:'Matematika', PP:'Pendidikan Pancasila', BI:'Bahasa Indonesia', BING:'Bahasa Inggris',
};

function kataDari(teks: string): string[] {
  const hasil = teks.replace(/[^\p{L}\p{N}\s-]/gu, '').split(/\s+/).filter(Boolean).slice(0, 7);
  return hasil.length > 1 ? hasil : ['Kelas', 'Lima'];
}

function GameArena({mapel,judul,topik}:{mapel:MapelInteraktif;judul:string;topik:string[]}) {
  const profil=PROFIL_INTERAKTIF_KELAS5[mapel].game;
  const [aktif,setAktif]=useState(0);
  const [ronde,setRonde]=useState(0);
  const [skor,setSkor]=useState(0);
  const [susun,setSusun]=useState<string[]>([]);
  const fokus=topik[ronde%Math.max(1,topik.length)]||judul;
  const kata=useMemo(()=>kataDari(fokus),[fokus]);
  const pilihan=useMemo(()=>[...kata].reverse(),[kata]);
  const target=20+(fokus.length%61);
  const [nilai,setNilai]=useState(50);
  const [jawaban,setJawaban]=useState('');

  const berikut=()=>{setRonde(r=>r+1);setSusun([]);setJawaban('');};
  const benar=()=>{setSkor(s=>s+100);berikut();};
  const p=profil[aktif]!;

  return <section className="k5-content-card" data-testid="k5-generic-game">
    <p className="k5-kicker">Game {LABEL[mapel]} · Ronde {ronde+1}</p>
    <h2>{p.ikon} {p.nama}</h2>
    <div className="k5-options">{profil.map((item,i)=><button key={item.kode} aria-pressed={aktif===i} onClick={()=>{setAktif(i);setSusun([])}}>{i+1}. {item.nama}</button>)}</div>
    <div className="k5-score">⭐ {skor} · Mekanik: {p.mekanik}</div>
    <h3>{fokus}</h3>
    {aktif===0?<><p>Geser nilai sampai tepat pada target. Gunakan perkiraan lalu perbaiki.</p><label>Nilai {nilai}<input aria-label="Nilai permainan" type="range" min="0" max="100" value={nilai} onChange={e=>setNilai(+e.target.value)}/></label><p>Target: <b>{target}</b></p><button onClick={()=>nilai===target?benar():setSkor(s=>Math.max(0,s-10))}>{nilai===target?'✓ Tepat — lanjut':'Periksa target'}</button></>:
    aktif===1?<><p>Susun kata dari fokus materi sampai kembali menjadi urutan yang benar.</p><div className="k5-options">{pilihan.map((x,i)=><button key={`${x}-${i}`} disabled={susun.includes(x)} onClick={()=>{const baru=[...susun,x];setSusun(baru);if(baru.length===kata.length&&baru.join(' ')===kata.join(' '))setSkor(s=>s+100)}}>{x}</button>)}</div><p>{susun.join(' → ')||'Belum ada kata dipilih'}</p><button onClick={berikut}>Topik berikut →</button></>:
    aktif===2?<><p>Baca fokus materi selama beberapa detik, lalu tandai bahwa kamu siap menjelaskannya dengan bahasamu sendiri.</p><button onClick={benar}>⚡ Siap menjelaskan</button><button onClick={berikut}>Ganti fokus</button></>:
    aktif===3?<><p>Pilih satu kata yang menurutmu paling penting dari fokus materi, lalu jelaskan alasannya.</p><div className="k5-options">{kata.map(x=><button key={x} onClick={()=>setJawaban(x)}>{x}</button>)}</div><textarea rows={3} value={jawaban} onChange={e=>setJawaban(e.target.value)} placeholder="Kata kunci + alasan…"/><button disabled={!jawaban.trim()} onClick={benar}>Simpan jawaban</button></>:
    <><p>Boss meminta jawaban singkat berdasarkan topik ini. Gunakan materi/buku saat menjawab.</p><textarea rows={4} value={jawaban} onChange={e=>setJawaban(e.target.value)} placeholder="Tulis jawabanmu…"/><button disabled={jawaban.trim().length<3} onClick={benar}>🏆 Selesaikan misi</button></>}
  </section>;
}

function LabArena({mapel,judul,topik}:{mapel:MapelInteraktif;judul:string;topik:string[]}) {
  const profil=PROFIL_INTERAKTIF_KELAS5[mapel].lab;
  const [aktif,setAktif]=useState(0);
  const [a,setA]=useState(35);
  const [b,setB]=useState(65);
  const [langkah,setLangkah]=useState(0);
  const [catatan,setCatatan]=useState('');
  const fokus=topik[langkah%Math.max(1,topik.length)]||judul;
  const p=profil[aktif]!;
  const selisih=Math.abs(a-b);

  return <section className="k5-content-card" data-testid="k5-generic-lab">
    <p className="k5-kicker">Simulasi / Lab {LABEL[mapel]}</p>
    <h2>{p.ikon} {p.nama}</h2>
    <div className="k5-options">{profil.map((item,i)=><button key={item.kode} aria-pressed={aktif===i} onClick={()=>setAktif(i)}>{i+1}. {item.nama}</button>)}</div>
    <h3>{fokus}</h3><p>Mekanik: {p.mekanik}. Ubah kontrol, amati hasil, lalu hubungkan dengan topik dari buku.</p>
    {aktif===0?<><label>Kontrol A: {a}<input aria-label="Kontrol A" type="range" min="0" max="100" value={a} onChange={e=>setA(+e.target.value)}/></label><div className="k5-score">Posisi/tingkat: {a}%</div></>:
    aktif===1?<><label>Bagian 1: {a}<input aria-label="Bagian 1" type="range" min="0" max="100" value={a} onChange={e=>setA(+e.target.value)}/></label><label>Bagian 2: {b}<input aria-label="Bagian 2" type="range" min="0" max="100" value={b} onChange={e=>setB(+e.target.value)}/></label><div className="k5-score">Total {a+b} · Selisih {selisih}</div></>:
    aktif===2?<><div className="k5-score">A {a}% ◀︎ dibandingkan ▶︎ B {b}%</div><label>A<input aria-label="Variabel A" type="range" min="0" max="100" value={a} onChange={e=>setA(+e.target.value)}/></label><label>B<input aria-label="Variabel B" type="range" min="0" max="100" value={b} onChange={e=>setB(+e.target.value)}/></label></>:
    aktif===3?<><p>Tekan langkah untuk mengubah keadaan simulasi dan amati hubungan sebelum–sesudah.</p><button onClick={()=>setLangkah(x=>x+1)}>Jalankan langkah {langkah+1} →</button><div className="k5-score">Keadaan simulasi: {langkah%4+1}/4</div></>:
    <><textarea rows={5} value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Tulis hasil pengamatan dengan bahasamu sendiri…"/><button onClick={()=>{setCatatan('');setLangkah(x=>x+1)}}>Simpan pengamatan & lanjut →</button></>}
  </section>;
}

export function Kelas5GenericInteraktif({mapel,judul,topik,mode}:{mapel:MapelInteraktif;judul:string;topik:string[];mode:ModeInteraktif}) {
  return mode==='game'?<GameArena mapel={mapel} judul={judul} topik={topik}/>:<LabArena mapel={mapel} judul={judul} topik={topik}/>;
}
