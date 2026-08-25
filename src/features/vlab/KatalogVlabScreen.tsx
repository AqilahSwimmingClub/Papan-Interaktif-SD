import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { KATALOG_VLAB, LABEL_RUMPUN, type RumpunVlab } from '../../lib/vlab/katalogVlab';
import { RUTE, ruteVlab } from '../../routes/paths';
import { VLAB_KELAS5_IPAS_BAB2 } from './VlabKelas5Bab2Screen';
import { VLAB_KELAS5_IPAS_BAB3 } from './VlabKelas5Bab3Screen';
import './vlab.css';

type Penyaring = 'semua' | RumpunVlab;
const BAB1_KODE = ['light-ray','mirror','material','shadow','sound'] as const;

export function KatalogVlabScreen() {
  const [penyaring, setPenyaring] = useState<Penyaring>('semua');
  const rumpunTersedia = useMemo(() => [...new Set(KATALOG_VLAB.map((profil) => profil.rumpun))], []);
  const tersaring = useMemo(() => penyaring === 'semua' ? KATALOG_VLAB : KATALOG_VLAB.filter((profil) => profil.rumpun === penyaring), [penyaring]);
  const bab1 = KATALOG_VLAB.filter((profil) => BAB1_KODE.includes(profil.kode as typeof BAB1_KODE[number]));

  return <main className="halaman-vlab" data-testid="katalog-vlab">
    <header className="vlab-katalog__kop"><div><p className="label-data">IPAS Kelas V · master/percontohan</p><h1>VLAB / Simulasi</h1><p>Bab 1–3 masing-masing memiliki lima aktivitas VLAB yang dapat dijalankan langsung.</p></div><div className="vlab-katalog__angka"><div><strong>15</strong><span>VLAB Kelas V</span></div><div><strong>3</strong><span>bab aktif</span></div></div></header>

    <section className="vlab5-catalog" aria-label="VLAB IPAS Kelas V Bab 1"><div className="vlab5-catalog__head"><div><span>IPAS Kelas V</span><h2>Bab 1 · Melihat karena Cahaya, Mendengar karena Bunyi</h2><p>Eksperimen cahaya dan bunyi dengan kontrol dan hasil pengamatan yang berbeda.</p></div><strong>5 playable</strong></div><div className="vlab-grid">{bab1.map((profil)=><Link className="vlab-kartu vlab-kartu--kelas5" key={profil.kode} to={ruteVlab(profil.kode)} style={{ ['--vlab-warna' as string]: profil.warna }}><span className="vlab-kartu__ikon" aria-hidden="true">{profil.ikon}</span><span className="vlab-rumpun">{LABEL_RUMPUN[profil.rumpun]}</span><h2>{profil.nama}</h2><p>{profil.tujuan}</p><dl><dt>Alat</dt><dd>{profil.alat.join(', ')}</dd><dt>Yang diamati</dt><dd>{profil.keluaran.join(', ')}</dd></dl><span className="vlab-kartu__buka">Mulai VLAB →</span></Link>)}</div></section>

    <section className="vlab5-catalog" aria-label="VLAB IPAS Kelas V Bab 2"><div className="vlab5-catalog__head"><div><span>IPAS Kelas V</span><h2>Bab 2 · Harmoni dalam Ekosistem</h2><p>Lima simulasi dengan alat, input, hasil, dan pengamatan yang berbeda.</p></div><strong>5 playable</strong></div><div className="vlab-grid">{VLAB_KELAS5_IPAS_BAB2.map((profil)=><Link className="vlab-kartu vlab-kartu--kelas5" key={profil.kode} to={`${RUTE.vlab}/kelas5-bab2/${profil.kode}`}><span className="vlab-kartu__ikon" aria-hidden="true">{profil.ikon}</span><span className="vlab-rumpun">{profil.topik}</span><h2>{profil.nama}</h2><p>{profil.tujuan}</p><span className="vlab-kartu__buka">Mulai VLAB →</span></Link>)}</div></section>

    <section className="vlab5-catalog" aria-label="VLAB IPAS Kelas V Bab 3"><div className="vlab5-catalog__head"><div><span>IPAS Kelas V</span><h2>Bab 3 · Magnet, Listrik, dan Teknologi untuk Kehidupan</h2><p>Lima simulasi berbeda untuk magnet, rangkaian, penghantar, elektromagnet, dan transformasi energi.</p></div><strong>5 playable</strong></div><div className="vlab-grid">{VLAB_KELAS5_IPAS_BAB3.map((profil)=><Link className="vlab-kartu vlab-kartu--kelas5" key={profil.kode} to={`${RUTE.vlab}/kelas5-bab3/${profil.kode}`}><span className="vlab-kartu__ikon" aria-hidden="true">{profil.ikon}</span><span className="vlab-rumpun">{profil.topik}</span><h2>{profil.nama}</h2><p>{profil.tujuan}</p><span className="vlab-kartu__buka">Mulai VLAB →</span></Link>)}</div></section>

    <h2 className="vlab-subjudul">Semua laboratorium</h2>
    <nav className="vlab-saring" aria-label="Saring laboratorium menurut rumpun"><button type="button" aria-pressed={penyaring === 'semua'} onClick={() => setPenyaring('semua')}>Semua lab</button>{rumpunTersedia.map((rumpun) => <button key={rumpun} type="button" aria-pressed={penyaring === rumpun} onClick={() => setPenyaring(rumpun)}>{LABEL_RUMPUN[rumpun]}</button>)}</nav>
    <section className="vlab-grid" aria-label="Daftar laboratorium virtual umum">{tersaring.map((profil) => <Link className="vlab-kartu" key={profil.kode} to={ruteVlab(profil.kode)} style={{ ['--vlab-warna' as string]: profil.warna }}><span className="vlab-kartu__ikon" aria-hidden="true">{profil.ikon}</span><span className="vlab-rumpun">{LABEL_RUMPUN[profil.rumpun]}</span><h2>{profil.nama}</h2><p>{profil.tujuan}</p><dl><dt>Alat</dt><dd>{profil.alat.join(', ')}</dd><dt>Yang diamati</dt><dd>{profil.keluaran.join(', ')}</dd></dl><span className="vlab-kartu__buka">Buka laboratorium →</span></Link>)}</section>
  </main>;
}
