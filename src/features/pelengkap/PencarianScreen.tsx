import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { cariGlobal, type HasilPencarian } from '../../lib/storage/pelengkapRepo';
import './pelengkap.css';

const LABEL = { kurikulum: 'Kurikulum', materi: 'Materi', media: 'Media', siswa: 'Siswa' } as const;

export function PencarianScreen() {
  const [parameter, setParameter] = useSearchParams();
  const [kata, setKata] = useState(parameter.get('q') ?? '');
  const [hasil, setHasil] = useState<HasilPencarian[]>([]);
  const [memuat, setMemuat] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setParameter(kata.trim() ? { q: kata.trim() } : {}, { replace: true });
      setMemuat(true);
      void cariGlobal(kata).then(setHasil).finally(() => setMemuat(false));
    }, 180);
    return () => window.clearTimeout(id);
  }, [kata, setParameter]);

  const kelompok = (['kurikulum','materi','media','siswa'] as const).map((jenis) => ({ jenis, isi: hasil.filter((item) => item.jenis === jenis) })).filter((item) => item.isi.length);
  return (
    <main className="halaman-pelengkap halaman-pencarian" data-testid="layar-pencarian">
      <header className="pelengkap-kop"><div><p className="label-data">Pencarian offline</p><h1>Pencarian Global</h1><p>Hasil kurikulum selalu di atas, lalu materi, media, dan siswa.</p></div></header>
      <label className="isian-pencarian"><span aria-hidden="true">⌕</span><input autoFocus value={kata} onChange={(e) => setKata(e.target.value)} placeholder="Cari TP, materi, media, atau siswa…" /><kbd>Ctrl K</kbd></label>
      {memuat ? <div className="kerangka-hasil" aria-label="Mencari"><span/><span/><span/></div> : kata.trim().length < 2 ? <section className="keadaan-kosong keadaan-kosong--fitur"><h2>Ketik sedikitnya dua huruf</h2><p>Pencarian berjalan dari data yang sudah tersimpan pada perangkat.</p></section> : kelompok.length ? <div className="kelompok-hasil-cari">{kelompok.map((grup) => <section key={grup.jenis}><header><h2>{LABEL[grup.jenis]}</h2><span>{grup.isi.length}</span></header>{grup.isi.map((item) => <Link key={`${item.jenis}-${item.id}`} to={item.tujuan}><span>{item.jenis === 'kurikulum' ? 'TP' : item.jenis.toUpperCase()}</span><div><strong>{item.judul}</strong><small>{item.keterangan}</small></div><b aria-hidden="true">→</b></Link>)}</section>)}</div> : <section className="keadaan-kosong keadaan-kosong--fitur"><h2>Tidak ada hasil untuk “{kata.trim()}”</h2><p>Coba kata yang lebih pendek atau periksa media dan siswa yang sudah disimpan.</p><button className="tombol-guru" type="button" onClick={() => setKata('')}>Bersihkan Pencarian</button></section>}
    </main>
  );
}
