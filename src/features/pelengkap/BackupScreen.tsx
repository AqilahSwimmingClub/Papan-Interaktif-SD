import { useEffect, useRef, useState } from 'react';
import { keAppError } from '../../lib/errors/AppError';
import { buatCadangan, daftarCadangan, pulihkanCadangan, type PaketCadangan } from '../../lib/storage/pelengkapRepo';
import { bacaSekolah } from '../../lib/storage/sekolahRepo';
import type { Cadangan } from '../../lib/types';
import './pelengkap.css';

function unduh(paket: PaketCadangan) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(paket, null, 2)], { type: 'application/json' }));
  const tautan = document.createElement('a'); tautan.href = url; tautan.download = `papan-interaktif-backup-${paket.waktu.slice(0,10)}.json`; tautan.click(); URL.revokeObjectURL(url);
}

export function BackupScreen() {
  const [riwayat, setRiwayat] = useState<Cadangan[]>([]);
  const [namaSekolah, setNamaSekolah] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [pesan, setPesan] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { void Promise.all([daftarCadangan(), bacaSekolah()]).then(([data, sekolah]) => { setRiwayat(data); setNamaSekolah(sekolah?.nama ?? ''); }); }, []);

  async function tanganiCadangkan() {
    try { const paket = await buatCadangan(false); unduh(paket); setRiwayat(await daftarCadangan()); setPesan('Cadangan selesai dan berkas diunduh. CP resmi tidak disalin.'); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }

  async function tanganiPulihkan(file: File | undefined) {
    if (!file) return;
    try { const paket = JSON.parse(await file.text()) as PaketCadangan; await pulihkanCadangan(paket, konfirmasi); setPesan('Pemulihan selesai. Keadaan sebelum restore dicatat sebagai cadangan pra-restore. Muat ulang aplikasi untuk melihat seluruh data.'); setRiwayat(await daftarCadangan()); }
    catch (galat) { setPesan(keAppError(galat).message); }
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <main className="halaman-pelengkap" data-testid="layar-backup">
      <header className="pelengkap-kop"><div><p className="label-data">Pengaturan</p><h1>Backup & Restore</h1><p>Cadangan lokal melindungi hasil kerja guru tanpa menyalin CP resmi.</p></div><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => void tanganiCadangkan()}>Cadangkan Sekarang</button></header>
      <div className="tata-backup"><section className="kartu-backup"><span className="status-backup">✓ Offline-first</span><h2>{riwayat[0] ? 'Pencadangan terakhir berhasil' : 'Belum ada pencadangan'}</h2>{riwayat[0] ? <p>{new Date(riwayat[0].waktu).toLocaleString('id-ID')} · {(riwayat[0].ukuran_byte/1024).toFixed(1)} KB</p> : <p>Buat cadangan pertama sebelum memindahkan atau memulihkan perangkat.</p>}<ul><li>TP Sekolah/Guru, materi, LKPD, soal, dan game</li><li>Data siswa, kelompok, hasil, poin, dan sesi papan</li><li>Media pembelajaran dan konfigurasi sekolah</li><li><strong>CP resmi tidak ikut</strong> — dimuat dari dataset final</li></ul></section><section className="kartu-restore"><span className="label-data">Tindakan terlindungi</span><h2>Pulihkan dari berkas</h2><p>Pemulihan menimpa data lokal. Keadaan saat ini dicatat lebih dulu.</p><label>Ketik nama sekolah untuk konfirmasi<input value={konfirmasi} onChange={(e) => setKonfirmasi(e.target.value)} placeholder={namaSekolah || 'Lengkapi profil sekolah dahulu'} /></label><button type="button" disabled={!namaSekolah || konfirmasi !== namaSekolah} onClick={() => inputRef.current?.click()}>Pilih Berkas Cadangan</button><input className="sr-only" ref={inputRef} type="file" accept="application/json,.json" onChange={(e) => void tanganiPulihkan(e.target.files?.[0])} /></section></div>
      {pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : null}
    </main>
  );
}
