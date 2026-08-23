import { useEffect, useRef, useState } from 'react';
import { keAppError } from '../../lib/errors/AppError';
import {
  buatPratinjauImpor,
  imporPratinjauKurikulum,
  ubahVerifikasiBaris,
  type PratinjauImpor,
} from '../../lib/kurikulumImport';
import { auditIntegritasKurikulum, type LaporanIntegritasKurikulum } from '../../lib/storage/kurikulumAdminRepo';
import { useAuth } from '../../state/useAuth';
import './kurikulum-admin.css';
import './impor.css';

export function MuatCpScreen() {
  const { peran } = useAuth();
  const [audit, setAudit] = useState<LaporanIntegritasKurikulum | null>(null);
  const [berkas, setBerkas] = useState<File[]>([]);
  const [pratinjau, setPratinjau] = useState<PratinjauImpor | null>(null);
  const [pesan, setPesan] = useState('');
  const [memproses, setMemproses] = useState(false);
  const [hasil, setHasil] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const operator = peran === 'admin';

  useEffect(() => { void auditIntegritasKurikulum().then(setAudit); }, []);

  async function periksa() {
    setMemproses(true); setPesan(''); setHasil('');
    try {
      const terlaluBesar = berkas.find((item) => item.size > 20 * 1024 * 1024);
      if (terlaluBesar) throw new Error(`${terlaluBesar.name} melebihi 20 MB.`);
      const teks = await Promise.all(berkas.map(async (item) => ({ nama: item.name, isi: await item.text() })));
      setPratinjau(await buatPratinjauImpor(teks));
    } catch (galat) { setPesan(keAppError(galat).message); setPratinjau(null); }
    finally { setMemproses(false); }
  }

  async function impor() {
    if (!pratinjau || !operator) return;
    setMemproses(true); setPesan('');
    try {
      const selesai = await imporPratinjauKurikulum(pratinjau);
      setHasil(`${selesai.jumlahTersimpan} baris tersimpan atomik sebagai ${selesai.versiBaru}; ${selesai.jumlahDitolak} baris ditolak.`);
      setAudit(await auditIntegritasKurikulum());
    } catch (galat) { setPesan(`${keAppError(galat).message} Tidak ada perubahan parsial yang dipertahankan.`); }
    finally { setMemproses(false); }
  }

  const langkah = hasil ? 4 : pratinjau ? 3 : berkas.length ? 2 : 1;
  return <main className="halaman-kurikulum halaman-muat-cp" data-testid="muat-cp">
    <header className="kop-kurikulum"><div><p className="label-data">Hanya operator sekolah</p><h1>Impor Data Kurikulum</h1><p>JSON/CSV mengikuti kontrak final. Teks CP/TP tidak pernah diperbaiki, diringkas, atau dilengkapi otomatis.</p></div></header>
    <section className="alur-impor">{['Unggah berkas','Petakan kontrak','Periksa & verifikasi','Kunci sebagai resmi'].map((label, indeks) => <article key={label} className={langkah === indeks + 1 ? 'aktif' : langkah > indeks + 1 ? 'selesai' : ''}><b>{indeks + 1}</b><span>{label}</span></article>)}</section>
    <div className="tata-muat-cp"><section className="drop-cp" onClick={() => inputRef.current?.click()}><span>↑</span><h2>{berkas.length ? `${berkas.length} berkas dipilih` : 'Letakkan paket impor di sini'}</h2><p>JSON paket lengkap atau CSV 01–09 · maksimum 20 MB per berkas</p><button type="button">Pilih Berkas</button><input ref={inputRef} className="sr-only" type="file" multiple accept=".csv,.json" onChange={(e) => { setBerkas(Array.from(e.target.files ?? [])); setPratinjau(null); setHasil(''); }}/>{berkas.length ? <ul>{berkas.map((item) => <li key={`${item.name}-${item.size}`}>{item.name}</li>)}</ul> : null}</section><section className="cakupan-cp"><h2>Cakupan data final aktif</h2><article><span>CP non-agama 046/H/KR/2025</span><strong>29 / 29</strong></article><article><span>CP agama 020/2026</span><strong>18 / 18</strong></article><article><span>Elemen bertaut</span><strong>221</strong></article><article><span>TP Rekomendasi</span><strong>212</strong></article><p className={audit?.masalah.length ? 'peringatan' : 'berhasil'}>{audit?.masalah.length ? `${audit.masalah.length} masalah integritas perlu diperiksa.` : 'Seed final lengkap; impor baru membuat versi dan tidak menimpa baris lama.'}</p></section></div>
    {berkas.length && !pratinjau ? <section className="aksi-impor"><div><h2>Berkas siap dipetakan otomatis</h2><p>Jenis tabel dikenali dari nama berkas dan header kontrak. Data aktif belum berubah.</p></div><button className="tombol-guru tombol-guru--utama" type="button" disabled={memproses} onClick={() => void periksa()}>{memproses ? 'Memeriksa…' : 'Validasi & Preview'}</button></section> : null}
    {pesan ? <p className="impor-pesan impor-pesan--galat" role="alert">{pesan}</p> : null}{hasil ? <p className="impor-pesan impor-pesan--berhasil" role="status">{hasil}</p> : null}
    {pratinjau ? <section className="preview-impor"><header><div><p className="label-data">Versi kontrak {pratinjau.versi}</p><h2>Preview sebelum impor</h2><p>{pratinjau.jumlahDiterima} diterima · {pratinjau.jumlahDitolak} ditolak. Centang hanya baris yang sudah dicocokkan dengan sumber.</p></div><button type="button" className="tombol-guru tombol-guru--utama" disabled={!operator || memproses} onClick={() => void impor()}>{operator ? memproses ? 'Mengimpor…' : 'Impor Atomik' : 'Login Admin Diperlukan'}</button></header><div className="tabel-preview" role="region" aria-label="Preview baris impor" tabIndex={0}><table><thead><tr><th>Verifikasi</th><th>Tabel / baris</th><th>Kunci</th><th>Status</th><th>Masalah / peringatan</th></tr></thead><tbody>{pratinjau.baris.map((item) => <tr key={item.id} className={item.status === 'ditolak' ? 'ditolak' : ''}><td><input type="checkbox" checked={item.terverifikasi} disabled={item.status === 'ditolak'} aria-label={`Verifikasi ${item.kunci}`} onChange={(e) => setPratinjau((lama) => lama ? ubahVerifikasiBaris(lama, item.id, e.target.checked) : lama)}/></td><td><b>{item.bagian}</b><small>Baris {item.nomor}</small></td><td>{item.kunci}</td><td><span>{item.status}</span></td><td>{[...item.masalah, ...item.peringatan].join(' · ') || 'Siap diimpor'}</td></tr>)}</tbody></table></div><footer><p>CP yang tidak dicentang tetap dapat disimpan untuk pemeriksaan, tetapi diblokir dari konteks/sitasi AI.</p><button type="button" onClick={() => setPratinjau(null)}>Kembali ke pemilihan berkas</button></footer></section> : null}
  </main>;
}
