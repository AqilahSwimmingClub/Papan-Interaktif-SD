import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { daftarKelompokKelas, daftarSiswaKelas, sesiLewatKode } from '../../lib/storage/kelasRepo';
import { PESAN_MENUNGGU_BUKU_GAME } from '../../lib/referensi/strukturReferensi';
import { KATALOG_VLAB } from '../../lib/vlab/katalogVlab';
import type { Kelompok, SesiPembelajaran, Siswa } from '../../lib/types';
import { ruteVlab } from '../../routes/paths';
import './mode-kelas.css';
import './mode-siswa-game.css';

export function ModeSiswaScreen() {
  const [kode, setKode] = useState('');
  const [sesi, setSesi] = useState<SesiPembelajaran | null>(null);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelompok, setKelompok] = useState<Array<Kelompok & { anggota: Siswa[] }>>([]);
  const [aktif, setAktif] = useState<Siswa | null>(null);
  const [pesan, setPesan] = useState('');
  const tahanRef = useRef<number | null>(null);

  async function cariSesi() {
    const ditemukan = await sesiLewatKode(kode);
    if (!ditemukan) { setPesan('Kode sesi belum ditemukan pada perangkat ini.'); return; }
    const [daftarSiswa, daftarKelompok] = await Promise.all([
      daftarSiswaKelas(ditemukan.kelas_id), daftarKelompokKelas(ditemukan.kelas_id),
    ]);
    setSesi(ditemukan); setSiswa(daftarSiswa); setKelompok(daftarKelompok); setPesan('');
  }

  function mulaiTahan() {
    tahanRef.current = window.setTimeout(() => { setAktif(null); setSesi(null); setKode(''); }, 3000);
  }
  function batalTahan() {
    if (tahanRef.current) window.clearTimeout(tahanRef.current);
    tahanRef.current = null;
  }

  if (aktif && sesi) {
    const grup = kelompok.find((item) => item.id === aktif.kelompok_id);
    return <main className="mode-siswa mode-siswa--aktif" data-testid="mode-siswa">
      <header><span className="avatar-siswa">{aktif.nama.split(/\s+/).map((x) => x[0]).slice(0, 2).join('')}</span><div><h1>{aktif.nama.split(' ')[0]}</h1><p>{grup ? `Kelompok ${grup.nama}` : 'Belum masuk kelompok'}</p></div><button type="button" onPointerDown={mulaiTahan} onPointerUp={batalTahan} onPointerLeave={batalTahan}>Tahan 3 detik untuk keluar</button></header>
      <section className="siswa-sekarang"><span>Sekarang</span><h2>Sesi pembelajaran aktif</h2><p>Ikuti arahan guru di papan kelas.</p><Link to={ruteVlab(KATALOG_VLAB[0]!.kode)}>Buka laboratorium virtual</Link></section>
      <section className="ringkasan-siswa"><article><span>Tujuan tuntas</span><strong>—</strong><small>Menunggu hasil pertamamu</small></article><article><span>Lencanaku</span><strong>0</strong><small>Belum ada badge</small></article><article><span>Kelompokku</span><strong>{grup?.nama ?? '—'}</strong><small>{grup ? `${grup.anggota.length} anggota` : 'Guru akan mengatur kelompok'}</small></article></section>
      <section className="latihan-siswa"><h2>Latihan untukku</h2><div className="pilih-nama-siswa">{KATALOG_VLAB.slice(0, 6).map((profil) => <Link key={profil.kode} to={ruteVlab(profil.kode)}>{profil.ikon} {profil.nama}<small>{profil.tujuan}</small></Link>)}</div><p className="kosong-siswa">{PESAN_MENUNGGU_BUKU_GAME}</p></section>
    </main>;
  }

  return <main className="mode-siswa mode-siswa--gabung" data-testid="mode-siswa"><section><div className="mode-siswa__merek">PI</div><p>Papan Interaktif SD</p><h1>{sesi ? 'Pilih namamu' : 'Masukkan kode'}</h1>{!sesi ? <><div className="input-kode"><input value={kode} onChange={(e) => setKode(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" aria-label="Kode sesi 4 angka" placeholder="••••"/><button type="button" onClick={() => void cariSesi()} disabled={kode.length !== 4}>Lanjut</button></div>{pesan ? <p role="alert">{pesan}</p> : null}<small>Empat angka dari papan kelas · tanpa kata sandi</small></> : siswa.length ? <div className="pilih-nama-siswa">{siswa.map((anak) => <button key={anak.id} type="button" onClick={() => setAktif(anak)}><span>{anak.nomor_absen}</span>{anak.nama}</button>)}</div> : <div className="kosong-siswa">Belum ada siswa pada kelas sesi ini. Minta guru menambahkan data siswa.</div>}</section></main>;
}
