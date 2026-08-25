import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import {
  bacaRingkasanKurikulum,
  daftarKelas,
  type RingkasanKelas,
  type RingkasanKurikulum,
} from '../../lib/storage/kurikulumRepo';
import { log } from '../../lib/errors/logger';
import { PESAN_MENUNGGU_BUKU } from '../../lib/referensi/strukturReferensi';
import { KATALOG_VLAB } from '../../lib/vlab/katalogVlab';
import { RUTE, ruteMapel } from '../../routes/paths';
import './beranda-terlindungi.css';

const JUMLAH_VLAB = KATALOG_VLAB.length;

function sapaanSekarang(): string {
  const jam = new Date().getHours();
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 19) return 'Selamat sore';
  return 'Selamat malam';
}

function tanggalSekarang(): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export function BerandaTerlindungi() {
  const { akun } = useAuth();
  const { pilihKelas } = useKurikulum();
  const [ringkasan, setRingkasan] = useState<RingkasanKurikulum | null>(null);
  const [kelas, setKelas] = useState<RingkasanKelas[]>([]);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let aktif = true;
    void Promise.all([bacaRingkasanKurikulum(), daftarKelas()])
      .then(([dataRingkasan, daftar]) => {
        if (!aktif) return;
        setRingkasan(dataRingkasan);
        setKelas(daftar);
        setGagal(false);
      })
      .catch((galat: unknown) => {
        log.galat('Dashboard kurikulum gagal dimuat.', galat);
        if (aktif) setGagal(true);
      });
    return () => {
      aktif = false;
    };
  }, []);

  const namaDepan = akun?.nama.trim().split(/\s+/)[0] || 'Guru';

  return (
    <main className="dasbor-guru" data-testid="beranda-terlindungi">
      <header className="dasbor-guru__kop">
        <div>
          <p className="dasbor-guru__tanggal">{tanggalSekarang()}</p>
          <h1>
            {sapaanSekarang()}, {namaDepan}
          </h1>
          <p>Siapkan kelas, buka mata pelajaran, lalu lanjutkan ke fitur pembelajaran.</p>
        </div>
        <Link className="tombol-guru tombol-guru--sekunder" to="/fitur/rencana-mingguan">
          Rencana mingguan
        </Link>
      </header>

      {gagal ? (
        <section className="dasbor-guru__galat" role="alert">
          <div>
            <h2>Ringkasan kurikulum belum dapat dibaca</h2>
            <p>Data lokal tetap aman. Muat ulang halaman untuk mencoba kembali.</p>
          </div>
          <button type="button" onClick={() => globalThis.location.reload()}>
            Muat ulang
          </button>
        </section>
      ) : null}

      <section className="dasbor-guru__hero" aria-labelledby="jadwal-hari-ini">
        <div className="dasbor-guru__hero-utama">
          <p className="label-data">Jadwal hari ini</p>
          <h2 id="jadwal-hari-ini">Belum ada jadwal mengajar</h2>
          <p>
            Jadwal belum diisi pada perangkat ini. Anda tetap dapat memilih kelas dan mata
            pelajaran, serta membuka VLAB yang sudah berjalan penuh.
          </p>
          <div className="dasbor-guru__aksi">
            <Link className="tombol-guru tombol-guru--utama" to={RUTE.kelas}>
              Pilih kelas
            </Link>
            <Link className="tombol-guru tombol-guru--terang" to="/fitur/atur-jadwal">
              Atur jadwal
            </Link>
          </div>
        </div>
        <div className="dasbor-guru__hero-status">
          <span className="dasbor-guru__status-ikon" aria-hidden="true">
            ✓
          </span>
          <div>
            <strong>Struktur siap, menunggu Buku Referensi</strong>
            <p>CP, TP, kuis, game, LKPD, dan bank soal dibuat setelah buku dimasukkan.</p>
          </div>
        </div>
      </section>

      <section className="dasbor-guru__statistik" aria-label="Ringkasan struktur kurikulum">
        {[
          { label: 'Kelas', nilai: ringkasan?.jumlahKelas, catatan: 'Fase A, B, dan C' },
          { label: 'Mata pelajaran', nilai: ringkasan?.jumlahMapel, catatan: 'struktur resmi' },
          { label: 'Buku referensi', nilai: ringkasan?.jumlahBuku, catatan: 'terdaftar sekolah' },
          { label: 'Laboratorium VLAB', nilai: JUMLAH_VLAB, catatan: 'siap dipakai sekarang' },
        ].map((statistik) => (
          <article className="kartu-statistik" key={statistik.label}>
            <p>{statistik.label}</p>
            <strong>{statistik.nilai ?? '—'}</strong>
            <small>{statistik.catatan}</small>
          </article>
        ))}
      </section>

      <div className="dasbor-guru__dua-kolom">
        <section className="panel-guru panel-guru--kelas" aria-labelledby="pilih-kelas-dasbor">
          <div className="panel-guru__kop">
            <div>
              <p className="label-data">Fase A · B · C</p>
              <h2 id="pilih-kelas-dasbor">Pilih kelas</h2>
            </div>
            <Link to={RUTE.kelas}>Lihat semua</Link>
          </div>
          <div className="kisi-kelas-ringkas">
            {kelas.map((item) => (
              <Link
                className={`kartu-kelas-ringkas fase-${item.fase_kode.toLowerCase()}`}
                key={item.tingkat}
                to={ruteMapel(item.tingkat)}
                onClick={() => pilihKelas(item.tingkat, item.fase_kode)}
              >
                <span>Fase {item.fase_kode}</span>
                <strong>{item.tingkat}</strong>
                <small>
                  {item.jumlahBuku ? `${item.jumlahBuku} buku` : 'Belum ada buku'}
                </small>
              </Link>
            ))}
          </div>
        </section>

        <aside className="panel-guru panel-guru--status" aria-labelledby="status-data-final">
          <div className="panel-guru__kop">
            <div>
              <p className="label-data">Rantai isi pembelajaran</p>
              <h2 id="status-data-final">Status struktur</h2>
            </div>
            <Link to={RUTE.strukturKurikulum}>Lihat detail</Link>
          </div>
          <ul className="daftar-status-kurikulum">
            <li>
              <span className="status-titik status-titik--hijau" aria-hidden="true" />
              <div>
                <strong>Kelas dan mata pelajaran siap</strong>
                <small>Rantai Kelas → Mapel → Buku Referensi sudah terpasang.</small>
              </div>
            </li>
            <li>
              <span className="status-titik status-titik--amber" aria-hidden="true" />
              <div>
                <strong>CP, TP, kuis, game, LKPD, bank soal menunggu buku</strong>
                <small>{PESAN_MENUNGGU_BUKU}</small>
              </div>
            </li>
            <li>
              <span className="status-titik status-titik--biru" aria-hidden="true" />
              <div>
                <strong>VLAB sudah berjalan penuh</strong>
                <small>{JUMLAH_VLAB} laboratorium virtual siap dipakai di kelas.</small>
              </div>
            </li>
          </ul>
        </aside>
      </div>

      <section className="panel-guru panel-guru--ai" aria-labelledby="buat-dengan-ai">
        <div className="panel-guru__kop">
          <div>
            <p className="label-data">Pintasan cepat</p>
            <h2 id="buat-dengan-ai">Yang siap dipakai</h2>
          </div>
        </div>
        <div className="kisi-ai-ringkas">
          {[
            ['VLAB / Simulasi', RUTE.vlab, 'Siap dipakai sekarang'],
            ['Buku Referensi', RUTE.bukuReferensi, 'Masukkan buku sekolah'],
            ['Pembuat LKPD', '/fitur/pembuat-lkpd', 'Menunggu Buku Referensi'],
          ].map(([label, tujuan, catatan]) => (
            <Link key={label} to={tujuan}>
              <span aria-hidden="true">✦</span>
              <strong>{label}</strong>
              <small>{catatan}</small>
              <b aria-hidden="true">→</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
