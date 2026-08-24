import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { keAppError } from '../../lib/errors/AppError';
import { daftarMedia, hapusMedia, simpanMedia } from '../../lib/storage/pelengkapRepo';
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

function buatUrl(blob: Blob | null): string {
  return blob && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(blob) : '';
}

export function MediaScreen() {
  const { akun } = useAuth();
  const { konteks } = useKurikulum();
  const [media, setMedia] = useState<MediaPembelajaran[]>([]);
  const [filter, setFilter] = useState<'semua' | MediaPembelajaran['jenis']>('semua');
  const [pesan, setPesan] = useState('');
  const [terpilih, setTerpilih] = useState<MediaPembelajaran | null>(null);
  const [halamanPdf, setHalamanPdf] = useState(1);
  const [zoom, setZoom] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useMemo(() => new Map(media.map((item) => [item.id, buatUrl(item.data_berkas)])), [media]);

  useEffect(() => () => {
    if (typeof URL.revokeObjectURL === 'function') for (const url of urls.values()) if (url) URL.revokeObjectURL(url);
  }, [urls]);
  async function muat() { setMedia(await daftarMedia()); }
  useEffect(() => { void muat(); }, []);
  const tampil = useMemo(() => media.filter((item) => filter === 'semua' || item.jenis === filter), [filter, media]);
  const totalByte = media.reduce((jumlah, item) => jumlah + item.ukuran_byte, 0);

  async function tanganiBerkas(file: File | undefined) {
    if (!file || !akun) return;
    try {
      await simpanMedia({ jenis: jenisBerkas(file), nama_berkas: file.name, ukuran_byte: file.size,
        durasi: null, tersedia_offline: true, diunggah_oleh: akun.id,
        tp_id: konteks.tp_id, data_berkas: file });
      setPesan(file.size > 50 * 1024 ** 2 ? 'Media tersimpan. Ukuran di atas 50 MB; kompresi disarankan untuk penggunaan offline.' : 'Media tersimpan dan siap diputar offline.');
      await muat();
    } catch (galat) { setPesan(keAppError(galat).message); }
    if (inputRef.current) inputRef.current.value = '';
  }

  async function hapus(item: MediaPembelajaran) {
    if (!window.confirm(`Hapus “${item.nama_berkas}” dari perangkat ini?`)) return;
    await hapusMedia(item.id); setTerpilih(null); setPesan('Media dihapus dari penyimpanan lokal.'); await muat();
  }

  const urlAktif = terpilih ? urls.get(terpilih.id) ?? '' : '';
  return <main className="halaman-pelengkap" data-testid="layar-media">
    <header className="pelengkap-kop"><div><p className="label-data">Perpustakaan lokal</p><h1>Media Pembelajaran</h1><p>{media.length} berkas · {ukuran(totalByte)} tersimpan pada perangkat ini.</p></div><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => inputRef.current?.click()}>Unggah Media</button><input className="sr-only" ref={inputRef} type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={(e) => void tanganiBerkas(e.target.files?.[0])}/></header>
    <nav className="filter-media" aria-label="Filter jenis media">{(['semua','gambar','video','audio','pdf','dokumen'] as const).map((jenis) => <button type="button" key={jenis} className={filter === jenis ? 'aktif' : ''} onClick={() => setFilter(jenis)}>{jenis === 'semua' ? `Semua ${media.length}` : jenis}</button>)}</nav>
    {pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : null}
    {tampil.length ? <section className="kisi-media">{tampil.map((item) => {
      const url = urls.get(item.id) ?? '';
      return <article key={item.id} className="kartu-media">
        <button className="pratinjau-media" type="button" onClick={() => { setTerpilih(item); setHalamanPdf(1); setZoom(100); }} aria-label={`Buka ${item.nama_berkas}`}>
          {item.jenis === 'gambar' && url ? <img src={url} alt=""/> : item.jenis === 'video' && url ? <video src={url} muted preload="metadata"/> : <span className={`ikon-media ikon-media--${item.jenis}`}>{item.jenis === 'video' ? '▶' : item.jenis === 'audio' ? '♫' : item.jenis === 'pdf' ? 'PDF' : '▤'}</span>}
        </button>
        <div><span>{item.jenis}</span><h2>{item.nama_berkas}</h2><p>{ukuran(item.ukuran_byte)} · {item.tersedia_offline ? 'offline siap' : 'belum diunduh'}</p>{item.tp_id ? <code>{item.tp_id}</code> : <small>Belum ditautkan ke TP</small>}<button type="button" onClick={() => setTerpilih(item)}>Buka / putar</button></div>
      </article>;
    })}</section> : <section className="keadaan-kosong keadaan-kosong--fitur"><h2>Belum ada media {filter === 'semua' ? '' : filter}</h2><p>Unggah gambar, video, audio, PDF, atau dokumen. Berkas disimpan sebagai Blob di IndexedDB agar tetap tersedia offline.</p><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => inputRef.current?.click()}>Pilih Berkas</button></section>}
    {terpilih ? <div className="modal-media" role="dialog" aria-modal="true" aria-label={`Pratinjau ${terpilih.nama_berkas}`}><section><header><div><span>{terpilih.jenis}</span><h2>{terpilih.nama_berkas}</h2></div><button type="button" onClick={() => setTerpilih(null)} aria-label="Tutup pratinjau">×</button></header>
      <div className="pemutar-media" style={{ '--zoom-media': `${zoom}%` } as CSSProperties}>
        {!urlAktif ? <p>Berkas tidak tersedia pada perangkat ini.</p> : terpilih.jenis === 'gambar' ? <img src={urlAktif} alt={terpilih.nama_berkas}/> : terpilih.jenis === 'video' ? <video src={urlAktif} controls playsInline/> : terpilih.jenis === 'audio' ? <audio src={urlAktif} controls/> : terpilih.jenis === 'pdf' ? <iframe title={terpilih.nama_berkas} src={`${urlAktif}#page=${halamanPdf}&zoom=${zoom}`}/> : <a href={urlAktif} download={terpilih.nama_berkas}>Unduh dokumen</a>}
      </div>
      <footer>{terpilih.jenis === 'pdf' ? <><button type="button" disabled={halamanPdf <= 1} onClick={() => setHalamanPdf((x) => Math.max(1, x - 1))}>Halaman sebelumnya</button><strong>Halaman {halamanPdf}</strong><button type="button" onClick={() => setHalamanPdf((x) => x + 1)}>Halaman berikutnya</button></> : null}<button type="button" onClick={() => setZoom((x) => Math.max(50, x - 25))}>− Zoom</button><span>{zoom}%</span><button type="button" onClick={() => setZoom((x) => Math.min(200, x + 25))}>+ Zoom</button><button className="hapus-media" type="button" onClick={() => void hapus(terpilih)}>Hapus</button></footer>
    </section></div> : null}
  </main>;
}
