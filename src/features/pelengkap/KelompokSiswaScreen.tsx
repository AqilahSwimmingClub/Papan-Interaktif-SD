import { useCallback, useEffect, useState } from 'react';
import { keAppError } from '../../lib/errors/AppError';
import {
  buatKelompokOtomatis,
  daftarKelompokKelas,
  daftarSiswaKelas,
  pastikanKelasKerja,
  tambahSiswa,
} from '../../lib/storage/kelasRepo';
import type { Kelas, Kelompok, Siswa } from '../../lib/types';
import { useAuth } from '../../state/useAuth';
import { useKurikulum } from '../../state/useKurikulum';
import './pelengkap.css';

type KelompokBeranggota = Kelompok & { anggota: Siswa[] };

export function KelompokSiswaScreen() {
  const { akun } = useAuth();
  const { konteks, pilihKelas } = useKurikulum();
  const [tingkat, setTingkat] = useState(konteks.tingkat_kelas ?? 4);
  const [kelas, setKelas] = useState<Kelas | null>(null);
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kelompok, setKelompok] = useState<KelompokBeranggota[]>([]);
  const [namaBaru, setNamaBaru] = useState('');
  const [ukuran, setUkuran] = useState(4);
  const [jenis, setJenis] = useState<NonNullable<Kelompok['jenis']>>('tetap');
  const [pesan, setPesan] = useState('');

  const muat = useCallback(async (tingkatAktif = tingkat) => {
    if (!akun) return;
    const kelasAktif = await pastikanKelasKerja(tingkatAktif, akun.id);
    const [daftarSiswa, daftarKelompok] = await Promise.all([
      daftarSiswaKelas(kelasAktif.id),
      daftarKelompokKelas(kelasAktif.id),
    ]);
    setKelas(kelasAktif);
    setSiswa(daftarSiswa);
    setKelompok(daftarKelompok);
    pilihKelas(tingkatAktif, kelasAktif.fase_kode);
  }, [akun, pilihKelas, tingkat]);

  useEffect(() => {
    void muat().catch((galat: unknown) => setPesan(keAppError(galat).message));
  }, [muat]);

  async function tanganiTambah(peristiwa: React.FormEvent) {
    peristiwa.preventDefault();
    if (!kelas) return;
    try {
      await tambahSiswa(kelas.id, namaBaru);
      setNamaBaru('');
      setPesan('Siswa disimpan lokal.');
      await muat();
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }

  async function tanganiAcak() {
    if (!kelas) return;
    try {
      await buatKelompokOtomatis(kelas.id, ukuran, 1, jenis);
      setPesan('Kelompok dapat digunakan ulang untuk pembelajaran, game, battle, dan penilaian.');
      await muat();
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }

  return (
    <main className="halaman-pelengkap" data-testid="layar-kelompok">
      <header className="pelengkap-kop">
        <div><p className="label-data">Kelas & Data</p><h1>Kelompok Siswa</h1><p>Kelompok tetap per semester untuk game, battle, dan penilaian kelompok.</p></div>
        <label className="pilih-kelas-ringkas">Kelas<select value={tingkat} onChange={(e) => setTingkat(Number(e.target.value))}>{[1, 2, 3, 4, 5, 6].map((nilai) => <option key={nilai} value={nilai}>Kelas {nilai}</option>)}</select></label>
      </header>

      <section className="pelengkap-toolbar">
        <form onSubmit={(e) => void tanganiTambah(e)}>
          <label htmlFor="nama-siswa">Tambah siswa</label>
          <input id="nama-siswa" value={namaBaru} onChange={(e) => setNamaBaru(e.target.value)} placeholder="Nama lengkap siswa" maxLength={80} />
          <button className="tombol-guru tombol-guru--utama" type="submit">Tambah</button>
        </form>
        <div className="kontrol-kelompok">
          <label>Jenis<select value={jenis} onChange={(e) => setJenis(e.target.value as NonNullable<Kelompok['jenis']>)}><option value="tetap">Tetap</option><option value="pembelajaran">Pembelajaran</option><option value="game_battle">Game / Battle</option></select></label>
          <label>Anggota<select value={ukuran} onChange={(e) => setUkuran(Number(e.target.value))}>{[2, 3, 4, 5, 6].map((nilai) => <option key={nilai} value={nilai}>{nilai} per kelompok</option>)}</select></label>
          <button type="button" onClick={() => void tanganiAcak()}>Acak ulang & simpan</button>
        </div>
      </section>
      {pesan ? <p className="pelengkap-pesan" role="status">{pesan}</p> : null}

      {siswa.length ? (
        kelompok.length ? (
          <section className="kisi-kelompok" aria-label={`${kelompok.length} kelompok`}>
            {kelompok.map((grup, indeks) => (
              <article key={grup.id}>
                <header><span>{indeks + 1}</span><div><h2>{grup.nama}</h2><small>{(grup.jenis ?? 'tetap').replace('_', ' ')} Â· {grup.poin_total.toLocaleString('id-ID')} poin</small></div><b>{grup.anggota.length}</b></header>
                <ul>{grup.anggota.map((anak) => <li key={anak.id}><span>{String(anak.nomor_absen).padStart(2, '0')}</span>{anak.nama}</li>)}</ul>
              </article>
            ))}
          </section>
        ) : (
          <section className="keadaan-kosong keadaan-kosong--fitur"><h2>{siswa.length} siswa belum dikelompokkan</h2><p>Pilih jumlah anggota, lalu tekan “Acak ulang & simpan”.</p><button className="tombol-guru tombol-guru--utama" type="button" onClick={() => void tanganiAcak()}>Buat Kelompok</button></section>
        )
      ) : (
        <section className="keadaan-kosong keadaan-kosong--fitur"><h2>Belum ada siswa di Kelas {tingkat}</h2><p>Tambahkan siswa satu per satu atau impor Excel dari menu Data Siswa.</p></section>
      )}
    </main>
  );
}
