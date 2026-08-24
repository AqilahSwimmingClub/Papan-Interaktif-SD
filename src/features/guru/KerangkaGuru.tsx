import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../state/useAuth';
import { bacaSekolah } from '../../lib/storage/sekolahRepo';
import type { Sekolah } from '../../lib/types';
import { log } from '../../lib/errors/logger';
import { RUTE } from '../../routes/paths';
import { akhiriSesiAktifGuru, daftarSesiAktifGuru } from '../../lib/storage/kelasRepo';
import { bacaPenanda, KUNCI_PERANGKAT, tulisPenanda } from '../../lib/storage/perangkatRepo';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import './kerangka-guru.css';
import './kerangka-akun.css';

interface ItemNavigasi { label: string; ikon: AppIconName; tujuan: string }
type KelompokNavigasi = Array<{ judul: string; item: ItemNavigasi[] }>;

const NAVIGASI_GURU: KelompokNavigasi = [
  { judul: 'Dashboard', item: [{ label: 'Dashboard', ikon: 'dashboard', tujuan: RUTE.dasbor }] },
  { judul: 'Kelas', item: [
    { label: 'Data Siswa', ikon: 'students', tujuan: RUTE.dataSiswa },
    { label: 'Papan Interaktif', ikon: 'board', tujuan: RUTE.papan },
    { label: 'Kuis Langsung', ikon: 'quiz', tujuan: RUTE.kuisLangsung },
    { label: 'Alat Matematika', ikon: 'math', tujuan: RUTE.alatMatematika },
    { label: 'Undian Nama', ikon: 'draw', tujuan: RUTE.undianNama },
    { label: 'Timer', ikon: 'timer', tujuan: RUTE.timerKelas },
    { label: 'Poin Kelompok', ikon: 'points', tujuan: RUTE.poinKelompok },
  ] },
  { judul: 'Game Edukasi & VLAB', item: [
    { label: 'Game Edukasi', ikon: 'game', tujuan: RUTE.game },
    { label: 'VLAB/Simulasi', ikon: 'lab', tujuan: RUTE.vlab },
  ] },
  { judul: 'LKPD & Bank Soal', item: [
    { label: 'Generate LKPD', ikon: 'worksheet', tujuan: RUTE.generateLkpd },
    { label: 'Generate Bank Soal', ikon: 'questions', tujuan: RUTE.bankSoal },
  ] },
  { judul: 'Settings', item: [
    { label: 'Backup & Restore', ikon: 'backup', tujuan: RUTE.backup },
    { label: 'Ganti Password', ikon: 'key', tujuan: RUTE.gantiPassword },
    { label: 'Ganti Profil', ikon: 'profile', tujuan: RUTE.profilGuru },
  ] },
];

const NAVIGASI_ADMIN: KelompokNavigasi = [
  { judul: 'Dashboard', item: [{ label: 'Dashboard', ikon: 'dashboard', tujuan: RUTE.dasbor }] },
  { judul: 'Admin', item: [{ label: 'Data Guru', ikon: 'teachers', tujuan: RUTE.dataGuru }] },
  { judul: 'Settings', item: [
    { label: 'Backup & Restore', ikon: 'backup', tujuan: RUTE.backup },
    { label: 'Reset Password Guru', ikon: 'key', tujuan: RUTE.resetPasswordGuru },
    { label: 'Edit Profil Sekolah', ikon: 'school', tujuan: RUTE.profilSekolah },
    { label: 'Ganti Profil Admin', ikon: 'profile', tujuan: RUTE.profilAdmin },
    { label: 'Konfigurasi AI', ikon: 'ai', tujuan: RUTE.konfigurasiAi },
  ] },
];

function inisial(nama: string): string {
  return nama.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((kata) => kata[0]?.toUpperCase() ?? '').join('');
}

