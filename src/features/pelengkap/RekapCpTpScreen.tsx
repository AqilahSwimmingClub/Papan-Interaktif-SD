import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { keAppError } from '../../lib/errors/AppError';
import { bacaRekapKelas, pastikanKelasKerja, type BarisRekap } from '../../lib/storage/kelasRepo';
import type { Kelas, TujuanPembelajaran } from '../../lib/types';
import { RUTE } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './pelengkap.css';

const SIMBOL_STATUS = { tuntas: '✓', berkembang: '◐', perlu_bimbingan: '!', belum_ada_data: '—' } as const;

export function RekapCpTpScreen() {
  const { akun } = useAuth();
  const { konteks } = useKurikulum();
  const [tingkat, setTingkat] = useState(konteks.tingkat_kelas ?? 4);
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [tp, setTp] = useState<TujuanPembelajaran[]>([]);
  const [baris, setBaris] = useState<BarisRekap[]>([]);
  const [pesan, setPesan] = useState('');

  useEffect(() => {
    if (!akun) return;
    void pastikanKelasKerja(tingkat, akun.id)
      .then(async (kelasAktif) => {
        const pilihan = konteks.tingkat_kelas === tingkat && konteks.tp_id ? [konteks.tp_id] : [];
        const rekap = await bacaRekapKelas(kelasAktif.id, tingkat, pilihan);
        setKelas(kelasAktif); setTp(rekap.tp); setBaris(rekap.baris); setPesan('');
      })
      .catch((galat: unknown) => setPesan(keAppError(galat).message));
  }, [akun, konteks.tingkat_kelas, konteks.tp_id, tingkat]);

  return (
    <main className="halaman-pelengkap halaman-rekap" data-testid="layar-rekap">
      <header className="pelengkap-kop"><div><p className="label-data">Kelas & Data</p><h1>Rekap CP/TP</h1><p>Matriks siswa × TP dari hasil game, LKPD, dan asesmen.</p></div><label className="pilih-kelas-ringkas">Kelas<select value={tingkat} onChange={(e) => setTingkat(Number(e.target.value))}>{[1,2,3,4,5,6].map((nilai) => <option key={nilai} value={nilai}>Kelas {nilai}</option>)}</select></label></header>
      <section className="legenda-rekap"><span className="status-tuntas">✓ Tuntas</span><span className="status-berkembang">◐ Berkembang</span><span className="status-perlu">! Perlu bimbingan</span><span>— Belum ada data</span></section>
      {pesan ? <p className="pelengkap-pesan">{pesan}</p> : null}
      {baris.length && tp.length ? (
        <div className="bungkus-rekap">
          <table><thead><tr><th>Siswa</th>{tp.map((tujuan) => <th key={tujuan.id}><abbr title={tujuan.teks_tujuan}>{tujuan.kode_tampil}</abbr></th>)}<th>Tuntas</th></tr></thead><tbody>{baris.map((item) => <tr key={item.siswa.id}><th>{item.siswa.nama}</th>{tp.map((tujuan) => { const status = item.statusPerTp[tujuan.id] ?? 'belum_ada_data'; return <td key={tujuan.id} data-status={status} aria-label={status.replaceAll('_', ' ')}>{SIMBOL_STATUS[status]}</td>; })}<td><strong>{item.jumlahTuntas} / {tp.length}</strong></td></tr>)}</tbody></table>
          <div className="kartu-rekap-hp">{baris.map((item) => <article key={item.siswa.id}><header><strong>{item.siswa.nama}</strong><span>{item.jumlahTuntas}/{tp.length} tuntas</span></header><div>{tp.map((tujuan) => { const status = item.statusPerTp[tujuan.id] ?? 'belum_ada_data'; return <span key={tujuan.id} data-status={status}><code>{tujuan.kode_tampil}</code><b>{SIMBOL_STATUS[status]}</b></span>; })}</div></article>)}</div>
        </div>
      ) : (
        <section className="keadaan-kosong keadaan-kosong--fitur"><h2>Belum ada hasil untuk {kelas ? `Kelas ${kelas.tingkat}` : 'kelas ini'}</h2><p>Tambahkan siswa, lalu jalankan game, LKPD, atau asesmen. Rekap akan dihitung dari satu tabel hasil.</p><Link className="tombol-guru tombol-guru--utama" to={baris.length ? RUTE.papan : '/kelas/kelompok'}>{baris.length ? 'Buka Papan' : 'Kelola Siswa'}</Link></section>
      )}
    </main>
  );
}
