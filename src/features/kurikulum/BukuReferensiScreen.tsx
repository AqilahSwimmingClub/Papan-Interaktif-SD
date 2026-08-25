import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { keAppError } from '../../lib/errors/AppError';
import {
  bacaRingkasanBukuReferensi,
  daftarBukuReferensi,
  simpanBukuReferensi,
  type RingkasanBukuReferensi,
} from '../../lib/storage/bukuReferensiRepo';
import { daftarMapelUntukKelas, type RingkasanMapel } from '../../lib/storage/kurikulumRepo';
import { PESAN_MENUNGGU_BUKU } from '../../lib/referensi/strukturReferensi';
import type { BukuReferensi } from '../../lib/types';
import { RUTE, ruteStrukturMapel } from '../../routes/paths';
import { useAuth } from '../../state/useAuth';
import './kurikulum.css';

/**
 * Pendaftaran Buku Referensi sekolah.
 *
 * Daftar dimulai kosong. Guru/operator mendaftarkan buku pelajaran resmi yang
 * benar-benar dipakai; bab, topik, CP, dan TP dipetakan setelah buku terdaftar.
 */
export function BukuReferensiScreen() {
  const { akun } = useAuth();
  const [tingkat, setTingkat] = useState(1);
  const [mapel, setMapel] = useState<RingkasanMapel[]>([]);
  const [mapelKode, setMapelKode] = useState('');
  const [buku, setBuku] = useState<BukuReferensi[]>([]);
  const [ringkasan, setRingkasan] = useState<RingkasanBukuReferensi | null>(null);
  const [judul, setJudul] = useState('');
  const [penerbit, setPenerbit] = useState('');
  const [tahun, setTahun] = useState('');
  const [pesan, setPesan] = useState('');

  const muat = useCallback(async () => {
    try {
      const [daftarMapel, daftarBuku, ringkas] = await Promise.all([
        daftarMapelUntukKelas(tingkat),
        daftarBukuReferensi(tingkat),
        bacaRingkasanBukuReferensi(),
      ]);
      setMapel(daftarMapel);
      setBuku(daftarBuku);
      setRingkasan(ringkas);
      setMapelKode((lama) =>
        daftarMapel.some((item) => item.kode === lama) ? lama : (daftarMapel[0]?.kode ?? ''),
      );
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }, [tingkat]);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function tambahBuku(peristiwa: FormEvent) {
    peristiwa.preventDefault();
    if (!judul.trim() || !mapelKode) return;
    try {
      await simpanBukuReferensi({
        id: `BUKU-${crypto.randomUUID()}`,
        tingkat_kelas: tingkat,
        mapel_kode: mapelKode,
        judul: judul.trim(),
        penulis: '',
        penerbit: penerbit.trim(),
        tahun: tahun.trim(),
        edisi: '',
        isbn: '',
        utama: buku.every((item) => item.mapel_kode !== mapelKode),
        status: 'aktif',
        ditambahkan_oleh: akun?.id ?? null,
        ditambahkan_pada: new Date().toISOString(),
      });
      setJudul('');
      setPenerbit('');
      setTahun('');
      setPesan('Buku referensi tersimpan. Bab dan topik dapat dipetakan setelah ini.');
      await muat();
    } catch (galat) {
      setPesan(keAppError(galat).message);
    }
  }

  return (
    <main className="halaman-kurikulum halaman-buku-referensi" data-testid="buku-referensi">
      <header className="kop-kurikulum">
        <div>
          <p className="label-data">Kelas → Mapel → Buku Referensi → Bab → Topik</p>
          <h1>Buku Referensi</h1>
          <p>
            Daftarkan buku pelajaran resmi yang dipakai sekolah. Seluruh CP, TP, kuis, game,
            LKPD, dan bank soal akan dibentuk dari buku yang terdaftar di sini.
          </p>
        </div>
        <Link className="tombol-guru tombol-guru--sekunder" to={RUTE.strukturKurikulum}>
          Lihat struktur kurikulum
        </Link>
      </header>

      <section className="statistik-basis" aria-label="Ringkasan buku referensi">
        <article>
          <span>Buku terdaftar</span>
          <strong>{ringkasan?.jumlahBuku ?? 0}</strong>
          <small>seluruh kelas</small>
        </article>
        <article>
          <span>Bab</span>
          <strong>{ringkasan?.jumlahBab ?? 0}</strong>
          <small>dari buku terdaftar</small>
        </article>
        <article>
          <span>Topik / lingkup materi</span>
          <strong>{ringkasan?.jumlahTopik ?? 0}</strong>
          <small>dari bab terdaftar</small>
        </article>
        <article>
          <span>Kelas terisi</span>
          <strong>{ringkasan?.kelasTerisi.length ?? 0}</strong>
          <small>dari 6 kelas</small>
        </article>
      </section>

      <section className="panel-kurikulum" aria-label="Tambah buku referensi">
        <div className="panel-kurikulum__kop">
          <div>
            <h2>Daftarkan buku</h2>
            <p>Metadata buku disimpan lokal di perangkat ini.</p>
          </div>
        </div>
        <form className="form-buku" onSubmit={(peristiwa) => void tambahBuku(peristiwa)}>
          <label>
            Kelas
            <select value={tingkat} onChange={(e) => setTingkat(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((nilai) => (
                <option key={nilai} value={nilai}>
                  Kelas {nilai}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mata pelajaran
            <select value={mapelKode} onChange={(e) => setMapelKode(e.target.value)}>
              {mapel.map((item) => (
                <option key={item.kode} value={item.kode}>
                  {item.nama}
                </option>
              ))}
            </select>
          </label>
          <label>
            Judul buku
            <input
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Judul buku pelajaran resmi"
            />
          </label>
          <label>
            Penerbit
            <input value={penerbit} onChange={(e) => setPenerbit(e.target.value)} />
          </label>
          <label>
            Tahun
            <input value={tahun} onChange={(e) => setTahun(e.target.value)} inputMode="numeric" />
          </label>
          <button className="tombol-guru tombol-guru--utama" type="submit" disabled={!judul.trim()}>
            Tambah buku referensi
          </button>
        </form>
        {pesan ? (
          <p className="pesan-kurikulum" role="status">
            {pesan}
          </p>
        ) : null}
      </section>

      <section className="daftar-buku-mapel" aria-label="Buku terdaftar pada kelas ini">
        {buku.length ? (
          buku.map((item) => (
            <article key={item.id}>
              <div>
                <h3>{item.judul}</h3>
                <p>
                  Kelas {item.tingkat_kelas} · {item.mapel_kode} ·{' '}
                  {item.penerbit || 'penerbit belum dicatat'}
                </p>
              </div>
              <Link to={ruteStrukturMapel(item.tingkat_kelas, item.mapel_kode)}>
                Buka struktur →
              </Link>
            </article>
          ))
        ) : (
          <div className="keadaan-kosong keadaan-kosong--dalam">
            <h3>Belum ada buku referensi untuk Kelas {tingkat}</h3>
            <p>{PESAN_MENUNGGU_BUKU}</p>
          </div>
        )}
      </section>
    </main>
  );
}
