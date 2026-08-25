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
  vlab: '/pembelajaran/vlab',
  bukuReferensi: '/kurikulum/buku-referensi',
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
  strukturKurikulum: '/kurikulum/struktur',
  modeSiswa: '/mode-siswa',
  modeKelas: '/mode-kelas',
  lainnya: '/lainnya',
} as const;

export function ruteMapel(tingkat: number): string {
  return `/kelas/${tingkat}/mapel`;
}

/**
 * Rantai baru: Kelas → Mata Pelajaran → Buku Referensi → Bab → Topik → CP → TP.
 * Layar ini menampilkan kerangka rantai tersebut; isinya menunggu buku
 * referensi resmi sekolah dimasukkan.
 */
export function ruteStrukturMapel(tingkat: number, mapelKode: string): string {
  return `/kelas/${tingkat}/mapel/${encodeURIComponent(mapelKode)}`;
}

export function ruteVlab(vlabKode: string): string {
  return `${RUTE.vlab}/${encodeURIComponent(vlabKode)}`;
}

export type JenisPembelajaran =
  | 'materi'
  | 'game'
  | 'vlab'
  | 'kuis'
  | 'lkpd'
  | 'bank-soal'
  | 'papan';

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
