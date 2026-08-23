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
import { RUTE, ruteMapel } from '../../routes/paths';
import './beranda-terlindungi.css';

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
          <p>Siapkan kelas, buka CP/TP, lalu lanjutkan ke fitur pembelajaran.</p>
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
            pelajaran langsung dari kurikulum.
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
            <strong>Kurikulum tersedia offline</strong>
            <p>29 CP non-agama 2025/2026 + 18 CP agama 020/2026.</p>
          </div>
        </div>
      </section>

      <section className="dasbor-guru__statistik" aria-label="Ringkasan database kurikulum">
        {[
          { label: 'CP resmi', nilai: ringkasan?.jumlahCp, catatan: '47 dari 47 baris' },
          { label: 'Elemen', nilai: ringkasan?.jumlahElemen, catatan: 'tertaut ke CP' },
          { label: 'TP Rekomendasi', nilai: ringkasan?.jumlahTp, catatan: 'kelas 1–6' },
          { label: 'CP Agama 020/2026', nilai: ringkasan?.cpAgama020, catatan: '6 agama × 3 fase' },
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
                <small>{item.jumlahTp} TP Rekomendasi</small>
              </Link>
            ))}
          </div>
        </section>

        <aside className="panel-guru panel-guru--status" aria-labelledby="status-data-final">
          <div className="panel-guru__kop">
            <div>
              <p className="label-data">Database final repository</p>
              <h2 id="status-data-final">Status kurikulum</h2>
            </div>
          </div>
          <ul className="daftar-status-kurikulum">
            <li>
              <span className="status-titik status-titik--hijau" aria-hidden="true" />
              <div>
                <strong>CP lengkap 47/47</strong>
                <small>Seluruh teks tersedia dari dataset final.</small>
              </div>
            </li>
            <li>
              <span className="status-titik status-titik--biru" aria-hidden="true" />
              <div>
                <strong>TP Rekomendasi terpisah</strong>
                <small>212 baris, hanya-baca, bukan TP resmi pemerintah.</small>
              </div>
            </li>
            <li>
              <span className="status-titik status-titik--amber" aria-hidden="true" />
              <div>
                <strong>Menunggu verifikasi operator</strong>
                <small>Data tampil apa adanya dan tidak diubah oleh aplikasi.</small>
              </div>
            </li>
          </ul>
        </aside>
      </div>

      <section className="panel-guru panel-guru--ai" aria-labelledby="buat-dengan-ai">
        <div className="panel-guru__kop">
          <div>
            <p className="label-data">Selalu terikat CP dan TP</p>
            <h2 id="buat-dengan-ai">Buat dengan AI</h2>
          </div>
        </div>
        <div className="kisi-ai-ringkas">
          {[
            ['Pembuat LKPD', '/fitur/pembuat-lkpd'],
            ['Pembuat Soal', '/fitur/pembuat-soal'],
            ['Game Generator', '/fitur/game-generator'],
          ].map(([label, tujuan]) => (
            <Link key={label} to={tujuan}>
              <span aria-hidden="true">✦</span>
              <strong>{label}</strong>
              <small>Pilih TP lebih dulu</small>
              <b aria-hidden="true">→</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
