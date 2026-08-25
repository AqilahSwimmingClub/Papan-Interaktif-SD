import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { log } from '../../lib/errors/logger';
import {
  bacaStrukturKelasMapel,
  type StrukturKelasMapel,
} from '../../lib/storage/bukuReferensiRepo';
import { daftarMapelUntukKelas, type RingkasanMapel } from '../../lib/storage/kurikulumRepo';
import {
  PESAN_MENUNGGU_BUKU,
  RANTAI_REFERENSI,
} from '../../lib/referensi/strukturReferensi';
import { useKurikulum } from '../../state/useKurikulum';
import { RUTE, ruteMapel } from '../../routes/paths';
import { aksiPembelajaranKelas5 } from './kelas5LearningRoutes';
import './kurikulum.css';

/**
 * Layar rantai isi satu mata pelajaran.
 *
 * Menggantikan layar CP & TP lama. Isi CP, TP, kuis, game, LKPD, dan bank soal
 * dibentuk dari Buku Referensi resmi sekolah.
 */
export function StrukturMapelScreen() {
  const { tingkat: tingkatParam, mapelKode: mapelParam } = useParams();
  const tingkat = Number(tingkatParam);
  const mapelKode = mapelParam ? decodeURIComponent(mapelParam) : '';
  const valid = Number.isInteger(tingkat) && tingkat >= 1 && tingkat <= 6 && Boolean(mapelKode);
  const { pilihKelas, pilihMapel } = useKurikulum();
  const [mapel, setMapel] = useState<RingkasanMapel | null>(null);
  const [struktur, setStruktur] = useState<StrukturKelasMapel | null>(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    if (!valid) {
      setMemuat(false);
      return;
    }
    let hidup = true;
    setMemuat(true);
    void Promise.all([daftarMapelUntukKelas(tingkat), bacaStrukturKelasMapel(tingkat, mapelKode)])
      .then(([daftar, isi]) => {
        if (!hidup) return;
        setMapel(daftar.find((item) => item.kode === mapelKode) ?? null);
        setStruktur(isi);
      })
      .catch((galat: unknown) => {
        log.galat('Struktur mata pelajaran gagal dimuat.', galat);
        if (hidup) setMapel(null);
      })
      .finally(() => hidup && setMemuat(false));
    return () => {
      hidup = false;
    };
  }, [mapelKode, tingkat, valid]);

  useEffect(() => {
    if (!valid || !mapel) return;
    pilihKelas(tingkat, tingkat <= 2 ? 'A' : tingkat <= 4 ? 'B' : 'C');
    pilihMapel({ mapelKode: mapel.kode, cpId: null, cabangKode: null, agamaKode: mapel.agama_kode });
  }, [mapel, pilihKelas, pilihMapel, tingkat, valid]);

  if (memuat) {
    return (
      <main className="halaman-kurikulum">
        <div className="kerangka-memuat" aria-label="Memuat struktur mata pelajaran">
          <span />
          <span />
          <span />
        </div>
      </main>
    );
  }

  if (!valid || !mapel) {
    return (
      <main className="halaman-kurikulum">
        <div className="keadaan-kosong keadaan-kosong--galat">
          <h1>Mata pelajaran tidak ditemukan</h1>
          <p>Pilih kembali kelas dan mata pelajaran yang tersedia.</p>
          <Link className="tombol-guru tombol-guru--utama" to={RUTE.kelas}>
            Pilih Kelas
          </Link>
        </div>
      </main>
    );
  }

  const faseKode = tingkat <= 2 ? 'A' : tingkat <= 4 ? 'B' : 'C';
  const adaBuku = (struktur?.buku.length ?? 0) > 0;
  const aksiKelas5 = tingkat === 5 ? aksiPembelajaranKelas5(mapelKode) : [];

  return (
    <main className="halaman-kurikulum halaman-struktur-mapel" data-testid="layar-struktur-mapel">
      <nav className="remah-kurikulum" aria-label="Konteks kurikulum">
        <Link to={RUTE.kelas}>Kelas {tingkat}</Link>
        <span>/</span>
        <Link to={ruteMapel(tingkat)}>Fase {faseKode}</Link>
        <span>/</span>
        <strong>{mapel.nama}</strong>
      </nav>

      <header className="kop-kurikulum kop-kurikulum--cp">
        <div>
          <p className="label-data">Langkah 3 dari 3 · rantai isi</p>
          <h1>Struktur Isi Mata Pelajaran</h1>
          <p>
            {mapel.nama} · Kelas {tingkat} · Fase {faseKode}
          </p>
        </div>
        <div className="aksi-kop-kurikulum">
          {aksiKelas5.map(([label, rute], indeks) => (
            <Link
              key={`${label}-${rute}`}
              className={`tombol-guru ${indeks === 0 ? 'tombol-guru--utama' : 'tombol-guru--sekunder'}`}
              to={rute}
            >
              {label}
            </Link>
          ))}
          <Link className="tombol-guru tombol-guru--sekunder" to={RUTE.bukuReferensi}>
            Kelola Buku Referensi
          </Link>
        </div>
      </header>

      <section className="panel-menunggu-buku" aria-label="Status buku referensi">
        <span aria-hidden="true">📕</span>
        <div>
          <h2>{adaBuku ? 'Buku referensi sudah terdaftar' : 'Buku Referensi belum dimasukkan'}</h2>
          <p>
            {adaBuku
              ? `${struktur?.buku.length} buku, ${struktur?.bab.length} bab, dan ${struktur?.topik.length} topik terdaftar untuk mata pelajaran ini.`
              : 'CP, TP, kuis, game, LKPD, dan bank soal akan dibuat mengikuti buku pelajaran resmi yang dipakai sekolah. Tidak ada isi yang dikarang lebih dulu.'}
          </p>
        </div>
      </section>

      {adaBuku ? (
        <section className="daftar-buku-mapel" aria-label="Buku referensi mata pelajaran">
          {struktur?.buku.map((buku) => (
            <article key={buku.id}>
              <div>
                <h3>{buku.judul}</h3>
                <p>
                  {buku.penerbit || 'Penerbit belum dicatat'} · {buku.tahun || 'tahun belum dicatat'}
                </p>
              </div>
              <span>{struktur.bab.filter((bab) => bab.buku_id === buku.id).length} bab</span>
            </article>
          ))}
        </section>
      ) : null}

      <section className="rantai-referensi" aria-label="Rantai isi pembelajaran">
        <div className="rantai-referensi__kop">
          <h2>Rantai isi</h2>
          <p>Urutan tetap dari kelas sampai bank soal.</p>
        </div>
        <ol>
          {RANTAI_REFERENSI.map((simpul, indeks) => (
            <li key={simpul.kode} data-keadaan={simpul.keadaan}>
              <b>{indeks + 1}</b>
              <div>
                <strong>{simpul.nama}</strong>
                <small>{simpul.keterangan}</small>
              </div>
              <span>
                {simpul.keadaan === 'tersedia'
                  ? 'Tersedia'
                  : simpul.keadaan === 'mandiri'
                    ? 'Sudah berjalan'
                    : 'Menunggu buku'}
              </span>
            </li>
          ))}
        </ol>
        <p className="rantai-referensi__catatan">{PESAN_MENUNGGU_BUKU}</p>
      </section>
    </main>
  );
}
