import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { buatKatalogGameUntukTp } from '../../lib/storage/gameRepo';
import { daftarKelompokKelas, daftarSiswaKelas, sesiLewatKode } from '../../lib/storage/kelasRepo';
import type { GamePembelajaran, Kelompok, SesiPembelajaran, Siswa } from '../../lib/types';
import { ruteMainGame } from '../../routes/paths';
import './mode-kelas.css';
import './mode-siswa-game.css';

export function ModeSiswaScreen() {
  const [kode, setKode] = useState('');
  const [sesi, setSesi] = useState<SesiPembelajaran | null>(null);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelompok, setKelompok] = useState<Array<Kelompok & { anggota: Siswa[] }>>([]);
  const [aktif, setAktif] = useState<Siswa | null>(null);
  const [game, setGame] = useState<GamePembelajaran[]>([]);
  const [pesan, setPesan] = useState('');
  const tahanRef = useRef<number | null>(null);

  useEffect(() => {
    if (!aktif || !sesi) return;
    void buatKatalogGameUntukTp(sesi.tp_id).then(setGame).catch(() => setGame([]));
  }, [aktif, sesi]);

  async function cariSesi() {
    const ditemukan = await sesiLewatKode(kode);
    if (!ditemukan) { setPesan('Kode sesi belum ditemukan pada perangkat ini.'); return; }
    const [daftarSiswa, daftarKelompok] = await Promise.all([
      daftarSiswaKelas(ditemukan.kelas_id), daftarKelompokKelas(ditemukan.kelas_id),
    ]);
    setSesi(ditemukan); setSiswa(daftarSiswa); setKelompok(daftarKelompok); setPesan('');
  }

  function mulaiTahan() {
    tahanRef.current = window.setTimeout(() => { setAktif(null); setSesi(null); setKode(''); setGame([]); }, 3000);
  }
  function batalTahan() {
    if (tahanRef.current) window.clearTimeout(tahanRef.current);
    tahanRef.current = null;
  }

  if (aktif && sesi) {
    const grup = kelompok.find((item) => item.id === aktif.kelompok_id);
    return <main className="mode-siswa mode-siswa--aktif" data-testid="mode-siswa">
      <header><span className="avatar-siswa">{aktif.nama.split(/\s+/).map((x) => x[0]).slice(0, 2).join('')}</span><div><h1>{aktif.nama.split(' ')[0]}</h1><p>{grup ? `Kelompok ${grup.nama}` : 'Belum masuk kelompok'}</p></div><button type="button" onPointerDown={mulaiTahan} onPointerUp={batalTahan} onPointerLeave={batalTahan}>Tahan 3 detik untuk keluar</button></header>
      <section className="siswa-sekarang"><span>Sekarang</span><h2>Sesi pembelajaran aktif</h2><p>{sesi.tp_id}</p>{game[0] ? <Link to={`${ruteMainGame(game[0].id)}?siswa=${encodeURIComponent(aktif.id)}&sesi=${encodeURIComponent(sesi.id)}`}>Mulai game</Link> : <button type="button" disabled>Menyiapkan game…</button>}</section>
      <section className="ringkasan-siswa"><article><span>Tujuan tuntas</span><strong>—</strong><small>Menunggu hasil pertamamu</small></article><article><span>Lencanaku</span><strong>0</strong><small>Belum ada badge</small></article><article><span>Kelompokku</span><strong>{grup?.nama ?? '—'}</strong><small>{grup ? `${grup.anggota.length} anggota` : 'Guru akan mengatur kelompok'}</small></article></section>
      <section className="latihan-siswa"><h2>Latihan untukku</h2>{game.length ? <div className="pilih-nama-siswa">{game.slice(0, 6).map((item) => <Link key={item.id} to={`${ruteMainGame(item.id)}?siswa=${encodeURIComponent(aktif.id)}&sesi=${encodeURIComponent(sesi.id)}`}>{item.judul}<small>{item.jumlah_butir} butir · {item.durasi_menit} menit</small></Link>)}</div> : <div className="kosong-siswa">Game sedang disiapkan dari TP aktif.</div>}</section>
    </main>;
  }

  return <main className="mode-siswa mode-siswa--gabung" data-testid="mode-siswa"><section><div className="mode-siswa__merek">PI</div><p>Papan Interaktif SD</p><h1>{sesi ? 'Pilih namamu' : 'Masukkan kode'}</h1>{!sesi ? <><div className="input-kode"><input value={kode} onChange={(e) => setKode(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" aria-label="Kode sesi 4 angka" placeholder="••••"/><button type="button" onClick={() => void cariSesi()} disabled={kode.length !== 4}>Lanjut</button></div>{pesan ? <p role="alert">{pesan}</p> : null}<small>Empat angka dari papan kelas · tanpa kata sandi</small></> : siswa.length ? <div className="pilih-nama-siswa">{siswa.map((anak) => <button key={anak.id} type="button" onClick={() => setAktif(anak)}><span>{anak.nomor_absen}</span>{anak.nama}</button>)}</div> : <div className="kosong-siswa">Belum ada siswa pada kelas sesi ini. Minta guru menambahkan data siswa.</div>}</section></main>;
}
