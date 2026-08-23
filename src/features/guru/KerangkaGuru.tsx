import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../state/useAuth';
import { bacaSekolah } from '../../lib/storage/sekolahRepo';
import type { Sekolah } from '../../lib/types';
import { log } from '../../lib/errors/logger';
import { RUTE } from '../../routes/paths';
import { akhiriSesiAktifGuru, daftarSesiAktifGuru } from '../../lib/storage/kelasRepo';
import './kerangka-guru.css';

interface ItemNavigasi {
  label: string;
  ikon: string;
  tujuan: string;
  hanyaAdmin?: boolean;
}

const KELOMPOK_NAVIGASI: Array<{ judul: string; item: ItemNavigasi[] }> = [
  {
    judul: 'Mengajar',
    item: [
      { label: 'Dasbor', ikon: '⌂', tujuan: RUTE.dasbor },
      { label: 'Kelas & Mapel', ikon: '▦', tujuan: RUTE.kelas },
      { label: 'Papan Interaktif', ikon: '□', tujuan: RUTE.papan },
      { label: 'Game Edukasi', ikon: '◆', tujuan: RUTE.game },
    ],
  },
  {
    judul: 'Buat dengan AI',
    item: [
      { label: 'Pembuat LKPD', ikon: '✦', tujuan: '/fitur/pembuat-lkpd' },
      { label: 'Pembuat Soal', ikon: '?', tujuan: '/fitur/pembuat-soal' },
      { label: 'Game Generator', ikon: '◎', tujuan: '/fitur/game-generator' },
    ],
  },
  {
    judul: 'Kelas & Data',
    item: [
      { label: 'Data Siswa', ikon: '♙', tujuan: '/fitur/data-siswa' },
      { label: 'Kelompok Siswa', ikon: '♟', tujuan: RUTE.kelompok },
      { label: 'Penilaian', ikon: '✓', tujuan: '/fitur/penilaian' },
      { label: 'Rekap CP/TP', ikon: '▥', tujuan: RUTE.rekap },
    ],
  },
  {
    judul: 'Perpustakaan & Pengaturan',
    item: [
      { label: 'Perpustakaan', ikon: '▤', tujuan: '/fitur/perpustakaan' },
      { label: 'Media', ikon: '▧', tujuan: RUTE.media },
      { label: 'Referensi Pembelajaran', ikon: '↗', tujuan: RUTE.referensi },
      { label: 'Pencarian', ikon: '⌕', tujuan: RUTE.pencarian },
      { label: 'Basis Data CP & TP', ikon: '⌘', tujuan: RUTE.basisData },
      { label: 'Profil Sekolah/Guru', ikon: '⚙', tujuan: RUTE.profil },
      { label: 'Kelola Akun', ikon: '♙', tujuan: RUTE.kelolaAkun, hanyaAdmin: true },
      { label: 'Backup & Restore', ikon: '⇩', tujuan: RUTE.backup },
      { label: 'Offline / PWA', ikon: '●', tujuan: RUTE.offline },
      { label: 'Tentang Aplikasi', ikon: 'i', tujuan: RUTE.tentang },
    ],
  },
];

function inisial(nama: string): string {
  const bagian = nama.trim().split(/\s+/).filter(Boolean);
  return bagian
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? '')
    .join('');
}

