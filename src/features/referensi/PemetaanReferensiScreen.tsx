import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { keAppError } from '../../lib/errors/AppError';
import {
  daftarBabReferensi,
  daftarPemetaanReferensi,
  daftarReferensiLengkap,
  hapusPemetaanBabTp,
  petakanBabKeTp,
  simpanBabReferensi,
  type ReferensiDenganStatus,
} from '../../lib/storage/referensiRepo';
import type { PemetaanBabTp, ReferensiBab, TujuanPembelajaran } from '../../lib/types';
import { RUTE } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './referensi.css';

type Relasi = PemetaanBabTp & { bab: ReferensiBab; tp: TujuanPembelajaran };

export function PemetaanReferensiScreen() {
  const { akun } = useAuth();
  const { konteks, pilihReferensi } = useKurikulum();
  const [referensi, setReferensi] = useState<ReferensiDenganStatus[]>([]);
  const [referensiId, setReferensiId] = useState(konteks.referensi_id ?? '');
  const [bab, setBab] = useState<ReferensiBab[]>([]);
  const [pemetaan, setPemetaan] = useState<Relasi[]>([]);
  const [judul, setJudul] = useState('');
  const [nomor, setNomor] = useState('Bab 1');
  const [pesan, setPesan] = useState('');
  const tingkat = konteks.tingkat_kelas;
  const mapelKode = konteks.mapel_kode;

  useEffect(() => {
    if (!tingkat || !mapelKode) return;
    void daftarReferensiLengkap(tingkat, mapelKode).then((hasil) => {
      setReferensi(hasil);
      if (!referensiId && hasil[0]) setReferensiId(hasil[0].id);
    }).catch((galat: unknown) => setPesan(keAppError(galat).message));
  }, [tingkat, mapelKode, referensiId]);

  async function muatRelasi(id: string) {
    if (!id) { setBab([]); setPemetaan([]); return; }
    try {
      const [daftarBab, daftarRelasi] = await Promise.all([daftarBabReferensi(id), daftarPemetaanReferensi(id)]);
      setBab(daftarBab); setPemetaan(daftarRelasi); setPesan('');
    } catch (galat) { setPesan(keAppError(galat).message); }
  }
  useEffect(() => { void muatRelasi(referensiId); }, [referensiId]);

  async function tambahBab(event: FormEvent) {
    event.preventDefault();
    if (!referensiId || !judul.trim()) return;
    try {
      await simpanBabReferensi({ id: `BAB-${crypto.randomUUID()}`, referensi_id: referensiId, nomor_tampil: nomor.trim(), judul_bab: judul.trim(), halaman_awal: null, urutan: bab.length + 1, ruang_lingkup: '' });
      setJudul(''); setNomor(`Bab ${bab.length + 2}`); await muatRelasi(referensiId);
    } catch (galat) { setPesan(keAppError(galat).message); }
  }

  async function petakan(item: ReferensiBab) {
    if (!konteks.tp_id || !akun) { setPesan('Pilih TP aktif sebelum membuat pemetaan.'); return; }
    try {
      await petakanBabKeTp({ referensi_bab_id: item.id, tp_id: konteks.tp_id, kesesuaian: 'penuh', dipetakan_oleh: akun.id, catatan: '' });
      pilihReferensi(referensiId, item.id); await muatRelasi(referensiId);
    } catch (galat) { setPesan(keAppError(galat).message); }
  }

  if (!tingkat || !mapelKode) return <main className="halaman-kurikulum"><h1>Pemetaan Bab → TP</h1><Link to={RUTE.kelas}>Pilih konteks kelas</Link></main>;
  return <main className="halaman-kurikulum referensi-screen" data-testid="pemetaan-referensi">
    <header className="kop-kurikulum"><div><p className="label-data">Buku → bab/unit → materi → TP → CP</p><h1>Pemetaan Bab ke TP</h1><p>Relasi banyak-ke-banyak disimpan pada tabel pemetaan; TP tidak menyimpan ID bab.</p></div><Link className="tombol-guru" to={RUTE.referensi}>Kembali ke Referensi</Link></header>
    <section className="pemetaan-kontrol"><label>Referensi<select value={referensiId} onChange={(e) => { setReferensiId(e.target.value); pilihReferensi(e.target.value || null); }}>{referensi.map((item) => <option key={item.id} value={item.id}>{item.judul}</option>)}</select></label><div><span>TP aktif</span><strong>{konteks.tp_id ?? 'Belum dipilih'}</strong></div></section>
    {pesan ? <p className="referensi-pesan" role="alert">{pesan}</p> : null}
    <div className="pemetaan-tata"><section><h2>Bab / unit</h2><form className="form-bab" onSubmit={(e) => void tambahBab(e)}><input value={nomor} onChange={(e) => setNomor(e.target.value)} aria-label="Nomor bab"/><input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Judul bab atau unit" aria-label="Judul bab"/><button type="submit">Tambah metadata bab</button></form><div className="daftar-bab">{bab.map((item) => <article key={item.id}><div><b>{item.nomor_tampil}</b><h3>{item.judul_bab}</h3></div><button type="button" onClick={() => void petakan(item)}>Petakan ke TP aktif</button></article>)}</div></section><section><h2>Relasi tersimpan</h2><div className="daftar-relasi">{pemetaan.map((item) => <article key={`${item.referensi_bab_id}-${item.tp_id}`}><div><b>{item.bab.nomor_tampil} · {item.bab.judul_bab}</b><p>{item.tp.kode_tampil} · {item.tp.teks_tujuan}</p><span>{item.kesesuaian}</span></div><button type="button" onClick={async () => { await hapusPemetaanBabTp(item.referensi_bab_id, item.tp_id); await muatRelasi(referensiId); }}>Hapus</button></article>)}{!pemetaan.length ? <p>Belum ada relasi untuk referensi ini.</p> : null}</div></section></div>
  </main>;
}
