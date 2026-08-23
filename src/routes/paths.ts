/** Peta rute aplikasi. Rute Tahap berikutnya ditambahkan di sini, bukan disebar. */
export const RUTE = {
  akar: '/',
  pembuka: '/pembuka',
  setupAdmin: '/setup-admin',
  masuk: '/masuk',
  lupaPassword: '/lupa-password',
  dasbor: '/dasbor',
} as const;

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
