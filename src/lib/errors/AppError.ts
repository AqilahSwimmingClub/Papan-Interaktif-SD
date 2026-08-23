/**
 * Galat aplikasi berkode. Kode dipakai antarmuka untuk memilih pesan;
 * pesan bawaan sudah berbahasa Indonesia dan aman ditampilkan kepada guru.
 */
export type KodeGalat =
  | 'PENYIMPANAN_TIDAK_TERSEDIA'
  | 'PENYIMPANAN_GAGAL'
  | 'VALIDASI'
  | 'ADMIN_SUDAH_ADA'
  | 'USERNAME_DIPAKAI'
  | 'KREDENSIAL_SALAH'
  | 'PERAN_TIDAK_SESUAI'
  | 'AKUN_NONAKTIF'
  | 'TERLALU_BANYAK_PERCOBAAN'
  | 'SESI_TIDAK_SAH'
  | 'KRIPTO_TIDAK_TERSEDIA'
  | 'TIDAK_DIKENAL';

export class AppError extends Error {
  readonly kode: KodeGalat;
  /** Nama field yang bermasalah, bila galat berasal dari validasi formulir. */
  readonly field?: string;
  readonly detail?: unknown;

  constructor(kode: KodeGalat, pesan: string, opsi?: { field?: string; detail?: unknown }) {
    super(pesan);
    this.name = 'AppError';
    this.kode = kode;
    this.field = opsi?.field;
    this.detail = opsi?.detail;
  }
}

export function adalahAppError(nilai: unknown): nilai is AppError {
  return nilai instanceof AppError;
}

/** Membungkus galat apa pun menjadi AppError agar antarmuka punya satu bentuk. */
export function keAppError(nilai: unknown): AppError {
  if (adalahAppError(nilai)) return nilai;
  if (nilai instanceof Error) {
    return new AppError('TIDAK_DIKENAL', nilai.message, { detail: nilai });
  }
  return new AppError('TIDAK_DIKENAL', 'Terjadi galat yang tidak dikenal.', { detail: nilai });
}
