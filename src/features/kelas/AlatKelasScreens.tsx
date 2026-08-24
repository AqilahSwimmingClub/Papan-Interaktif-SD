import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import { daftarKelompokKelas, daftarSiswaKelas, pastikanKelasKerja, ubahPoinKelompok } from '../../lib/storage/kelasRepo';
import { bacaPenanda, tulisPenanda } from '../../lib/storage/perangkatRepo';
import type { Kelompok, Siswa } from '../../lib/types';
import { RUTE } from '../../routes/paths';
import './alat-kelas.css';

type KelompokBeranggota = Kelompok & { anggota: Siswa[] };

function TombolLayarPenuh() {
  return <button className="alat-kelas__fullscreen" type="button" onClick={() => void document.documentElement.requestFullscreen?.()}>⛶ Layar penuh</button>;
}

function Kepala({ label, judul, deskripsi }: { label: string; judul: string; deskripsi: string }) {
  return <header className="alat-kelas__kop"><div><p>{label}</p><h1>{judul}</h1><span>{deskripsi}</span></div><TombolLayarPenuh /></header>;
}

function useDataKelas() {
  const { akun } = useAuth();
  const { konteks } = useKurikulum();
  const tingkat = konteks.tingkat_kelas ?? 5;
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelompok, setKelompok] = useState<KelompokBeranggota[]>([]);
  const muat = useCallback(async () => {
    if (!akun) return;
    const kelas = await pastikanKelasKerja(tingkat, akun.id);
    const [anak, grup] = await Promise.all([daftarSiswaKelas(kelas.id), daftarKelompokKelas(kelas.id)]);
    setSiswa(anak); setKelompok(grup);
  }, [akun, tingkat]);
  useEffect(() => { void muat(); }, [muat]);
  return { siswa, kelompok, tingkat, muat, akun };
}

export function KuisLangsungScreen() {
  const { konteks } = useKurikulum();
  const { kelompok } = useDataKelas();
  const [mode, setMode] = useState<'individu' | 'kelompok'>('kelompok');
  const [status, setStatus] = useState<'siap' | 'jalan' | 'selesai'>('siap');
  const [indeks, setIndeks] = useState(0);
  const [skor, setSkor] = useState<Record<string, number>>({});
  const [durasi, setDurasi] = useState(30);
  const sumberSiap = Boolean(konteks.referensi_bab_id && konteks.tp_id);

  useEffect(() => {
    if (status !== 'jalan' || durasi <= 0) return;
    const id = window.setInterval(() => setDurasi((nilai) => Math.max(0, nilai - 1)), 1000);
    return () => window.clearInterval(id);
  }, [status, durasi]);

  return <main className="alat-kelas" data-testid="kuis-langsung"><Kepala label="Aktivitas kelas" judul="Kuis Langsung" deskripsi="Mesin kuis siap membaca Buku → Bab → Topik → TP. Isi final menunggu referensi buku." />
    <section className="alat-kelas__panel kuis-konfigurasi"><label>Mode<select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}><option value="kelompok">Kelompok</option><option value="individu">Individu</option></select></label><label>Waktu per soal<input type="number" min="5" max="180" value={durasi} onChange={(e) => setDurasi(Number(e.target.value))} /></label><div><strong>TP aktif</strong><span>{konteks.tp_id ?? 'Belum dipilih'}</span></div><div><strong>Bab referensi</strong><span>{konteks.referensi_bab_id ?? 'Belum dipilih'}</span></div></section>
    {!sumberSiap ? <section className="alat-kelas__kosong"><span>📚</span><h2>Referensi buku belum dipilih</h2><p>Kuis tidak akan mengarang materi. Tambahkan buku nanti, lalu petakan Bab/Topik ke TP aktif.</p><Link to={RUTE.kelas}>Pilih kelas dan TP</Link></section> : <section className="arena-kuis"><header><span>Soal {indeks + 1}</span><b>{durasi} detik</b></header><div className="arena-kuis__panggung"><p>Konten kuis akan ditampilkan dari topik referensi terpilih.</p></div><footer>{kelompok.map((grup) => <div key={grup.id}><strong>{grup.nama}</strong><button type="button" onClick={() => setSkor((lama) => ({ ...lama, [grup.id]: (lama[grup.id] ?? 0) - 10 }))}>−</button><b>{skor[grup.id] ?? 0}</b><button type="button" onClick={() => setSkor((lama) => ({ ...lama, [grup.id]: (lama[grup.id] ?? 0) + 10 }))}>+</button></div>)}</footer><button type="button" onClick={() => { setStatus('jalan'); setIndeks((nilai) => nilai + 1); setDurasi(30); }}>Soal berikutnya</button></section>}
  </main>;
}

