import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { KATALOG_VLAB, LABEL_RUMPUN, type RumpunVlab } from '../../lib/vlab/katalogVlab';
import { RUTE, ruteVlab } from '../../routes/paths';
import { VLAB_KELAS5_IPAS_BAB2 } from './VlabKelas5Bab2Screen';
import './vlab.css';

type Penyaring = 'semua' | RumpunVlab;

export function KatalogVlabScreen() {
  const [penyaring, setPenyaring] = useState<Penyaring>('semua');
  const rumpunTersedia = useMemo(() => [...new Set(KATALOG_VLAB.map((profil) => profil.rumpun))], []);
  const tersaring = useMemo(() => penyaring === 'semua' ? KATALOG_VLAB : KATALOG_VLAB.filter((profil) => profil.rumpun === penyaring), [penyaring]);

  return (
    <main className="halaman-vlab" data-testid="katalog-vlab">
      <header className="vlab-katalog__kop">
        <div>
          <p className="label-data">Kelas V menjadi master/percontohan</p>
          <h1>VLAB / Simulasi</h1>
          <p>VLAB khusus Bab 2 IPAS Kelas V sudah terhubung ke buku referensi. Laboratorium umum tetap tersedia sebagai alat eksplorasi tambahan.</p>
        </div>
        <div className="vlab-katalog__angka"><div><strong>{VLAB_KELAS5_IPAS_BAB2.length}</strong><span>VLAB Bab 2</span></div><div><strong>{KATALOG_VLAB.length}</strong><span>lab umum</span></div></div>
      </header>

      <section className="vlab5-catalog" aria-label="VLAB IPAS Kelas V Bab 2">
        <div className="vlab5-catalog__head"><div><span>IPAS Kelas V</span><h2>Bab 2 · Harmoni dalam Ekosistem</h2><p>Lima simulasi dengan alat, input, hasil, dan pengamatan yang berbeda.</p></div><strong>5 playable</strong></div>
        <div className="vlab-grid">
          {VLAB_KELAS5_IPAS_BAB2.map((profil)=>(
            <Link className="vlab-kartu vlab-kartu--kelas5" key={profil.kode} to={`${RUTE.vlab}/kelas5-bab2/${profil.kode}`}>
              <span className="vlab-kartu__ikon" aria-hidden="true">{profil.ikon}</span>
              <span className="vlab-rumpun">{profil.topik}</span>
              <h2>{profil.nama}</h2><p>{profil.tujuan}</p><span className="vlab-kartu__buka">Mulai VLAB →</span>
            </Link>
          ))}
        </div>
      </section>

      <h2 className="vlab-subjudul">Laboratorium umum</h2>
      <nav className="vlab-saring" aria-label="Saring laboratorium menurut rumpun">
        <button type="button" aria-pressed={penyaring === 'semua'} onClick={() => setPenyaring('semua')}>Semua lab</button>
        {rumpunTersedia.map((rumpun) => <button key={rumpun} type="button" aria-pressed={penyaring === rumpun} onClick={() => setPenyaring(rumpun)}>{LABEL_RUMPUN[rumpun]}</button>)}
      </nav>

      <section className="vlab-grid" aria-label="Daftar laboratorium virtual umum">
        {tersaring.map((profil) => (
          <Link className="vlab-kartu" key={profil.kode} to={ruteVlab(profil.kode)} style={{ ['--vlab-warna' as string]: profil.warna }}>
            <span className="vlab-kartu__ikon" aria-hidden="true">{profil.ikon}</span><span className="vlab-rumpun">{LABEL_RUMPUN[profil.rumpun]}</span><h2>{profil.nama}</h2><p>{profil.tujuan}</p>
            <dl><dt>Alat</dt><dd>{profil.alat.join(', ')}</dd><dt>Yang diamati</dt><dd>{profil.keluaran.join(', ')}</dd></dl><span className="vlab-kartu__buka">Buka laboratorium →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
