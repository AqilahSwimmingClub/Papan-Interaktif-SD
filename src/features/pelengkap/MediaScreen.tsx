import { useEffect, useMemo, useRef, useState } from 'react';
import { keAppError } from '../../lib/errors/AppError';
import { daftarMedia, simpanMedia } from '../../lib/storage/pelengkapRepo';
import type { MediaPembelajaran } from '../../lib/types';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './pelengkap.css';

function jenisBerkas(file: File): MediaPembelajaran['jenis'] {
  if (file.type.startsWith('image/')) return 'gambar';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf') return 'pdf';
  return 'dokumen';
}

function ukuran(byte: number): string {
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 ** 2) return `${(byte / 1024).toFixed(1)} KB`;
  return `${(byte / 1024 ** 2).toFixed(1)} MB`;
}

export function MediaScreen() {
  const { akun } = useAuth();
  const { konteks } = useKurikulum();
  const [media, setMedia] = useState<MediaPembelajaran[]>([]);
  const [filter, setFilter] = useState<'semua' | MediaPembelajaran['jenis']>('semua');
  const [pesan, setPesan] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function muat() { setMedia(await daftarMedia()); }
  useEffect(() => { void muat(); }, []);
  const tampil = useMemo(() => media.filter((item) => filter === 'semua' || item.jenis === filter), [filter, media]);
  const totalByte = media.reduce((jumlah, item) => jumlah + item.ukuran_byte, 0);

  async function tanganiBerkas(file: File | undefined) {
    if (!file || !akun) return;
    try {
      await simpanMedia({
        jenis: jenisBerkas(file), nama_berkas: file.name, ukuran_byte: file.size,
        durasi: null, tersedia_offline: true, diunggah_oleh: akun.id,
        tp_id: konteks.tp_id, data_berkas: file,
      });
      setPesan(file.size > 50 * 1024 ** 2 ? 'Media tersimpan. Ukuran di atas 50 MB; kompresi disarankan untuk penggunaan offline.' : 'Media tersimpan dan siap offline.');
      await muat();
    } catch (galat) { setPesan(keAppError(galat).message); }
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <main className="halaman-pelengkap" data-testid="layar-media">
      <header className="pelengkap-kop"><div><p className="label-data">Perpustakaan</p><h1>Media Pembelajaran</h1><p>{media.length} berkas · {ukuran(totalByte)} tersimpan pada perangkat ini.</p></div><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => inputRef.current?.click()}>Unggah Media</button><input className="sr-only" ref={inputRef} type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={(e) => void tanganiBerkas(e.target.files?.[0])} /></header>
      <nav className="filter-media" aria-label="Filter jenis media">{(['semua','gambar','video','audio','pdf','dokumen'] as const).map((jenis) => <button type="button" key={jenis} className={filter === jenis ? 'aktif' : ''} onClick={() => setFilter(jenis)}>{jenis === 'semua' ? `Semua ${media.length}` : jenis}</button>)}</nav>
      {pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : null}
      {tampil.length ? <section className="kisi-media">{tampil.map((item) => <article key={item.id}><div className={`ikon-media ikon-media--${item.jenis}`}>{item.jenis === 'video' ? '▶' : item.jenis === 'audio' ? '♫' : item.jenis === 'pdf' ? 'PDF' : item.jenis === 'gambar' ? '▧' : '▤'}</div><div><span>{item.jenis}</span><h2>{item.nama_berkas}</h2><p>{ukuran(item.ukuran_byte)} · {item.tersedia_offline ? 'offline siap' : 'belum diunduh'}</p>{item.tp_id ? <code>{item.tp_id}</code> : <small>Belum ditautkan ke TP</small>}</div></article>)}</section> : <section className="keadaan-kosong keadaan-kosong--fitur"><h2>Belum ada media {filter === 'semua' ? '' : filter}</h2><p>Unggah gambar, video, audio, PDF, atau dokumen. Media hingga di atas 50 MB tetap diterima dengan peringatan kompresi.</p><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => inputRef.current?.click()}>Pilih Berkas</button></section>}
    </main>
  );
}
