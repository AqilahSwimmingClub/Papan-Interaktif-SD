import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { keAppError } from '../../lib/errors/AppError';
import { daftarKelompokKelas, daftarSiswaKelas, pastikanKelasKerja } from '../../lib/storage/kelasRepo';
import { daftarHasilKelas, simpanPenilaian } from '../../lib/storage/penilaianRepo';
import type { HasilBelajar, Kelas, Kelompok, Siswa } from '../../lib/types';
import { RUTE } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './pelengkap.css';

type KelompokAnggota = Kelompok & { anggota: Siswa[] };

export function PenilaianScreen() {
  const { akun } = useAuth();
  const { konteks, pilihKelas } = useKurikulum();
  const [tingkat, setTingkat] = useState(konteks.tingkat_kelas ?? 4);
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelompok, setKelompok] = useState<KelompokAnggota[]>([]);
  const [hasil, setHasil] = useState<HasilBelajar[]>([]);
  const [mode, setMode] = useState<'individu'|'kelompok'>('individu');
  const [sasaran, setSasaran] = useState('');
  const [jenis, setJenis] = useState<HasilBelajar['jenis_aktivitas']>('pembelajaran');
  const [skor, setSkor] = useState(75);
  const [maksimal, setMaksimal] = useState(100);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [pesan, setPesan] = useState('');

  const muat = useCallback(async (kelasTingkat = tingkat) => {
    if (!akun) return;
    const aktif = await pastikanKelasKerja(kelasTingkat, akun.id);
    const [anak, grup, nilai] = await Promise.all([daftarSiswaKelas(aktif.id), daftarKelompokKelas(aktif.id), daftarHasilKelas(aktif.id)]);
    setKelas(aktif); setSiswa(anak); setKelompok(grup); setHasil(nilai); pilihKelas(kelasTingkat, aktif.fase_kode);
  }, [akun, pilihKelas, tingkat]);
  useEffect(() => { void muat().catch((galat: unknown) => setPesan(keAppError(galat).message)); }, [muat]);

  async function simpan() {
    if (!akun || !kelas) return;
    try {
      await simpanPenilaian({ kelasId: kelas.id, tpId: konteks.tp_id ?? '', dinilaiOleh: akun.id, jenis,
        siswaId: mode === 'individu' ? sasaran : undefined, kelompokId: mode === 'kelompok' ? sasaran : undefined,
        skor, skorMaksimal: maksimal, tanggal });
      setPesan(mode === 'kelompok' ? 'Nilai kelompok tersimpan dan disinkronkan ke setiap anggota.' : 'Nilai individu tersimpan.');
      await muat();
    } catch (galat) { setPesan(keAppError(galat).message); }
  }

  const namaSiswa = useMemo(() => new Map(siswa.map((item) => [item.id, item.nama])), [siswa]);
  return <main className="halaman-pelengkap" data-testid="layar-penilaian">
    <header className="pelengkap-kop"><div><p className="label-data">Kelas dan Data</p><h1>Penilaian</h1><p>Nilai individu, kelompok, game/battle, dan pembelajaran selalu terkait TP aktif.</p></div><label className="pilih-kelas-ringkas">Kelas<select value={tingkat} onChange={(e) => { setTingkat(Number(e.target.value)); setSasaran(''); }}>{[1,2,3,4,5,6].map((item) => <option key={item} value={item}>Kelas {item}</option>)}</select></label></header>
    {!konteks.tp_id ? <section className="keadaan-kosong keadaan-kosong--fitur"><h2>Pilih CP dan TP lebih dulu</h2><p>Penilaian tanpa TP tidak dapat disimpan agar laporan pembelajaran tetap sahih.</p><Link className="tombol-guru tombol-guru--utama" to={RUTE.kelas}>Pilih Kelas, Mapel, CP, dan TP</Link></section> : <>
      <section className="kartu-backup form-penilaian"><h2>Catat hasil kegiatan</h2><div className="baris-form"><label>Mode<select value={mode} onChange={(e) => { setMode(e.target.value as typeof mode); setSasaran(''); }}><option value="individu">Individu</option><option value="kelompok">Kelompok</option></select></label><label>Sasaran<select value={sasaran} onChange={(e) => setSasaran(e.target.value)}><option value="">Pilih...</option>{(mode === 'individu' ? siswa : kelompok).map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label><label>Kegiatan<select value={jenis} onChange={(e) => setJenis(e.target.value as HasilBelajar['jenis_aktivitas'])}><option value="pembelajaran">Pembelajaran</option><option value="asesmen">Asesmen</option><option value="lkpd">LKPD</option><option value="game">Game</option><option value="battle">Battle</option></select></label><label>Tanggal<input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}/></label><label>Skor<input type="number" min="0" value={skor} onChange={(e) => setSkor(Number(e.target.value))}/></label><label>Maksimal<input type="number" min="1" value={maksimal} onChange={(e) => setMaksimal(Number(e.target.value))}/></label></div><button className="tombol-guru tombol-guru--utama" disabled={!sasaran} type="button" onClick={() => void simpan()}>Simpan Penilaian</button></section>
      {pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : null}
      <section className="daftar-siswa"><h2>Riwayat penilaian</h2>{hasil.length ? <div className="tabel-data-wrap"><table><thead><tr><th>Tanggal</th><th>Siswa</th><th>Kegiatan</th><th>Skor</th><th>Ketuntasan</th></tr></thead><tbody>{hasil.slice(0,100).map((item) => <tr key={item.id}><td>{item.tanggal_kegiatan ?? item.waktu.slice(0,10)}</td><td>{namaSiswa.get(item.siswa_id) ?? item.siswa_id}</td><td>{item.jenis_aktivitas}</td><td>{item.skor}/{item.skor_maksimal}</td><td>{item.ketuntasan.replace('_',' ')}</td></tr>)}</tbody></table></div> : <p>Belum ada hasil pada kelas ini.</p>}</section>
    </>}
  </main>;
}