const ALAT_MATEMATIKA = [
  ['blok', 'Blok Basis Sepuluh'], ['sempoa', 'Sempoa'], ['garis', 'Garis Bilangan'], ['pecahan', 'Batang Pecahan'], ['lingkaran', 'Lingkaran Pecahan'], ['jam', 'Jam Analog'], ['uang', 'Uang Rupiah'], ['penggaris', 'Penggaris'], ['busur', 'Busur Derajat'], ['jangka', 'Jangka'], ['bangun2d', 'Bangun Datar'], ['bangun3d', 'Bangun Ruang 3D'], ['jaring', 'Jaring-jaring'], ['volume', 'Kubus Volume'], ['koordinat', 'Bidang Koordinat'], ['geoboard', 'Geoboard'], ['pola', 'Pola Bilangan'], ['timbangan', 'Timbangan'], ['data', 'Diagram Data'], ['peta', 'Peta & Skala'], ['probabilitas', 'Peluang Eksperimen'],
] as const;

export function AlatMatematikaScreen() {
  const [alat, setAlat] = useState<(typeof ALAT_MATEMATIKA)[number][0]>('blok');
  const [nilai, setNilai] = useState({ a: 0, b: 0, c: 0, sudut: 90, radius: 28 });
  const [titik, setTitik] = useState<number[]>([]);
  function ubah(kunci: keyof typeof nilai, perubahan: number) { setNilai((lama) => ({ ...lama, [kunci]: Math.max(0, lama[kunci] + perubahan) })); }
  const jumlah = nilai.a * 100 + nilai.b * 10 + nilai.c;

  return <main className="alat-kelas matematika" data-testid="alat-matematika"><Kepala label="21 manipulatif" judul="Alat Matematika" deskripsi="Objek besar, visual, dan dapat disentuh pada HP, tablet, laptop, serta papan interaktif." />
    <div className="matematika__layout"><nav aria-label="Daftar alat matematika">{ALAT_MATEMATIKA.map(([kode, nama]) => <button type="button" key={kode} className={alat === kode ? 'aktif' : ''} onClick={() => setAlat(kode)}>{nama}</button>)}</nav><section className="matematika__panggung" data-alat={alat}><header><h2>{ALAT_MATEMATIKA.find(([kode]) => kode === alat)?.[1]}</h2><button type="button" onClick={() => { setNilai({ a: 0, b: 0, c: 0, sudut: 90, radius: 28 }); setTitik([]); }}>Reset</button></header>
      {alat === 'blok' ? <div className="blok-basis"><div><button type="button" draggable onClick={() => ubah('a', 1)}>100</button><b>× {nilai.a}</b></div><div><button type="button" draggable onClick={() => ubah('b', 1)}>10</button><b>× {nilai.b}</b></div><div><button type="button" draggable onClick={() => ubah('c', 1)}>1</button><b>× {nilai.c}</b></div><strong>{jumlah}</strong></div> : null}
      {alat === 'sempoa' ? <div className="sempoa" aria-label="Sempoa interaktif">{Array.from({ length: 5 }, (_, batang) => <div key={batang}><span>Nilai {10 ** (4 - batang)}</span>{Array.from({ length: 10 }, (_, butir) => <button type="button" aria-label={`Manik ${batang + 1}-${butir + 1}`} className={butir < (batang === 4 ? nilai.c : 0) ? 'aktif' : ''} onClick={() => setNilai((lama) => ({ ...lama, c: butir + 1 }))} />)}</div>)}</div> : null}
      {alat === 'jam' ? <div className="jam-analog" style={{ '--sudut': `${nilai.sudut}deg` } as React.CSSProperties}><i /><b>12</b><span>{String(Math.floor(nilai.sudut / 30)).padStart(2, '0')}:00</span><input aria-label="Putar jarum jam" type="range" min="0" max="359" value={nilai.sudut} onChange={(e) => setNilai({ ...nilai, sudut: Number(e.target.value) })} /></div> : null}
      {alat === 'busur' || alat === 'jangka' || alat === 'penggaris' || alat === 'peta' ? <div className={`alat-ukur alat-ukur--${alat}`}><div style={{ '--sudut': `${nilai.sudut}deg`, '--radius': `${nilai.radius}%` } as React.CSSProperties}><i /></div><label>{alat === 'jangka' ? 'Radius' : alat === 'peta' ? 'Skala/Jarak' : 'Ukuran/Sudut'}<input type="range" min="1" max={alat === 'busur' ? 180 : 100} value={alat === 'jangka' ? nilai.radius : nilai.sudut} onChange={(e) => setNilai({ ...nilai, [alat === 'jangka' ? 'radius' : 'sudut']: Number(e.target.value) })} /></label><strong>{alat === 'busur' ? `${nilai.sudut}°` : alat === 'jangka' ? `${nilai.radius} cm` : `${nilai.sudut} satuan`}</strong></div> : null}
      {alat === 'koordinat' || alat === 'geoboard' ? <div className={`papan-titik papan-titik--${alat}`}>{Array.from({ length: 49 }, (_, i) => <button key={i} type="button" aria-label={`Titik ${i + 1}`} className={titik.includes(i) ? 'aktif' : ''} onClick={() => setTitik((lama) => lama.includes(i) ? lama.filter((x) => x !== i) : [...lama, i])} />)}<p>{titik.length} titik dipilih</p></div> : null}
      {!['blok', 'sempoa', 'jam', 'busur', 'jangka', 'penggaris', 'peta', 'koordinat', 'geoboard'].includes(alat) ? <div className="manipulatif-generik"><div className="manipulatif-generik__aksi"><button type="button" onClick={() => ubah('a', 1)}>Tambah objek</button><button type="button" onClick={() => ubah('b', 1)}>Ubah bagian</button><button type="button" onClick={() => ubah('c', 1)}>Putar / geser</button></div><div>{Array.from({ length: Math.min(30, nilai.a + nilai.b + 1) }, (_, i) => <span key={i} style={{ transform: `rotate(${i * 12 + nilai.c * 15}deg)` }} />)}</div><strong>{nilai.a + nilai.b} objek aktif · posisi {nilai.c}</strong></div> : null}
    </section></div>
  </main>;
}

