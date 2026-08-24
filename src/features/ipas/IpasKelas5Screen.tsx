import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BUKU_IPAS_KELAS_5, BAB_IPAS_KELAS_5, type GameIpas } from '../../lib/ipasKelas5';
import { keAppError } from '../../lib/errors/AppError';
import { daftarKelompokKelas, daftarSiswaKelas, pastikanKelasKerja } from '../../lib/storage/kelasRepo';
import { pastikanGameIpasTopik } from '../../lib/storage/ipasRepo';
import type { GamePembelajaran, Kelompok, Siswa } from '../../lib/types';
import { ruteMainGame, ruteVlabIpas5 } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './ipas.css';

type KelompokAnggota = Kelompok & { anggota: Siswa[] };

export function IpasKelas5Screen() {
  const { akun } = useAuth();
  const { konteks } = useKurikulum();
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelompok, setKelompok] = useState<KelompokAnggota[]>([]);
  const [mode, setMode] = useState<'individu' | 'kelompok' | 'battle'>('individu');
  const [sasaran, setSasaran] = useState<string[]>([]);
  const [terbuka, setTerbuka] = useState<string | null>(null);
  const [gameTersimpan, setGameTersimpan] = useState<Record<string, GamePembelajaran[]>>({});
  const [memuatGame, setMemuatGame] = useState<string | null>(null);
  const [pesan, setPesan] = useState('');

  useEffect(() => {
    if (!akun) return;
    void pastikanKelasKerja(5, akun.id).then(async (kelas) => {
      const [anak, grup] = await Promise.all([daftarSiswaKelas(kelas.id), daftarKelompokKelas(kelas.id)]);
      setSiswa(anak); setKelompok(grup);
    }).catch((galat: unknown) => setPesan(keAppError(galat).message));
  }, [akun]);

  const konteksSah = konteks.tingkat_kelas === 5 && konteks.mapel_kode === 'IPAS' && Boolean(konteks.cp_id && konteks.tp_id);
  const sesiId = useMemo(() => `SESI-IPAS5-${Date.now()}`, []);
  const parameterSasaran = useCallback(() => {
    const parameter = new URLSearchParams({ sesi: sesiId });
    if (mode === 'individu' && sasaran[0]) parameter.set('siswa', sasaran[0]);
    if (mode !== 'individu' && sasaran.length) parameter.set('kelompok', sasaran.slice(0, mode === 'battle' ? 4 : 1).join(','));
    return parameter.toString();
  }, [mode, sasaran, sesiId]);

  async function bukaGame(topikId: string) {
    if (!konteks.tp_id) return;
    setTerbuka(topikId); setMemuatGame(topikId); setPesan('');
    try {
      const game = await pastikanGameIpasTopik(topikId, konteks.tp_id);
      setGameTersimpan((lama) => ({ ...lama, [topikId]: game }));
    } catch (galat) { setPesan(keAppError(galat).message); }
    finally { setMemuatGame(null); }
  }

  const pilihSasaran = (id: string) => {
    if (mode !== 'battle') { setSasaran(id ? [id] : []); return; }
    setSasaran((lama) => lama.includes(id) ? lama.filter((item) => item !== id) : lama.length < 4 ? [...lama, id] : lama);
  };

  if (!konteksSah) return <main className="halaman-ipas"><section className="ipas-kosong"><span>🧭</span><h1>Pilih konteks IPAS Kelas V</h1><p>Buka Kelas 5 → IPAS → CP → TP. Sistem hanya menampilkan VLAB dan GIM EDU yang relevan dengan TP aktif.</p><Link className="tombol-guru tombol-guru--utama" to="/kelas/5/mapel/IPAS">Pilih CP dan TP IPAS</Link></section></main>;

  return <main className="halaman-ipas" data-testid="hub-ipas-kelas-5">
    <nav className="ipas-remah"><Link to="/kelas/5/mapel/IPAS">← Kembali ke CP & TP</Link><span>Kelas 5</span><span>IPAS</span><strong>{konteks.tp_id}</strong></nav>
    <header className="ipas-hero"><div><p>BUKU REFERENSI · {BUKU_IPAS_KELAS_5.kode}</p><h1>Laboratorium & Gim IPAS Kelas V</h1><span>{BUKU_IPAS_KELAS_5.judul}</span><small>Metadata/topik digunakan sebagai referensi; teks dan ilustrasi buku tidak disalin.</small></div><div className="ipas-ringkasan"><b>8</b><span>Bab</span><b>25</b><span>Topik</span></div></header>

    <section className="ipas-sasaran" aria-label="Sasaran kegiatan"><div><h2>Mode kegiatan</h2><p>Hasil VLAB dan skor gim akan terhubung ke siswa atau anggota kelompok.</p></div><div className="ipas-mode">{(['individu', 'kelompok', 'battle'] as const).map((item) => <button type="button" key={item} className={mode === item ? 'aktif' : ''} onClick={() => { setMode(item); setSasaran([]); }}>{item === 'individu' ? '👤 Individu' : item === 'kelompok' ? '👥 Kelompok' : '⚔️ Battle 2–4 Tim'}</button>)}</div>{mode === 'individu' ? <select aria-label="Pilih siswa" value={sasaran[0] ?? ''} onChange={(e) => pilihSasaran(e.target.value)}><option value="">Pilih siswa (boleh nanti)</option>{siswa.map((item) => <option key={item.id} value={item.id}>{item.nomor_absen}. {item.nama}</option>)}</select> : mode === 'kelompok' ? <select aria-label="Pilih kelompok" value={sasaran[0] ?? ''} onChange={(e) => pilihSasaran(e.target.value)}><option value="">Pilih kelompok (boleh nanti)</option>{kelompok.map((item) => <option key={item.id} value={item.id}>{item.nama} · {item.anggota.length} anggota</option>)}</select> : <div className="ipas-pilih-tim">{kelompok.map((item) => <button type="button" key={item.id} className={sasaran.includes(item.id) ? 'aktif' : ''} onClick={() => pilihSasaran(item.id)}>{sasaran.includes(item.id) ? '✓ ' : ''}{item.nama}</button>)}</div>}</section>
    {pesan ? <p className="ipas-pesan" role="status">{pesan}</p> : null}

    <section className="ipas-katalog"><div className="ipas-katalog__kop"><div><p>KATALOG PEMBELAJARAN</p><h2>TP aktif → topik → percobaan → permainan</h2></div><span>Hanya kartu dengan label “Sesuai TP aktif” yang dapat dibuka.</span></div>
      {BAB_IPAS_KELAS_5.map((bab) => <article className="ipas-bab" key={bab.id}><header><span>BAB {bab.nomor}</span><h2>{bab.nama}</h2></header><div className="ipas-topik-grid">{bab.topik.map((topik) => {
        const relevan = topik.tpIds.includes(konteks.tp_id!); const game = gameTersimpan[topik.id] ?? [];
        return <section className={`ipas-topik${relevan ? '' : ' tidak-relevan'}`} key={topik.id}><header><span>{topik.ikon}</span><div><small>{topik.kode}</small><h3>{topik.nama}</h3><em>{relevan ? '✓ Sesuai TP aktif' : `TP: ${topik.tpIds.join(' / ')}`}</em></div></header><div className="ipas-dua-fitur"><button type="button" disabled={!relevan} onClick={() => setTerbuka(terbuka === `${topik.id}-vlab` ? null : `${topik.id}-vlab`)}>🔬 VLAB / SIMULASI <b>{topik.vlab.length}</b></button><button type="button" disabled={!relevan} onClick={() => void bukaGame(topik.id)}>🎮 GIM EDU <b>{topik.game.length}</b></button></div>
          {terbuka === `${topik.id}-vlab` ? <div className="ipas-lista">{topik.vlab.map((lab) => <article key={lab.id}><span>🔬</span><div><h4>{lab.nama}</h4><p>{lab.tujuan}</p><small>{konteks.tp_id}</small></div><Link to={`${ruteVlabIpas5(lab.id)}?${parameterSasaran()}`}>Mulai VLAB</Link></article>)}</div> : null}
          {terbuka === topik.id ? <div className="ipas-lista ipas-lista--game">{memuatGame === topik.id ? <p>Mempersiapkan dunia permainan di perangkat…</p> : game.map((item) => <KartuGame key={item.id} game={item} config={topik.game.find((cfg) => cfg.id === item.id.slice(item.id.indexOf(topik.id))) ?? topik.game[0]!} parameter={parameterSasaran()}/>)}</div> : null}
        </section>;
      })}</div></article>)}
    </section>
  </main>;
}

function KartuGame({ game, config, parameter }: { game: GamePembelajaran; config: GameIpas; parameter: string }) {
  return <article><span>🎮</span><div><h4>{game.judul}</h4><p>{config.mekanik.replaceAll('_', ' ')} · arena interaktif · 5 level misi</p><small>{game.tp_id} · {game.tingkat_kesulitan} · {game.mode_permainan}</small></div><Link to={`${ruteMainGame(game.id)}?${parameter}`}>Mainkan</Link></article>;
}
