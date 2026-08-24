/** Peta rute aplikasi. Rute Tahap berikutnya ditambahkan di sini, bukan disebar. */
export const RUTE = {
  akar: '/',
  pembuka: '/pembuka',
  setupAdmin: '/setup-admin',
  masuk: '/masuk',
  lupaPassword: '/lupa-password',
  dasbor: '/dasbor',
  kelas: '/kelas',
  papan: '/pembelajaran/papan',
  game: '/pembelajaran/game',
  dataSiswa: '/kelas/data-siswa',
  penilaian: '/kelas/penilaian',
  perpustakaan: '/perpustakaan',
  referensi: '/perpustakaan/referensi',
  pemetaanReferensi: '/perpustakaan/referensi/pemetaan',
  materi: '/pembelajaran/materi',
  kelompok: '/kelas/kelompok',
  rekap: '/kelas/rekap',
  media: '/perpustakaan/media',
  pencarian: '/pencarian',
  profil: '/pengaturan/profil',
  kelolaAkun: '/pengaturan/akun',
  backup: '/pengaturan/backup',
  offline: '/pengaturan/offline',
  tentang: '/tentang-aplikasi',
  basisData: '/kurikulum/basis-data',
  kelolaTp: '/kurikulum/kelola-tp',
  muatCp: '/kurikulum/muat-cp',
  modeSiswa: '/mode-siswa',
  modeKelas: '/mode-kelas',
  lainnya: '/lainnya',
} as const;

export function ruteMapel(tingkat: number): string {
  return `/kelas/${tingkat}/mapel`;
}

export function ruteCpTp(tingkat: number, mapelKode: string): string {
  return `/kelas/${tingkat}/mapel/${encodeURIComponent(mapelKode)}`;
}

export function ruteMainGame(gameId: string): string {
  return `/pembelajaran/game/${encodeURIComponent(gameId)}/main`;
}

export type JenisPembelajaran = 'materi' | 'game' | 'lkpd' | 'asesmen' | 'papan';

export function rutePembelajaran(jenis: JenisPembelajaran): string {
  return `/pembelajaran/${jenis}`;
}

/**
 * Rute yang boleh dibuka tanpa sesi sah — Opening, Setup Admin, Login, dan
 * Lupa Password. Seluruh rute lain ditolak di lapisan rute, bukan disembunyikan
 * dari menu (IMPLEMENTATION HANDOFF §4, "Penjagaan sesi").
 */
export const RUTE_TERBUKA: readonly string[] = [
  RUTE.pembuka,
  RUTE.setupAdmin,
  RUTE.masuk,
  RUTE.lupaPassword,
];

export function ruteTerbuka(path: string): boolean {
  return RUTE_TERBUKA.includes(path);
}