export function KerangkaGuru() {
  const { akun, peran, keluar } = useAuth();
  const [sekolah, setSekolah] = useState<Sekolah | null>(null);
  const [sedangKeluar, setSedangKeluar] = useState(false);
  const [menuAkun, setMenuAkun] = useState(false);
  const [drawerTerbuka, setDrawerTerbuka] = useState(false);
  const [formKotor, setFormKotor] = useState(false);
  const [modePapan, setModePapan] = useState(false);
  const lokasi = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    void bacaSekolah().then((hasil) => setSekolah(hasil ?? null)).catch((galat: unknown) => log.galat('Identitas sekolah gagal dibaca.', galat));
    void bacaPenanda<boolean>(KUNCI_PERANGKAT.modePapanInteraktif).then((aktif) => setModePapan(Boolean(aktif)));
  }, []);
  useEffect(() => { setDrawerTerbuka(false); setFormKotor(false); }, [lokasi.pathname]);
  useEffect(() => {
    document.documentElement.dataset.modePapan = String(modePapan);
    return () => { delete document.documentElement.dataset.modePapan; };
  }, [modePapan]);

  const namaSekolah = sekolah?.nama.trim() || 'Identitas sekolah belum dilengkapi';
  const namaAkun = akun?.nama ?? '';
  const labelPeran = peran === 'admin' ? 'Admin perangkat' : 'Guru';
  const kelompokNavigasi = peran === 'admin' ? NAVIGASI_ADMIN : NAVIGASI_GURU;
  const daftarUtama = useMemo(() => kelompokNavigasi.flatMap((grup) => grup.item), [kelompokNavigasi]);

  async function tanganiKeluar() {
    setSedangKeluar(true);
    try {
      if (akun) {
        const sesiAktif = await daftarSesiAktifGuru(akun.id);
        if (sesiAktif.length > 0 && !window.confirm('Sesi mengajar masih berjalan. Keluar akan menyimpan keadaan terakhir dan menutup sesi. Lanjutkan?')) return;
        if (sesiAktif.length > 0) await akhiriSesiAktifGuru(akun.id);
      }
      await keluar();
    } catch (galat) { log.galat('Logout gagal diselesaikan.', galat); }
    finally { setSedangKeluar(false); }
  }

  function kembali() {
    if (formKotor && !window.confirm('Ada perubahan formulir yang belum disimpan. Tetap kembali?')) return;
    const indeksRiwayat = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (indeksRiwayat > 0 || lokasi.key !== 'default') navigate(-1);
    else navigate(RUTE.dasbor);
  }

  function ubahModePapan() {
    const baru = !modePapan;
    setModePapan(baru);
    void tulisPenanda(KUNCI_PERANGKAT.modePapanInteraktif, baru);
  }

  return <div className="kerangka-guru">
    <aside className={`guru-sidebar${drawerTerbuka ? ' guru-sidebar--terbuka' : ''}`} aria-label="Navigasi utama">
      <Link className="guru-sidebar__merek" to={RUTE.dasbor} aria-label="Papan Interaktif SD"><span className="guru-sidebar__logo" aria-hidden="true">PI</span><span className="guru-sidebar__merek-teks"><strong>Papan Interaktif SD</strong><small>{namaSekolah}</small></span></Link>
      <nav className="guru-sidebar__navigasi">
        {kelompokNavigasi.map((kelompok) => <section className="guru-sidebar__kelompok" key={kelompok.judul}><h2>{kelompok.judul}</h2>{kelompok.item.map((item) => <NavLink className={({ isActive }) => `guru-sidebar__tautan${isActive ? ' guru-sidebar__tautan--aktif' : ''}`} key={item.label} to={item.tujuan} onClick={() => setDrawerTerbuka(false)}><span className="guru-sidebar__ikon"><AppIcon name={item.ikon}/></span><span className="guru-sidebar__label">{item.label}</span></NavLink>)}</section>)}
      </nav>
      <div className="guru-sidebar__bawah"><p className="guru-sidebar__offline"><span aria-hidden="true" /> Offline siap</p><div className="guru-sidebar__akun"><span className="guru-sidebar__avatar" aria-hidden="true">{inisial(namaAkun) || 'PI'}</span><span className="guru-sidebar__akun-teks"><strong>{namaAkun}</strong><small>{labelPeran}</small></span><button type="button" className="guru-sidebar__keluar" onClick={() => setMenuAkun((nilai) => !nilai)} aria-label="Buka menu akun">⇥</button></div></div>
    </aside>
    {drawerTerbuka ? <button type="button" className="guru-drawer-overlay" aria-label="Tutup menu navigasi" onClick={() => setDrawerTerbuka(false)} /> : null}

    <div className="kerangka-guru__kolom">
      <header className="guru-topbar"><button className="guru-topbar__hamburger" type="button" aria-label="Buka menu navigasi" aria-expanded={drawerTerbuka} onClick={() => setDrawerTerbuka(true)}>☰</button><Link className="guru-topbar__merek" to={RUTE.dasbor}><span>PI</span><strong>Papan Interaktif SD</strong></Link><nav className="guru-topbar__papan-nav" aria-label="Navigasi cepat">{daftarUtama.slice(0, 4).map((item) => <NavLink key={item.label} to={item.tujuan}>{item.label}</NavLink>)}</nav>{peran === 'guru' ? <button className="guru-topbar__papan" type="button" aria-pressed={modePapan} onClick={ubahModePapan}>{modePapan ? 'Mode Papan Aktif' : 'Mode Papan Interaktif'}</button> : null}<button className="guru-topbar__akun" type="button" onClick={() => setMenuAkun((nilai) => !nilai)} aria-label="Buka menu akun" aria-expanded={menuAkun}>{inisial(namaAkun) || 'PI'}</button></header>
      {lokasi.pathname !== RUTE.dasbor ? <div className="guru-kembali-bar"><button type="button" onClick={kembali}>← Kembali</button></div> : null}
      <div className="kerangka-guru__isi" onInputCapture={(e) => { const target = e.target; if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) setFormKotor(true); }}><Outlet /></div>
    </div>

    {menuAkun ? <aside className="guru-menu-akun" aria-label="Menu akun"><header><span className="guru-sidebar__avatar">{inisial(namaAkun) || 'PI'}</span><div><strong>{namaAkun}</strong><small>{labelPeran}</small></div><button type="button" onClick={() => setMenuAkun(false)} aria-label="Tutup menu akun">×</button></header>{peran === 'admin' ? <Link to={RUTE.dataGuru} onClick={() => setMenuAkun(false)}>Data Guru</Link> : <Link to={RUTE.profilGuru} onClick={() => setMenuAkun(false)}>Ganti Profil</Link>}<button className="guru-menu-akun__logout" type="button" onClick={() => void tanganiKeluar()} disabled={sedangKeluar}>Logout</button><p>Logout hanya menutup sesi. Data lokal tetap tersimpan di perangkat.</p></aside> : null}
  </div>;
}