interface GrupUndian { id: string; nama: string; anggota: Siswa[] }
function acak<T>(data: T[]): T[] { return [...data].sort(() => Math.random() - 0.5); }

export function UndianNamaScreen() {
  const { siswa, tingkat, akun } = useDataKelas();
  const [mode, setMode] = useState<'nama' | 'kelompok'>('nama');
  const [tersisa, setTersisa] = useState<Siswa[]>([]);
  const [terpilih, setTerpilih] = useState<Siswa[]>([]);
  const [jumlah, setJumlah] = useState(4);
  const [grup, setGrup] = useState<GrupUndian[]>([]);
  useEffect(() => { setTersisa(siswa); setTerpilih([]); }, [siswa]);
  useEffect(() => { if (!akun) return; void bacaPenanda<GrupUndian[]>(`undian_grup_${akun.id}_${tingkat}`).then((data) => { if (data) setGrup(data); }); }, [akun, tingkat]);
  function undi() { if (!tersisa.length) return; const anak = tersisa[Math.floor(Math.random() * tersisa.length)]!; setTersisa((lama) => lama.filter((x) => x.id !== anak.id)); setTerpilih((lama) => [anak, ...lama]); }
  function buatGrup() { const baru = Array.from({ length: Math.min(jumlah, Math.max(1, siswa.length)) }, (_, i): GrupUndian => ({ id: String(i), nama: `Kelompok ${i + 1}`, anggota: [] })); acak(siswa).forEach((anak, i) => baru[i % baru.length]?.anggota.push(anak)); setGrup(baru); }
  function pindah(siswaId: string, tujuan: string) { const anak = grup.flatMap((x) => x.anggota).find((x) => x.id === siswaId); if (!anak) return; setGrup((lama) => lama.map((x) => ({ ...x, anggota: x.id === tujuan ? [...x.anggota.filter((a) => a.id !== siswaId), anak] : x.anggota.filter((a) => a.id !== siswaId) }))); }
  return <main className="alat-kelas" data-testid="undian-nama"><Kepala label={`Kelas ${tingkat}`} judul="Undian Nama" deskripsi="Undian tidak menghapus siswa; reset dan masukkan kembali selalu tersedia." /><div className="tab-alat"><button type="button" className={mode === 'nama' ? 'aktif' : ''} onClick={() => setMode('nama')}>Undi satu per satu</button><button type="button" className={mode === 'kelompok' ? 'aktif' : ''} onClick={() => setMode('kelompok')}>Kelompok acak</button></div>
    {mode === 'nama' ? <section className="arena-undian"><div className="roda-undian"><span>{terpilih[0]?.nama ?? 'Siap mengundi'}</span><button type="button" onClick={undi} disabled={!tersisa.length}>Putar & pilih</button></div><aside><h2>Belum terpilih ({tersisa.length})</h2><ul>{tersisa.map((x) => <li key={x.id}>{x.nama}</li>)}</ul><h2>Sudah terpilih</h2><ul>{terpilih.map((x) => <li key={x.id}>{x.nama}<button type="button" onClick={() => { setTerpilih((lama) => lama.filter((a) => a.id !== x.id)); setTersisa((lama) => [...lama, x]); }}>Masukkan lagi</button></li>)}</ul><button type="button" onClick={() => { setTersisa(siswa); setTerpilih([]); }}>Reset semua</button></aside></section> : <section className="kelompok-undian"><header><label>Jumlah kelompok<input type="number" min="2" max="8" value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} /></label><button type="button" onClick={buatGrup}>Acak seimbang</button><button type="button" onClick={() => { if (akun) void tulisPenanda(`undian_grup_${akun.id}_${tingkat}`, grup); }}>Simpan</button></header><div>{grup.map((g) => <article key={g.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => pindah(e.dataTransfer.getData('siswa'), g.id)}><input aria-label={`Nama ${g.nama}`} value={g.nama} onChange={(e) => setGrup((lama) => lama.map((x) => x.id === g.id ? { ...x, nama: e.target.value } : x))} />{g.anggota.map((anak) => <div className="anggota-undian" key={anak.id}><button type="button" draggable onDragStart={(e) => e.dataTransfer.setData('siswa', anak.id)}>{anak.nama}</button><select aria-label={`Pindahkan ${anak.nama}`} value={g.id} onChange={(e) => pindah(anak.id, e.target.value)}>{grup.map((tujuan) => <option key={tujuan.id} value={tujuan.id}>{tujuan.nama}</option>)}</select></div>)}</article>)}</div></section>}
  </main>;
}

