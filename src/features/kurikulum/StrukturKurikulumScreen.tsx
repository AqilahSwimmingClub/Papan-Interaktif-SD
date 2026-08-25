import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  auditIntegritasKurikulum,
  type LaporanIntegritasKurikulum,
} from '../../lib/storage/kurikulumAdminRepo';
import { bacaRantaiReferensiTerisi } from '../../lib/storage/bukuReferensiRepo';
import { daftarKelas, type RingkasanKelas } from '../../lib/storage/kurikulumRepo';
import type { SimpulReferensi } from '../../lib/referensi/strukturReferensi';
import { RUTE, ruteMapel } from '../../routes/paths';
import './kurikulum-admin.css';

type BarisRantai = SimpulReferensi & { jumlah: number | null };

/**
 * Layar status struktur kurikulum. Menggantikan "Basis Data CP & TP" lama:
 * yang ditampilkan sekarang adalah kesiapan rantai Kelas → Mapel → Buku
 * Referensi → Bab → Topik → CP → TP, bukan cacah CP/TP bawaan.
 */
export function StrukturKurikulumScreen() {
  const [audit, setAudit] = useState<LaporanIntegritasKurikulum | null>(null);
  const [kelas, setKelas] = useState<RingkasanKelas[]>([]);
  const [rantai, setRantai] = useState<BarisRantai[]>([]);

  useEffect(() => {
    void Promise.all([auditIntegritasKurikulum(), daftarKelas(), bacaRantaiReferensiTerisi()]).then(
      ([laporan, daftar, isi]) => {
        setAudit(laporan);
        setKelas(daftar);
        setRantai(isi);
      },
    );
  }, []);

  return (
    <main className="halaman-kurikulum halaman-basis-data" data-testid="struktur-kurikulum">
      <header className="kop-kurikulum">
        <div>
          <p className="label-data">Pengaturan · status struktur</p>
          <h1>Struktur Kurikulum</h1>
          <p>Kesiapan rantai isi dan hasil audit relasi pada perangkat ini.</p>
        </div>
        <Link className="tombol-guru tombol-guru--utama" to={RUTE.bukuReferensi}>
          Buku Referensi
        </Link>
      </header>

      {audit ? (
        <>
          <section className={`banner-integritas ${audit.masalah.length ? 'bermasalah' : ''}`}>
            <span>{audit.masalah.length ? '!' : '✓'}</span>
            <div>
              <h2>
                {audit.masalah.length
                  ? 'Ditemukan masalah integritas'
                  : 'Semua relasi struktur sehat'}
              </h2>
              <p>
                {audit.masalah.length
                  ? audit.masalah.join(' ')
                  : 'Kelas dan mata pelajaran konsisten. CP/TP lama sudah dikeluarkan dari alur aplikasi.'}
              </p>
            </div>
          </section>

          <section className="statistik-basis">
            <article>
              <span>Kelas</span>
              <strong>{audit.jumlah.kelas}</strong>
              <small>Fase A, B, dan C</small>
            </article>
            <article>
              <span>Mata pelajaran</span>
              <strong>{audit.jumlah.mapel}</strong>
              <small>struktur resmi</small>
            </article>
            <article>
              <span>Buku referensi</span>
              <strong>{audit.jumlah.buku}</strong>
              <small>terdaftar sekolah</small>
            </article>
            <article>
              <span>Bab &amp; topik</span>
              <strong>
                {audit.jumlah.bab} / {audit.jumlah.topik}
              </strong>
              <small>dari buku terdaftar</small>
            </article>
          </section>
        </>
      ) : (
        <div className="kerangka-memuat">
          <span />
          <span />
          <span />
        </div>
      )}

      <section className="rantai-referensi" aria-label="Kesiapan rantai isi">
        <div className="rantai-referensi__kop">
          <h2>Rantai isi pembelajaran</h2>
          <p>CP dan TP baru dibuat setelah Buku Referensi dimasukkan.</p>
        </div>
        <ol>
          {rantai.map((simpul, indeks) => (
            <li key={simpul.kode} data-keadaan={simpul.keadaan}>
              <b>{indeks + 1}</b>
              <div>
                <strong>{simpul.nama}</strong>
                <small>{simpul.keterangan}</small>
              </div>
              <span>
                {simpul.jumlah === null
                  ? 'Sudah berjalan'
                  : simpul.jumlah > 0
                    ? `${simpul.jumlah} baris`
                    : 'Menunggu buku'}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="daftar-basis-kelas">
        <header>
          <div>
            <p className="label-data">Rantai kelas → mapel</p>
            <h2>Kelas dan buku referensinya</h2>
          </div>
        </header>
        <div>
          {kelas.map((item) => (
            <article key={item.tingkat}>
              <span className={`fase-mini fase-${item.fase_kode.toLowerCase()}`}>
                Fase {item.fase_kode}
              </span>
              <h3>Kelas {item.tingkat}</h3>
              <p>
                {item.jumlahPilihanMapel} mata pelajaran ·{' '}
                {item.jumlahBuku ? `${item.jumlahBuku} buku referensi` : 'belum ada buku referensi'}
              </p>
              <Link to={ruteMapel(item.tingkat)}>Jelajahi mapel →</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
