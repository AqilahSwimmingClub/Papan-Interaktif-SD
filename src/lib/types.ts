/**
 * Bentuk data Zona 6 (akun & sesi) dan bagian Zona 2 yang dipakai Tahap 1.
 * Acuan: MASTER SPECIFICATION FINAL §4 dan Tahap 11 §30.
 */

export type Peran = 'admin' | 'guru';

/** Tabel `akun` — MASTER SPECIFICATION FINAL §4, Zona 6. */
export interface Akun {
  id: string;
  nama: string;
  /** Unik per perangkat. Disimpan huruf kecil. */
  username: string;
  /** Turunan kunci PBKDF2, base64. Tidak pernah teks terbuka. */
  hash_sandi: string;
  /** Imbuhan acak (salt) per akun, base64. */
  imbuhan: string;
  /** Parameter KDF disimpan bersama hash agar biaya kerja dapat dinaikkan kelak. */
  kdf_algoritma: string;
  kdf_iterasi: number;
  peran: Peran;
  aktif: boolean;
  dibuat: string;
  terakhir_masuk: string | null;
  gagal_berurutan: number;
  /** Waktu ISO saat jeda coba-coba berakhir; null bila tidak terkunci. */
  terkunci_sampai: string | null;
}

/** Tabel `sesi_login` — MASTER SPECIFICATION FINAL §4, Zona 6. */
export interface SesiLogin {
  token: string;
  akun_id: string;
  dibuat: string;
  kedaluwarsa: string;
  perangkat: string;
}

/** Tabel `sekolah` — Zona 2. Tahap 1 hanya mengisinya dari Setup Admin. */
export interface Sekolah {
  id: string;
  nama: string;
  npsn: string;
  alamat: string;
  kepala_sekolah: string;
  logo_berkas: string | null;
  kop_cetak: string;
  kertas_bawaan: 'A4' | 'F4';
}

/** Lima keadaan sesi — Tahap 11 §01. */
export type KeadaanSesi =
  | 'belum_setup'
  | 'belum_login'
  | 'login_admin'
  | 'login_guru'
  | 'logout';

export interface SesiAktif {
  akun: Akun;
  sesi: SesiLogin;
}
