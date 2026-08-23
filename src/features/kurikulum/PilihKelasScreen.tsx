import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { daftarKelas, type RingkasanKelas } from '../../lib/storage/kurikulumRepo';
import type { KodeFase } from '../../lib/types';
import { log } from '../../lib/errors/logger';
import { useKurikulum } from '../../state/useKurikulum';
import { ruteMapel } from '../../routes/paths';
import './kurikulum.css';

type PenyaringFase = 'SEMUA' | KodeFase;

export function PilihKelasScreen() {
  const { pilihKelas } = useKurikulum();
  const [kelas, setKelas] = useState<RingkasanKelas[]>([]);
  const [penyaring, setPenyaring] = useState<PenyaringFase>('SEMUA');
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    void daftarKelas()
      .then(setKelas)
      .catch((galat: unknown) => {
        log.galat('Daftar kelas gagal dimuat.', galat);
        setGagal(true);
      });
  }, []);

  const tersaring = kelas.filter(
    (item) => penyaring === 'SEMUA' || item.fase_kode === penyaring,
  );

  return (
    <main className="halaman-kurikulum halaman-pilih-kelas">
      <header className="kop-kurikulum">
        <div>
          <p className="label-data">Langkah 1 dari 3</p>
          <h1>Kelas & Mata Pelajaran</h1>
          <p>Fase menentukan struktur mata pelajaran dan konteks pembelajaran.</p>
        </div>
        <Link className="tombol-guru tombol-guru--utama" to="/pembelajaran/papan">
          Buka Papan
        </Link>
      </header>

      <section className="panel-kurikulum" aria-labelledby="judul-pilih-kelas">
        <div className="panel-kurikulum__kop">
          <div>
            <h2 id="judul-pilih-kelas">Pilih kelas</h2>
            <p>Konteks terakhir tersimpan lokal untuk akun yang sedang masuk.</p>
          </div>
          <div className="penyaring-fase" aria-label="Saring berdasarkan fase">
            {(['SEMUA', 'A', 'B', 'C'] as const).map((fase) => (
              <button
                type="button"
                key={fase}
                className={penyaring === fase ? 'penyaring-fase__aktif' : ''}
                onClick={() => setPenyaring(fase)}
              >
                {fase === 'SEMUA' ? 'Semua fase' : `Fase ${fase}`}
              </button>
            ))}
          </div>
        </div>

        {gagal ? (
          <div className="keadaan-kosong keadaan-kosong--galat" role="alert">
            <h3>Daftar kelas belum dapat dibaca</h3>
            <p>Muat ulang halaman untuk mencoba kembali.</p>
          </div>
        ) : (
          <div className="kisi-kelas">
            {tersaring.map((item) => (
              <Link
                className={`kartu-kelas fase-${item.fase_kode.toLowerCase()}`}
                key={item.tingkat}
                to={ruteMapel(item.tingkat)}
                onClick={() => pilihKelas(item.tingkat, item.fase_kode)}
              >
                <div className="kartu-kelas__atas">
                  <span>Fase {item.fase_kode}</span>
                  <small>{item.jumlahPilihanMapel} pilihan mapel/cabang</small>
                </div>
                <strong>Kelas {item.tingkat}</strong>
                <p>{item.jumlahTp} TP Rekomendasi pada dataset final</p>
                <span className="kartu-kelas__aksi">Buka mata pelajaran →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
