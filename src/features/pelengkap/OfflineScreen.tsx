import { useEffect, useState } from 'react';
import { bacaStatusOffline } from '../../lib/storage/pelengkapRepo';
import {
  pantauPemasanganPwa,
  pasangPwa,
  statusPemasanganPwa,
  type StatusPemasanganPwa,
} from '../../lib/pwa';
import './pelengkap.css';

function ukuran(byte: number) {
  return byte < 1024 ** 2
    ? `${(byte / 1024).toFixed(1)} KB`
    : `${(byte / 1024 ** 2).toFixed(1)} MB`;
}

const STATUS_AWAL = {
  antreanAi: 0,
  mediaByte: 0,
  materi: 0,
  game: 0,
  lembarDanSoal: 0,
  hasil: 0,
  indeks: 0,
};

function labelPemasangan(status: StatusPemasanganPwa): string {
  if (status === 'terpasang') return 'Aplikasi terpasang';
  if (status === 'siap_dipasang') return 'Siap dipasang di perangkat';
  return 'Dapat dipasang lewat menu peramban';
}

export function OfflineScreen() {
  const [online, setOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState(STATUS_AWAL);
  const [pemasangan, setPemasangan] = useState(statusPemasanganPwa());
  const [pemakaian, setPemakaian] = useState<{ usage?: number; quota?: number }>({});

  useEffect(() => {
    const perbaruiJaringan = () => setOnline(navigator.onLine);
    const perbaruiPemasangan = () => setPemasangan(statusPemasanganPwa());
    window.addEventListener('online', perbaruiJaringan);
    window.addEventListener('offline', perbaruiJaringan);
    const berhentiPantau = pantauPemasanganPwa(perbaruiPemasangan);
    void bacaStatusOffline().then(setStatus);
    void navigator.storage?.estimate().then(setPemakaian);
    return () => {
      window.removeEventListener('online', perbaruiJaringan);
      window.removeEventListener('offline', perbaruiJaringan);
      berhentiPantau();
    };
  }, []);

  async function tanganiPasang() {
    await pasangPwa();
    setPemasangan(statusPemasanganPwa());
  }

  return (
    <main className="halaman-pelengkap" data-testid="layar-offline">
      <header className="pelengkap-kop">
        <div>
          <p className="label-data">Pengaturan</p>
          <h1>Offline / PWA</h1>
          <p>Aplikasi, data kurikulum, papan, dan hasil belajar tetap bekerja tanpa jaringan.</p>
        </div>
        <div className="status-pwa">
          <span className={`indikator-jaringan ${online ? 'online' : 'offline'}`}>
            {online ? '● Terhubung' : '● Sedang offline'}
          </span>
          <small>{labelPemasangan(pemasangan)}</small>
          {pemasangan === 'siap_dipasang' ? (
            <button
              className="tombol-guru tombol-guru--utama"
              type="button"
              onClick={() => void tanganiPasang()}
            >
              Pasang Aplikasi
            </button>
          ) : null}
        </div>
      </header>

      <div className="tata-offline">
        <section>
          <span className="ikon-siap">✓</span>
          <h2>Siap dipakai tanpa internet</h2>
          <ul>
            <li>Materi dan media tersimpan</li>
            <li>LKPD, game, papan, dan simpan sesi</li>
            <li>Data siswa, nilai, poin, dan badge</li>
            <li>Pencarian global, Mode Siswa, dan Mode Kelas</li>
          </ul>
        </section>
        <section>
          <span className="ikon-internet">●</span>
          <h2>Perlu internet</h2>
          <ul>
            <li>Studio AI dan antreannya</li>
            <li>Pemuatan CP resmi oleh operator</li>
            <li>Salinan cadangan awan</li>
          </ul>
          <p>
            <strong>{status.antreanAi}</strong> permintaan AI menunggu dan akan berjalan otomatis
            ketika pemroses Studio AI tersedia serta jaringan tersambung.
          </p>
        </section>
      </div>

      <section className="penyimpanan-offline">
        <header>
          <div>
            <h2>Penyimpanan perangkat</h2>
            <p>
              {pemakaian.usage ? ukuran(pemakaian.usage) : 'Menghitung…'} digunakan{' '}
              {pemakaian.quota ? `dari ${ukuran(pemakaian.quota)}` : ''}
            </p>
          </div>
        </header>
        <div>
          <article><span>Media</span><strong>{ukuran(status.mediaByte)}</strong></article>
          <article><span>Materi</span><strong>{status.materi}</strong></article>
          <article><span>Game</span><strong>{status.game}</strong></article>
          <article><span>LKPD, soal, asesmen</span><strong>{status.lembarDanSoal}</strong></article>
          <article><span>Hasil belajar</span><strong>{status.hasil}</strong></article>
          <article><span>Indeks pencarian</span><strong>{status.indeks}</strong></article>
          <article><span>Antrean AI</span><strong>{status.antreanAi}</strong></article>
        </div>
      </section>
    </main>
  );
}