function formatWaktu(total: number) { const aman = Math.max(0, total); return `${String(Math.floor(aman / 60)).padStart(2, '0')}:${String(aman % 60).padStart(2, '0')}`; }

export function TimerKelasScreen() {
  const [mode, setMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [detik, setDetik] = useState(300);
  const [jalan, setJalan] = useState(false);
  const awal = useRef(300);
  useEffect(() => { if (!jalan) return; const id = window.setInterval(() => setDetik((lama) => mode === 'countdown' ? Math.max(0, lama - 1) : lama + 1), 1000); return () => clearInterval(id); }, [jalan, mode]);
  useEffect(() => { if (mode === 'countdown' && detik === 0) { setJalan(false); try { const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (AudioContextClass) { const audio = new AudioContextClass(); const osilator = audio.createOscillator(); osilator.connect(audio.destination); osilator.start(); osilator.stop(audio.currentTime + .25); } } catch { /* Perangkat tanpa WebAudio tetap menyelesaikan timer. */ } } }, [detik, mode]);
  function preset(nilai: number) { awal.current = nilai; setDetik(nilai); setJalan(false); }
  return <main className="alat-kelas timer-kelas" data-testid="timer-kelas"><Kepala label="Manajemen waktu" judul="Timer" deskripsi="Countdown dan stopwatch tetap berjalan saat orientasi layar berubah." /><div className="tab-alat"><button type="button" className={mode === 'countdown' ? 'aktif' : ''} onClick={() => { setMode('countdown'); preset(300); }}>Countdown</button><button type="button" className={mode === 'stopwatch' ? 'aktif' : ''} onClick={() => { setMode('stopwatch'); preset(0); }}>Stopwatch</button></div><section className="timer-panggung"><strong aria-live="polite">{formatWaktu(detik)}</strong>{mode === 'countdown' ? <div>{[60, 180, 300, 600, 900].map((nilai) => <button type="button" key={nilai} onClick={() => preset(nilai)}>{nilai / 60} menit</button>)}<label>Menit khusus<input type="number" min="1" max="180" onChange={(e) => preset(Number(e.target.value) * 60)} /></label></div> : null}<footer><button type="button" onClick={() => setJalan((x) => !x)}>{jalan ? 'Jeda' : detik === awal.current ? 'Mulai' : 'Lanjutkan'}</button><button type="button" onClick={() => { setJalan(false); setDetik(awal.current); }}>Reset</button></footer></section></main>;
}

interface RiwayatPoin { kelompokId: string; perubahan: number; waktu: string }
export function PoinKelompokScreen() {
  const { kelompok, tingkat, muat } = useDataKelas();
  const [riwayat, setRiwayat] = useState<RiwayatPoin[]>([]);
  const [khusus, setKhusus] = useState(1);
  async function ubah(id: string, perubahan: number) { await ubahPoinKelompok(id, perubahan); setRiwayat((lama) => [{ kelompokId: id, perubahan, waktu: new Date().toLocaleTimeString('id-ID') }, ...lama]); await muat(); }
  async function undo() { const terakhir = riwayat[0]; if (!terakhir) return; await ubahPoinKelompok(terakhir.kelompokId, -terakhir.perubahan); setRiwayat((lama) => lama.slice(1)); await muat(); }
  async function resetSemua() { if (!window.confirm('Reset seluruh poin kelompok pada kelas ini?')) return; for (const grup of kelompok) if (grup.poin_total) await ubahPoinKelompok(grup.id, -grup.poin_total); setRiwayat([]); await muat(); }
  return <main className="alat-kelas" data-testid="poin-kelompok"><Kepala label={`Kelas ${tingkat}`} judul="Poin Kelompok" deskripsi="Perubahan tersimpan lokal dan dapat dibatalkan melalui riwayat." />{!kelompok.length ? <section className="alat-kelas__kosong"><h2>Kelompok belum dibuat</h2><p>Buat kelompok dari Undian Nama atau data kelompok lama sebelum memberi poin.</p><Link to={RUTE.undianNama}>Buat kelompok</Link></section> : <><section className="kisi-poin">{kelompok.map((grup) => <article key={grup.id}><h2>{grup.nama}</h2><strong>{grup.poin_total}</strong><div>{[-10, -5, -1, 1, 5, 10].map((nilai) => <button type="button" key={nilai} onClick={() => void ubah(grup.id, nilai)}>{nilai > 0 ? '+' : ''}{nilai}</button>)}</div><button type="button" onClick={() => void ubah(grup.id, khusus)}>+{khusus} khusus</button></article>)}</section><section className="riwayat-poin"><header><label>Poin khusus<input type="number" min="1" max="100" value={khusus} onChange={(e) => setKhusus(Number(e.target.value))} /></label><div><button type="button" onClick={() => void undo()} disabled={!riwayat.length}>Undo terakhir</button><button type="button" onClick={() => void resetSemua()}>Reset semua</button></div></header><ol>{riwayat.map((item, i) => <li key={`${item.waktu}-${i}`}><span>{item.waktu}</span><b>{kelompok.find((x) => x.id === item.kelompokId)?.nama}</b><strong>{item.perubahan > 0 ? '+' : ''}{item.perubahan}</strong></li>)}</ol></section></>}</main>;
}
