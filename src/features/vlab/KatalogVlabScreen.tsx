import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  KATALOG_VLAB,
  LABEL_RUMPUN,
  type RumpunVlab,
} from '../../lib/vlab/katalogVlab';
import { ruteVlab } from '../../routes/paths';
import './vlab.css';

type Penyaring = 'semua' | RumpunVlab;

export function KatalogVlabScreen() {
  const [penyaring, setPenyaring] = useState<Penyaring>('semua');

  const rumpunTersedia = useMemo(
    () => [...new Set(KATALOG_VLAB.map((profil) => profil.rumpun))],
    [],
  );
  const tersaring = useMemo(
    () =>
      penyaring === 'semua'
        ? KATALOG_VLAB
        : KATALOG_VLAB.filter((profil) => profil.rumpun === penyaring),
    [penyaring],
  );

  return (
    <main className="halaman-vlab" data-testid="katalog-vlab">
      <header className="vlab-katalog__kop">
        <div>
          <p className="label-data">Laboratorium virtual · berjalan tanpa internet</p>
          <h1>VLAB / Simulasi</h1>
          <p>
            Setiap laboratorium memiliki alat, variabel, dan logika simulasi sendiri. Ubah
            kontrolnya, dan panggung percobaan langsung berubah beserta hasil pengukurannya.
          </p>
        </div>
        <div className="vlab-katalog__angka">
          <div>
            <strong>{KATALOG_VLAB.length}</strong>
            <span>laboratorium</span>
          </div>
          <div>
            <strong>{rumpunTersedia.length}</strong>
            <span>rumpun materi</span>
          </div>
        </div>
      </header>

      <nav className="vlab-saring" aria-label="Saring laboratorium menurut rumpun">
        <button
          type="button"
          aria-pressed={penyaring === 'semua'}
          onClick={() => setPenyaring('semua')}
        >
          Semua lab
        </button>
        {rumpunTersedia.map((rumpun) => (
          <button
            key={rumpun}
            type="button"
            aria-pressed={penyaring === rumpun}
            onClick={() => setPenyaring(rumpun)}
          >
            {LABEL_RUMPUN[rumpun]}
          </button>
        ))}
      </nav>

      <section className="vlab-grid" aria-label="Daftar laboratorium virtual">
        {tersaring.map((profil) => (
          <Link
            className="vlab-kartu"
            key={profil.kode}
            to={ruteVlab(profil.kode)}
            style={{ ['--vlab-warna' as string]: profil.warna }}
          >
            <span className="vlab-kartu__ikon" aria-hidden="true">
              {profil.ikon}
            </span>
            <span className="vlab-rumpun">{LABEL_RUMPUN[profil.rumpun]}</span>
            <h2>{profil.nama}</h2>
            <p>{profil.tujuan}</p>
            <dl>
              <dt>Alat</dt>
              <dd>{profil.alat.join(', ')}</dd>
              <dt>Yang diamati</dt>
              <dd>{profil.keluaran.join(', ')}</dd>
            </dl>
            <span className="vlab-kartu__buka">Buka laboratorium →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
