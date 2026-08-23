import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  bacaDetailMapelKelas,
  type DetailMapelKelas,
} from '../../lib/storage/kurikulumRepo';
import { log } from '../../lib/errors/logger';
import { useKurikulum } from '../../state/useKurikulum';
import {
  RUTE,
  ruteMapel,
  rutePembelajaran,
  type JenisPembelajaran,
} from '../../routes/paths';
import './kurikulum.css';

const TAB_PEMBELAJARAN: Array<{ label: string; jenis: JenisPembelajaran }> = [
  { label: 'Materi', jenis: 'materi' },
  { label: 'Aktivitas / Game', jenis: 'game' },
  { label: 'LKPD', jenis: 'lkpd' },
  { label: 'Asesmen', jenis: 'asesmen' },
];

export function CpTpScreen() {
  const { tingkat: tingkatParam, mapelKode: mapelParam } = useParams();
  const tingkat = Number(tingkatParam);
  const mapelKode = mapelParam ? decodeURIComponent(mapelParam) : '';
  const validTingkat = Number.isInteger(tingkat) && tingkat >= 1 && tingkat <= 6;
  const { konteks, pilihKelas, pilihMapel, pilihElemen, pilihTp } = useKurikulum();
  const [detail, setDetail] = useState<DetailMapelKelas | null>(null);
  const [elemenAktifId, setElemenAktifId] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(true);
  const elemenTersimpanAwal = useRef(konteks.elemen_id);

  useEffect(() => {
    if (!validTingkat || !mapelKode) {
      setMemuat(false);
      return;
    }
    setMemuat(true);
    void bacaDetailMapelKelas(tingkat, mapelKode)
      .then((hasil) => {
        setDetail(hasil);
        const idTersimpan = hasil?.elemen.some(
          (elemen) => elemen.id === elemenTersimpanAwal.current && elemen.status === 'aktif',
        )
          ? elemenTersimpanAwal.current
          : hasil?.elemen.find((elemen) => elemen.status === 'aktif')?.id ?? null;
        setElemenAktifId(idTersimpan);
      })
      .catch((galat: unknown) => {
        log.galat('CP dan TP gagal dimuat.', galat);
        setDetail(null);
      })
      .finally(() => setMemuat(false));
  }, [mapelKode, tingkat, validTingkat]);

  useEffect(() => {
    if (!detail) return;
    pilihKelas(detail.kelas.tingkat, detail.kelas.fase_kode);
    pilihMapel({
      mapelKode: detail.mapel.kode,
      cpId: detail.cp.id,
      cabangKode: detail.cp.cabang_kode,
      agamaKode: detail.cp.agama_kode,
    });
    if (elemenAktifId) pilihElemen(elemenAktifId);
  }, [detail, elemenAktifId, pilihElemen, pilihKelas, pilihMapel]);

  const elemenAktif = useMemo(
    () => detail?.elemen.find((elemen) => elemen.id === elemenAktifId) ?? null,
    [detail, elemenAktifId],
  );
  const tpAktif = elemenAktif
    ? [...elemenAktif.tpRekomendasi, ...elemenAktif.tpSekolah].find(
        (tujuan) => tujuan.id === konteks.tp_id,
      ) ?? null
    : null;

  function tanganiPilihElemen(id: string) {
    setElemenAktifId(id);
    pilihElemen(id);
  }

  if (memuat) {
    return (
      <main className="halaman-kurikulum">
        <div className="kerangka-memuat" aria-label="Memuat CP dan TP">
          <span />
          <span />
          <span />
        </div>
      </main>
    );
  }

  if (!detail || !validTingkat) {
    return (
      <main className="halaman-kurikulum">
        <div className="keadaan-kosong keadaan-kosong--galat">
          <h1>Data mata pelajaran tidak ditemukan</h1>
          <p>Pilih kembali kelas dan mata pelajaran yang tersedia.</p>
          <Link className="tombol-guru tombol-guru--utama" to={RUTE.kelas}>
            Pilih Kelas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="halaman-kurikulum halaman-cp-tp" data-testid="layar-cp-tp">
      <nav className="remah-kurikulum" aria-label="Konteks kurikulum">
        <Link to={RUTE.kelas}>Kelas {detail.kelas.tingkat}</Link>
        <span>/</span>
        <Link to={ruteMapel(detail.kelas.tingkat)}>Fase {detail.kelas.fase_kode}</Link>
        <span>/</span>
        <strong>{detail.mapel.nama}</strong>
        {elemenAktif ? (
          <>
            <span>/</span>
            <span>{elemenAktif.nama}</span>
          </>
        ) : null}
      </nav>

      <header className="kop-kurikulum kop-kurikulum--cp">
        <div>
          <p className="label-data">Langkah 3 dari 3 · CP hanya-baca</p>
          <h1>CP & Tujuan Pembelajaran</h1>
          <p>
            {detail.mapel.nama} · Kelas {detail.kelas.tingkat} · Fase {detail.kelas.fase_kode}
          </p>
        </div>
        <Link className="tombol-guru tombol-guru--utama" to={rutePembelajaran('papan')}>
          Buka Papan
        </Link>
      </header>

      <div className="bilah-tab-pembelajaran" aria-label="Fitur pembelajaran TP">
        {TAB_PEMBELAJARAN.map((tab) =>
          tpAktif ? (
            <Link key={tab.jenis} to={rutePembelajaran(tab.jenis)}>
              {tab.label}
            </Link>
          ) : (
            <span key={tab.jenis} aria-disabled="true" title="Pilih satu TP lebih dulu">
              {tab.label}
            </span>
          ),
        )}
      </div>

      <div className="tata-cp-tp">
        <aside className="panel-elemen" aria-label="Daftar elemen CP">
          <div className="panel-elemen__kop">
            <div>
              <h2>Capaian Pembelajaran</h2>
              <span className="badge-terkunci">Hanya-baca</span>
            </div>
            <p>{detail.elemen.length} elemen</p>
          </div>
          <div className="daftar-elemen">
            {detail.elemen.map((elemen) => (
              <button
                type="button"
                key={elemen.id}
                className={elemen.id === elemenAktifId ? 'daftar-elemen__aktif' : ''}
                onClick={() => tanganiPilihElemen(elemen.id)}
                disabled={elemen.status === 'tidak_berlaku'}
              >
                {elemen.kelompok ? <small>{elemen.kelompok}</small> : null}
                <strong>{elemen.nama}</strong>
                <span>
                  {elemen.status === 'tidak_berlaku'
                    ? 'Tidak berlaku di fase ini'
                    : `${elemen.tpRekomendasi.length + elemen.tpSekolah.length} TP`}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="panel-tp">
          {elemenAktif ? (
            <>
              <article className="kutipan-cp">
                <div className="kutipan-cp__kop">
                  <div>
                    <span className="badge-cp">CP Resmi · {detail.cp.versi}</span>
                    <h2>{elemenAktif.nama}</h2>
                  </div>
                  <span className="badge-verifikasi">Menunggu verifikasi</span>
                </div>
                <p>{elemenAktif.teks_elemen}</p>
                <footer>
                  <span>{detail.dokumen?.judul ?? detail.cp.dokumen_kode}</span>
                  <span>
                    {detail.cp.halaman_lampiran
                      ? `Halaman lampiran ${detail.cp.halaman_lampiran}`
                      : 'Nomor halaman belum tersedia'}
                  </span>
                </footer>
              </article>

              <div className="kop-daftar-tp">
                <div>
                  <p className="label-data">Elemen {elemenAktif.nama}</p>
                  <h2>Tujuan Pembelajaran</h2>
                </div>
                <Link to="/fitur/kelola-tp-sekolah">Tambah TP Sekolah/Guru</Link>
              </div>

              <section className="kelompok-tp" aria-labelledby="tp-rekomendasi">
                <div className="kelompok-tp__judul">
                  <h3 id="tp-rekomendasi">TP Rekomendasi</h3>
                  <span>{elemenAktif.tpRekomendasi.length}</span>
                </div>
                {elemenAktif.tpRekomendasi.length ? (
                  <div className="daftar-tp">
                    {elemenAktif.tpRekomendasi.map((tujuan) => (
                      <article
                        className={`kartu-tp${
                          tujuan.id === konteks.tp_id ? ' kartu-tp--aktif' : ''
                        }`}
                        key={tujuan.id}
                      >
                        <div className="kartu-tp__isi">
                          <div>
                            <code>{tujuan.kode_tampil}</code>
                            <span className="badge-rekomendasi">Rekomendasi · Terkunci</span>
                          </div>
                          <p>{tujuan.teks_tujuan}</p>
                          <small>Semester {tujuan.semester}</small>
                        </div>
                        <div className="kartu-tp__aksi">
                          <button type="button" onClick={() => pilihTp(tujuan.id)}>
                            Pilih TP
                          </button>
                          <Link
                            to={rutePembelajaran('materi')}
                            onClick={() => pilihTp(tujuan.id)}
                          >
                            Buka TP
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="keadaan-kosong keadaan-kosong--dalam">
                    <h4>Belum ada TP Rekomendasi untuk elemen ini</h4>
                    <p>
                      {detail.cp.dokumen_kode === '020/2026'
                        ? 'Nomor 020 Tahun 2026 menetapkan CP dan tidak memuat daftar TP nasional. Gunakan TP Sekolah/Guru atau impor TP Rekomendasi terpisah.'
                        : 'Dataset final belum memuat TP untuk kelas dan elemen ini. Data tidak dilengkapi dengan perkiraan.'}
                    </p>
                    <Link to="/fitur/kelola-tp-sekolah">Kelola TP Sekolah/Guru</Link>
                  </div>
                )}
              </section>

              <section className="kelompok-tp kelompok-tp--sekolah" aria-labelledby="tp-sekolah">
                <div className="kelompok-tp__judul">
                  <h3 id="tp-sekolah">TP Sekolah/Guru</h3>
                  <span>{elemenAktif.tpSekolah.length}</span>
                </div>
                {elemenAktif.tpSekolah.length ? (
                  <div className="daftar-tp">
                    {elemenAktif.tpSekolah.map((tujuan) => (
                      <article className="kartu-tp kartu-tp--sekolah" key={tujuan.id}>
                        <div className="kartu-tp__isi">
                          <div>
                            <code>{tujuan.kode_tampil}</code>
                            <span className="badge-sekolah">Sekolah · Dapat diedit</span>
                          </div>
                          <p>{tujuan.teks_tujuan}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="kelompok-tp__kosong">
                    Belum ada TP Sekolah/Guru untuk elemen ini.
                  </p>
                )}
              </section>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
