import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { keAppError } from '../../lib/errors/AppError';
import { daftarMateriUntukTp, simpanMateri } from '../../lib/storage/kurikulumAdminRepo';
import { daftarBukuReferensi } from '../../lib/storage/bukuReferensiRepo';
import type { BlokMateri, BukuReferensi, JenisBlokMateri, Materi } from '../../lib/types';
import { RUTE, ruteStrukturMapel, rutePembelajaran } from '../../routes/paths';
import { useKurikulum } from '../../state/useKurikulum';
import './materi.css';

const JENIS_BLOK: Array<{ nilai: JenisBlokMateri; label: string }> = [
  { nilai: 'judul', label: 'Judul' },
  { nilai: 'teks', label: 'Teks' },
  { nilai: 'gambar', label: 'Gambar' },
  { nilai: 'video', label: 'Video' },
  { nilai: 'audio', label: 'Audio' },
  { nilai: 'dokumen', label: 'Dokumen' },
  { nilai: 'aktivitas', label: 'Aktivitas' },
];

function blokBaru(jenis: JenisBlokMateri): BlokMateri {
  return { id: crypto.randomUUID(), jenis, isi: '', urutan: 1 };
}

export function MateriScreen() {
  const { konteks } = useKurikulum();
  const [materi, setMateri] = useState<Materi[]>([]);
  const [buku, setBuku] = useState<BukuReferensi[]>([]);
  const [judul, setJudul] = useState('');
  const [blok, setBlok] = useState<BlokMateri[]>([blokBaru('teks')]);
  const [pesan, setPesan] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    if (!konteks.tp_id || !konteks.mapel_kode || !konteks.tingkat_kelas) return;
    void Promise.all([
      daftarMateriUntukTp(konteks.tp_id),
      daftarBukuReferensi(konteks.tingkat_kelas, konteks.mapel_kode),
    ]).then(([daftarMateri, daftarBuku]) => {
      setMateri(daftarMateri);
      setBuku(daftarBuku);
    });
  }, [konteks.mapel_kode, konteks.tingkat_kelas, konteks.tp_id]);

  if (!konteks.tp_id || !konteks.mapel_kode || !konteks.tingkat_kelas) {
    return (
      <main className="halaman-kurikulum halaman-materi">
        <section className="keadaan-kosong keadaan-kosong--fitur">
          <h1>Pilih TP sebelum membuka materi</h1>
          <p>Materi wajib menunjuk satu TP pada lapisan data.</p>
          <Link className="tombol-guru tombol-guru--utama" to={RUTE.kelas}>Pilih Kelas</Link>
        </section>
      </main>
    );
  }

  async function tanganiSimpan() {
    if (!konteks.tp_id) return;
    setMenyimpan(true);
    setPesan('');
    try {
      const nilai: Materi = {
        id: `MATERI-${crypto.randomUUID()}`,
        tp_id: konteks.tp_id,
        judul: judul.trim(),
        blok: blok.map((item, indeks) => ({ ...item, urutan: indeks + 1 })),
        sumber: 'guru',
        perkiraan_menit: 20,
        diperbarui: new Date().toISOString(),
        referensi_bab_id: konteks.referensi_bab_id,
      };
      if (!nilai.judul || nilai.blok.every((item) => !item.isi.trim())) {
        throw new Error('Judul dan sedikitnya satu isi blok wajib diisi.');
      }
      await simpanMateri(nilai);
      setMateri((lama) => [...lama, nilai]);
      setJudul('');
      setBlok([blokBaru('teks')]);
      setPesan('Materi tersimpan lokal dan tertaut ke TP aktif.');
    } catch (galat) {
      setPesan(keAppError(galat).message);
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <main className="halaman-kurikulum halaman-materi" data-testid="layar-materi">
      <nav className="remah-kurikulum" aria-label="Konteks kurikulum">
        <Link to={ruteStrukturMapel(konteks.tingkat_kelas, konteks.mapel_kode)}>Kelas {konteks.tingkat_kelas}</Link>
        <span>/</span><strong>{konteks.mapel_kode}</strong><span>/</span><span>{konteks.tp_id}</span>
      </nav>
      <header className="kop-kurikulum kop-materi">
        <div>
          <p className="label-data">Materi lokal · tujuh jenis blok</p>
          <h1>Materi Pembelajaran</h1>
          <p>Semua materi wajib tertaut TP dan dapat dibuka kembali tanpa internet.</p>
        </div>
        <Link className="tombol-guru tombol-guru--utama" to={rutePembelajaran('papan')}>Tayangkan di Papan</Link>
      </header>

      <div className="tata-materi">
        <section className="panel-materi">
          <h2>Materi tersimpan</h2>
          {materi.length ? (
            <div className="daftar-materi">
              {materi.map((item) => (
                <article key={item.id}>
                  <span>{item.sumber}</span><h3>{item.judul}</h3>
                  <p>{item.blok.length} blok · {item.perkiraan_menit} menit</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="keadaan-kosong keadaan-kosong--dalam">
              <h3>Belum ada materi untuk TP ini</h3>
              <p>Buat manual dengan blok di samping. Data disimpan di perangkat ini.</p>
            </div>
          )}

          <div className="referensi-materi">
            <h2>Buku referensi</h2>
            {buku.length ? buku.map((item) => (
              <article key={item.id}><strong>{item.judul}</strong><small>{item.penerbit || 'Penerbit belum dicatat'}</small></article>
            )) : <p>Belum ada buku referensi untuk kelas dan mata pelajaran ini.</p>}
          </div>
        </section>

        <section className="editor-materi">
          <div><p className="label-data">Buat manual</p><h2>Materi baru</h2></div>
          <label>Judul materi<input value={judul} onChange={(peristiwa) => setJudul(peristiwa.target.value)} maxLength={120} /></label>
          <div className="pilih-blok" aria-label="Tambah jenis blok">
            {JENIS_BLOK.map((item) => <button type="button" key={item.nilai} onClick={() => setBlok((lama) => [...lama, { ...blokBaru(item.nilai), urutan: lama.length + 1 }])}>+ {item.label}</button>)}
          </div>
          <div className="daftar-editor-blok">
            {blok.map((item, indeks) => (
              <article key={item.id}>
                <header><strong>{indeks + 1}. {JENIS_BLOK.find((jenis) => jenis.nilai === item.jenis)?.label}</strong><button type="button" onClick={() => setBlok((lama) => lama.filter((baris) => baris.id !== item.id))} disabled={blok.length === 1}>Hapus</button></header>
                <textarea aria-label={`Isi blok ${indeks + 1}`} value={item.isi} onChange={(peristiwa) => setBlok((lama) => lama.map((baris) => baris.id === item.id ? { ...baris, isi: peristiwa.target.value } : baris))} placeholder={item.jenis === 'teks' ? 'Tulis penjelasan materi…' : 'Tulis keterangan atau pilih media…'} />
              </article>
            ))}
          </div>
          {pesan ? <p className="pesan-materi" role="status">{pesan}</p> : null}
          <button className="tombol-guru tombol-guru--utama" type="button" onClick={() => void tanganiSimpan()} disabled={menyimpan}>{menyimpan ? 'Menyimpan…' : 'Simpan Materi'}</button>
        </section>
      </div>
    </main>
  );
}
