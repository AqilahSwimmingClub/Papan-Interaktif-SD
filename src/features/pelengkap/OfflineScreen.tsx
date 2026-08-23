import { useEffect, useState } from 'react';
import { bacaStatusOffline } from '../../lib/storage/pelengkapRepo';
import './pelengkap.css';

function ukuran(byte: number) { return byte < 1024 ** 2 ? `${(byte/1024).toFixed(1)} KB` : `${(byte/1024**2).toFixed(1)} MB`; }

export function OfflineScreen() {
  const [online, setOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState({ antreanAi: 0, mediaByte: 0, materi: 0, indeks: 0 });
  const [pemakaian, setPemakaian] = useState<{ usage?: number; quota?: number }>({});
  useEffect(() => {
    const perbarui = () => setOnline(navigator.onLine);
    window.addEventListener('online', perbarui); window.addEventListener('offline', perbarui);
    void bacaStatusOffline().then(setStatus);
    void navigator.storage?.estimate().then(setPemakaian);
    return () => { window.removeEventListener('online', perbarui); window.removeEventListener('offline', perbarui); };
  }, []);
  return (
    <main className="halaman-pelengkap" data-testid="layar-offline">
      <header className="pelengkap-kop"><div><p className="label-data">Pengaturan</p><h1>Offline / PWA</h1><p>Aplikasi, data kurikulum, papan, dan hasil belajar tetap bekerja tanpa jaringan.</p></div><span className={`indikator-jaringan ${online ? 'online' : 'offline'}`}>{online ? '● Terhubung' : '● Sedang offline'}</span></header>
      <div className="tata-offline"><section><span className="ikon-siap">✓</span><h2>Siap dipakai tanpa internet</h2><ul><li>Materi dan media tersimpan</li><li>LKPD, game, papan, dan simpan sesi</li><li>Data siswa, nilai, poin, dan badge</li><li>Pencarian global dan Mode Kelas</li></ul></section><section><span className="ikon-internet">●</span><h2>Perlu internet</h2><ul><li>Studio AI dan antreannya</li><li>Pemuatan CP resmi oleh operator</li><li>Salinan cadangan awan</li></ul><p><strong>{status.antreanAi}</strong> permintaan AI menunggu</p></section></div>
      <section className="penyimpanan-offline"><header><div><h2>Penyimpanan perangkat</h2><p>{pemakaian.usage ? ukuran(pemakaian.usage) : 'Menghitung…'} digunakan {pemakaian.quota ? `dari ${ukuran(pemakaian.quota)}` : ''}</p></div></header><div><article><span>Media</span><strong>{ukuran(status.mediaByte)}</strong></article><article><span>Materi</span><strong>{status.materi}</strong></article><article><span>Indeks pencarian</span><strong>{status.indeks}</strong></article><article><span>Antrean AI</span><strong>{status.antreanAi}</strong></article></div></section>
    </main>
  );
}
