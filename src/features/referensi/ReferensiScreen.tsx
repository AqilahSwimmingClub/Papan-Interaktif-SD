import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { keAppError } from '../../lib/errors/AppError';
import {
  daftarReferensiLengkap,
  nonaktifkanReferensiSekolah,
  pilihReferensiSekolah,
  type ReferensiDenganStatus,
} from '../../lib/storage/referensiRepo';
import { RUTE } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './referensi.css';

const LABEL_JENIS: Record<string, string> = {
  panduan_resmi: 'Panduan resmi', buku_guru: 'Buku guru', buku_siswa: 'Buku siswa',
  buku_lain: 'Buku lain', materi_guru: 'Materi guru', katalog_resmi: 'Katalog resmi',
};

export function ReferensiScreen() {
  const { akun } = useAuth();
  const { konteks, pilihReferensi } = useKurikulum();
  const [daftar, setDaftar] = useState<ReferensiDenganStatus[]>([]);
  const [pesan, setPesan] = useState('');
  const tingkat = konteks.tingkat_kelas;
  const mapelKode = konteks.mapel_kode;

  const muat = useCallback(async () => {
    if (!tingkat || !mapelKode) return;
    try { setDaftar(await daftarReferensiLengkap(tingkat, mapelKode)); setPesan(''); }
    catch (galat) { setPesan(keAppError(galat).message); }
  }, [tingkat, mapelKode]);
  useEffect(() => { void muat(); }, [muat]);

  async function ubah(item: ReferensiDenganStatus, utama: boolean) {
    if (!tingkat || !akun) return;
    try {
      await pilihReferensiSekolah(item.id, tingkat, utama, akun.id);
      pilihReferensi(item.id);
      await muat();
    } catch (galat) { setPesan(keAppError(galat).message); }
  }

  async function nonaktifkan(item: ReferensiDenganStatus) {
    if (!tingkat) return;
    await nonaktifkanReferensiSekolah(item.id, tingkat);
    if (konteks.referensi_id === item.id) pilihReferensi(null);
    await muat();
  }

  if (!tingkat || !mapelKode) return <main className="halaman-kurikulum referensi-screen"><p className="label-data">Library resmi</p><h1>Perpustakaan</h1><section className="keadaan-kosong keadaan-kosong--fitur"><h2>Pilih kelas dan mata pelajaran</h2><p>Panduan dan buku resmi disaring sesuai kelas serta mata pelajaran aktif.</p><a className="tombol-guru" href="https://kurikulum.kemendikdasmen.go.id/panduan-mapel" target="_blank" rel="noreferrer">Buka katalog resmi</a><Link className="tombol-guru tombol-guru--utama" to={RUTE.kelas}>Pilih Kelas</Link></section></main>;

  return <main className="halaman-kurikulum referensi-screen" data-testid="referensi-screen">
    <header className="kop-kurikulum"><div><p className="label-data">Referensi resmi, panduan, dan buku</p><h1>Perpustakaan</h1><p>Satu CP/TP dapat memakai beberapa referensi. Hanya metadata dan ringkasan ruang lingkup yang disimpan.</p></div><Link className="tombol-guru tombol-guru--utama" to={RUTE.pemetaanReferensi}>Pemetaan Bab → TP</Link></header>
    <div className="referensi-konteks"><span>Kelas {tingkat}</span><span>{mapelKode}</span><span>{daftar.length} sumber cocok</span></div>
    {pesan ? <p className="referensi-pesan" role="alert">{pesan}</p> : null}
    <section className="referensi-grid">
      {daftar.map((item) => <article key={item.id} className={item.pilihan?.aktif ? 'dipilih' : ''}>
        <div className="referensi-card__kepala"><span>{LABEL_JENIS[item.jenis] ?? item.jenis}</span>{item.pilihan?.utama ? <b>Utama</b> : item.pilihan?.aktif ? <b>Pendamping</b> : null}</div>
        <h2>{item.judul}</h2><p>{item.penerbit} · {item.tahun || 'Tahun tidak dicantumkan'} · {item.versi || 'Tanpa versi'}</p>
        <dl><div><dt>Bab/unit</dt><dd>{item.jumlah_bab}</dd></div><div><dt>TP terpetakan</dt><dd>{item.jumlah_tp}</dd></div><div><dt>Izin</dt><dd>{item.lingkup_izin === 'metadata_saja' ? 'Metadata saja' : 'Isi boleh disimpan'}</dd></div></dl>
        <div className="referensi-card__aksi">{item.url_sumber.startsWith('https://') ? <a href={item.url_sumber} target="_blank" rel="noreferrer">Buka / unduh resmi</a> : null}{item.pilihan?.aktif ? <button type="button" onClick={() => void nonaktifkan(item)}>Lepaskan</button> : <button type="button" onClick={() => void ubah(item, false)}>Jadikan pendamping</button>}<button type="button" className="utama" onClick={() => void ubah(item, true)}>Pilih utama</button></div>
      </article>)}
    </section>
    {!daftar.length ? <section className="keadaan-kosong keadaan-kosong--dalam"><h2>Belum ada referensi yang cocok</h2><p>Tambahkan metadata referensi melalui paket impor kurikulum.</p><Link className="tombol-guru" to={RUTE.muatCp}>Buka Impor Data</Link></section> : null}
  </main>;
}
