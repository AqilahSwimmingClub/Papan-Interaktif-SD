import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  daftarMapelUntukKelas,
  type RingkasanMapel,
} from '../../lib/storage/kurikulumRepo';
import type { KodeFase } from '../../lib/types';
import { log } from '../../lib/errors/logger';
import { useKurikulum } from '../../state/useKurikulum';
import { RUTE, ruteCpTp } from '../../routes/paths';
import './kurikulum.css';

function faseKelas(tingkat: number): KodeFase {
  if (tingkat <= 2) return 'A';
  if (tingkat <= 4) return 'B';
  return 'C';
}

function labelStatus(mapel: RingkasanMapel): string {
  if (mapel.status === 'wajib') return 'Wajib';
  if (mapel.status === 'wajib_sesuai_agama') return 'Sesuai agama';
  if (mapel.status === 'pilihan_cabang_seni_default') return 'Bawaan sekolah';
  if (mapel.status === 'pilihan_cabang_seni') return 'Cabang seni';
  return 'Pilihan';
}

export function PilihMapelScreen() {
  const { tingkat: tingkatParam } = useParams();
  const tingkat = Number(tingkatParam);
  const valid = Number.isInteger(tingkat) && tingkat >= 1 && tingkat <= 6;
  const faseKode = valid ? faseKelas(tingkat) : 'A';
  const { pilihKelas } = useKurikulum();
  const [mapel, setMapel] = useState<RingkasanMapel[]>([]);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    if (!valid) return;
    pilihKelas(tingkat, faseKode);
    void daftarMapelUntukKelas(tingkat)
      .then(setMapel)
      .catch((galat: unknown) => {
        log.galat('Mata pelajaran gagal dimuat.', galat);
        setGagal(true);
      });
  }, [faseKode, pilihKelas, tingkat, valid]);

  const kelompok = useMemo(
    () => ({
      wajib: mapel.filter((item) => item.status === 'wajib'),
      agama: mapel.filter((item) => item.status === 'wajib_sesuai_agama'),
      seni: mapel.filter((item) => item.status.startsWith('pilihan_cabang_seni')),
      pilihan: mapel.filter(
        (item) =>
          item.status === 'pilihan' || item.status === 'sesuai_konfigurasi_sekolah',
      ),
    }),
    [mapel],
  );

  if (!valid) {
    return (
      <main className="halaman-kurikulum">
        <div className="keadaan-kosong keadaan-kosong--galat">
          <h1>Kelas tidak dikenal</h1>
          <p>Pilih kelas 1 sampai 6 dari daftar kelas.</p>
          <Link className="tombol-guru tombol-guru--utama" to={RUTE.kelas}>
            Kembali ke Pilih Kelas
          </Link>
        </div>
      </main>
    );
  }

  const bagian: Array<{
    judul: string;
    keterangan: string;
    daftar: RingkasanMapel[];
  }> = [
    {
      judul: 'Mata pelajaran wajib',
      keterangan: `Struktur resmi Fase ${faseKode}.`,
      daftar: kelompok.wajib,
    },
    {
      judul: 'Agama dan Budi Pekerti',
      keterangan: 'Pilih sesuai agama yang diajarkan; seluruh CP memakai Nomor 020 Tahun 2026.',
      daftar: kelompok.agama,
    },
    {
      judul: 'Seni dan Budaya',
      keterangan: 'Seni Rupa adalah bawaan; cabang lain tetap tersedia dalam dataset final.',
      daftar: kelompok.seni,
    },
    {
      judul: 'Mata pelajaran pilihan',
      keterangan: 'Ketersediaan mengikuti kelas pada dataset dan pengaturan kurikulum sekolah.',
      daftar: kelompok.pilihan,
    },
  ];

  return (
    <main className="halaman-kurikulum halaman-pilih-mapel">
      <nav className="remah-kurikulum" aria-label="Konteks kurikulum">
        <Link to={RUTE.kelas}>Kelas</Link>
        <span>/</span>
        <strong>Kelas {tingkat}</strong>
        <span>/</span>
        <span>Fase {faseKode}</span>
        <span>/</span>
        <span>Pilih mata pelajaran</span>
      </nav>

      <header className="kop-kurikulum">
        <div>
          <p className="label-data">Langkah 2 dari 3 · Fase {faseKode}</p>
          <h1>Mata pelajaran Kelas {tingkat}</h1>
          <p>CP, elemen, dan TP di bawah dihitung langsung dari database lokal final.</p>
        </div>
        <Link className="tombol-guru tombol-guru--sekunder" to="/fitur/pengaturan-kurikulum">
          Atur mapel pilihan
        </Link>
      </header>

      {gagal ? (
        <div className="keadaan-kosong keadaan-kosong--galat" role="alert">
          <h2>Mata pelajaran belum dapat dibaca</h2>
          <p>Muat ulang halaman untuk mencoba kembali.</p>
        </div>
      ) : null}

      {bagian.map((blok) =>
        blok.daftar.length ? (
          <section className="kelompok-mapel" key={blok.judul}>
            <div className="kelompok-mapel__kop">
              <h2>{blok.judul}</h2>
              <p>{blok.keterangan}</p>
            </div>
            <div className="kisi-mapel">
              {blok.daftar.map((item) => (
                <Link
                  className="kartu-mapel"
                  key={item.kode}
                  to={ruteCpTp(tingkat, item.kode)}
                >
                  <div className="kartu-mapel__kode">{item.kode}</div>
                  <div className="kartu-mapel__isi">
                    <span className="badge-mapel">{labelStatus(item)}</span>
                    <h3>{item.nama}</h3>
                    <p>
                      {item.jumlahElemen} elemen · {item.jumlahTp} TP Rekomendasi
                    </p>
                    <small>{item.dokumen_kode}</small>
                  </div>
                  <span className="kartu-mapel__panah" aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null,
      )}

      {tingkat < 5 ? (
        <aside className="mapel-tidak-tersedia">
          <strong>Koding dan Kecerdasan Artifisial belum tersedia.</strong>
          <span>Mapel pilihan ini hanya dapat diaktifkan pada kelas 5 dan 6.</span>
        </aside>
      ) : null}
    </main>
  );
}
