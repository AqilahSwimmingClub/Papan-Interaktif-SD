import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { daftarMateriUntukTp } from '../../lib/storage/kurikulumAdminRepo';
import { daftarKelompokKelas, pastikanKelasKerja } from '../../lib/storage/kelasRepo';
import { bacaSekolah } from '../../lib/storage/sekolahRepo';
import type { Kelompok, Materi, Sekolah, Siswa } from '../../lib/types';
import { RUTE, ruteCpTp } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './mode-kelas.css';

export function ModeKelasScreen() {
  const { akun } = useAuth();
  const { konteks } = useKurikulum();
  const [sekolah, setSekolah] = useState<Sekolah | null>(null);
  const [kelompok, setKelompok] = useState<Array<Kelompok & { anggota: Siswa[] }>>([]);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [waktu, setWaktu] = useState(new Date());
  const [giliran, setGiliran] = useState(0);
  const [skor, setSkor] = useState<Record<string, number>>({});

  useEffect(() => { const id = window.setInterval(() => setWaktu(new Date()), 30_000); return () => window.clearInterval(id); }, []);
  useEffect(() => {
    if (!akun || !konteks.tingkat_kelas) return;
    let hidup = true;
    void pastikanKelasKerja(konteks.tingkat_kelas, akun.id).then(async (kelas) => {
      const [identitas, grup, daftarMateri] = await Promise.all([bacaSekolah(), daftarKelompokKelas(kelas.id), konteks.tp_id ? daftarMateriUntukTp(konteks.tp_id) : []]);
      if (!hidup) return;
      setSekolah(identitas ?? null); setKelompok(grup); setMateri(daftarMateri);
      setSkor(Object.fromEntries(grup.map((item) => [item.id, item.poin_total])));
    });
    return () => { hidup = false; };
  }, [akun, konteks.tingkat_kelas, konteks.tp_id]);
  const semuaSiswa = useMemo(() => kelompok.flatMap((grup) => grup.anggota), [kelompok]);
  const siswaAktif = semuaSiswa[giliran % Math.max(1, semuaSiswa.length)];
  const peringkat = [...kelompok].sort((a,b) => (skor[b.id] ?? 0) - (skor[a.id] ?? 0)).slice(0,3);

  if (!konteks.tingkat_kelas || !konteks.mapel_kode) return <main className="mode-kelas mode-kelas--kosong"><section><h1>Pilih kelas dan mata pelajaran lebih dulu</h1><p>Mode Kelas memakai konteks kurikulum yang sama dengan layar Guru.</p><Link to={RUTE.kelas}>Pilih Kelas</Link></section></main>;
  return <main className="mode-kelas" data-testid="mode-kelas"><header className="mode-kelas__kop"><Link to={ruteCpTp(konteks.tingkat_kelas, konteks.mapel_kode)} aria-label="Kembali ke layar guru">←</Link><div><strong>{konteks.mapel_kode} · Kelas {konteks.tingkat_kelas}</strong><span>{sekolah?.nama || 'Identitas sekolah belum dilengkapi'}{konteks.tp_id ? ` · ${konteks.tp_id}` : ''}</span></div><time>{waktu.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</time><button type="button" onClick={() => void document.documentElement.requestFullscreen?.()}>⛶</button></header><div className="mode-kelas__isi"><section className="tayangan-kelas"><span className="label-kelas">Materi pembelajaran</span><h1>{materi[0]?.judul ?? 'Siapkan materi untuk TP aktif'}</h1>{materi[0]?.blok.length ? <div className="blok-tayang">{materi[0].blok.slice(0,2).map((blok) => <p key={blok.id}>{blok.isi}</p>)}</div> : <p className="tayangan-kosong">Papan siap digunakan. Materi yang disimpan akan tampil di area ini.</p>}<div className="navigasi-tayangan"><button type="button">Halaman sebelumnya</button><Link to={RUTE.papan}>Buka Papan Tulis</Link><Link to="/pembelajaran/game">Mulai Game</Link><button type="button" onClick={() => setGiliran((nilai) => nilai + 1)}>Undi nama</button><button type="button">Halaman berikutnya</button></div></section><aside className="panel-kelas"><section><h2>Papan skor kelompok</h2>{peringkat.length ? peringkat.map((grup, indeks) => <article key={grup.id}><b>{indeks+1}</b><span>{grup.nama}</span><button type="button" onClick={() => setSkor((lama) => ({...lama,[grup.id]:(lama[grup.id]??0)+10}))}>+10</button><strong>{skor[grup.id] ?? 0}</strong></article>) : <p>Kelompok belum dibuat.</p>}</section><section className="giliran-kelas"><span>Giliran sekarang</span><strong>{siswaAktif?.nama ?? 'Belum ada siswa'}</strong><small>{kelompok.find((grup) => grup.id === siswaAktif?.kelompok_id)?.nama ?? 'Tambahkan siswa dan kelompok'}</small></section><section><span className="label-kelas">Selanjutnya</span><h2>Aktivitas bersama kelas</h2><p>{konteks.tp_id ? 'Game, papan, dan asesmen memakai TP yang sama.' : 'Pilih TP untuk mengaktifkan aktivitas.'}</p></section></aside></div></main>;
}