export function KerangkaGuru() {
  const { akun, peran, keluar } = useAuth();
  const [sekolah, setSekolah] = useState<Sekolah | null>(null);
  const [sedangKeluar, setSedangKeluar] = useState(false);

  useEffect(() => {
    void bacaSekolah()
      .then((hasil) => setSekolah(hasil ?? null))
      .catch((galat: unknown) => log.galat('Identitas sekolah gagal dibaca.', galat));
  }, []);

  const namaSekolah = sekolah?.nama.trim() || 'Identitas sekolah belum dilengkapi';
  const namaAkun = akun?.nama ?? '';
  const labelPeran = peran === 'admin' ? 'Admin perangkat' : 'Guru';
  const daftarUtama = useMemo(() => KELOMPOK_NAVIGASI.flatMap((grup) => grup.item), []);

  async function tanganiKeluar() {
    setSedangKeluar(true);
    try {
      if (akun) {
        const sesiAktif = await daftarSesiAktifGuru(akun.id);
        if (
          sesiAktif.length > 0 &&
          !window.confirm(
            'Sesi mengajar masih berjalan. Keluar akan menyimpan keadaan terakhir dan menutup sesi. Lanjutkan?',
          )
        ) {
          return;
        }
        if (sesiAktif.length > 0) await akhiriSesiAktifGuru(akun.id);
      }
      await keluar();
    } catch (galat) {
      log.galat('Logout gagal diselesaikan.', galat);
    } finally {
      setSedangKeluar(false);
    }
  }

  return (
    <div className="kerangka-guru">
      <aside className="guru-sidebar" aria-label="Navigasi utama">
        <Link className="guru-sidebar__merek" to={RUTE.dasbor} aria-label="Papan Interaktif SD">
          <span className="guru-sidebar__logo" aria-hidden="true">
            PI
          </span>
          <span className="guru-sidebar__merek-teks">
            <strong>Papan Interaktif SD</strong>
            <small>{namaSekolah}</small>
          </span>
        </Link>

        <nav className="guru-sidebar__navigasi">
          {KELOMPOK_NAVIGASI.map((kelompok) => (
            <section className="guru-sidebar__kelompok" key={kelompok.judul}>
              <h2>{kelompok.judul}</h2>
              {kelompok.item
                .filter((item) => !item.hanyaAdmin || peran === 'admin')
                .map((item) => (
                  <NavLink
                    className={({ isActive }) =>
                      `guru-sidebar__tautan${isActive ? ' guru-sidebar__tautan--aktif' : ''}`
                    }
                    key={item.label}
                    to={item.tujuan}
                    title={item.label}
                  >
                    <span className="guru-sidebar__ikon" aria-hidden="true">
                      {item.ikon}
                    </span>
                    <span className="guru-sidebar__label">{item.label}</span>
                  </NavLink>
                ))}
            </section>
          ))}
        </nav>

        <div className="guru-sidebar__bawah">
          <p className="guru-sidebar__offline">
            <span aria-hidden="true" /> Offline siap
          </p>
          <div className="guru-sidebar__akun">
            <span className="guru-sidebar__avatar" aria-hidden="true">
              {inisial(namaAkun) || 'PI'}
            </span>
            <span className="guru-sidebar__akun-teks">
              <strong>{namaAkun}</strong>
              <small>{labelPeran}</small>
            </span>
            <button
              type="button"
              className="guru-sidebar__keluar"
              onClick={() => void tanganiKeluar()}
              disabled={sedangKeluar}
              aria-label="Logout"
              title="Logout"
            >
              {sedangKeluar ? '…' : '↪'}
            </button>
          </div>
        </div>
      </aside>

      <div className="kerangka-guru__kolom">
        <header className="guru-topbar">
          <Link className="guru-topbar__merek" to={RUTE.dasbor}>
            <span>PI</span>
            <strong>Papan Interaktif SD</strong>
          </Link>
          <Link className="guru-topbar__cari" to={RUTE.pencarian}>
            <span aria-hidden="true">⌕</span>
            Cari materi, LKPD, soal, game, media, siswa…
          </Link>
          <nav className="guru-topbar__papan-nav" aria-label="Navigasi papan">
            {daftarUtama.slice(0, 4).map((item) => (
              <NavLink key={item.label} to={item.tujuan}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link className="guru-topbar__papan" to={RUTE.papan}>
            Buka Papan
          </Link>
        </header>

        <div className="kerangka-guru__isi">
          <Outlet />
        </div>
      </div>

      <nav className="guru-nav-bawah" aria-label="Navigasi HP">
        {[
          { label: 'Dasbor', ikon: '⌂', tujuan: RUTE.dasbor },
          { label: 'Kelas', ikon: '▦', tujuan: RUTE.kelas },
          { label: 'Papan', ikon: '□', tujuan: RUTE.papan },
          { label: 'AI', ikon: '✦', tujuan: '/fitur/studio-ai' },
          { label: 'Lainnya', ikon: '•••', tujuan: RUTE.lainnya },
        ].map((item) => (
          <NavLink
            key={item.label}
            to={item.tujuan}
            className={({ isActive }) => (isActive ? 'guru-nav-bawah__aktif' : '')}
          >
            <span aria-hidden="true">{item.ikon}</span>
            <small>{item.label}</small>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
