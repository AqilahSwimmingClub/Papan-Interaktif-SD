import type { KeadaanSesi, SesiAktif } from '../types';

export interface MasukanKeadaan {
  adaAdmin: boolean;
  sesi: SesiAktif | null;
  /** Benar tepat setelah aksi Logout, sebelum Login dibuka kembali. */
  baruKeluar?: boolean;
}

/**
 * Lima keadaan sesi — Tahap 11 §01.
 *
 * belum_setup  perangkat tanpa Admin; hanya Setup Admin yang dapat dibuka
 * belum_login  akun ada, sesi tidak; hanya Login dan Lupa Password terbuka
 * login_admin  seluruh fitur guru + Kelola Akun, identitas sekolah, cadangan
 * login_guru   seluruh fitur pembelajaran tanpa pengurangan
 * logout       token dibuang, kembali ke Login; tidak ada data yang hilang
 */
export function keadaanSesi({ adaAdmin, sesi, baruKeluar }: MasukanKeadaan): KeadaanSesi {
  if (!adaAdmin) return 'belum_setup';
  if (sesi) return sesi.akun.peran === 'admin' ? 'login_admin' : 'login_guru';
  return baruKeluar ? 'logout' : 'belum_login';
}

export function sudahMasuk(keadaan: KeadaanSesi): boolean {
  return keadaan === 'login_admin' || keadaan === 'login_guru';
}
